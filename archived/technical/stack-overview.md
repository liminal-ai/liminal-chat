# Liminal Type Chat - Stack Architecture Overview

*Understanding the layers of the application*

## Layer Architecture

```
┌─────────────────────────────────────────┐
│            Client Layer                 │
│         (CLI, Web, Slack)              │
└────────────────┬───────────────────────┘
                 │ HTTP/SSE
┌────────────────▼───────────────────────┐
│            Edge Layer                   │
│   (Request handling, Auth, Bundling)   │
│            Port 8765                    │
└────────────────┬───────────────────────┘
                 │ HTTP
┌────────────────▼───────────────────────┐
│           Domain Layer                  │
│    (Business logic, LLM providers)     │
│            Port 8766                    │
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│         Database Layer                  │
│    (SQLite: liminal.db, messages.db)   │
└─────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Database Layer (Foundation)
- **Technology**: SQLite via better-sqlite3
- **Databases**:
  - `liminal.db`: Users, threads, metadata
  - `messages.db`: High-volume message storage
- **Pattern**: Repository interfaces

### 2. Domain Layer (Business Logic)
- **Location**: `domain-server/`
- **Responsibilities**:
  - LLM provider management
  - Business rule enforcement
  - MCP tool execution
  - Data persistence
- **Key Services**:
  - `LLMService`: Provider orchestration
  - `ContextThreadService`: Conversation logic
  - `HealthService`: System monitoring

### 3. Edge Layer (Client Adaptation)
- **Location**: `edge-server/`
- **Responsibilities**:
  - Authentication/authorization
  - Request validation
  - Response transformation
  - Token bundling for streaming
  - Rate limiting
- **Deployment**: Can run on Cloudflare Workers

### 4. Client Layer (User Interfaces)
- **Current**: CLI (`cli/`)
- **Future**: Web UI, Slack bot, VS Code extension
- **Pattern**: All clients use same Edge API

## Key Design Patterns

### Repository Pattern
```typescript
interface IContextThreadRepository {
  create(thread: ContextThread): Promise<void>;
  findById(id: string): Promise<ContextThread | null>;
  update(thread: ContextThread): Promise<void>;
}
```

### Provider Pattern
```typescript
interface LLMProvider {
  name: string;
  prompt(text: string): Promise<LLMProviderResponse>;
  // Future: streamPrompt(...): AsyncIterator<Token>
}
```

### Service Layer Pattern
```typescript
class ContextThreadService {
  constructor(
    private repository: IContextThreadRepository,
    private llmService: ILLMService
  ) {}
  
  // Pure business logic, no HTTP/DB details
}
```

## Data Flow Examples

### Health Check
```
CLI → GET /api/v1/health → Edge
                            ↓
                          GET /domain/health → Domain
                                                ↓
                                              Check DB
```

### LLM Prompt
```
CLI → POST /api/v1/llm/prompt → Edge
                                  ↓ (validate, auth)
                                POST /domain/llm/prompt → Domain
                                                           ↓
                                                         LLM Provider
```

## Benefits of This Architecture

1. **Clear Separation**: Each layer has single responsibility
2. **Independent Scaling**: Can scale Edge separately from Domain
3. **Technology Flexibility**: Can change implementations per layer
4. **Testing**: Each layer can be tested in isolation
5. **AI-Friendly**: Clear boundaries prevent architectural violations

## Migration Path

- **Current**: Monolithic Node.js app
- **Phase 1**: Separate Domain and Edge processes
- **Phase 2**: Edge to Cloudflare Workers
- **Phase 3**: Domain sharding by feature
- **Future**: Microservices as needed