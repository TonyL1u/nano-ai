import type { ModelResponse } from 'ollama';

import { useChats } from '@/store/chats';

export function useModel() {
  const [chats, { set }] = useChats();
  const { current, data } = chats;
  const { model } = data[current] || {};

  const setModel = (model: ModelResponse) => {
    set(chats => {
      const { current, data } = chats;
      data[current].model = model;
    });
  };

  return [model, setModel] as const;
}
