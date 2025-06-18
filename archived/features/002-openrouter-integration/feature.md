# Feature 002: OpenRouter Integration

## Overview
This feature replaces the Vercel AI SDK with direct OpenRouter API integration, providing access to 200+ LLM models through a unified interface while maintaining the existing contract structure.

## Goals

1. **Direct API Integration**: Remove SDK dependency for better control
2. **Multi-Model Access**: Support all OpenRouter models with single API key
3. **Streaming Support**: Implement SSE streaming across all tiers
4. **Cost Efficiency**: Leverage OpenRouter's competitive pricing
5. **TDD Development**: Cross-tier test-first approach

## Architecture Evolution

### Current State
```
CLI → Edge → Domain → Vercel AI SDK → OpenAI only
     (prompt)  (prompt)
```

### After Feature 002
```
CLI → Edge → Domain → OpenRouter Provider → 200+ Models
     (prompt or    (prompt or            (Native API calls
      messages)     messages)             with streaming)
```

## API Contract (No Changes)

### Request
```json
// Simple mode
POST /domain/llm/prompt
{
  "prompt": "Hello, AI!",
  "provider": "openrouter"
}

// Messages mode
POST /domain/llm/prompt
{
  "messages": [
    {"role": "system", "content": "You are helpful"},
    {"role": "user", "content": "Hello, AI!"}
  ],
  "provider": "openrouter"
}
```

### Response (Non-streaming)
```json
{
  "content": "Hello! How can I help?",
  "model": "anthropic/claude-3.5-sonnet",
  "usage": {
    "promptTokens": 25,
    "completionTokens": 15,
    "totalTokens": 40
  }
}
```

### Response (Streaming)
```
data: {"delta": "Hello", "model": "anthropic/claude-3.5-sonnet"}
data: {"delta": "! How", "model": "anthropic/claude-3.5-sonnet"}
data: {"delta": " can I help?", "model": "anthropic/claude-3.5-sonnet"}
data: {"usage": {"promptTokens": 25, "completionTokens": 15, "totalTokens": 40}}
data: [DONE]
```

## Implementation Stories

### Story 1: Basic OpenRouter Provider
**Objective**: Implement non-streaming OpenRouter provider with full test coverage

**Scope**:
- Domain tier only
- HTTP client implementation
- Error mapping
- Model configuration

**Cross-tier validation**:
- E2E: CLI → Edge → Domain → OpenRouter (mocked)
- Integration: Domain controller → Provider
- Unit: Provider methods, error handling

### Story 2: SSE Streaming Implementation  
**Objective**: Add streaming support across all tiers

**Scope**:
- Domain: AsyncIterable implementation
- Edge: SSE proxy enhancement
- CLI: Stream display handling

**Cross-tier validation**:
- E2E: Full streaming flow with real responses
- Integration: Each tier boundary
- Unit: Stream parsing, chunk handling

### Story 3: Model Selection & Configuration
**Objective**: Enable model selection from CLI through to OpenRouter

**Scope**:
- CLI: --model flag and config support
- Edge: Model validation
- Domain: Model routing and defaults

**Cross-tier validation**:
- E2E: Different models produce different responses
- Integration: Config propagation
- Unit: Model validation, defaults

### Story 4: Resilience & Error Handling
**Objective**: Comprehensive error handling across tiers

**Scope**:
- Rate limiting with retries
- Timeout handling
- Fallback strategies
- Clear error messages

**Cross-tier validation**:
- E2E: Error scenarios end-to-end
- Integration: Error propagation
- Unit: Each error type

## Success Criteria

### Functional Requirements
- [ ] OpenRouter provider works with mock in tests
- [ ] Streaming works end-to-end
- [ ] Model selection from CLI
- [ ] Graceful error handling
- [ ] No Vercel AI SDK dependency

### Technical Requirements
- [ ] 90% test coverage per story
- [ ] Cross-tier tests for each story
- [ ] No breaking changes
- [ ] Performance: <100ms overhead

### Operational Requirements
- [ ] Clear setup documentation
- [ ] Environment variable configuration
- [ ] Cost tracking via usage data
- [ ] Debug logging for troubleshooting

## Configuration

### Environment Variables
```bash
# Required
OPENROUTER_API_KEY=sk-or-v1-...

# Optional
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_TIMEOUT=30000
```

### Supported Models (Examples)
- **Anthropic**: claude-3.5-sonnet, claude-3-opus
- **OpenAI**: gpt-4, gpt-3.5-turbo
- **Google**: gemini-pro, gemini-pro-vision
- **Meta**: llama-3.1-70b-instruct
- **Open Models**: mixtral-8x7b, deepseek-coder

## Testing Strategy

### TDD Flow Per Story
1. **Write E2E test** - Full tier crossing scenario
2. **Write integration tests** - Tier boundaries
3. **Write unit tests** - Component logic
4. **Implement minimal code** - Make tests pass
5. **Refactor** - Improve design

### Test Execution Modes
```bash
# Unit tests only (fast, no external calls)
pnpm test:unit

# Integration tests (may use test containers)
pnpm test:integration  

# E2E with mocks (default CI/CD)
pnpm test:e2e

# E2E with real API (manual verification)
OPENROUTER_API_KEY=real-key pnpm test:e2e:real
```

## Non-Goals
- **Provider-specific features**: No OpenRouter-specific APIs
- **Response caching**: Not in this feature
- **Conversation memory**: Stateless per request
- **Tool/Function calling**: Future feature

## Risk Mitigation
- **API Changes**: Abstract behind interface
- **Rate Limits**: Implement exponential backoff
- **Costs**: Log usage data for monitoring
- **Network Issues**: Timeout and retry logic

## Migration Path
1. Implement OpenRouter provider alongside existing
2. Test thoroughly with feature flags
3. Switch default provider to OpenRouter
4. Remove Vercel AI SDK in separate PR