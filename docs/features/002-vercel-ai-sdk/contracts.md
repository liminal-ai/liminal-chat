# Feature 002: Vercel AI SDK Contract Changes

## Overview
This document defines the contract changes needed to support multiple LLM providers through the Vercel AI SDK. The goal is minimal changes while enabling provider selection.

## Contract Changes from Feature 001

### 1. Domain API Changes

#### LLMPromptRequest Schema Update
**Path:** `server/src/schemas/domain/LLMPromptRequest.json`

```diff
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
- "required": ["prompt"],
+ "oneOf": [
+   { "required": ["prompt"] },
+   { "required": ["messages"] }
+ ],
  "properties": {
    "prompt": {
      "type": "string",
      "minLength": 1,
      "maxLength": 4000
    },
+   "messages": {
+     "type": "array",
+     "minItems": 1,
+     "items": {
+       "type": "object",
+       "required": ["role", "content"],
+       "properties": {
+         "role": {
+           "type": "string",
+           "enum": ["system", "user", "assistant"]
+         },
+         "content": {
+           "type": "string",
+           "minLength": 1
+         }
+       },
+       "additionalProperties": false
+     }
+   },
    "provider": {
      "type": "string",
-     "enum": ["echo"],
+     "enum": ["echo", "openai", "anthropic", "google"],
      "default": "echo"
    }
  },
  "additionalProperties": false
}
```

#### LLMPromptResponse Schema (No Changes)
The response schema remains the same - just the content and model values will change based on provider.

### 2. Edge API Changes

#### ChatCompletionRequest Schema Update
**Path:** `server/src/schemas/edge/ChatCompletionRequest.json`

```diff
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
- "required": ["prompt"],
+ "oneOf": [
+   { "required": ["prompt"] },
+   { "required": ["messages"] }
+ ],
  "properties": {
    "prompt": {
      "type": "string",
      "minLength": 1,
      "maxLength": 4000
+   },
+   "messages": {
+     "type": "array",
+     "minItems": 1,
+     "items": {
+       "type": "object",
+       "required": ["role", "content"],
+       "properties": {
+         "role": {
+           "type": "string",
+           "enum": ["system", "user", "assistant"]
+         },
+         "content": {
+           "type": "string",
+           "minLength": 1
+         }
+       },
+       "additionalProperties": false
+     }
+   },
+   "provider": {
+     "type": "string",
+     "enum": ["echo", "openai", "anthropic", "google"],
+     "description": "LLM provider to use. Defaults to configured default."
    }
  },
  "additionalProperties": false
}
```

### 3. Configuration Schema (New)

> **Important**: Model strings must match the exact identifiers used by each provider's API. 
> 
> **May 2025 Current Models** (marketing names - API strings may differ):
> - **OpenAI**: gpt-4.1, gpt-4o, gpt-o3, gpt-o4-mini, o4-mini-high
> - **Anthropic**: claude-3.7-sonnet, claude-4.0-sonnet, claude-4.0-opus  
> - **Google**: gemini-2.5-pro, gemini-2.5-flash
>
> **WARNING**: Provider docs often show outdated models. If the API rejects these model strings, try variations like adding dates (e.g., "gpt-4.1-2025-05") or check provider's model listing endpoint.

#### Domain Configuration
**Path:** `server/src/schemas/domain/LLMConfiguration.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "defaultProvider": {
      "type": "string",
      "enum": ["echo", "openai", "anthropic", "google"],
      "default": "openai"
    },
    "providers": {
      "type": "object",
      "properties": {
        "openai": {
          "type": "object",
          "properties": {
            "apiKey": { "type": "string" },
            "model": { 
              "type": "string",
              "description": "OpenAI model identifier. Verify exact string with OpenAI API docs.",
              "examples": ["gpt-4.1", "gpt-4o", "gpt-o3", "gpt-o4-mini", "o4-mini-high"],
              "default": "gpt-4.1"
            },
            "temperature": {
              "type": "number",
              "minimum": 0,
              "maximum": 2,
              "default": 0.7
            }
          },
          "required": ["apiKey"]
        },
        "anthropic": {
          "type": "object",
          "properties": {
            "apiKey": { "type": "string" },
            "model": { 
              "type": "string",
              "description": "Anthropic model identifier. Verify exact string with Anthropic API docs.",
              "examples": ["claude-3.7-sonnet", "claude-4.0-sonnet", "claude-4.0-opus"],
              "default": "claude-4.0-sonnet"
            },
            "temperature": {
              "type": "number",
              "minimum": 0,
              "maximum": 1,
              "default": 0.7
            }
          },
          "required": ["apiKey"]
        },
        "google": {
          "type": "object",
          "properties": {
            "apiKey": { "type": "string" },
            "model": { 
              "type": "string",
              "description": "Google model identifier. Verify exact string with Google AI API docs.",
              "examples": ["gemini-2.5-pro", "gemini-2.5-flash"],
              "default": "gemini-2.5-pro"
            },
            "temperature": {
              "type": "number",
              "minimum": 0,
              "maximum": 1,
              "default": 0.7
            }
          },
          "required": ["apiKey"]
        }
      }
    }
  }
}
```

### 4. Environment Variables

