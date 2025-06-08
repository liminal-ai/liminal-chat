# Story 2: SSE Streaming Implementation

## Objective
Add streaming support to OpenRouter provider and ensure SSE streams work correctly across all tiers (Domain → Edge → CLI).

## Scope

### In Scope
- Implement `generateStream()` in OpenRouter provider
- Parse SSE chunks from OpenRouter API
- Ensure Edge properly proxies SSE streams
- CLI displays streaming responses incrementally
- Handle stream interruptions gracefully

### Out of Scope
- Streaming UI enhancements
- Progress indicators
- Stream history replay

## Technical Design

### Domain: Stream Implementation
```typescript
async *generateStream(input: string | Message[]): AsyncIterable<string> {
  // 1. Set stream: true in request
  // 2. Parse SSE chunks: data: {"delta": "...", ...}
  // 3. Yield content deltas
  // 4. Handle data: [DONE] signal
  // 5. Emit usage data at end
}
```

### Edge: SSE Proxy (Already Implemented)
```typescript
// Existing code detects text/event-stream and proxies correctly
// Just needs to handle OpenRouter's SSE format
```

### CLI: Stream Display
```typescript
// Existing EdgeClient.streamChat handles SSE
// May need adjustment for OpenRouter's format
```

## Test Specifications

### E2E Test
```typescript
// test/e2e/openrouter-streaming.e2e.spec.ts
describe('E2E: OpenRouter Streaming', () => {
  it('should stream response through all tiers', async () => {
    // Mock SSE stream from OpenRouter
    // Verify chunks appear in order at CLI
    // Verify usage data at stream end
  });
  
  it('should handle stream interruption gracefully', async () => {
    // Start stream, interrupt midway
    // Verify partial response handled
  });
});
```

### Integration Tests
```typescript
// apps/domain/src/providers/llm/providers/openrouter.provider.integration.spec.ts
describe('OpenRouter Streaming Integration', () => {
  it('should parse SSE chunks correctly');
  it('should handle comment lines in SSE');
  it('should complete on [DONE] signal');
});

// apps/edge/test/streaming-proxy.integration.spec.ts
describe('Edge SSE Proxy', () => {
  it('should proxy OpenRouter SSE format');
  it('should maintain connection keep-alive');
});
```

### Unit Tests
```typescript
// apps/domain/src/providers/llm/providers/openrouter.provider.spec.ts
describe('OpenRouterProvider.generateStream()', () => {
  it('should yield content from delta fields');
  it('should skip comment SSE lines');
  it('should handle multi-byte UTF-8 correctly');
  it('should emit usage as final event');
});

// apps/cli/src/api/edge-client.spec.ts  
describe('EdgeClient streaming', () => {
  it('should accumulate chunks into full response');
  it('should handle reconnection on error');
});
```

## Acceptance Criteria

### Functional
- [ ] Streaming responses appear incrementally in CLI
- [ ] Complete messages reconstruct correctly
- [ ] Usage data appears after stream completes
- [ ] Interruptions handled without crashes

### Technical
- [ ] 90% test coverage for new code
- [ ] SSE parsing handles edge cases
- [ ] No memory leaks in long streams
- [ ] Proper UTF-8 handling

### Cross-Tier Validation
- [ ] Domain yields chunks correctly
- [ ] Edge proxies without buffering
- [ ] CLI displays incremental updates
- [ ] Errors propagate appropriately

## Implementation Plan

1. **Red Phase** (Tests First)
   - Write E2E streaming test
   - Write SSE parsing unit tests
   - Write integration tests for each tier
   - Mock different streaming scenarios

2. **Green Phase** (Implementation)
   - Add generateStream to provider
   - Implement SSE parser
   - Test with real OpenRouter API
   - Verify existing Edge/CLI code works

3. **Refactor Phase**
   - Extract SSE parsing utilities
   - Optimize chunk buffering
   - Add streaming metrics
   - Improve error recovery

## SSE Format Reference

### OpenRouter SSE Format
```
data: {"id":"gen-123","model":"claude-3.5-sonnet","object":"chat.completion.chunk","choices":[{"delta":{"content":"Hello"},"index":0}]}

data: {"id":"gen-123","choices":[{"delta":{"content":" there!"},"index":0}]}

data: {"id":"gen-123","choices":[{"delta":{},"index":0}],"usage":{"prompt_tokens":10,"completion_tokens":5,"total_tokens":15}}

data: [DONE]
```

### Expected CLI Output
```
Assistant: Hello there!

[Model: claude-3.5-sonnet | Tokens: 15]
```

## Edge Cases to Test

1. **Empty deltas** - Some chunks have empty content
2. **Comment lines** - SSE comments for keep-alive
3. **Multiple chunks in buffer** - Network may batch
4. **UTF-8 boundaries** - Multi-byte chars split across chunks
5. **Connection drops** - Resume or fail gracefully

## Definition of Done

- [ ] All streaming tests pass
- [ ] Manual test with real API succeeds
- [ ] No regressions in non-streaming mode
- [ ] Performance: <50ms chunk latency
- [ ] Documentation includes streaming example