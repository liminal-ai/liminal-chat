# Feature 002: Vercel AI SDK & Single Provider Setup

## Overview
Establish Vercel AI SDK integration with OpenRouter as the single provider, replacing the complex NestJS custom implementation with Vercel's streamlined patterns.

## Why OpenRouter First
- **Official Vercel provider exists**: `@openrouter/ai-sdk-provider` 
- **200+ models available** with single API key
- **Proven in production** with existing CLI integration
- **Simpler than custom implementation**: 5-10 lines vs 200+ lines

## Goals
1. **Simplify LLM integration**: Replace custom HTTP client with Vercel AI SDK
2. **Establish streaming patterns**: Core `/chat` endpoint with real-time streaming  
3. **Prove Convex + Vercel**: Validate HTTP actions work with AI SDK
4. **Reduce complexity**: Use official providers instead of custom implementations

## Architecture Evolution

### From: NestJS Custom Implementation
```
CLI → NestJS → Custom OpenRouter Provider → HTTP Fetch → OpenRouter API
                     ↑ (200+ lines of custom code)
```

### To: Convex + Vercel AI SDK  
```
CLI → Convex HTTP Action → @openrouter/ai-sdk-provider → OpenRouter API
              ↑ (5-10 lines using Vercel patterns)
```

## Technical Approach

### Single Provider Focus
- **OpenRouter only** for this feature
- **Use official provider**: `@openrouter/ai-sdk-provider`
- **Standard Vercel patterns**: `streamText()` in HTTP actions
- **No custom abstractions**: Direct Vercel AI SDK usage

### Core Implementation
```typescript
// convex/chat.ts - HTTP Action
import { httpAction } from "./_generated/server";
import { openrouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

export const chat = httpAction(async (ctx, request) => {
  const { messages } = await request.json();
  
  const result = await streamText({
    model: openrouter('openai/gpt-4o'), 
    messages,
  });
  
  return result.toDataStreamResponse();
});
```

## Success Criteria

### Functional
- [ ] CLI can chat via Convex `/chat` endpoint
- [ ] Streaming responses work end-to-end
- [ ] OpenRouter models accessible (GPT-4, Claude, Gemini, etc.)
- [ ] Error handling for API failures

### Technical  
- [ ] Clean HTTP action implementation (<20 lines)
- [ ] Integration tests for CLI → Convex → OpenRouter
- [ ] No custom LLM provider abstractions
- [ ] Performance: <500ms first token

### Architectural
- [ ] Follows Convex + Vercel AI SDK patterns
- [ ] Ready for multi-provider expansion later
- [ ] Clean separation from old NestJS code
- [ ] Documented setup process

## Implementation Stories

### Story 1: Single Provider Setup & Test
**Scope**: Install Vercel AI SDK, configure OpenRouter provider, basic functionality test
**Deliverable**: Working OpenRouter integration in Convex with basic chat

### Story 2: Core Chat Endpoint  
**Scope**: Create `/chat` HTTP action, streaming implementation, CLI integration
**Deliverable**: Full streaming chat flow working end-to-end

## Configuration
```bash
# Convex Environment Variables
OPENROUTER_API_KEY=sk-or-v1-...
```

## Dependencies
```json
{
  "ai": "^3.4.7",
  "@openrouter/ai-sdk-provider": "^0.7.2"
}
```

## Out of Scope
- Multi-provider support (Feature 004)
- Complex error handling/retries (Feature 004)  
- Model selection UI (Feature 004)
- Authentication (separate feature)
- Conversation persistence (Feature 005)

## Risk Mitigation
- **Provider lock-in**: Use standard Vercel patterns for easy provider switching
- **API changes**: Official provider maintained by OpenRouter team
- **Complexity creep**: Keep implementation minimal, defer advanced features 