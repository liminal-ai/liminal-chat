# Story 1 TDD Test Specifications

## Overview
These tests should be written FIRST, before implementing any production code. They will all fail initially (Red phase), then you implement code to make them pass (Green phase).

## E2E Test

### `test/e2e/llm-openai.e2e.spec.ts`
```typescript
describe('E2E: OpenAI Provider Integration', () => {
  it('should process prompt through entire stack with OpenAI', async () => {
    // Skip if SKIP_PROVIDER_TESTS is true
    // Requires real OPENAI_API_KEY
    
    // POST http://localhost:8766/domain/llm/prompt
    // {
    //   "prompt": "What is 2+2?",
    //   "provider": "openai"
    // }
    
    // Expect:
    // - Status 200
    // - response.content includes "4" or "four"
    // - response.model includes "gpt"
    // - response.usage has all three token counts > 0
  });

  it('should process messages with system prompt through entire stack', async () => {
    // POST with messages array including system prompt
    // Verify system prompt influences response style
  });
});
```

## Unit Tests

### `src/providers/llm/llm-provider.interface.spec.ts`
```typescript
describe('ILLMProvider Interface', () => {
  it('should define generate method accepting string or messages');
  it('should define getName method');
  it('should define isAvailable method');
});
```

### `src/providers/llm/providers/echo.provider.spec.ts`
```typescript
describe('EchoProvider', () => {
  describe('with prompt string', () => {
    it('should return "Echo: {prompt}"');
    it('should calculate tokens as length/4');
    it('should return model as "echo-1.0"');
  });

  describe('with messages array', () => {
    it('should concatenate user messages with "Echo: " prefix');
    it('should ignore system messages in output');
    it('should include assistant messages in output');
    it('should calculate tokens for all messages');
  });

  describe('availability', () => {
    it('should always return true for isAvailable');
    it('should return "echo" for getName');
  });
});
```

### `src/providers/llm/providers/vercel-openai.provider.spec.ts`
```typescript
describe('VercelOpenAIProvider', () => {
  beforeEach(() => {
    jest.mock('ai');
    jest.mock('@ai-sdk/openai');
  });

  describe('configuration', () => {
    it('should throw PROVIDER_NOT_CONFIGURED if API key missing');
    it('should use configured model name');
    it('should default to gpt-4o-mini if no model specified');
  });

  describe('generate with prompt', () => {
    it('should convert prompt to messages format');
    it('should call generateText with correct parameters');
    it('should return mapped response with content, model, usage');
  });

  describe('generate with messages', () => {
    it('should pass messages array directly to generateText');
    it('should handle system, user, and assistant roles');
    it('should aggregate token usage correctly');
  });

  describe('error handling', () => {
    it('should map invalid API key error to INVALID_API_KEY');
    it('should map model not found to MODEL_NOT_FOUND');
    it('should map rate limit error to PROVIDER_RATE_LIMITED');
    it('should map network errors to PROVIDER_API_ERROR');
  });

  describe('availability', () => {
    it('should return false if API key not configured');
    it('should return true if API key exists');
    it('should return "openai" for getName');
  });
});
```

### `src/providers/llm/llm-provider.factory.spec.ts`
```typescript
describe('LlmProviderFactory', () => {
  describe('getProvider', () => {
    it('should return EchoProvider for "echo"');
    it('should return VercelOpenAIProvider for "openai"');
    it('should throw ProviderNotFoundError for unknown provider');
    it('should use default provider when none specified');
  });

  describe('getAvailableProviders', () => {
    it('should return list of configured providers');
    it('should always include echo provider');
    it('should check isAvailable for each provider');
  });

  describe('configuration loading', () => {
    it('should load API keys from ConfigService');
    it('should handle missing configuration gracefully');
    it('should log available providers on init');
  });
});
```

### `src/domain/dto/llm-prompt-request.dto.spec.ts`
```typescript
describe('LlmPromptRequestDto Validation', () => {
  describe('prompt mode', () => {
    it('should accept valid prompt string');
    it('should reject empty prompt');
    it('should reject prompt over maxLength');
  });

  describe('messages mode', () => {
    it('should accept valid messages array');
    it('should reject empty messages array');
    it('should reject messages without role');
    it('should reject messages without content');
    it('should reject invalid role values');
  });

  describe('oneOf constraint', () => {
    it('should reject request with both prompt and messages');
    it('should reject request with neither prompt nor messages');
  });

  describe('provider validation', () => {
    it('should accept valid provider enum values');
    it('should reject invalid provider names');
    it('should allow missing provider (optional)');
  });
});
```

### `src/domain/domain.service.spec.ts`
```typescript
describe('DomainService - LLM Integration', () => {
  describe('prompt method', () => {
    it('should use factory to get provider');
    it('should pass prompt or messages to provider.generate');
    it('should return provider response unchanged');
    it('should use default provider if none specified');
  });

  describe('error handling', () => {
    it('should throw HttpException for provider errors');
    it('should include provider name in error message');
    it('should preserve error codes from provider');
  });
});
```

### `src/providers/llm/vercel-error.mapper.spec.ts`
```typescript
describe('VercelErrorMapper', () => {
  it('should map API key errors to INVALID_API_KEY');
  it('should map model errors to MODEL_NOT_FOUND');
  it('should map rate limit to PROVIDER_RATE_LIMITED');
  it('should map quota errors to PROVIDER_QUOTA_EXCEEDED');
  it('should map unknown errors to PROVIDER_API_ERROR');
  it('should include provider name in error details');
  it('should sanitize sensitive information');
});
```

## Integration Tests

### `src/domain/domain.controller.integration.spec.ts`
```typescript
describe('Domain Controller - LLM Endpoint', () => {
  describe('POST /domain/llm/prompt', () => {
    it('should process prompt with echo provider');
    it('should process messages with echo provider');
    it('should return 400 for validation errors');
    it('should return proper error for missing provider');
  });
});
```

## Test Execution Order

1. **Write all test files first** with empty or failing tests
2. **Run tests** - all should fail (Red)
3. **Implement interfaces** - some type tests pass
4. **Implement EchoProvider** with messages support
5. **Implement DTOs** with validation
6. **Implement VercelOpenAIProvider**
7. **Implement Factory and Error Mapper**
8. **Update Service and Controller**
9. **All tests should pass** (Green)
10. **Refactor** with confidence

## Important Testing Notes

1. **Mock Vercel AI SDK** at the module level:
   ```typescript
   jest.mock('ai', () => ({
     generateText: jest.fn(),
   }));
   ```

2. **Environment Variables** for tests:
   ```typescript
   process.env.OPENAI_API_KEY = 'test-key';
   process.env.DEFAULT_LLM_PROVIDER = 'echo';
   ```

3. **Skip real API tests** by default:
   ```typescript
   const skipProviderTests = process.env.SKIP_PROVIDER_TESTS === 'true';
   
   (skipProviderTests ? it.skip : it)('should call real OpenAI', ...);
   ```

4. **Test data builders** for messages:
   ```typescript
   const buildMessage = (role: string, content: string) => ({ role, content });
   const systemPrompt = buildMessage('system', 'You are helpful');
   ```

Remember: Write tests first, implement second, refactor third!