# Vercel Migration Details

## Current State Analysis

### Provider Interface Compatibility

Our existing `ILLMProvider` interface is **already compatible** with Vercel AI SDK primitives:

```typescript
// Our interface (llm-provider.interface.ts)
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ILLMProvider {
  generate(input: string | Message[]): Promise<LlmResponse>;
  generateStream?(input: string | Message[]): AsyncIterable<ProviderStreamEvent>;
  getName(): string;
  isAvailable(): boolean;
}
```

**Key Finding**: Our `Message` type is identical to Vercel AI SDK's message format. No transformation needed.

### Vercel OpenAI Provider Status

**What Works**:
- Direct implementation of `ILLMProvider` (no adapter layer)
- Uses Vercel AI SDK's `generateText()` function
- Handles both string prompts and message arrays
- 100% test coverage on implemented functionality
- Proper error handling with `VercelErrorMapper`

**Critical Gap**:
- Missing `generateStream()` implementation
- Currently only supports synchronous generation
- Blocks end-to-end streaming functionality

### Implementation Pattern

```typescript
// Current working implementation
const result = await generateText({
  model: openai(this.modelName),
  messages,
});

// Missing streaming implementation would use:
const stream = streamText({
  model: openai(this.modelName), 
  messages,
});
```

## Migration Strategy

### Phase 1: Complete Backend Streaming
1. Add `generateStream()` method to `VercelOpenAIProvider`
2. Use Vercel AI SDK's `streamText()` function
3. Map to our `ProviderStreamEvent` format
4. Add streaming tests

### Phase 2: Validate Integration
1. Create integration tests with real OpenAI API
2. Test streaming through domain service layer
3. Verify end-to-end CLI → Edge → Domain flow

### Phase 3: Frontend Development
1. Only after backend streaming is proven
2. Leverage Vercel AI SDK frontend primitives (`useChat`, `useCompletion`)
3. Build component generation workflows

## Architecture Advantages

### No Adapter Tax
- Direct Vercel AI SDK integration
- No message format transformation
- Minimal abstraction overhead

### Preserved Domain Architecture
- Keeps our provider abstraction for multi-LLM support
- Maintains existing error handling patterns
- Preserves domain service layer intelligence

### Vercel Ecosystem Benefits
- Native streaming support
- Built-in error handling patterns  
- Frontend primitive compatibility
- v0 component generation readiness

## Identified Wrapper: LlmResponse

**Current Issue**: Our `generate()` method wraps Vercel's native response:

```typescript
// Vercel native response from generateText()
{
  text: string;
  usage: { promptTokens, completionTokens, totalTokens };
  // Plus other Vercel metadata fields
}

// Our wrapper in LlmResponse
{
  content: string;  // ← We map text → content
  model: string;    // ← We inject model name
  usage: { ... };   // ← Passes through unchanged
}
```

**Decision**: **Remove the wrapper and return Vercel native response directly**

**Rationale**: 
- Aligns with Vercel pivot objective of using their primitives everywhere
- Enables frontend code to use same response shape as `useChat`/`useCompletion`
- Eliminates transformation overhead
- Maximizes velocity with v0 component generation

**Required Changes**:
1. Modify `generate()` to return Vercel's native `generateText()` response
2. Update domain service layer to expect `result.text` instead of `result.content`
3. Update all tests expecting `LlmResponse` format

## Backend Endpoints Required for Full Vercel UI Support

To maximize Vercel UI component usage, we need these 3 core endpoints:

### 1. `/api/chat` - Powers useChat()
- **Purpose**: Real-time streaming chat interfaces
- **Input**: `{ messages: Message[], id?: string }`
- **Backend**: Uses `streamText()` from AI SDK Core
- **Output**: `result.toDataStreamResponse()` 
- **Unlocks**: Chat components, conversation management, most v0 examples

### 2. `/api/completion` - Powers useCompletion()
- **Purpose**: Single-turn text generation
- **Input**: `{ prompt: string }`
- **Backend**: Uses `streamText()` from AI SDK Core  
- **Output**: `result.toDataStreamResponse()`
- **Unlocks**: Text completion interfaces, prompt-based generation

### 3. `/api/use-object` - Powers useObject()
- **Purpose**: Structured data streaming with schema validation
- **Input**: Context/prompt data
- **Backend**: Uses `streamObject()` with schema validation
- **Output**: `result.toTextStreamResponse()`
- **Unlocks**: Dynamic forms, data tables, JSON workflows, structured outputs

**Key Pattern**: All endpoints use Vercel AI SDK Core functions and return streaming responses using their response helpers.

## Generative UI Capabilities

**What Generative UI Enables**:
- LLM acts as router, deciding which UI components to render
- Progressive streaming of React components from server
- Tool calls return interactive components, not just data
- Multi-viewport orchestration potential

**Architecture Options for Multi-Viewport**:
1. **Multiple Independent Streams** - Each micro-view has own stream
2. **Single Stream + Routing** - One stream with viewport targeting (recommended)
3. **Hybrid Stream Manager** - Multiple logical streams, single transport

**Liminal Integration Strategy**:
- Single WebSocket/SSE connection from backend
- LLM generates viewport routing instructions
- Frontend micro-view controller distributes to appropriate viewports
- Preserves Vercel velocity while enabling complex layouts

## Immediate Next Steps

### Phase 1: Basic Vercel Integration
1. **Remove LlmResponse wrapper** from `VercelOpenAIProvider.generate()`
2. **Complete `generateStream()` implementation** using native Vercel streaming
3. **Update domain service calls** to use `result.text`
4. **Add streaming integration tests** with real API calls

### Phase 2: Core Endpoints + Basic Chat
5. **Implement `/api/chat` endpoint** in backend (NestJS pattern)
6. **Implement `/api/completion` endpoint** for single-turn generation
7. **Implement `/api/use-object` endpoint** for structured data
8. **Build Next.js basic bitch chat** (no persistence)
9. **Validate streaming works end-to-end**

### Phase 3: Persistence + Round Table UI Evolution
10. **Add persistence layer** to backend and chat
11. **Iterate basic chat toward round table UI**
12. **Master core Vercel patterns** before advancing

**Why this progression:**
- **Proves streaming plumbing first** - Don't complicate with DB during initial debugging
- **Validates Vercel integration** - Core LLM functionality working before advanced features
- **Clean iteration path** - Basic chat → round table is simpler than jumping to generative UI
- **Learning time** - Round table development provides time to research generative UI patterns
- **Solid foundation** - By round table completion, we have real chat app with persistence

### Phase 4: Generative UI Exploration  
13. **Research generative UI patterns** (YouTube university)
14. **Build simple tool → component streaming**
15. **Test multi-viewport routing with 2-3 micro-views**
16. **Validate development velocity in practice**

### Phase 5: Advanced Patterns
17. **Implement viewport orchestration**
18. **Build Liminal-specific UI generation patterns**
19. **Integration with Tauri micro-view architecture**

**Reality Check**: "We don't know shit until we build it" - All velocity estimates are theoretical until we have working code and real development experience.

The foundation is solid - we just need to eliminate our wrappers, complete streaming, and build the core endpoints to unlock the full Vercel ecosystem.