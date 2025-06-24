# Echo Feature Contracts

## Overview
This document defines all contracts between components for the Echo LLM Provider feature. These contracts must be established before implementation begins.

## Architecture Flow
```
CLI → Edge (8765) → Domain (8766)
     ↓               ↓
   Edge API      Domain API
```

## JSON Schema Definitions

### Edge API Schemas

#### ChatCompletionRequest
**Path:** `server/src/schemas/edge/ChatCompletionRequest.json`
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["prompt"],
  "properties": {
    "prompt": {
      "type": "string",
      "minLength": 1,
      "maxLength": 4000
    }
  },
  "additionalProperties": false
}
```

#### ChatCompletionResponse
**Path:** `server/src/schemas/edge/ChatCompletionResponse.json`
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["content", "model", "usage"],
  "properties": {
    "content": {
      "type": "string"
    },
    "model": {
      "type": "string"
    },
    "usage": {
      "type": "object",
      "required": ["prompt_tokens", "completion_tokens"],
      "properties": {
        "prompt_tokens": {
          "type": "integer",
          "minimum": 0
        },
        "completion_tokens": {
          "type": "integer",
          "minimum": 0
        }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

#### ConversationListResponse
**Path:** `server/src/schemas/edge/ConversationListResponse.json`
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["conversations", "total"],
  "properties": {
    "conversations": {
      "type": "array",
      "items": {
        "$ref": "./ConversationSummary.json"
      }
    },
    "total": {
      "type": "integer",
      "minimum": 0
    }
  },
  "additionalProperties": false
}
```

#### ConversationSummary
**Path:** `server/src/schemas/edge/ConversationSummary.json`
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "title", "created_at", "updated_at", "message_count"],
  "properties": {
    "id": {
      "type": "string"
    },
    "title": {
      "type": "string"
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time"
    },
    "message_count": {
      "type": "integer",
      "minimum": 0
    }
  },
  "additionalProperties": false
}
```

#### CreateConversationRequest
**Path:** `server/src/schemas/edge/CreateConversationRequest.json`
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["title"],
  "properties": {
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 255
    }
  },
  "additionalProperties": false
}
```

#### ConversationResponse
**Path:** `server/src/schemas/edge/ConversationResponse.json`
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "title", "created_at", "updated_at", "messages"],
  "properties": {
    "id": {
      "type": "string"
    },
    "title": {
      "type": "string"
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time"
    },
    "messages": {
      "type": "array",
      "items": {
        "$ref": "./MessageResponse.json"
      }
    }
  },
  "additionalProperties": false
}
```

#### AddMessageRequest
**Path:** `server/src/schemas/edge/AddMessageRequest.json`
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["content", "role"],
  "properties": {
    "content": {
      "type": "string",
      "minLength": 1,
      "maxLength": 4000
    },
    "role": {
      "type": "string",
      "enum": ["user", "assistant"]
    }
  },
  "additionalProperties": false
}
```

