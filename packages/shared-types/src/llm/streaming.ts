// SSE Streaming type definitions for LLM providers

import { StreamErrorCode } from './streaming-errors';

export type ProviderStreamEvent = 
  | { type: 'content'; data: string; eventId?: string }
  | { type: 'usage'; data: UsageData; eventId?: string }
  | { type: 'done'; eventId?: string }
  | { type: 'error'; data: StreamError; eventId?: string };

export interface UsageData {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
}

export interface StreamError {
  message: string;
  code: StreamErrorCode;
  retryable: boolean;
  details?: Record<string, unknown>;
}

// Re-export StreamErrorCode from streaming-errors
export { StreamErrorCode } from './streaming-errors';