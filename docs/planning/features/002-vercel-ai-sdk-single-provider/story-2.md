# Story 2: Core Chat Endpoint

## Objective
Create production `/chat` HTTP action with streaming support and integrate with CLI for full end-to-end chat experience.

## Scope

### In Scope
- Streaming chat endpoint mirroring Vercel's `/api/chat` pattern
- CLI integration to call Convex HTTP action instead of NestJS domain
- Message array support for conversation context
- Real-time streaming display in CLI
- Integration test for full flow

### Out of Scope
- Conversation persistence (Feature 005)
- Multiple model selection (Feature 004)
- Advanced error handling/retries (Feature 004)
- Authentication (separate feature)

## Technical Design

### Streaming Chat HTTP Action
```typescript
// apps/liminal-api/convex/chat.ts
"use node";

import { httpAction } from "./_generated/server";
import { openrouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

export const chat = httpAction(async (ctx, request) => {
  const { messages, model = 'openai/gpt-4o' } = await request.json();
  
  const result = await streamText({
    model: openrouter(model),
    messages,
  });
  
  return result.toDataStreamResponse();
});
```

### CLI Integration Update
```typescript
// apps/cli/src/api/edge-client.ts (or create convex-client.ts)
export class ConvexClient {
  constructor(private convexUrl: string) {}
  
  async *streamChat(messages: Message[]): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${this.convexUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    
    if (!response.body) throw new Error('No response body');
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('0:"')) {
          // Parse Vercel AI SDK streaming format
          const text = JSON.parse(line.slice(2));
          yield text;
        }
      }
    }
  }
}
```

### CLI Command Update
```typescript
// apps/cli/src/commands/chat.ts
// Update to use ConvexClient instead of EdgeClient for provider 'convex'
```

## Testing Strategy

### Integration Test
```typescript
// apps/cli/tests/integration/convex-chat.integration.test.ts
describe('Convex Chat Integration', () => {
  it('should stream chat response end-to-end', async () => {
    const convexClient = new ConvexClient(process.env.CONVEX_URL);
    const messages = [
      { role: 'user', content: 'Hello, say "Integration test success"' }
    ];
    
    let response = '';
    for await (const chunk of convexClient.streamChat(messages)) {
      response += chunk;
    }
    
    expect(response).toContain('Integration test success');
  });
});
```

### Manual Testing
```bash
# 1. Test streaming endpoint directly (using pnpm local-curl to avoid macOS security prompts)
pnpm local-curl POST your-deployment.convex.site/chat '{"messages":[{"role":"user","content":"Hello"}]}'

# 2. Test via CLI
cd apps/cli
npm run dev chat --provider=convex
> Hello
< Hi there! How can I help you?
```

## Acceptance Criteria

### Functional
- [ ] Streaming endpoint returns real-time token-by-token responses
- [ ] CLI displays streaming text with typewriter effect
- [ ] Conversation context maintained across messages
- [ ] Multiple OpenRouter models selectable

### Technical
- [ ] Response format matches Vercel AI SDK standard
- [ ] Streaming latency: <500ms first token
- [ ] CLI integration works without breaking existing providers
- [ ] Integration test passes consistently

### User Experience
- [ ] Smooth streaming display in CLI
- [ ] Graceful error handling for API failures
- [ ] Clear model identification in responses
- [ ] Performance comparable to existing providers

## Implementation Tasks

### Task 1: Create Streaming HTTP Action (45 min)
- Implement `chat` HTTP action with `streamText`
- Test streaming response format
- Verify multiple models work

### Task 2: CLI Client Integration (60 min)
- Create ConvexClient class
- Implement streaming response parsing
- Add 'convex' provider option to CLI
- Test manual conversation flow

### Task 3: Integration Testing (30 min)
- Write integration test for full flow
- Test error scenarios
- Verify performance benchmarks

### Task 4: Documentation Update (15 min)
- Update CLI help text
- Add convex provider to examples
- Document environment setup

## Story Notes

### Vercel AI SDK Streaming Format
The streaming response uses this format:
```
0:"Hello"
0:" there"
0:"!"
1:{"finishReason":"stop","usage":{"promptTokens":10,"completionTokens":3}}
```
- `0:` prefix indicates text chunks
- `1:` prefix indicates metadata (usage, finish reason)

### CLI Provider Integration
Add 'convex' as a provider option:
```bash
# Existing
liminal chat --provider=openrouter
liminal chat --provider=echo

# New  
liminal chat --provider=convex
```

### Environment Variables
```bash
# CLI environment
CONVEX_URL=https://your-deployment.convex.site

# Convex dashboard
OPENROUTER_API_KEY=sk-or-v1-...
```

### Performance Expectations
- **First token**: <500ms (baseline from existing providers)
- **Streaming speed**: 20-50 tokens/second (OpenRouter dependent)
- **End-to-end latency**: CLI → Convex → OpenRouter → CLI

### Ready for Feature 003
This completes the basic Vercel AI SDK integration. Next features:
- **Feature 003**: Testing infrastructure setup
- **Feature 004**: Multi-provider & core endpoints expansion
- **Feature 005**: Model/Provider DTOs with persistence 