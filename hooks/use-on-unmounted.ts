import { useEffect, useRef } from 'react';

/**
 * A hook that executes the function right before the component is unmounted.
 *
 * @example
 * ```ts
 * import { useOnUnmounted } from 'reactuse';
 *
 * useOnUnmounted(() => {
 *     // something you want to call when component is unmounted...
 * })
 * ```
 * @param fn - The function to be executed
 *
 */
export function useOnUnmounted(fn: () => void) {
  const ref = useRef(fn);
  ref.current = fn;

  useEffect(
    () => () => {
      fn?.();
    },
    []
  );
}
