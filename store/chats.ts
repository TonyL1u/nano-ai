import type { ModelResponse } from 'ollama';

import { useStorageAtom } from '@/hooks/use-storage-atom';
import { createStorageAtom, StorageKey } from '@/lib/local-storage';
import { withImmer } from '@/lib/utils';

export interface MessageStatus {
  isPending: boolean;
  isThinking: boolean;
  isStreaming: boolean;
  isAborted: boolean;
}

export interface Message extends Partial<MessageStatus> {
  role: string;
  content: string;
  createAt: number;
  updateAt?: number;
  thinkingContent?: string;
  thinkingDuration?: number;
}

export interface Chat {
  messages: Message[];
  model?: ModelResponse & { canThink?: boolean };
  think?: boolean;
}

export const chats = createStorageAtom(StorageKey.CHATS_HISTORY, { current: 0, data: [{ messages: [] }] as Chat[] });

export function useChats() {
  const [_chats, _setChats] = useStorageAtom(chats);
  const set = withImmer(_setChats);

  const create = () => {
    set(chats => {
      if (chats.data.length === 0 || chats.data.at(-1)?.messages.length) {
        chats.data.push({ messages: [] });
      }

      if (chats.current !== chats.data.length - 1) {
        chats.current = chats.data.length - 1;
      }
    });
  };

  const remove = (index: number) => {
    set(chats => {
      chats.data.splice(index, 1);

      if (chats.data.length === 0 || chats.data.at(-1)?.messages.length) {
        chats.data.push({ messages: [] });
      }

      if (chats.current !== chats.data.length - 1) {
        chats.current = chats.data.length - 1;
      }
    });
  };

  const switchTo = (index: number) => {
    set(chats => {
      chats.current = index;
    });
  };

  const toggleThink = () => {
    set(chats => {
      const { current, data } = chats;
      data[current].think = !data[current].think;
    });
  };

  const clear = () => {
    set(chats => {
      chats.current = 0;
      chats.data = [{ messages: [] }];
    });
  };

  return [
    _chats,
    {
      set,
      create,
      remove,
      switchTo,
      toggleThink,
      clear
    }
  ] as const;
}