```bash
# .env file additions
DEFAULT_LLM_PROVIDER=openai

# Provider API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-api03-...
GOOGLE_AI_API_KEY=...

# Optional Model Overrides
OPENAI_MODEL=gpt-4.1
ANTHROPIC_MODEL=claude-4.0-sonnet
GOOGLE_MODEL=gemini-2.5-pro
```

### 5. Error Response Updates

New error codes for provider-specific failures:

```typescript
// Additional error codes
export const LLM_ERROR_CODES = {
  // ... existing codes ...
  PROVIDER_NOT_CONFIGURED: 'PROVIDER_NOT_CONFIGURED',
  PROVIDER_API_ERROR: 'PROVIDER_API_ERROR',
  PROVIDER_RATE_LIMITED: 'PROVIDER_RATE_LIMITED',
  PROVIDER_QUOTA_EXCEEDED: 'PROVIDER_QUOTA_EXCEEDED',
  INVALID_API_KEY: 'INVALID_API_KEY',
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND'
} as const;
```

## Example Request/Response Flows

### 1. Simple Prompt Mode (Backward Compatible)
```bash
POST http://localhost:8765/api/v1/llm/prompt
{
  "prompt": "What is the capital of France?"
}

← 200 OK
{
  "content": "The capital of France is Paris.",
  "model": "gpt-4.1",
  "usage": {
    "prompt_tokens": 14,
    "completion_tokens": 8
  }
}
```

### 2. Messages Mode with System Prompt
```bash
POST http://localhost:8765/api/v1/llm/prompt
{
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful geography tutor. Keep answers concise."
    },
    {
      "role": "user",
      "content": "What is the capital of France?"
    }
  ],
  "provider": "anthropic"
}

← 200 OK
{
  "content": "Paris is the capital of France.",
  "model": "claude-sonnet-4-20250514",
  "usage": {
    "prompt_tokens": 28,
    "completion_tokens": 7
  }
}
```

### 3. Conversation History
```bash
POST http://localhost:8765/api/v1/llm/prompt
{
  "messages": [
    {
      "role": "user",
      "content": "What is the capital of France?"
    },
    {
      "role": "assistant", 
      "content": "The capital of France is Paris."
    },
    {
      "role": "user",
      "content": "Tell me more about it."
    }
  ]
}

← 200 OK
{
  "content": "Paris, known as the 'City of Light', is located on the Seine River in northern France. It's home to about 2.2 million people in the city proper and is famous for landmarks like the Eiffel Tower, Louvre Museum, and Notre-Dame Cathedral.",
  "model": "gpt-4.1",
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 52
  }
}
```

### 3. Provider Not Configured Error
```bash
POST http://localhost:8765/api/v1/llm/prompt
{
  "prompt": "Hello",
  "provider": "anthropic"
}

← 400 Bad Request
{
  "error": {
    "code": "PROVIDER_NOT_CONFIGURED",
    "message": "Provider 'anthropic' is not configured. Please set ANTHROPIC_API_KEY."
  }
}
```

### 4. Provider API Error
```bash
POST http://localhost:8765/api/v1/llm/prompt
{
  "prompt": "Hello",
  "provider": "openai"
}

← 502 Bad Gateway
{
  "error": {
    "code": "PROVIDER_API_ERROR",
    "message": "OpenAI API error: Invalid API key",
    "details": {
      "provider": "openai",
      "originalError": "401 Unauthorized"
    }
  }
}
```

## CLI Changes

### New CLI Options
```bash
# Use specific provider
liminal chat --provider anthropic

# In interactive mode
You: !provider anthropic
Switched to provider: anthropic

You: !provider
Current provider: anthropic
Available providers: echo, openai*, anthropic, google
(* = default)
```

## Backward Compatibility

1. **No Breaking Changes**: 
   - Existing requests without `provider` field continue to work
   - Echo provider remains available

2. **Graceful Degradation**:
   - If default provider fails, could fall back to echo (optional)
   - Clear error messages for configuration issues

3. **Progressive Enhancement**:
   - Start with one provider (OpenAI)
   - Add others incrementally

## Testing Considerations

1. **Mock Providers**: 
   - Create mock versions for unit tests
   - Use echo provider for integration tests

2. **API Key Validation**:
   - Validate on startup
   - Provide clear setup instructions

3. **Cost Control**:
   - Integration tests should skip by default
   - Use cheapest models for testing

## Implementation Notes

1. **Model Discovery Strategy**:
   ```typescript
   // If model strings fail, implement discovery
   async function discoverModels(provider: string) {
     // OpenAI: GET https://api.openai.com/v1/models
     // Anthropic: Check their model listing endpoint
     // Google: Check their model listing endpoint
     
     // Log available models and their IDs
     console.log(`Available ${provider} models:`, models);
   }
   ```

2. **Provider Factory Pattern**:
   ```typescript
   interface LLMProvider {
     name: string;
     generateResponse(prompt: string): Promise<LLMResponse>;
   }
   
   class VercelOpenAIProvider implements LLMProvider {
     // Implementation using Vercel AI SDK
   }
   ```

2. **Configuration Loading**:
   - Check environment variables
   - Validate API keys on startup
   - Log available providers (without keys)

3. **Error Handling**:
   - Map provider-specific errors to standard codes
   - Include retry logic for transient failures
   - Rate limit handling per provider

This contract design ensures minimal changes while enabling powerful multi-provider support through the Vercel AI SDK.