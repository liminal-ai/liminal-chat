# OpenRouter Integration Contracts

## API Contracts

### OpenRouter API (External)

#### Request
```http
POST https://openrouter.ai/api/v1/chat/completions
Authorization: Bearer {OPENROUTER_API_KEY}
HTTP-Referer: https://liminal.chat
Content-Type: application/json

{
  "model": "anthropic/claude-3.5-sonnet",
  "messages": [
    {"role": "system", "content": "You are helpful"},
    {"role": "user", "content": "Hello"}
  ],
  "stream": false, // or true for SSE
  "temperature": 0.7
}
```

#### Response (Non-streaming)
```json
{
  "id": "gen-1234567890",
  "model": "anthropic/claude-3.5-sonnet", 
  "object": "chat.completion",
  "created": 1234567890,
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you today?"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 15,
    "total_tokens": 40
  }
}
```

#### Response (Streaming)
```
data: {"id":"gen-123","model":"anthropic/claude-3.5-sonnet","object":"chat.completion.chunk","choices":[{"delta":{"content":"Hello"},"index":0}]}

data: {"id":"gen-123","choices":[{"delta":{"content":" there!"},"index":0}]}

data: {"id":"gen-123","choices":[{"delta":{},"index":0}],"usage":{"prompt_tokens":10,"completion_tokens":5,"total_tokens":15}}

data: [DONE]
```

### Internal Contracts (No Changes)

#### CLI → Edge
```typescript
// Existing contract remains unchanged
POST /api/v1/llm/prompt
{
  "prompt": "string" | "messages": Message[],
  "provider": "openrouter",
  "model?": "anthropic/claude-3.5-sonnet" // New optional field
}
```

#### Edge → Domain  
```typescript
// Existing contract remains unchanged
POST /domain/llm/prompt
{
  "prompt": "string" | "messages": Message[],
  "provider": "openrouter",
  "model?": "anthropic/claude-3.5-sonnet" // New optional field
}
```

#### Domain → Provider
```typescript
interface ILLMProvider {
  generate(input: string | Message[]): Promise<LlmResponse>;
  generateStream?(input: string | Message[]): AsyncIterable<string>;
  getName(): string;
  isAvailable(): boolean;
}
```

## Error Code Contracts

### OpenRouter Error Mapping
| HTTP Status | OpenRouter Error | Domain Error Code | Description |
|-------------|-----------------|-------------------|-------------|
| 400 | Invalid request | VALIDATION_ERROR | Bad request format |
| 401 | Invalid API key | INVALID_API_KEY | Authentication failed |
| 403 | Forbidden | PROVIDER_ACCESS_DENIED | No access to model |
| 404 | Model not found | MODEL_NOT_FOUND | Unknown model |
| 429 | Rate limited | PROVIDER_RATE_LIMITED | Too many requests |
| 500 | Server error | PROVIDER_API_ERROR | OpenRouter internal error |
| 503 | Service unavailable | PROVIDER_UNAVAILABLE | Temporary outage |
| Timeout | - | PROVIDER_TIMEOUT | Request timeout |

### Error Response Format
```json
{
  "error": "Human readable message",
  "code": "PROVIDER_RATE_LIMITED",
  "details": {
    "provider": "openrouter",
    "retryAfter": 2000,
    "attempts": 2
  }
}
```

## Configuration Contracts

### Environment Variables
```bash
# Required
OPENROUTER_API_KEY=sk-or-v1-...

# Optional with defaults
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_TIMEOUT=30000
OPENROUTER_MAX_RETRIES=3
```

### CLI Configuration Schema
```typescript
interface LiminalConfig {
  defaultProvider?: string;
  defaultModel?: string;
  providers?: {
    openrouter?: {
      apiKey?: string;
      model?: string;
      timeout?: number;
      baseUrl?: string;
    };
  };
}
```

## Streaming Protocol

### SSE Event Types
1. **Content chunks**: Include delta.content
2. **Usage data**: Final chunk with usage stats
3. **Comments**: Keep-alive messages (ignored)
4. **Done signal**: `data: [DONE]`

### Stream Processing Rules
1. Parse each `data:` line as JSON
2. Extract content from `choices[0].delta.content`
3. Accumulate usage from final chunk
4. Close on `[DONE]` signal
5. Handle partial chunks (UTF-8 safety)

## Model Format Contract

### Valid Formats
- `provider/model-name`: Full format (preferred)
- `model-name`: Short format (open models)

### Examples
```
anthropic/claude-3.5-sonnet ✓
openai/gpt-4 ✓
mixtral-8x7b ✓
claude-3.5 ✗ (missing provider)
```

## Testing Contracts

### Mock Responses
Test fixtures should match exact OpenRouter format:
```typescript
export const mockOpenRouterResponse = {
  id: "gen-test-123",
  model: "anthropic/claude-3.5-sonnet",
  object: "chat.completion",
  created: Date.now(),
  choices: [{
    index: 0,
    message: {
      role: "assistant",
      content: "Test response"
    },
    finish_reason: "stop"
  }],
  usage: {
    prompt_tokens: 10,
    completion_tokens: 5,
    total_tokens: 15
  }
};
```

### Test Environment
```bash
# Disable real API calls in tests
OPENROUTER_API_KEY=test-key
OPENROUTER_BASE_URL=http://localhost:9999
SKIP_PROVIDER_TESTS=true
```