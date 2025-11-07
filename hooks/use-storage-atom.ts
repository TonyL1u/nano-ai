import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import type { StoredAtom } from '@/lib/local-storage';

export function useStorageAtom<V>(atom: StoredAtom<V>) {
  const [data, setData] = useAtom(atom);

  return [
    data,
    (update: (data: V) => V) => {
      // use setTimeout to make sure the primitive data has promised
      setTimeout(() => {
        setData(async promise => {
          return update(await promise);
        });
      }, 0);
    }
  ] as const;
}

export function useStorageAtomValue<V>(atom: StoredAtom<V>) {
  return useAtomValue(atom) as V;
}

export function useSetStorageAtom<V>(atom: StoredAtom<V>) {
  const setData = useSetAtom(atom);

  return (update: (data: V) => V) => {
    // use setTimeout to make sure the primitive data has promised
    setTimeout(() => {
      setData(async promise => {
        return update(await promise);
      });
    }, 0);
  };
}
