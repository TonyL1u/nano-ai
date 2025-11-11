import type { AbortableAsyncIterator, ChatRequest, ChatResponse, ListResponse } from 'ollama';

export interface AIClientImpl {
  chat(
    request: ChatRequest & {
      stream: true;
    }
  ): Promise<AbortableAsyncIterator<ChatResponse>>;
  chat(
    request: ChatRequest & {
      stream?: false;
    }
  ): Promise<ChatResponse>;
  list(): Promise<ListResponse>;
}
