import { type Message, useChats } from '@/store/chats';

interface UseMessageReturn {
  push: (...items: Message[]) => void;
  set<K extends keyof Message>(key: K, value: Message[K]): void;
  set(item: Partial<Message> | ((current: Message) => void)): void;
  get: () => readonly [Message, Message[]];
}

export function useMessage(): [Message[], UseMessageReturn] {
  const [chats, { set: setChats }] = useChats();
  const { current, data } = chats;
  const { messages = [] } = data[current] || {};

  const push = (...items: Message[]) => {
    setChats(chats => {
      const { messages } = chats.data[current];
      messages.push(...items);
    });
  };

  const set = (...args: any[]) => {
    if (args.length === 1) {
      if (typeof args[0] === 'function') {
        setChats(chats => {
          const { messages } = chats.data[current];
          args[0](messages.at(-1));
        });
      } else {
        setChats(chats => {
          const { messages } = chats.data[current];
          messages[messages.length - 1] = { ...messages.at(-1)!, ...args[0] };
        });
      }
    } else {
      setChats(chats => {
        const { messages } = chats.data[current];
        messages[messages.length - 1] = { ...messages.at(-1)!, [args[0]]: args[1] };
      });
    }
  };

  const get = () => {
    const { messages } = data[current];

    return [messages.at(-1)!, messages] as const;
  };

  return [messages, { get, set, push }];
}
