import type { LanguageModelUsage, ModelMessage, TextStreamPart, ToolSet } from 'ai';
import { useMemo, useRef, useState } from 'react';

import { useSessions } from '@/hooks/use-sessions';
import { useSettings } from '@/hooks/use-settings';
import { AIProviderEnum, AIRegistry, chat } from '@/lib/ai';
import type { UIMessage } from '@/store/sessions';

interface OnFinishedOptions {
  isAbort: boolean;
  isError: boolean;
  messages: UIMessage[];
  finishReason?: 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other';
  totalUsage?: LanguageModelUsage;
}

export interface UseChatOptions {
  onFinished?: (options: OnFinishedOptions) => void;
  onError?: (error: Error) => void;
  onData?: (part: TextStreamPart<ToolSet>) => void;
}

export function useChat(options?: UseChatOptions) {
  const { onData, onError, onFinished } = options || {};
  const [settings] = useSettings();
  const { current, currentSession, setSessions } = useSessions();
  const { think = false, model, messages = [] } = currentSession || {};
  const [error, setError] = useState<Error | null>(null);
  const languageModel = useMemo(() => {
    const { provider = AIProviderEnum.OLLAMA, host, apiKey } = settings;
    const { name: modelName, canThink = false } = model || {};
    const reasoning = canThink ? think : false;

    return new AIRegistry(host, apiKey).model(`${provider}:${modelName}`, {
      [AIProviderEnum.OLLAMA]: { think: reasoning },
      [AIProviderEnum.ANTHROPIC]: { thinking: { type: reasoning ? 'enabled' : 'disabled', budgetTokens: 12000 } },
      [AIProviderEnum.OPENAI]: { reasoningEffort: reasoning ? 'high' : 'none' },
      [AIProviderEnum.GOOGLE]: { thinkingConfig: reasoning ? { thinkingLevel: 'high' } : {} },
      [AIProviderEnum.CUSTOM]: { reasoningEffort: reasoning ? 'high' : 'none' },
      [AIProviderEnum.OPENCLAW]: { reasoningEffort: reasoning ? 'high' : 'none' }
    });
  }, [settings, think, model]);
  const stopRef = useRef<() => void>(null);

  const createUpdater = (index?: number) => {
    return (patch: (msg: UIMessage) => void) => {
      setSessions(sessions => {
        const msgs = sessions.data[current].messages;
        const targetMsg = msgs[index ?? msgs.length - 1];

        patch(targetMsg);
      });
    };
  };

  const createChatWithAI = (index?: number) => {
    return (message: string) => {
      return chat({
        model: languageModel,
        messages: [
          ...messages.slice(0, settings.provider === AIProviderEnum.OPENCLAW ? 0 : (index ?? messages.length)),
          {
            role: 'user',
            content: message
          }
        ].map(({ role, content }) => ({ role, content })) as ModelMessage[],
        stream: true
      });
    };
  };

  const processing = async (input: string, index?: number) => {
    const updater = createUpdater(index);
    const markAborted = () =>
      updater(msg => {
        msg.isPending = false;
        msg.isStreaming = false;
        msg.isThinking = false;
        msg.isAborted = true;
      });
    try {
      const chatWithAI = createChatWithAI(index);

      const [stream, abort] = chatWithAI(input);
      const startTime = +new Date();
      let startThinkingTime = +new Date();

      for await (const part of stream) {
        onData?.(part);
        const { type } = part;

        switch (type) {
          case 'start':
            stopRef.current = () => {
              updater(msg => {
                msg.isPending = false;
                msg.isAborted = true;
                msg.isStreaming = false;
              });
              abort();
              onFinished?.({ isAbort: false, isError: false, messages });
            };

            break;
          case 'reasoning-start':
            startThinkingTime = +new Date();
            updater(msg => {
              msg.isPending = false;
              msg.isThinking = true;
            });

            break;
          case 'reasoning-delta':
            updater(msg => {
              msg.thinkingContent = (msg.thinkingContent || '') + part.text;
            });

            break;
          case 'reasoning-end':
            updater(msg => {
              msg.isThinking = false;
              msg.thinkingDuration = +new Date() - startThinkingTime;
            });

            break;
          case 'text-start':
            updater(msg => {
              msg.isPending = false;
              msg.isStreaming = true;
            });

            break;
          case 'text-delta':
            updater(msg => {
              msg.content = (msg.content || '') + part.text;
            });

            break;
          case 'text-end':
            updater(msg => {
              msg.isStreaming = false;
            });

            break;
          case 'abort':
            updater(msg => {
              msg.isAborted = true;
            });
            onFinished?.({ isAbort: true, isError: false, messages });

            break;
          case 'error':
            markAborted();
            onFinished?.({ isAbort: false, isError: true, messages });
            handleError(part.error as Error);

            break;
          case 'finish': {
            const { finishReason, totalUsage } = part;
            updater(msg => {
              msg.cost = {
                time: +new Date() - startTime,
                tokens: totalUsage.totalTokens || 0
              };
              if (finishReason === 'error') {
                msg.isPending = false;
                msg.isStreaming = false;
                msg.isThinking = false;
                msg.isAborted = true;
              }
            });
            if (finishReason === 'error') {
              const error = new Error('Network error', { cause: `Stream terminated by ${finishReason}` });
              handleError(error);
            }
            onFinished?.({ isAbort: false, isError: finishReason === 'error', messages, finishReason, totalUsage });

            break;
          }
        }
      }
    } catch (error) {
      markAborted();
      handleError(error as Error);
    } finally {
      stopRef.current = null;
    }
  };

  const sendMessage = async (input: string) => {
    const createAt = +new Date();
    const assistantIndex = messages.length + 1;
    setSessions(sessions => {
      const msgs = sessions.data[current].messages;
      sessions.data[current].messages = [
        ...msgs,
        { role: 'user', content: input, createAt },
        {
          role: 'assistant',
          content: '',
          createAt,
          thinkingContent: '',
          isPending: true,
          isStreaming: false
        }
      ];
    });

    await processing(input, assistantIndex);
  };

  const regenerate = async (index: number) => {
    const realIndex = index < 0 ? messages.length + index : index;
    setSessions(sessions => {
      sessions.data[sessions.current].messages[realIndex] = {
        role: 'assistant',
        content: '',
        createAt: +new Date(),
        thinkingContent: '',
        isPending: true,
        isStreaming: false
      };
    });

    const input = messages[realIndex - 1].content;
    await processing(input, realIndex);
  };

  const handleError = (error: Error) => {
    setError(error);
    onError?.(error);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    messages,
    error,
    sendMessage,
    stop: () => stopRef.current?.(),
    regenerate,
    clearError
  };
}
