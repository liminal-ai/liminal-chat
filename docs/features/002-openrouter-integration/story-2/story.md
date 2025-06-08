# Story 2: Implement End-to-End SSE Streaming with Graceful Interruption Handling

**Story ID:** S002  
**Feature ID:** F002  
**Title:** Implement End-to-End SSE Streaming with Graceful Interruption Handling  
**Date Created:** 2025-06-08  
**Status:** Refined  
**Priority:** High

## Business Context

As a user of Liminal Chat, I want to see smooth streaming responses from the LLM agent so I know something is happening and I don't have to wait for the full LLM response to arrive before beginning to read the response. This real-time feedback creates a more engaging and responsive user experience, similar to how ChatGPT and Claude display responses incrementally.

### User Value
- **Immediate Feedback**: Users see the first words within milliseconds, confirming their request is being processed
- **Better Reading Experience**: Users can start reading and comprehending while the rest of the response generates
- **Perceived Performance**: Streaming makes the system feel faster even if total response time is unchanged
- **Graceful Interruption**: If responses are taking an unexpected direction, users can interrupt early

## 1. Objective
Add robust Server-Sent Events (SSE) streaming support for the OpenRouter provider, ensuring correct and resilient stream processing and display across all application tiers (Domain → Edge → CLI).

## 2. Scope

### In Scope
- Implement `generateStream()` in the `OpenRouterProvider` to produce SSE-compatible data
- Parse SSE chunks received from the OpenRouter API, including content deltas and control signals (e.g., `[DONE]`)
- Ensure the Edge service properly proxies SSE streams from the Domain service to the CLI without unintended buffering or modification
- Enable the CLI to receive and display streaming responses incrementally as tokens arrive
- Implement graceful handling of stream interruptions:
  - CLI detects interruptions and attempts reconnection
  - Backend (Domain/`OpenRouterProvider`) restarts the stream from the beginning with OpenRouter upon successful CLI reconnection, as OpenRouter does not support `Last-Event-ID` resumption
  - CLI clears any prior partial content from the interrupted stream and displays the new, restarted stream
- Emit usage data (e.g., token counts) as a final event or part of the stream completion signal from the `OpenRouterProvider`

