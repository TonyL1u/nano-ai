import { useCallback, useEffect, useRef, useState } from 'react';

import { useLatest } from './use-latest';
import { useOnUnmounted } from './use-on-unmounted';

type Fn<T = void> = () => T;

type SpecFn<P, R> = (...args: P[]) => R;

interface Stoppable<StartFnArgs extends unknown[] = unknown[]> {
  /**
   * A ref indicate whether a stoppable instance is executing
   */
  isPending: Readonly<boolean>;
  /**
   * Stop the effect from executing
   */
  stop: Fn;
  /**
   * Start the effects
   */
  start: (...args: StartFnArgs) => void;
}

export interface UseTimeoutFnOptions {
  /**
   * Running the timer automatically after calling this function
   *
   * @defaultValue true
   */
  immediate?: boolean;
}

/**
 * Wrapper for `setTimeout` with controls.
 *
 * @example
 * ```ts
 * import { useTimeoutFn } from 'reactuse';
 *
 * const { start, stop } = useTimeoutFn(() => {
 *     // fired after 1000ms...
 * }, 1000)
 *
 * start(); // start timer
 * stop(); // stop timer
 * ```
 * @param fn - The function to be executed
 * @param interval -
 * @param options -
 * @returns
 */
export function useTimeoutFn(fn: SpecFn<unknown, unknown>, interval: number, options: UseTimeoutFnOptions = {}): Stoppable {
  const { immediate = true } = options;
  const [pending, setPending] = useState(false);
  const fnRef = useLatest(fn);
  const timer = useRef<number | null>(null);
  const hasStarted = useRef(false);

  const clear = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };
  const stop = useCallback(() => {
    setPending(false);
    clear();
  }, []);
  const start = useCallback(
    (...args: unknown[]) => {
      clear();
      setPending(true);
      hasStarted.current = true;
      timer.current = window.setTimeout(() => {
        stop();
        fnRef.current(...args);
      }, interval);
    },
    [fnRef, interval, stop]
  );

  useEffect(() => {
    if ((immediate && !hasStarted.current) || hasStarted.current) start();

    return stop;
  }, [immediate, start, stop]);

  useOnUnmounted(stop);

  return { isPending: pending, start, stop };
}
