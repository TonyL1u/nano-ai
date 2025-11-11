import { fetch } from 'expo/fetch';
import { type Fetch, Ollama as _Ollama } from 'ollama/browser';

import type { AIClientImpl } from './impl';

export class Ollama extends _Ollama implements AIClientImpl {
  constructor(host: string, apiKey?: string) {
    super({
      fetch: fetch as Fetch,
      host,
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
    });
  }
}
