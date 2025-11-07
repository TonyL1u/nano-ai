/* eslint-disable no-console */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WritableAtom } from 'jotai';
import { atomWithStorage, createJSONStorage, RESET } from 'jotai/utils';

import type { Chat } from '@/store/chats';
import type { Settings } from '@/store/settings';

export enum StorageKey {
  CHATS_HISTORY = 'chats_history',
  SETTINGS = 'settings'
}

export interface StorageItems {
  [StorageKey.CHATS_HISTORY]: { current: number; data: Chat[] };
  [StorageKey.SETTINGS]: Settings;
}

export const getStorageItem = async <K extends keyof StorageItems, V = StorageItems[K]>(key: K) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) return JSON.parse(value) as V;
  } catch (e) {
    // error reading value
    console.log(e);
  }

  return null;
};

export async function setStorageItem<K extends keyof StorageItems, V = StorageItems[K]>(key: K, value: V): Promise<void>;
// eslint-disable-next-line @typescript-eslint/unified-signatures
export async function setStorageItem<K extends keyof StorageItems, V = StorageItems[K]>(key: K, setter: (value: V | null) => V): Promise<void>;
export async function setStorageItem(...args: any[]) {
  try {
    const [key, setter] = args;
    if (typeof setter === 'function') {
      const currentValue = await getStorageItem(key);
      const newValue = setter(currentValue);
      await AsyncStorage.setItem(key, typeof newValue === 'string' ? newValue : JSON.stringify(newValue));
    } else {
      await AsyncStorage.setItem(key, typeof setter === 'string' ? setter : JSON.stringify(setter));
    }
  } catch (e) {
    // saving error
    console.log(e);
  }
}

type SetStateActionWithReset<V> = V | typeof RESET | ((prev: V) => V | typeof RESET);

export type StoredAtom<V> = WritableAtom<V | Promise<V>, [SetStateActionWithReset<V | Promise<V>>], Promise<void>>;

export function createStorageAtom<K extends keyof StorageItems, V = StorageItems[K]>(key: K): StoredAtom<V | null>;
export function createStorageAtom<K extends keyof StorageItems, V = StorageItems[K]>(key: K, initialValue: V): StoredAtom<V>;
export function createStorageAtom<K extends keyof StorageItems, V = StorageItems[K]>(key: K, initialValue?: V) {
  const storage = createJSONStorage<V | null>(() => AsyncStorage);

  return atomWithStorage(key, initialValue || null, storage, { getOnInit: true });
}
