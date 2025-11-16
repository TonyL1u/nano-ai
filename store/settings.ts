import type { ModelResponse } from 'ollama';

import { useSetStorageAtom, useStorageAtom, useStorageAtomValue } from '@/hooks/use-storage-atom';
import { DEFAULT_CUSTOM_HOST } from '@/lib/constants';
import { createStorageAtom, StorageKey } from '@/lib/local-storage';
import { withImmer } from '@/lib/utils';

export enum ConnectStatus {
  FAILED,
  SUCCESSFUL,
  DEFAULT
}

export enum ServerType {
  CUSTOM_HOST = 'custom_host',
  OLLAMA_CLOUD = 'ollama_cloud',
  OPEN_AI = 'open_ai'
}

export interface Settings {
  ollama: {
    serverType: ServerType;
    connectStatus: ConnectStatus;
    models: (ModelResponse & { canThink?: boolean })[];
    host: string;
    hostList: { value: string; isLastUsed: boolean }[];
    apiKey?: string;
    apiKeyList: { value: string; isLastUsed: boolean }[];
  };
  hapticFeedback: boolean;
}

export const settings = createStorageAtom(StorageKey.SETTINGS, {
  ollama: {
    serverType: ServerType.CUSTOM_HOST,
    host: DEFAULT_CUSTOM_HOST,
    connectStatus: ConnectStatus.DEFAULT,
    models: [],
    hostList: [],
    apiKeyList: []
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
