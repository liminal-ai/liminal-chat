import { ProviderStreamEvent } from '@liminal-chat/shared-types';
import { EdgeClient } from './edge-client';

export interface ReconnectionConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterFactor: number;
}

export interface ReconnectionState {
  retryCount: number;
  lastEventId?: string;
  isReconnecting: boolean;
  shouldClearContent: boolean;
}

export class StreamReconnectionManager {
  private config: ReconnectionConfig;
  private state: ReconnectionState;
  private onContentClear?: () => void;

  constructor(
    config: Partial<ReconnectionConfig> = {},
    onContentClear?: () => void
  ) {
    this.config = {
      maxRetries: 5,
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      jitterFactor: 0.1,
      ...config
    };
    
    this.state = {
      retryCount: 0,
      isReconnecting: false,
      shouldClearContent: false
    };

    this.onContentClear = onContentClear;
  }

  async *streamWithReconnection(
    client: EdgeClient,
    prompt: string,
    options?: { provider?: string }
  ): AsyncGenerator<ProviderStreamEvent> {
    while (this.state.retryCount <= this.config.maxRetries) {
      try {
        // Clear content if this is a reconnection attempt
        if (this.state.shouldClearContent && this.onContentClear) {
          this.onContentClear();
          this.state.shouldClearContent = false;
        }

        // Start streaming
        this.state.isReconnecting = false;
        const streamOptions = {
          ...options,
          lastEventId: this.state.lastEventId
        };

        for await (const event of client.streamChat(prompt, streamOptions)) {
          // Update last event ID if present
          if (event.eventId) {
            this.state.lastEventId = event.eventId;
          }

          // Reset retry count on successful event
          this.state.retryCount = 0;
          
          yield event;
          
          // Exit successfully if we get a 'done' event
          if (event.type === 'done') {
            return;
          }
        }

        // If we reach here, the stream ended without a 'done' event
        // This might be a normal completion, so return
        return;

      } catch (error: any) {
        // Check if we should retry
        if (!this.shouldRetry(error)) {
          throw error;
        }

        this.state.retryCount++;
        this.state.isReconnecting = true;
        this.state.shouldClearContent = true;

        // If we've exceeded max retries, throw the error
        if (this.state.retryCount > this.config.maxRetries) {
          throw new Error(`Failed to reconnect after ${this.config.maxRetries} attempts: ${error.message}`);
        }

        // Calculate delay with exponential backoff and jitter
        const delay = this.calculateBackoffDelay();
        
        // Yield a reconnection event to inform the user
        yield {
          type: 'error',
          data: {
            message: `Connection lost. Reconnecting in ${Math.round(delay / 1000)}s... (attempt ${this.state.retryCount}/${this.config.maxRetries})`,
            code: 'CONNECTION_LOST',
            retryable: true
          }
        };

        // Wait before retrying
        await this.delay(delay);
      }
    }
  }

  private shouldRetry(error: any): boolean {
    // Handle null/undefined errors
    if (!error) {
      return false;
    }

    // Don't retry on certain error types
    const nonRetryableErrors = [
      'AUTHENTICATION',
      'AUTHENTICATION_FAILED',
      'PROVIDER_INVALID_RESPONSE'
    ];

    // Check if error has a code property indicating it's not retryable
    if (error.code && nonRetryableErrors.includes(error.code)) {
      return false;
    }

    // Retry on network-related errors
    const retryableMessages = [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNRESET',
      'Cannot connect to server',
      'Connection lost',
      'Network error'
    ];

    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code || '';

    return retryableMessages.some(msg => 
      errorMessage.includes(msg.toLowerCase()) || errorCode === msg
    );
  }

  private calculateBackoffDelay(): number {
    // Exponential backoff: baseDelay * 2^retryCount
    const exponentialDelay = this.config.baseDelayMs * Math.pow(2, this.state.retryCount - 1);
    
    // Cap at maximum delay
    const cappedDelay = Math.min(exponentialDelay, this.config.maxDelayMs);
    
    // Add jitter to prevent thundering herd
    const jitter = cappedDelay * this.config.jitterFactor * (Math.random() - 0.5) * 2;
    
    return Math.max(0, cappedDelay + jitter);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getReconnectionState(): Readonly<ReconnectionState> {
    return { ...this.state };
  }

  resetReconnectionState(): void {
    const preservedLastEventId = this.state.lastEventId;
    this.state = {
      retryCount: 0,
      isReconnecting: false,
      shouldClearContent: false,
      lastEventId: preservedLastEventId
    };
  }

  setLastEventId(eventId: string): void {
    this.state.lastEventId = eventId;
  }
}