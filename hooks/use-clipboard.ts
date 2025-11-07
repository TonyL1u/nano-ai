import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';

import { useTimeoutFn } from './use-timeout-fn';

export interface UseClipboardOptions {
  /**
   * Initial copying source text
   */
  source?: string;
  copiedDelay?: number;
}

export interface UseClipboardReturn {
  isSupported: boolean;
  copy: (source?: string) => void;
  text: string;
  copied: boolean;
}

export function useClipboard(options: UseClipboardOptions = {}) {
  const { source = '', copiedDelay = 1000 } = options;
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const isSupported = navigator && 'clipboard' in navigator;
  const timeout = useTimeoutFn(() => setCopied(false), copiedDelay);
  const copy = async (value = source) => {
    await Clipboard.setStringAsync(value);
    setText(value);
    setCopied(true);
    timeout.start();
  };

  return { isSupported, copy, text, copied };
}
