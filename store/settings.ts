import type { ModelResponse } from 'ollama';

import { useSetStorageAtom, useStorageAtom, useStorageAtomValue } from '@/hooks/use-storage-atom';
import { createStorageAtom, StorageKey } from '@/lib/local-storage';
import { withImmer } from '@/lib/utils';

export enum ConnectStatus {
  FAILED,
  SUCCESSFUL,
  DEFAULT
}

export enum ServerType {
  CUSTOM_HOST = 'custom_host',
  OLLAMA_CLOUD = 'ollama_cloud'
}

export interface Settings {
  ollama: {
    serverType: ServerType;
    host: string;
    apiKey?: string;
    connectStatus: ConnectStatus;
    models: (ModelResponse & { canThink?: boolean })[];
  };
  hapticFeedback: boolean;
}

export const settings = createStorageAtom(StorageKey.SETTINGS, {
  ollama: {
    serverType: ServerType.CUSTOM_HOST,
    host: 'localhost:11434',
    connectStatus: ConnectStatus.DEFAULT,
    models: []
  },
  hapticFeedback: true
} as Settings);

export const useSettings = () => {
  const [_settings, _setSettings] = useStorageAtom(settings);

  return [_settings, withImmer(_setSettings)] as const;
};

export const useSettingsValue = () => {
  return useStorageAtomValue(settings);
};

export const useSetSettings = () => {
  const _setSettings = useSetStorageAtom(settings);

  return withImmer(_setSettings);
};