### Out of Scope
- Advanced UI enhancements for streaming display (e.g., complex animations, beyond simple incremental text)
- User-configurable progress indicators during streaming
- Stream history replay or resuming sessions across application restarts (beyond the immediate turn's interruption handling)
- Support for `Last-Event-ID` based stream resumption with OpenRouter (due to current provider limitations)

## 3. Technical Design

### 3.1. Interface Definitions

#### 3.1.1. ProviderStreamEvent Interface
```typescript
// packages/shared-types/src/llm/streaming.ts

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
```

#### 3.1.2. Stream Error Taxonomy
```typescript
// packages/shared-types/src/llm/streaming-errors.ts

export enum StreamErrorCode {
  // Network errors (1xxx)
  NETWORK_ERROR = 1000,
  CONNECTION_TIMEOUT = 1001,
  CONNECTION_LOST = 1002,
  
  // Provider errors (2xxx)
  PROVIDER_UNAVAILABLE = 2000,
  PROVIDER_RATE_LIMIT = 2001,
  PROVIDER_INVALID_RESPONSE = 2002,
  
  // Stream parsing errors (3xxx)
  INVALID_SSE_FORMAT = 3000,
  MALFORMED_JSON = 3001,
  UNEXPECTED_STREAM_END = 3002,
  
  // Client errors (4xxx)
  INVALID_REQUEST = 4000,
  AUTHENTICATION_FAILED = 4001,
  INSUFFICIENT_QUOTA = 4002,
}

export const STREAM_ERROR_MESSAGES: Record<StreamErrorCode, string> = {
  [StreamErrorCode.NETWORK_ERROR]: "Network error occurred during streaming",
  [StreamErrorCode.CONNECTION_TIMEOUT]: "Connection timed out",
  [StreamErrorCode.CONNECTION_LOST]: "Connection lost. Attempting to reconnect...",
  [StreamErrorCode.PROVIDER_UNAVAILABLE]: "AI provider temporarily unavailable",
  [StreamErrorCode.PROVIDER_RATE_LIMIT]: "Rate limit exceeded. Please try again later",
  [StreamErrorCode.PROVIDER_INVALID_RESPONSE]: "Invalid response from AI provider",
  [StreamErrorCode.INVALID_SSE_FORMAT]: "Invalid streaming format received",
  [StreamErrorCode.MALFORMED_JSON]: "Malformed data received from provider",
  [StreamErrorCode.UNEXPECTED_STREAM_END]: "Stream ended unexpectedly",
  [StreamErrorCode.INVALID_REQUEST]: "Invalid request format",
  [StreamErrorCode.AUTHENTICATION_FAILED]: "Authentication failed",
  [StreamErrorCode.INSUFFICIENT_QUOTA]: "Insufficient quota for this request",
};
```

### 3.2. Domain: `OpenRouterProvider` Stream Implementation
```typescript
// apps/domain/src/providers/llm/providers/openrouter.provider.ts
async *generateStream(
  input: string | Message[], 
  originalRequestParams: any, 
  lastEventId?: string
): AsyncIterable<ProviderStreamEvent> {
  // 1. Log received lastEventId for observability (if present)
  if (lastEventId) {
    this.logger.debug(`Received lastEventId: ${lastEventId} (not used for OpenRouter resumption)`);
  }
  
  // 2. Initiate a NEW stream request to OpenRouter API with `stream: true`
  const response = await this.startStream(input, { ...originalRequestParams, stream: true });
  
  // 3. Process SSE chunks
  try {
    for await (const chunk of this.parseSSEStream(response)) {
      const eventId = `or-${Date.now()}-${nanoid(6)}`; // e.g., or-1733680800000-x7B9mK
      
      if (chunk.type === 'data') {
        // Parse JSON data
        const data = JSON.parse(chunk.data);
        
        if (data === '[DONE]') {
          yield { type: 'done', eventId };
          break;
        }
        
        // Extract content delta
        const content = data.choices?.[0]?.delta?.content;
        if (content !== undefined && content !== '') {
          yield { type: 'content', data: content, eventId };
        }
        
        // Check for usage data
        if (data.usage) {
          yield { 
            type: 'usage', 
            data: {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
              model: data.model || this.model,
            },
            eventId 
          };
        }
      }
      // Ignore SSE comments (lines starting with :)
    }
  } catch (error) {
    yield {
      type: 'error',
      data: this.mapErrorToStreamError(error),
      eventId: `or-${Date.now()}-${nanoid(6)}`
    };
  }
}

private mapErrorToStreamError(error: unknown): StreamError {
  // Map various error types to StreamError
  if (error instanceof NetworkError) {
    return {
      message: error.message,
      code: StreamErrorCode.NETWORK_ERROR,
      retryable: true,
      details: { originalError: error.name }
    };
  }
  // ... additional error mapping
}
```

### 3.3. Reconnection Logic Specification

#### 3.3.1. CLI Reconnection Strategy
```typescript
// apps/cli/src/api/streaming-reconnection.ts

export interface ReconnectionConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitterRange: number;
}

export const DEFAULT_RECONNECTION_CONFIG: ReconnectionConfig = {
  maxRetries: 3,
  initialDelay: 1000,    // 1 second
  maxDelay: 10000,       // 10 seconds
  backoffMultiplier: 2,  // Exponential backoff
  jitterRange: 0.1       // ±10% jitter
};

export class StreamReconnectionManager {
  private retryCount = 0;
  private lastEventId?: string;
  
  async attemptReconnection(): Promise<boolean> {
    if (this.retryCount >= this.config.maxRetries) {
      return false;
    }
    
    const delay = this.calculateDelay();
    await this.sleep(delay);
    
    try {
      // Attempt reconnection with lastEventId
      const newStream = await this.client.reconnectStream(this.lastEventId);
      this.retryCount = 0;
      return true;
    } catch (error) {
      this.retryCount++;
      return false;
    }
  }
  
  private calculateDelay(): number {
    const baseDelay = Math.min(
      this.config.initialDelay * Math.pow(this.config.backoffMultiplier, this.retryCount),
      this.config.maxDelay
    );
    
    // Add jitter
    const jitter = baseDelay * this.config.jitterRange * (Math.random() * 2 - 1);
    return Math.round(baseDelay + jitter);
  }
}
```

#### 3.3.2. Success Criteria
- Reconnection succeeds when a new SSE connection is established and the first valid event is received
- CLI successfully clears previous partial content before displaying new stream
- No duplicate content is displayed to the user

### 3.4. Edge Service Capability Requirements

The Edge service must support the following capabilities for streaming:

```typescript
// Edge Service Requirements
interface EdgeStreamingCapabilities {
  // 1. SSE Detection
  detectSSEResponse(headers: Headers): boolean;
  
  // 2. Header Forwarding
  forwardLastEventId(request: Request): string | undefined;
  
  // 3. Keep-Alive Handling
  maintainSSEConnection(response: Response): void;
  
  // 4. Buffering Control
  disableResponseBuffering(): void;
}

// Pre-implementation verification checklist:
// [ ] Run Edge capability tests before starting implementation
// [ ] Verify Cloudflare Workers SSE support with test endpoint
// [ ] Confirm no automatic response buffering in production mode
// [ ] Test header forwarding with actual Last-Event-ID values

// Verification tests to add:
describe('Edge SSE Capabilities', () => {
  it('should detect text/event-stream content type');
  it('should forward Last-Event-ID header from client');
  it('should not buffer SSE chunks');
  it('should maintain keep-alive for long streams');
  it('should handle chunked transfer encoding');
});
```

### 3.5. Performance Requirements

#### 3.5.1. Latency Metrics
- **First Token Latency**: ≤ 500ms from request to first content chunk displayed
- **Inter-chunk Latency**: ≤ 100ms from chunk receipt at Edge to CLI display
- **Reconnection Latency**: ≤ 2s for successful reconnection attempt

#### 3.5.2. Throughput Metrics
- **Minimum Stream Rate**: 10 tokens/second sustainable
- **Maximum Buffer Size**: 64KB for SSE chunk accumulation
- **Memory Usage**: ≤ 10MB increase during 10,000 token stream

#### 3.5.3. Reliability Metrics
- **Reconnection Success Rate**: ≥ 90% for transient network failures
- **Stream Completion Rate**: ≥ 99% for stable connections
- **Error Recovery Time**: ≤ 5s from error detection to recovery/failure

### 3.6. Memory Management Strategy

```typescript
// Memory constraints and cleanup
interface StreamMemoryManagement {
  // Buffer limits
  maxChunkBufferSize: 64 * 1024;        // 64KB max for accumulating partial SSE lines
  maxContentAccumulator: 10 * 1024 * 1024; // 10MB max for total response
  
  // Cleanup triggers
  cleanupOnStreamEnd(): void;           // Release all buffers on [DONE]
  cleanupOnError(): void;               // Immediate cleanup on any error
  cleanupOnTimeout(ms: number): void;   // Force cleanup after timeout
}

// Implementation approach:
class StreamBuffer {
  private buffer: Uint8Array;
  private position: number = 0;
  
  append(chunk: Uint8Array): void {
    if (this.position + chunk.length > this.maxChunkBufferSize) {
      throw new Error('Stream buffer overflow - possible attack or malformed stream');
    }
    // ... append logic
  }
  
  reset(): void {
    this.position = 0;
    // Explicitly clear sensitive data
    this.buffer.fill(0);
  }
}
```

### 3.7. UTF-8 Boundary Handling

```typescript
// UTF-8 incomplete sequence buffering
class UTF8StreamDecoder {
  private incompleteBytes: Uint8Array | null = null;
  
  decode(chunk: Uint8Array): string {
    let toProcess = chunk;
    
    // Prepend any incomplete bytes from previous chunk
    if (this.incompleteBytes) {
      toProcess = new Uint8Array(this.incompleteBytes.length + chunk.length);
      toProcess.set(this.incompleteBytes);
      toProcess.set(chunk, this.incompleteBytes.length);
      this.incompleteBytes = null;
    }
    
    // Find last complete UTF-8 character boundary
    const lastCompleteIndex = this.findLastCompleteCharBoundary(toProcess);
    
    // Save incomplete bytes for next chunk
    if (lastCompleteIndex < toProcess.length) {
      this.incompleteBytes = toProcess.slice(lastCompleteIndex);
      toProcess = toProcess.slice(0, lastCompleteIndex);
    }
    
    return new TextDecoder('utf-8', { fatal: false }).decode(toProcess);
  }
  
  private findLastCompleteCharBoundary(bytes: Uint8Array): number {
    // Walk backwards to find start of last complete UTF-8 sequence
    for (let i = bytes.length - 1; i >= Math.max(0, bytes.length - 4); i--) {
      if ((bytes[i] & 0x80) === 0) return i + 1;        // ASCII
      if ((bytes[i] & 0xE0) === 0xC0) return i + 2;     // 2-byte char
      if ((bytes[i] & 0xF0) === 0xE0) return i + 3;     // 3-byte char
      if ((bytes[i] & 0xF8) === 0xF0) return i + 4;     // 4-byte char
    }
    return bytes.length; // Assume complete if no markers found
  }
}
```

## 4. Test Specifications & Conditions (Gherkin Examples)

### 4.1. E2E Tests
```typescript
// test/e2e/openrouter-streaming.e2e.spec.ts
describe('E2E: OpenRouter Streaming', () => {
  it('should stream response incrementally through all tiers and display usage data', async () => { 
    // Verify first token latency ≤ 500ms
    // Verify inter-chunk latency ≤ 100ms
    // Verify complete message reconstruction
    // Verify usage data display
  });
});
```

**Functional Test Conditions (for E2E):**
```gherkin
Feature: OpenRouter End-to-End Streaming

  Scenario: Successful streaming with performance validation
    Given the CLI is connected to the Edge service
    And the OpenRouter provider is configured
    When the user sends a prompt "Hello"
    Then the first token should appear within 500ms
    And subsequent tokens should appear with ≤ 100ms latency
    And the CLI should incrementally display "Hello, world!"
    And after the stream completes, the CLI should display usage data like "[Model: claude-3.5-sonnet | Tokens: 15]"

  Scenario: Graceful handling of stream interruption with event ID tracking
    Given the CLI is receiving a streaming response for the prompt "Tell me a story"
    And the CLI has displayed "Once upon a time," with lastEventId "or-1234-5"
    And the network connection between the CLI and Edge is interrupted
    Then the CLI should display "Connection lost. Attempting to reconnect..."
    And the CLI should attempt reconnection with exponential backoff (1s, 2s, 4s)
    When the network connection is restored after 3 seconds
    And the CLI reconnects to the Edge with Last-Event-ID: "or-1234-5"
    Then the Domain service should log "Received lastEventId: or-1234-5 (not used for OpenRouter resumption)"
    And the Domain service should initiate a NEW stream request to OpenRouter
    And the CLI should clear the "Once upon a time," text
    And the CLI should start displaying the NEW stream from the beginning
    And the user sees the complete story streamed

  Scenario: Failed reconnection with proper error handling
    Given the CLI is receiving a streaming response
    And the network connection is interrupted
    When the CLI attempts reconnection 3 times over ~7 seconds (1s + 2s + 4s)
    And all reconnection attempts fail
    Then the CLI should display "Reconnection failed. Please try your command again."
    And the error should be logged with code CONNECTION_LOST (1002)
```

### 4.2. Integration Tests
- **Domain (`OpenRouterProvider`):**
  - `apps/domain/src/providers/llm/providers/openrouter.provider.integration.spec.ts`
    - Verify correct parsing of various OpenRouter SSE chunk formats
    - Verify ProviderStreamEvent generation with proper eventIds
    - Verify error mapping to StreamError types
    - Verify SSE comment lines are handled (ignored for content)
    - Verify stream completes correctly on `[DONE]` signal
    - Verify error events are yielded with proper error codes

### 4.3. Unit Tests
- **Domain (`OpenRouterProvider.generateStream()`):**
  - Test extraction of content from `delta` fields
  - Test event ID generation format
  - Test StreamError mapping for various error types
  - Test handling of empty delta fields
  - Test correct yielding of typed ProviderStreamEvent objects
  - Test handling of multi-byte UTF-8 characters

- **CLI (`StreamReconnectionManager`):**
  - Test exponential backoff calculation
  - Test jitter application
  - Test max retry enforcement
  - Test lastEventId preservation across reconnection attempts

## 5. Acceptance Criteria

### 5.1. Functional
- [ ] Streaming responses from OpenRouter appear incrementally in the CLI as tokens are generated
- [ ] Complete messages are correctly reconstructed at the CLI after the stream finishes
- [ ] Usage data (model, token counts) is displayed in the CLI after the stream completes
- [ ] **Stream Interruptions:**
  - [ ] CLI detects network interruptions within 2 seconds
  - [ ] CLI displays clear user messages about connection status
  - [ ] CLI implements exponential backoff with jitter for reconnection
  - [ ] CLI sends `Last-Event-ID` header on reconnection attempts
  - [ ] Backend logs but does not use `Last-Event-ID` for OpenRouter
  - [ ] CLI clears previously displayed partial content before showing new stream
  - [ ] Failed reconnection shows actionable error message to user
- [ ] All errors are mapped to specific StreamErrorCode values
- [ ] Application remains stable during stream interruptions or malformed SSE events

### 5.2. Technical
- [ ] ProviderStreamEvent interface is properly defined in shared-types
- [ ] StreamError taxonomy covers all expected error scenarios
- [ ] New streaming code achieves at least 90% unit test coverage
- [ ] SSE parsing handles all documented OpenRouter format variations
- [ ] Performance metrics meet specified thresholds
- [ ] Memory usage remains within specified limits for long streams
- [ ] Proper UTF-8 character handling across chunk boundaries

### 5.3. Cross-Tier Validation
- [ ] Domain service correctly yields typed ProviderStreamEvent objects
- [ ] Edge service capabilities verified through integration tests
- [ ] Edge maintains SSE connection without buffering
- [ ] CLI correctly processes typed events and displays appropriate UI
- [ ] Error events propagate with proper error codes through all tiers

## 6. Implementation Plan (Phased Approach)

1. **Red Phase (Tests First - Focused on Core Streaming & Interruption):**
   - Define interfaces in shared-types package
   - Write E2E tests with performance assertions
   - Write unit tests for typed event generation and error mapping
   - Write integration tests for reconnection scenarios
   - Create test fixtures for various SSE formats and error conditions

2. **Green Phase (Implementation):**
   - Implement typed generateStream in OpenRouterProvider
   - Implement StreamReconnectionManager in CLI
   - Add performance monitoring hooks
   - Verify Edge service capabilities
   - Test with real OpenRouter API under various network conditions

3. **Refactor Phase (Polish & Optimization):**
   - Extract common SSE utilities to shared-utils
   - Optimize memory usage for long streams
   - Add comprehensive logging and metrics
   - Performance tune based on real-world measurements

## 7. SSE Format Reference (OpenRouter)
```
data: {"id":"gen-123","model":"claude-3.5-sonnet","object":"chat.completion.chunk","choices":[{"delta":{"content":"Hello"},"index":0}]}

data: {"id":"gen-123","choices":[{"delta":{"content":" there!"},"index":0}]}

: keep-alive comment

data: {"id":"gen-123","choices":[{"delta":{},"index":0}],"usage":{"prompt_tokens":10,"completion_tokens":5,"total_tokens":15}}

data: [DONE]
```

## 8. Key Edge Cases to Test
1. Empty content deltas in SSE chunks
2. SSE comment lines (`: keep-alive`) interspersed in the stream
3. Multiple SSE events in a single network packet
4. Multi-byte UTF-8 characters split across SSE chunks
5. Connection drops at various stream positions (start, middle, near end)
6. Rapid reconnection attempts (rate limiting)
7. OpenRouter API errors with specific error codes
8. Very short streams (1-2 tokens) and very long streams (10,000+ tokens)
9. Malformed JSON in SSE data lines
10. Network timeouts vs explicit connection drops

## 9. Definition of Done
- [ ] All E2E, integration, and unit tests pass
- [ ] Manual testing confirms all acceptance criteria
- [ ] Performance metrics validated with production-like load
- [ ] No memory leaks detected in 1-hour streaming session
- [ ] Error handling covers all defined StreamErrorCode scenarios
- [ ] Code review confirms proper interface usage
- [ ] Documentation updated with streaming examples
- [ ] Monitoring/logging sufficient for production debugging

## 10. Technical Notes & Decisions
- **OpenRouter Limitation**: No Last-Event-ID support requires full stream restart
- **Event ID Format**: `or-{timestamp}-{counter}` for debugging and ordering
- **Error Philosophy**: Fail fast with specific codes rather than generic errors
- **Performance Trade-offs**: Optimize for latency over throughput
- **Memory Management**: Stream processing must be truly streaming (no full buffering)
- **Retry Strategy**: Exponential backoff with jitter prevents thundering herd