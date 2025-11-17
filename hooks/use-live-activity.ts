import { useState } from 'react';
import { Platform } from 'react-native';

import { areLiveActivitiesEnabled, isLiveActivityRunning, startLiveActivity, stopLiveActivity, updateLiveActivity } from '@/modules/activity-controller';
import type { Message } from '@/store/chats';

export function useLiveActivity() {
  const [running, setRunning] = useState(false);

  const start = async (question: string, model: string) => {
    if (Platform.OS !== 'ios') return;

    if (!areLiveActivitiesEnabled) return;

    setRunning(true);
    await startLiveActivity({ question, model });
  };

  const stop = async () => {
    if (Platform.OS !== 'ios') return;

    if (!isLiveActivityRunning()) return;

    setRunning(false);
    await stopLiveActivity();
  };

  const update = async (data: Message) => {
    if (Platform.OS !== 'ios') return;

    if (!isLiveActivityRunning()) return;

    const { isPending = true, isThinking = false, isStreaming = false, isAborted = false } = data;
    await updateLiveActivity({
      status: { isThinking, isPending, isStreaming, isAborted }
    });
  };

  return { running, start, stop, update };
}
