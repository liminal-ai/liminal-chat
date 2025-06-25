# Story 1: Single Provider Setup & Test

## Objective
Install and configure Vercel AI SDK with OpenRouter provider in Convex, proving basic integration works with simple test chat.

## Scope

### In Scope
- Install Vercel AI SDK and OpenRouter provider in Convex
- Configure OpenRouter API key in Convex environment
- Create basic HTTP action for text generation (non-streaming first)
- Test with simple prompt via Convex dashboard/CLI
- Validate OpenRouter models are accessible

### Out of Scope
- Streaming implementation (Story 2)
- CLI integration (Story 2)
- Error handling beyond basic try/catch
- Multiple model support

## Technical Design

### Dependencies to Add
```json
// apps/liminal-api/package.json
{
  "dependencies": {
    "ai": "^3.4.7",
    "@openrouter/ai-sdk-provider": "^0.7.2"
  }
}
```

### Basic HTTP Action
```typescript
// apps/liminal-api/convex/chat.ts
"use node";

import { httpAction } from "./_generated/server";
import { openrouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

export const simpleChat = httpAction(async (ctx, request) => {
  const { prompt } = await request.json();
  
  try {
    const result = await generateText({
      model: openrouter('openai/gpt-4o'),
      prompt,
    });
    
    return new Response(JSON.stringify({
      content: result.text,
      model: result.responseMetadata?.modelId,
      usage: result.usage
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
```

### Environment Configuration
```bash
# Set in Convex Dashboard
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

## Testing Strategy

### Manual Testing via Convex Dashboard
```bash
# 1. Deploy the function
npx convex deploy

# 2. Test via Convex dashboard function runner
# Function: chat:simpleChat  
# Args: { "prompt": "Hello, can you say hi back?" }
```

### Manual Testing via CLI
```bash
# Test the HTTP endpoint directly (using pnpm local-curl to avoid macOS security prompts)
pnpm local-curl POST your-deployment.convex.site/chat/simpleChat '{"prompt": "Hello world"}'
```

## Acceptance Criteria

### Functional
- [ ] OpenRouter provider initializes without errors
- [ ] Simple prompt returns coherent response
- [ ] Response includes text, model info, and token usage
- [ ] Different OpenRouter models accessible (test 2-3 models)

### Technical
- [ ] Convex function deploys successfully
- [ ] HTTP action responds within 10 seconds
- [ ] Proper JSON response format
- [ ] Basic error handling for API failures

### Environmental
- [ ] OPENROUTER_API_KEY configures correctly
- [ ] Function runs in Node.js runtime ("use node" directive)
- [ ] No TypeScript compilation errors

## Implementation Tasks

### Task 1: Install Dependencies (15 min)
```bash
cd apps/liminal-api
npm install ai @openrouter/ai-sdk-provider
```

### Task 2: Create Basic HTTP Action (30 min)
- Create `convex/chat.ts` with `simpleChat` action
- Test basic prompt/response flow
- Verify model and usage data in response

### Task 3: Environment Configuration (10 min)
- Set OPENROUTER_API_KEY in Convex dashboard
- Test API key validation

### Task 4: Model Validation (20 min)
- Test 3 different models:
  - `openai/gpt-4o` (OpenAI via OpenRouter)
  - `anthropic/claude-3.5-sonnet` (Anthropic via OpenRouter)  
  - `google/gemini-pro` (Google via OpenRouter)
- Verify different response characteristics

## Story Notes

### Convex + Vercel AI SDK Pattern Notes

**Key Patterns from Research:**
1. **"use node" directive required** for Vercel AI SDK in Convex
2. **HTTP actions not mutations** - LLM calls are side effects  
3. **Direct response streaming** - `.toDataStreamResponse()` for Story 2
4. **Environment variables** in Convex dashboard, not .env files
5. **Error handling** - wrap in try/catch, return Response objects

**Example from Convex documentation:**
```typescript
// Working pattern from convex examples
"use node";
import { httpAction } from "./_generated/server";
import { streamText } from 'ai';

export const generate = httpAction(async (ctx, request) => {
  const result = await streamText({
    model: openrouter('openai/gpt-4o'),
    messages: await request.json(),
  });
  
  return result.toDataStreamResponse();
});
```

**What makes this different from NestJS implementation:**
- No custom provider classes needed
- No manual HTTP fetch calls  
- No custom error mapping
- Official provider handles all OpenRouter specifics
- Vercel AI SDK handles streaming, tokens, etc.

### Ready for Story 2
This story proves the basic integration. Story 2 will add:
- Streaming responses (`streamText` + `.toDataStreamResponse()`)
- CLI integration to call the HTTP action
- Message array support (conversation context)
- Real-time streaming display 