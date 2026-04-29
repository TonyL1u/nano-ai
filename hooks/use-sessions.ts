import { useEffect } from 'react';

import { withImmer } from '@/lib/utils';
import { sessions } from '@/store/sessions';

import { useSettings } from './use-settings';
import { useStorageAtom } from './use-storage-atom';

export function useSessions() {
  const [_sessions, _setSessions] = useStorageAtom(sessions);
  const [{ defaultModel }] = useSettings();
  const set = withImmer(_setSessions);

  useEffect(() => {
    set(sessions => {
      for (const session of sessions.data) {
        for (const msg of session.messages) {
          if (msg.isPending || msg.isStreaming || msg.isThinking) {
            msg.isPending = false;
            msg.isStreaming = false;
            msg.isThinking = false;
            msg.isAborted = true;
          }
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = () => {
    set(sessions => {
      if (sessions.data.length === 0 || sessions.data.at(-1)?.messages.length) {
        sessions.data.push({ messages: [], model: defaultModel });
      }

      if (sessions.current !== sessions.data.length - 1) {
        sessions.current = sessions.data.length - 1;
        sessions.data[sessions.current].model = defaultModel;
      }
    });
  };

  const remove = (index: number) => {
    set(sessions => {
      sessions.data.splice(index, 1);

      if (sessions.data.length === 0 || sessions.data.at(-1)?.messages.length) {
        sessions.data.push({ messages: [], model: defaultModel });
      }

      if (index < sessions.current) {
        sessions.current -= 1;
      }
    });
  };

  const switchTo = (index: number) => {
    set(sessions => {
      sessions.current = index;
    });
  };

  const clear = () => {
    set(sessions => {
      sessions.current = 0;
      sessions.data = [{ messages: [] }];
    });
  };

  return {
    current: _sessions.current,
    sessions: _sessions.data,
    currentSession: _sessions.data[_sessions.current],
    setSessions: set,
    createSession: create,
    deleteSession: remove,
    loadSession: switchTo,
    clearSessions: clear
  };
}
