# Story 1: Basic OpenRouter Provider

## Objective
Implement a non-streaming OpenRouter provider that replaces Vercel AI SDK with direct HTTP calls, establishing the foundation for multi-model support.

## Scope

### In Scope
- Create `openrouter.provider.ts` implementing `ILLMProvider`
- HTTP client using native fetch
- Support both prompt and messages formats
- Error mapping to domain error codes
- Configuration via environment variables
- Comprehensive unit tests

### Out of Scope  
- Streaming implementation (Story 2)
- Model selection UI (Story 3)
- Retry logic (Story 4)

## Technical Design

### Provider Implementation
```typescript
export class OpenRouterProvider implements ILLMProvider {
  async generate(input: string | Message[]): Promise<LlmResponse> {
    // 1. Format request for OpenRouter API
    // 2. Make HTTP POST to /chat/completions
    // 3. Parse response and map to LlmResponse
    // 4. Handle errors with proper codes
  }
  
  getName(): string { return 'openrouter'; }
  isAvailable(): boolean { return !!this.apiKey; }
}
```

### API Integration
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Headers: `Authorization: Bearer ${apiKey}`, `HTTP-Referer: ${appUrl}`
- Timeout: 30 seconds for non-streaming

## Test Specifications

### E2E Test
```typescript
// test/e2e/openrouter-integration.e2e.spec.ts
describe('E2E: OpenRouter Provider Integration', () => {
  it('should process prompt through full stack', async () => {
    // Mock OpenRouter API response
    // CLI sends prompt
    // Verify response flows back correctly
  });
  
  it('should process messages with system prompt', async () => {
    // Mock OpenRouter API with messages
    // Verify system prompt influences response
  });
});
```

### Integration Tests
```typescript
// apps/domain/src/domain/domain.controller.integration.spec.ts
describe('Domain Controller: OpenRouter Integration', () => {
  it('should route to OpenRouter provider');
  it('should handle provider not available');
});
```

### Unit Tests
```typescript
// apps/domain/src/providers/llm/providers/openrouter.provider.spec.ts
describe('OpenRouterProvider', () => {
  describe('generate()', () => {
    it('should convert prompt to OpenRouter format');
    it('should pass messages array correctly');
    it('should include required headers');
    it('should map response to LlmResponse format');
    it('should extract usage statistics');
  });
  
  describe('error handling', () => {
    it('should map 401 to INVALID_API_KEY');
    it('should map 429 to RATE_LIMITED');
    it('should map timeout to PROVIDER_TIMEOUT');
    it('should map network errors to API_ERROR');
  });
});
```

## Acceptance Criteria

### Functional
- [ ] Provider processes prompts successfully with mocked API
- [ ] Provider processes messages array with all roles
- [ ] Usage data extracted from responses
- [ ] Model name included in response

### Technical
- [ ] 90% test coverage
- [ ] All tests written before implementation
- [ ] No Vercel AI SDK imports
- [ ] Follows existing provider patterns

### Cross-Tier Validation
- [ ] CLI can select openrouter provider
- [ ] Edge passes through to Domain correctly  
- [ ] Domain returns expected response format
- [ ] Errors propagate with correct codes

## Implementation Tasks

### Task 1: Write E2E Test Skeleton (30 min)
**Goal**: Create failing E2E test that defines the full integration contract

**Implementation**:
- Create `test/e2e/openrouter-integration.e2e.spec.ts`
- Mock OpenRouter API responses using MSW or similar
- Test both prompt and messages formats
- Verify full CLI → Edge → Domain → OpenRouter flow

**Done Criteria**:
- [ ] Test file exists and imports necessary dependencies
- [ ] Mock server configured for OpenRouter API
- [ ] Two test cases written (prompt & messages)
- [ ] Tests run but fail with "provider not found" error
- [ ] Can run with: `pnpm test test/e2e/openrouter-integration.e2e.spec.ts`

### Task 2: Write Unit Tests Suite (45 min)
**Goal**: Define detailed provider behavior through comprehensive unit tests

