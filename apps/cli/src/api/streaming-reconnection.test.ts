import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StreamReconnectionManager, ReconnectionConfig } from './streaming-reconnection';
import { EdgeClient } from './edge-client';
import { ProviderStreamEvent } from '@liminal-chat/shared-types';

// Mock EdgeClient
class MockEdgeClient {
  private shouldFail: boolean = false;
  private failureCount: number = 0;
  private failureType: string = 'ECONNREFUSED';
  private events: ProviderStreamEvent[] = [];

  setFailure(shouldFail: boolean, failureType: string = 'ECONNREFUSED', failureCount: number = 1) {
    this.shouldFail = shouldFail;
    this.failureType = failureType;
    this.failureCount = failureCount;
  }

  setEvents(events: ProviderStreamEvent[]) {
    this.events = events;
  }

  async *streamChat(prompt: string, options?: { provider?: string; lastEventId?: string }): AsyncGenerator<ProviderStreamEvent> {
    if (this.shouldFail && this.failureCount > 0) {
      this.failureCount--;
      const error = new Error(`Mock ${this.failureType} error`);
      (error as any).code = this.failureType;
      throw error;
    }

    for (const event of this.events) {
      yield event;
    }
  }
}

describe('StreamReconnectionManager', () => {
  let manager: StreamReconnectionManager;
  let mockClient: MockEdgeClient;
  let contentClearCallback: vi.Mock;

  beforeEach(() => {
    mockClient = new MockEdgeClient();
    contentClearCallback = vi.fn();
    manager = new StreamReconnectionManager(
      {
        maxRetries: 3,
        baseDelayMs: 100,
        maxDelayMs: 1000,
        jitterFactor: 0.1
      },
      contentClearCallback
    );

    // Mock setTimeout to avoid actual delays in tests
    vi.spyOn(global, 'setTimeout').mockImplementation((fn: Function) => {
      fn();
      return 0 as any;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('successful streaming', () => {
    it('should yield events from successful stream', async () => {
      const expectedEvents: ProviderStreamEvent[] = [
        { type: 'content', data: 'Hello', eventId: 'event-1' },
        { type: 'content', data: ' world', eventId: 'event-2' },
        { type: 'usage', data: { promptTokens: 10, completionTokens: 5, totalTokens: 15, model: 'test-model' }, eventId: 'event-3' },
        { type: 'done', eventId: 'event-4' }
      ];

      mockClient.setEvents(expectedEvents);

      const events: ProviderStreamEvent[] = [];
      for await (const event of manager.streamWithReconnection(mockClient as any, 'test prompt')) {
        events.push(event);
      }

      expect(events).toEqual(expectedEvents);
      expect(contentClearCallback).not.toHaveBeenCalled();
    });

    it('should update lastEventId from events', async () => {
      const expectedEvents: ProviderStreamEvent[] = [
        { type: 'content', data: 'Hello', eventId: 'event-1' },
        { type: 'done', eventId: 'event-2' }
      ];

      mockClient.setEvents(expectedEvents);

      for await (const event of manager.streamWithReconnection(mockClient as any, 'test prompt')) {
        // Just consume events
      }

      const state = manager.getReconnectionState();
      expect(state.lastEventId).toBe('event-2');
    });
  });

  describe('reconnection logic', () => {
    it('should retry on retryable errors', async () => {
      mockClient.setFailure(true, 'ECONNREFUSED', 2);
      mockClient.setEvents([
        { type: 'content', data: 'Success after retry', eventId: 'event-1' },
        { type: 'done', eventId: 'event-2' }
      ]);

      const events: ProviderStreamEvent[] = [];
      for await (const event of manager.streamWithReconnection(mockClient as any, 'test prompt')) {
        events.push(event);
      }

      // Should get error events for retries, then success events
      expect(events.length).toBeGreaterThan(2);
      expect(events.some(e => e.type === 'error')).toBe(true);
      expect(events.some(e => e.type === 'content')).toBe(true);
      expect(contentClearCallback).toHaveBeenCalled();
    });

    it('should not retry on non-retryable errors', async () => {
      mockClient.setFailure(true, 'AUTHENTICATION_FAILED', 1);

      await expect(async () => {
        for await (const event of manager.streamWithReconnection(mockClient as any, 'test prompt')) {
          // Should not get here
        }
      }).rejects.toThrow('Mock AUTHENTICATION_FAILED error');

      expect(contentClearCallback).not.toHaveBeenCalled();
    });

    it('should fail after exceeding max retries', async () => {
      mockClient.setFailure(true, 'ECONNREFUSED', 10); // More failures than maxRetries

      await expect(async () => {
        for await (const event of manager.streamWithReconnection(mockClient as any, 'test prompt')) {
          // Should not get here
        }
      }).rejects.toThrow('Failed to reconnect after 3 attempts');
    });

    it('should clear content on reconnection', async () => {
      mockClient.setFailure(true, 'ECONNREFUSED', 1);
      mockClient.setEvents([
        { type: 'content', data: 'Success', eventId: 'event-1' },
        { type: 'done', eventId: 'event-2' }
      ]);

      for await (const event of manager.streamWithReconnection(mockClient as any, 'test prompt')) {
        // Just consume events
      }

      expect(contentClearCallback).toHaveBeenCalled();
    });
  });

  describe('exponential backoff calculations', () => {
    it('should calculate exponential backoff with jitter', () => {
      const config: ReconnectionConfig = {
        maxRetries: 5,
        baseDelayMs: 1000,
        maxDelayMs: 30000,
        jitterFactor: 0.1
      };

      const manager = new StreamReconnectionManager(config);

      // Access private method for testing
      const calculateBackoffDelay = (manager as any).calculateBackoffDelay.bind(manager);

      // Set retry count manually for testing
      (manager as any).state.retryCount = 1;
      const delay1 = calculateBackoffDelay();
      expect(delay1).toBeGreaterThan(900); // 1000 - 10% jitter
      expect(delay1).toBeLessThan(1100); // 1000 + 10% jitter

      (manager as any).state.retryCount = 2;
      const delay2 = calculateBackoffDelay();
      expect(delay2).toBeGreaterThan(1800); // 2000 - 10% jitter
      expect(delay2).toBeLessThan(2200); // 2000 + 10% jitter

      (manager as any).state.retryCount = 3;
      const delay3 = calculateBackoffDelay();
      expect(delay3).toBeGreaterThan(3600); // 4000 - 10% jitter
      expect(delay3).toBeLessThan(4400); // 4000 + 10% jitter
    });

    it('should cap delay at maxDelayMs', () => {
      const config: ReconnectionConfig = {
        maxRetries: 10,
        baseDelayMs: 1000,
        maxDelayMs: 5000,
        jitterFactor: 0.1
      };

      const manager = new StreamReconnectionManager(config);
      const calculateBackoffDelay = (manager as any).calculateBackoffDelay.bind(manager);

      // High retry count should be capped
      (manager as any).state.retryCount = 10;
      const delay = calculateBackoffDelay();
      expect(delay).toBeLessThanOrEqual(5500); // maxDelayMs + max jitter
    });

    it('should never produce negative delays', () => {
      const config: ReconnectionConfig = {
        maxRetries: 5,
        baseDelayMs: 100,
        maxDelayMs: 1000,
        jitterFactor: 1.0 // Large jitter factor
      };

      const manager = new StreamReconnectionManager(config);
      const calculateBackoffDelay = (manager as any).calculateBackoffDelay.bind(manager);

      for (let i = 1; i <= 5; i++) {
        (manager as any).state.retryCount = i;
        const delay = calculateBackoffDelay();
        expect(delay).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('state management', () => {
    it('should reset reconnection state', () => {
      manager.setLastEventId('test-event-id');
      
      const stateBefore = manager.getReconnectionState();
      expect(stateBefore.lastEventId).toBe('test-event-id');

      manager.resetReconnectionState();

      const stateAfter = manager.getReconnectionState();
      expect(stateAfter.retryCount).toBe(0);
      expect(stateAfter.isReconnecting).toBe(false);
      expect(stateAfter.shouldClearContent).toBe(false);
      // lastEventId should be preserved
      expect(stateAfter.lastEventId).toBe('test-event-id');
    });

    it('should set and get last event ID', () => {
      manager.setLastEventId('test-event-123');
      
      const state = manager.getReconnectionState();
      expect(state.lastEventId).toBe('test-event-123');
    });

    it('should return readonly state', () => {
      const state = manager.getReconnectionState();
      
      // Attempting to modify the returned state should not affect internal state
      (state as any).retryCount = 999;
      
      const newState = manager.getReconnectionState();
      expect(newState.retryCount).toBe(0);
    });
  });

  describe('shouldRetry logic', () => {
    it('should identify retryable errors', () => {
      const shouldRetry = (manager as any).shouldRetry.bind(manager);

      // Retryable errors
      expect(shouldRetry({ code: 'ECONNREFUSED' })).toBe(true);
      expect(shouldRetry({ code: 'ETIMEDOUT' })).toBe(true);
      expect(shouldRetry({ message: 'Cannot connect to server' })).toBe(true);
      expect(shouldRetry({ message: 'Network error occurred' })).toBe(true);
    });

    it('should identify non-retryable errors', () => {
      const shouldRetry = (manager as any).shouldRetry.bind(manager);

      // Non-retryable errors
      expect(shouldRetry({ code: 'AUTHENTICATION' })).toBe(false);
      expect(shouldRetry({ code: 'AUTHENTICATION_FAILED' })).toBe(false);
      expect(shouldRetry({ code: 'PROVIDER_INVALID_RESPONSE' })).toBe(false);
    });

    it('should handle errors without code or message', () => {
      const shouldRetry = (manager as any).shouldRetry.bind(manager);

      expect(shouldRetry({})).toBe(false);
      expect(shouldRetry(null)).toBe(false);
      expect(shouldRetry(undefined)).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should preserve lastEventId across reconnections', async () => {
      // First, successful stream with event IDs
      mockClient.setEvents([
        { type: 'content', data: 'First', eventId: 'event-1' },
        { type: 'content', data: ' part', eventId: 'event-2' }
      ]);

      const events1: ProviderStreamEvent[] = [];
      for await (const event of manager.streamWithReconnection(mockClient as any, 'test prompt')) {
        events1.push(event);
      }

      expect(manager.getReconnectionState().lastEventId).toBe('event-2');

      // Now simulate a failure followed by success
      mockClient.setFailure(true, 'ECONNREFUSED', 1);
      mockClient.setEvents([
        { type: 'content', data: 'Reconnected', eventId: 'event-3' },
        { type: 'done', eventId: 'event-4' }
      ]);

      for await (const event of manager.streamWithReconnection(mockClient as any, 'test prompt')) {
        // Just consume
      }

      // Should have preserved and updated the lastEventId
      expect(manager.getReconnectionState().lastEventId).toBe('event-4');
    });

    it('should reset retry count after successful events', async () => {
      // Simulate partial failure then success
      mockClient.setFailure(true, 'ECONNREFUSED', 1);
      mockClient.setEvents([
        { type: 'content', data: 'Success', eventId: 'event-1' },
        { type: 'done', eventId: 'event-2' }
      ]);

      for await (const event of manager.streamWithReconnection(mockClient as any, 'test prompt')) {
        // Just consume
      }

      const state = manager.getReconnectionState();
      expect(state.retryCount).toBe(0); // Should be reset after success
    });
  });
});