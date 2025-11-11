import { fetch } from 'expo/fetch';
import type { ChatRequest, ChatResponse, Config, ErrorResponse, ModelResponse } from 'ollama';
import { AbortableAsyncIterator } from 'ollama';

import { parseJSON } from '../utils';
import type { AIClientImpl } from './impl';

export class OpenAI implements AIClientImpl {
  #config: Config = {
    host: '',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      'x-requested-with': 'XMLHttpRequest'
    }
  };
  #ongoingStreamedRequests: AbortableAsyncIterator<object>[] = [];

  constructor(host: string, apiKey: string) {
    this.#config.host = host;
    this.#config.headers = {
      ...this.#config.headers,
      Authorization: `Bearer ${apiKey}`
    };
  }

  get #baseUrl() {
    const { host } = this.#config;
    if (/^https?:\/\//.test(host)) return host;

    return `http://${host}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async #post<T extends object>(endpoint: string, request: { stream?: boolean } & Record<string, any>): Promise<T | AbortableAsyncIterator<T>> {
    request.stream = request.stream ?? false;
    const url = `${this.#baseUrl}/api/${endpoint}`;
    const body = JSON.stringify(request);
    const { headers } = this.#config;

    if (request.stream) {
      const abortController = new AbortController();
      const response = await fetch(url, {
        method: 'POST',
        body,
        signal: abortController.signal,
        headers
      });

      if (!response.body) {
        throw new Error('Missing body');
      }

      const itr = parseJSON<T | ErrorResponse>(response.body);
      const abortableAsyncIterator = new AbortableAsyncIterator(abortController, itr, () => {
        const i = this.#ongoingStreamedRequests.indexOf(abortableAsyncIterator);
        if (i > -1) {
          this.#ongoingStreamedRequests.splice(i, 1);
        }
      });
      this.#ongoingStreamedRequests.push(abortableAsyncIterator);
      return abortableAsyncIterator;
    }

    const response = await fetch(url, { method: 'POST', body, headers });

    return await response.json();
  }

  async #get<T extends object>(endpoint: string) {
    const url = `${this.#baseUrl}/api/${endpoint}`;
    const response = await fetch(url, { method: 'GET' });

    return (await response.json()) as T;
  }

  chat(request: ChatRequest & { stream: true }): Promise<AbortableAsyncIterator<ChatResponse>>;
  chat(request: ChatRequest & { stream?: false }): Promise<ChatResponse>;
  /**
   * Chats with the model. The request object can contain messages with images that are either
   * Uint8Arrays or base64 encoded strings. The images will be base64 encoded before sending the
   * request.
   * @param request {ChatRequest} - The request object.
   * @returns {Promise<ChatResponse | AbortableAsyncIterator<ChatResponse>>} - The response object or an
   * AbortableAsyncIterator that yields response messages.
   */
  chat(request: ChatRequest): Promise<ChatResponse | AbortableAsyncIterator<ChatResponse>> {
    return this.#post<ChatResponse>('chat', request);
  }

  list() {
    return this.#get<{ models: ModelResponse[] }>('tags');
  }
}
