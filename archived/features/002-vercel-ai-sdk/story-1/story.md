# Story 1: Domain Vercel AI SDK Integration

## Objective
Integrate the Vercel AI SDK into the Domain layer to support multiple LLM providers while maintaining backward compatibility with the echo provider.

## Success Criteria
- [ ] Domain accepts both `prompt` and `messages` formats
- [ ] Echo provider continues to work unchanged
- [ ] OpenAI provider works with real API calls
- [ ] Provider selection via request parameter
- [ ] Proper error handling for missing/invalid API keys

## E2E Test Scenario
```typescript
// Test: CLI sends prompt through Edge to Domain with OpenAI provider
// CLI → Edge → Domain → OpenAI → Domain → Edge → CLI

describe('E2E: OpenAI Provider Integration', () => {
  it('should process prompt through entire stack with OpenAI', async () => {
    // Given: OpenAI API key is configured
    // When: CLI sends "What is 2+2?" with provider "openai"
    // Then: Response contains OpenAI model name and correct answer
    // And: Usage stats show token counts
  });
});
```

## TDD Unit Test Conditions

### Domain Layer Tests
1. **Provider Factory**
   - WHEN creating provider with "echo" THEN returns EchoProvider instance
   - WHEN creating provider with "openai" THEN returns VercelOpenAIProvider instance
   - WHEN creating provider with unknown name THEN throws ProviderNotFoundError

2. **Request Handling**
   - WHEN request has only prompt THEN converts to messages format internally
   - WHEN request has messages array THEN uses messages directly
   - WHEN request has both prompt and messages THEN throws ValidationError
   - WHEN request has neither prompt nor messages THEN throws ValidationError

3. **Vercel SDK Integration**
   - WHEN OpenAI API key not set THEN throws ProviderNotConfiguredError
   - WHEN Vercel SDK returns response THEN maps to our response format
   - WHEN Vercel SDK throws error THEN maps to our error codes

### Provider Implementation Tests
1. **Echo Provider (existing)**
   - WHEN processing prompt THEN returns "Echo: {prompt}"
   - WHEN processing messages THEN concatenates user messages with "Echo: "

2. **VercelOpenAIProvider**
   - WHEN API key is invalid THEN throws InvalidApiKeyError
   - WHEN model not found THEN throws ModelNotFoundError
   - WHEN rate limited THEN throws ProviderRateLimitedError

## TDD Integration Test Conditions

### Domain HTTP Client Tests
1. **Prompt Mode**
   - WHEN POST /domain/llm/prompt with prompt only THEN returns completion
   - WHEN POST with provider "openai" THEN uses OpenAI provider
   
2. **Messages Mode**
   - WHEN POST with messages array THEN processes conversation
   - WHEN messages include system role THEN applies system prompt

## Implementation Guide

### Phase 1: Setup (Red)
1. Install Vercel AI SDK: `npm install ai @ai-sdk/openai`
2. Write failing tests for all conditions above
3. Tests should fail with "not implemented" errors

### Phase 2: Implementation (Green)
1. Create `ILLMProvider` interface matching existing pattern
2. Implement `VercelOpenAIProvider` using `@ai-sdk/openai`
3. Update `LLMService` to handle both prompt and messages
4. Add provider factory with configuration loading

### Phase 3: Refactor
1. Extract common provider logic to base class
2. Improve error mapping and messages
3. Add logging and metrics

## File Structure
```
server/src/
├── providers/
│   └── llm/
│       ├── ILLMProvider.ts          # Existing interface
│       ├── EchoProvider.ts          # Update for messages
│       ├── VercelOpenAIProvider.ts  # New implementation
│       └── LLMProviderFactory.ts    # New factory
├── services/
│   └── core/
│       └── LLMService.ts            # Update to use factory
└── schemas/
    └── domain/
        └── LLMPromptRequest.json    # Already updated
```

## Notes
- Start with mock OpenAI responses for unit tests
- Use cheapest model (gpt-4o-mini) for integration tests
- Environment variable: `OPENAI_API_KEY`
- Keep echo as default to avoid breaking existing code