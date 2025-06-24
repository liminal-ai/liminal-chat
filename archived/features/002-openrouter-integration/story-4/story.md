# Story 4: Resilience & Error Handling

## Objective
Implement comprehensive error handling and resilience patterns across all tiers to ensure reliable operation with OpenRouter API.

## Scope

### In Scope
- Retry logic with exponential backoff
- Timeout handling for slow responses
- Rate limit detection and handling
- Clear error messages to users
- Fallback strategies

### Out of Scope
- Circuit breaker patterns
- Request queuing
- Alternative provider fallback
- Offline mode

## Technical Design

### Retry Strategy
```typescript
class RetryHandler {
  async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries: number = 3,
      initialDelay: number = 1000,
      maxDelay: number = 10000,
      retryableErrors: string[] = ['RATE_LIMITED', 'TIMEOUT']
    }
  ): Promise<T>
}
```

### Error Categories
1. **Retryable**: Rate limits, timeouts, 503 errors
2. **Non-retryable**: Auth errors, validation errors
3. **Fatal**: Network down, service unavailable

### Timeout Handling
- Non-streaming: 30s default, configurable
- Streaming: 60s total, 30s between chunks
- CLI timeout: Slightly higher than Edge

## Test Specifications

### E2E Test
```typescript
// test/e2e/error-resilience.e2e.spec.ts
describe('E2E: Error Handling & Resilience', () => {
  it('should retry on rate limit and succeed', async () => {
    // Mock: First call 429, second succeeds
    // Verify retry with backoff
    // Verify final success
  });
  
  it('should timeout and show clear error', async () => {
    // Mock: Delayed response beyond timeout
    // Verify timeout at each tier
    // Verify user sees helpful message
  });
  
  it('should handle auth errors without retry', async () => {
    // Mock: 401 response
    // Verify no retry attempted
    // Verify clear error message
  });
});
```

### Integration Tests
```typescript
// apps/domain/test/providers/resilience.integration.spec.ts
describe('Provider Resilience', () => {
  it('should retry with exponential backoff');
  it('should respect max retry limit');
  it('should timeout long requests');
  it('should handle partial streaming failures');
});

// apps/edge/test/error-propagation.spec.ts
describe('Edge Error Propagation', () => {
  it('should preserve error codes from Domain');
  it('should add context to errors');
  it('should handle Edge-specific timeouts');
});
```

### Unit Tests
```typescript
// apps/domain/src/providers/llm/providers/openrouter.provider.spec.ts
describe('OpenRouter Error Handling', () => {
  describe('HTTP errors', () => {
    it('should map 401 to INVALID_API_KEY');
    it('should map 429 to RATE_LIMITED'); 
    it('should map 503 to PROVIDER_UNAVAILABLE');
    it('should include retry-after header');
  });
  
  describe('Network errors', () => {
    it('should handle ECONNREFUSED');
    it('should handle ETIMEDOUT');
    it('should handle DNS failures');
  });
});

// apps/cli/src/utils/error-display.spec.ts
describe('Error Display', () => {
  it('should show user-friendly messages');
  it('should suggest fixes for common errors');
  it('should hide technical details by default');
});
```

## Error Mapping

### OpenRouter → Domain Errors
| OpenRouter Error | Domain Error Code | User Message |
|-----------------|-------------------|--------------|
| 401 Unauthorized | INVALID_API_KEY | "Invalid API key. Check OPENROUTER_API_KEY" |
| 429 Too Many Requests | RATE_LIMITED | "Rate limit hit. Retrying in X seconds..." |
| 503 Service Unavailable | PROVIDER_UNAVAILABLE | "Service temporarily unavailable" |
| Timeout | PROVIDER_TIMEOUT | "Request timed out after 30s" |
| Network Error | PROVIDER_API_ERROR | "Network error connecting to AI service" |

### Retry Configuration
```typescript
{
  maxRetries: 3,
  retryDelays: [1000, 2000, 4000], // exponential
  retryableStatuses: [429, 502, 503, 504],
  retryableErrors: ['ETIMEDOUT', 'ECONNRESET']
}
```

## Acceptance Criteria

### Functional
- [ ] Rate limited requests retry and succeed
- [ ] Timeouts show clear error message
- [ ] Auth errors fail fast with help
- [ ] Network errors handled gracefully

### Technical  
- [ ] Exponential backoff implemented
- [ ] Timeout at each tier tested
- [ ] Error codes preserved across tiers
- [ ] 90% test coverage

### User Experience
- [ ] Errors show actionable messages
- [ ] Retry progress visible to user
- [ ] Debug mode shows full details
- [ ] Common fixes suggested

## Implementation Plan

1. **Red Phase** (Tests First)
   - Write E2E error scenario tests
   - Write retry behavior tests
   - Write timeout tests per tier
   - Mock various error conditions

2. **Green Phase** (Implementation)
   - Implement retry handler
   - Add timeout configuration
   - Map all error types
   - Create user-friendly messages

3. **Refactor Phase**
   - Extract retry utilities
   - Centralize error messages
   - Add debug logging
   - Optimize retry delays

## Error Message Examples

### Rate Limited
```
⚠️  Rate limit reached. Retrying in 2 seconds... (attempt 2/3)
✓ Request successful after retry
```

### Invalid API Key
```
❌ Authentication failed: Invalid API key

To fix:
1. Set your OpenRouter API key:
   export OPENROUTER_API_KEY=sk-or-v1-...
   
2. Or add to .liminalrc:
   {
     "providers": {
       "openrouter": {
         "apiKey": "sk-or-v1-..."
       }
     }
   }
```

### Timeout
```
❌ Request timed out after 30 seconds

This might be due to:
- Large request size
- Network issues
- Service congestion

Try: liminal chat --timeout 60000
```

### Network Error
```
❌ Failed to connect to OpenRouter API

Check:
- Internet connection
- Firewall settings  
- OpenRouter service status: https://status.openrouter.ai
```

## Resilience Patterns

### 1. Exponential Backoff
```typescript
const delay = Math.min(
  initialDelay * Math.pow(2, attemptNumber),
  maxDelay
);
```

### 2. Timeout Escalation
- CLI: 35s (gives Edge time to retry)
- Edge: 32s (gives Domain time to retry)
- Domain: 30s (actual API timeout)

### 3. Partial Success (Streaming)
- Save partial response on interrupt
- Show what was received
- Indicate incomplete response

## Definition of Done

- [ ] All error scenarios tested
- [ ] Retry logic works correctly
- [ ] Timeouts configured per tier
- [ ] User messages helpful
- [ ] No error swallowing
- [ ] Performance impact < 5%