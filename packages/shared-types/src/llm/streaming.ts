// SSE Streaming type definitions for LLM providers

import type { StreamErrorCode } from './streaming-errors';

/**
 * Union type representing all possible SSE stream events from LLM providers.
 * 
 * Event types:
 * - content: Partial text content from the stream
 * - usage: Token usage statistics (typically sent at end)
 * - done: Indicates stream completion
 * - error: Error event with categorized error information
 */
export type ProviderStreamEvent = 
  | { type: 'content'; data: string; eventId?: string }
  | { type: 'usage'; data: UsageData; eventId?: string }
  | { type: 'done'; eventId?: string }
  | { type: 'error'; data: StreamError; eventId?: string };

/**
 * Token usage statistics typically provided at the end of a stream.
 */
export interface UsageData {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
}

/**
 * Structured error information for streaming failures.
 */
export interface StreamError {
  message: string;
  code: StreamErrorCode;
  retryable: boolean;
  details?: Record<string, unknown>;
}

// Re-export StreamErrorCode from streaming-errors
export { StreamErrorCode } from './streaming-errors';