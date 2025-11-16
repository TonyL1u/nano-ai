import type { MessageStatus } from '@/store/chats';

export interface LiveActivityParams {
  question: string;
  model?: string;
}

export type StartLiveActivityFn = (params: LiveActivityParams) => Promise<void>;

export type UpdateLiveActivityFn = (params: { status: MessageStatus }) => Promise<void>;

export type StopLiveActivityFn = () => Promise<void>;

export type IsLiveActivityRunningFn = () => boolean;
