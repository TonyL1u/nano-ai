import { useRef } from 'react';

import { OllamaApi } from '@/lib/ollama-api';
import { ConnectStatus, useSettingsValue } from '@/store/settings';

import { useMessage } from './use-message';
import { useModel } from './use-model';
import { useToast } from './use-toast';

export function useOllama() {
  const isAbortedRef = useRef(false);
  const abortFnRef = useRef<() => void>(null);
  const [, { get, set, push }] = useMessage();
  const [model] = useModel();
  const { ollama } = useSettingsValue();
  const { host } = ollama;
  const toast = useToast();

  const request = async (input: string, think = false) => {
    isAbortedRef.current = false;
    if (!model || ollama.connectStatus !== ConnectStatus.SUCCESSFUL) return;

    try {
      const { name, canThink } = model;
      const ollamaApi = new OllamaApi(host);

      const createAt = +new Date();
      const newUserMessage = { role: 'user', content: input, createAt };
      const newAssistantMessage = { role: 'assistant', content: '', createAt, thinkingContent: '', isPending: true, isStreaming: false };

      push(newUserMessage, newAssistantMessage);
      const [, messages] = get();
      const stream = await ollamaApi.chat({
        model: name,
        messages: [...messages, newUserMessage].map(({ role, content }) => ({ role, content })),
        think: canThink ? think : false,
        stream: true
      });
      if (isAbortedRef.current) {
        stream.abort();
      } else {
        abortFnRef.current = () => stream.abort();
        set('isPending', false);

        let inThinking = false;
        const startThinkingTime = +new Date();
        for await (const chunk of stream) {
          if (chunk.message.thinking) {
            if (!inThinking) {
              inThinking = true;
              set('isThinking', true);
            }
            // accumulate the partial thinking
            set(msg => (msg.thinkingContent! += chunk.message.thinking));
          } else if (chunk.message.content) {
            set('isStreaming', true);
            if (inThinking) {
              inThinking = false;
              set({ isThinking: false, thinkingDuration: +new Date() - startThinkingTime });
            }
            // accumulate the partial content
            set(msg => (msg.content += chunk.message.content));
          }
        }
        set('isStreaming', false);
      }
    } catch (error) {
      set('isAborted', true);
      if (!isAbortedRef.current) {
        toast.error(`${error}`, { description: 'Please check your Ollama API endpoint and try again' });
      }
    }
  };

  const abort = () => {
    set({ isPending: false, isAborted: true });
    isAbortedRef.current = true;
    abortFnRef.current?.();
  };

  return { request, abort };
}