#### MessageResponse
**Path:** `server/src/schemas/edge/MessageResponse.json`
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "content", "role", "created_at"],
  "properties": {
    "id": {
      "type": "string"
    },
    "content": {
      "type": "string"
    },
    "role": {
      "type": "string",
      "enum": ["user", "assistant"]
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "additionalProperties": false
}
```

### Domain API Schemas

#### LLMPromptRequest
**Path:** `server/src/schemas/domain/LLMPromptRequest.json`
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["prompt"],
  "properties": {
    "prompt": {
      "type": "string",
      "minLength": 1,
      "maxLength": 4000
    },
    "provider": {
      "type": "string",
      "enum": ["echo"],
      "default": "echo"
    }
  },
  "additionalProperties": false
}
```

#### LLMPromptResponse
**Path:** `server/src/schemas/domain/LLMPromptResponse.json`
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["content", "model", "usage"],
  "properties": {
    "content": {
      "type": "string"
    },
    "model": {
      "type": "string"
    },
    "provider": {
      "type": "string"
    },
    "usage": {
      "type": "object",
      "required": ["promptTokens", "completionTokens"],
      "properties": {
        "promptTokens": {
          "type": "integer",
          "minimum": 0
        },
        "completionTokens": {
          "type": "integer",
          "minimum": 0
        }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

## OpenAPI Specifications

### Edge API Endpoints

#### Health Check
```yaml
/api/v1/health:
  get:
    summary: Health check endpoint
    operationId: getHealth
    tags: [System]
    responses:
      '200':
        description: Service is healthy
        content:
          application/json:
            schema:
              type: object
              required: [status, timestamp]
              properties:
                status:
                  type: string
                  enum: [healthy]
                timestamp:
                  type: string
                  format: date-time
      '503':
        description: Service unhealthy
        content:
          application/json:
            schema:
              $ref: './schemas/edge/ErrorResponse.json'
```

#### Conversations Management
```yaml
/api/v1/conversations:
  get:
    summary: List conversations
    operationId: listConversations
    tags: [Conversations]
    parameters:
      - name: limit
        in: query
        schema:
          type: integer
          default: 20
          minimum: 1
          maximum: 100
      - name: offset
        in: query
        schema:
          type: integer
          default: 0
          minimum: 0
    responses:
      '200':
        description: List of conversations
        content:
          application/json:
            schema:
              $ref: './schemas/edge/ConversationListResponse.json'
  post:
    summary: Create new conversation
    operationId: createConversation
    tags: [Conversations]
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: './schemas/edge/CreateConversationRequest.json'
    responses:
      '201':
        description: Conversation created
        content:
          application/json:
            schema:
              $ref: './schemas/edge/ConversationResponse.json'
      '400':
        description: Invalid request
        content:
          application/json:
            schema:
              $ref: './schemas/edge/ErrorResponse.json'

/api/v1/conversations/{conversationId}:
  get:
    summary: Get conversation by ID
    operationId: getConversation
    tags: [Conversations]
    parameters:
      - name: conversationId
        in: path
        required: true
        schema:
          type: string
    responses:
      '200':
        description: Conversation details
        content:
          application/json:
            schema:
              $ref: './schemas/edge/ConversationResponse.json'
      '404':
        description: Conversation not found
        content:
          application/json:
            schema:
              $ref: './schemas/edge/ErrorResponse.json'
  delete:
    summary: Delete conversation
    operationId: deleteConversation
    tags: [Conversations]
    parameters:
      - name: conversationId
        in: path
        required: true
        schema:
          type: string
    responses:
      '204':
        description: Conversation deleted
      '404':
        description: Conversation not found
        content:
          application/json:
            schema:
              $ref: './schemas/edge/ErrorResponse.json'
```

#### Chat Operations
```yaml
/api/v1/conversations/{conversationId}/messages:
  post:
    summary: Send message to conversation
    operationId: sendMessage
    tags: [Chat]
    parameters:
      - name: conversationId
        in: path
        required: true
        schema:
          type: string
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: './schemas/edge/AddMessageRequest.json'
    responses:
      '200':
        description: Message sent successfully
        content:
          application/json:
            schema:
              $ref: './schemas/edge/MessageResponse.json'
      '404':
        description: Conversation not found
        content:
          application/json:
            schema:
              $ref: './schemas/edge/ErrorResponse.json'

/api/v1/chat/stream:
  post:
    summary: Stream chat responses
    operationId: streamChat
    tags: [Chat]
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [conversationId, message]
            properties:
              conversationId:
                type: string
              message:
                type: string
                minLength: 1
                maxLength: 4000
    responses:
      '200':
        description: SSE stream of chat events
        content:
          text/event-stream:
            schema:
              type: string
              description: Server-sent events stream
      '404':
        description: Conversation not found
        content:
          application/json:
            schema:
              $ref: './schemas/edge/ErrorResponse.json'
```

### Domain API Endpoints

#### Domain Health Check
```yaml
/domain/health:
  get:
    summary: Domain health check
    operationId: getDomainHealth
    responses:
      '200':
        description: Domain service healthy
        content:
          application/json:
            schema:
              type: object
              required: [status]
              properties:
                status:
                  type: string
                  enum: [healthy]
```

#### LLM Prompt
```yaml
/domain/llm/prompt:
  post:
    summary: Execute LLM prompt
    operationId: executeLLMPrompt
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: './schemas/domain/LLMPromptRequest.json'
    responses:
      '200':
        description: Prompt executed
        content:
          application/json:
            schema:
              $ref: './schemas/domain/LLMPromptResponse.json'
      '400':
        description: Invalid request
        content:
          application/json:
            schema:
              $ref: './schemas/edge/ErrorResponse.json'
```

## TypeScript Interfaces

### Generated Edge Types
```typescript
// types/edge-api.ts
export interface HealthResponse {
  status: 'healthy';
  timestamp: string;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Conversation Management Types
export interface ConversationSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ConversationListResponse {
  conversations: ConversationSummary[];
  total: number;
}

export interface CreateConversationRequest {
  title: string;
}

export interface ConversationResponse {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: MessageResponse[];
}

// Message Types
export interface AddMessageRequest {
  content: string;
  role: 'user' | 'assistant';
}

export interface MessageResponse {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

// Chat Streaming Types
export interface StreamChatRequest {
  conversationId: string;
  message: string;
}

// SSE Event Types
export type ChatEvent = 
  | { type: 'content'; data: string }
  | { type: 'error'; error: string }
  | { type: 'end' };

// Client Configuration
export interface EdgeClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retryConfig?: {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
  };
}
```

### Generated Domain Types
```typescript
// types/domain-api.ts
export interface LLMPromptRequest {
  prompt: string;
  provider?: 'echo';
}

export interface LLMPromptResponse {
  content: string;
  model: string;
  provider?: string;
  usage: {
    promptTokens: number;    // Note: camelCase in domain
    completionTokens: number;
  };
}

export interface DomainHealthResponse {
  status: 'healthy';
}
```

## CLI Exit Codes
```typescript
// cli/src/constants.ts
export const EXIT_CODES = {
  SUCCESS: 0,
  CONNECTION_ERROR: 1,
  API_ERROR: 2,
  USER_EXIT: 0
} as const;
```

## Error Codes Usage

### Connection Errors
- `SERVICE_UNAVAILABLE` (503) - When CLI can't connect to Edge
- `EXTERNAL_SERVICE_UNAVAILABLE` (503) - When Edge can't reach Domain

### Validation Errors
- `VALIDATION_FAILED` (400) - For request validation failures
- `VALUE_TOO_LONG` (400) - When prompt exceeds 4000 characters

## Example Request/Response Flows

### Successful Chat Flow
```bash
# 1. CLI Health Check
GET http://localhost:8765/api/v1/health
← 200 OK
{
  "status": "healthy",
  "timestamp": "2025-01-27T10:00:00Z"
}

# 2. Create Conversation
POST http://localhost:8765/api/v1/conversations
{
  "title": "CLI Chat 2025-01-27T10:00:00Z"
}
← 201 Created
{
  "id": "conv_123abc",
  "title": "CLI Chat 2025-01-27T10:00:00Z",
  "created_at": "2025-01-27T10:00:00Z",
  "updated_at": "2025-01-27T10:00:00Z",
  "messages": []
}

# 3. Send Message (Non-streaming)
POST http://localhost:8765/api/v1/conversations/conv_123abc/messages
{
  "content": "Hello world",
  "role": "user"
}
← 200 OK
{
  "id": "msg_456def",
  "content": "Echo: Hello world",
  "role": "assistant",
  "created_at": "2025-01-27T10:00:01Z"
}

# 4. Stream Chat Response
POST http://localhost:8765/api/v1/chat/stream
{
  "conversationId": "conv_123abc",
  "message": "Tell me a story"
}
← 200 OK (text/event-stream)
data: {"type": "content", "data": "Echo: "}
data: {"type": "content", "data": "Tell "}
data: {"type": "content", "data": "me "}
data: {"type": "content", "data": "a "}
data: {"type": "content", "data": "story"}
data: {"type": "end"}
```

### Error Flow - No Connection
```bash
# CLI attempts health check
GET http://localhost:8765/api/v1/health
← Connection refused
Exit code: 1
```

### Error Flow - Invalid Request
```bash
POST http://localhost:8765/api/v1/llm/prompt
{
  "prompt": ""
}
← 400 Bad Request
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",
    "details": {
      "prompt": "String must have at least 1 character"
    }
  }
}
```

## Domain Service Interface

```typescript
// domain/src/services/llm/types.ts
export interface LLMProvider {
  name: string;
  prompt(text: string): Promise<LLMProviderResponse>;
}

export interface LLMProviderResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
}

// domain/src/services/llm/providers/echo.ts
export class EchoProvider implements LLMProvider {
  name = 'echo';
  
  async prompt(text: string): Promise<LLMProviderResponse> {
    return {
      content: `Echo: ${text}`,
      model: 'echo-1.0',
      usage: {
        promptTokens: Math.ceil(text.length / 4),
        completionTokens: Math.ceil(text.length / 4) + 2
      }
    };
  }
}
```

## Authentication

For this feature, authentication is in **bypass mode**:
- Edge logs: "Auth bypassed for development"
- Domain accepts all requests from Edge
- No tokens or API keys required

## Contract Validation

Before implementation:
1. All JSON schemas must be valid
2. OpenAPI specs must reference schemas correctly
3. TypeScript types must be generated from schemas
4. Example flows must match contract definitions

## Implementation Order

1. Create JSON schema files
2. Update OpenAPI specifications
3. Generate TypeScript types
4. Implement Domain echo provider
5. Implement Edge endpoint
6. Implement CLI client
7. Add unit tests for each component
8. Manual E2E test via CLI