**Implementation**:
- Create `apps/domain/src/providers/llm/providers/openrouter.provider.spec.ts`
- Write tests for all provider methods
- Cover all error scenarios
- Test request formatting and response mapping

**Done Criteria**:
- [ ] Test file with 4 describe blocks (generate, getName, isAvailable, errors)
- [ ] At least 10 test cases covering happy path and errors
- [ ] Tests import non-existent OpenRouterProvider (fail at import)
- [ ] Clear test names that document expected behavior
- [ ] Can run with: `cd apps/domain && pnpm test openrouter.provider.spec.ts`

### Task 3: Create Provider Skeleton (15 min)
**Goal**: Minimal implementation that makes tests fail on logic, not structure

**Implementation**:
- Create `apps/domain/src/providers/llm/providers/openrouter.provider.ts`
- Implement ILLMProvider interface
- Add constructor with configuration
- Stub all methods to throw "not implemented"

**Done Criteria**:
- [ ] Provider class exists and implements ILLMProvider
- [ ] All interface methods present but throw errors
- [ ] Constructor accepts API key from environment
- [ ] Unit tests now fail on "not implemented" errors
- [ ] No linting errors in the file

### Task 4: Implement generate() Method (1 hour)
**Goal**: Core HTTP integration with OpenRouter API

**Implementation**:
- Format requests for OpenRouter API
- Use native fetch with proper headers
- Parse responses into LlmResponse format
- Basic error handling (throw on failure)

**Done Criteria**:
- [ ] Accepts both string prompt and Message[] array
- [ ] Makes HTTP POST to correct OpenRouter endpoint
- [ ] Includes Authorization and HTTP-Referer headers
- [ ] Returns properly formatted LlmResponse
- [ ] At least 5 unit tests passing (happy path)
- [ ] Can manually test with: `OPENROUTER_API_KEY=test pnpm test`

### Task 5: Add Error Mapping (45 min)
**Goal**: Robust error handling with proper domain error codes

**Implementation**:
- Map HTTP status codes to domain errors
- Handle network failures and timeouts
- Preserve error context for debugging
- Use shared error utilities

**Done Criteria**:
- [ ] 401 → INVALID_API_KEY error
- [ ] 429 → RATE_LIMITED error
- [ ] Timeout → PROVIDER_TIMEOUT error
- [ ] Network errors → API_ERROR
- [ ] All error unit tests passing
- [ ] Errors include helpful context (status, message)

### Task 6: Factory Integration (30 min)
**Goal**: Make provider selectable from CLI

**Implementation**:
- Update `llm-provider.factory.ts` to include OpenRouter
- Add configuration validation
- Update factory tests
- Ensure provider appears in available providers list

**Done Criteria**:
- [ ] Factory creates OpenRouter provider when requested
- [ ] Provider shows in GET /domain/llm/providers response
- [ ] isAvailable() returns true when API key present
- [ ] Factory tests updated and passing
- [ ] Can select via: `pnpm local-curl POST 8787/api/v1/llm/prompt '{"provider":"openrouter"}'`

### Task 7: E2E Validation (30 min)
**Goal**: Verify complete integration across all tiers

**Implementation**:
- Remove API mocks for real integration test
- Test with actual CLI commands
- Verify streaming readiness (for Story 2)
- Document any issues found

**Done Criteria**:
- [ ] E2E tests pass with mocked OpenRouter
- [ ] Manual test with CLI chat command works
- [ ] Errors propagate correctly through all tiers
- [ ] No regressions in existing tests
- [ ] Documentation updated with setup instructions
- [ ] Can run: `cd apps/cli && pnpm dev` and select OpenRouter

## Implementation Plan

Follow tasks sequentially, committing after each task completion. Total estimated time: 4-5 hours.

## Definition of Done

- [ ] All tests written and passing
- [ ] Provider added to factory
- [ ] Environment vars documented
- [ ] No regressions in existing tests
- [ ] PR approved with test evidence