# Echo Provider Design Document

## Overview

This document provides detailed design specifications for the Echo Provider feature, establishing patterns and architectures that will be used throughout the Liminal Type Chat application.

## Component Architecture

### Domain Service Components

```
domain-server/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Server entry point
│   ├── routes/
│   │   ├── health.ts            # Health check endpoint
│   │   └── llm.ts               # LLM endpoints
│   ├── services/
│   │   └── llm/
│   │       ├── llm-service.ts   # LLM service orchestrator
│   │       └── types.ts         # Shared types
│   └── providers/
│       └── llm/
│           ├── echo-provider.ts  # Echo implementation
│           └── types.ts          # Provider interface
```

#### Provider Pattern

```typescript
// providers/llm/types.ts
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

// providers/llm/echo-provider.ts
export class EchoProvider implements LLMProvider {
  name = 'echo';
  
  async prompt(text: string): Promise<LLMProviderResponse> {
    const promptTokens = Math.ceil(text.length / 4);
    const responseText = `Echo: ${text}`;
    const completionTokens = Math.ceil(responseText.length / 4);
    
    return {
      content: responseText,
      model: 'echo-1.0',
      usage: {
        promptTokens,
        completionTokens
      }
    };
  }
}
```

#### Service Layer

```typescript
// services/llm/llm-service.ts
export class LLMService {
  private providers: Map<string, LLMProvider>;
  
  constructor() {
    this.providers = new Map();
    this.registerProvider(new EchoProvider());
  }
  
  async prompt(request: LLMPromptRequest): Promise<LLMPromptResponse> {
    const provider = this.providers.get(request.provider || 'echo');
    if (!provider) {
      throw new Error(`Provider ${request.provider} not found`);
    }
    
    const response = await provider.prompt(request.prompt);
    
    return {
      content: response.content,
      model: response.model,
      provider: provider.name,
      usage: response.usage
    };
  }
}
```

### Edge Service Components

```
edge-server/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Server entry point
│   ├── routes/
│   │   ├── health.ts            # Health check with Domain check
│   │   └── llm.ts               # LLM prompt endpoint
│   ├── clients/
│   │   └── domain-client.ts     # HTTP client for Domain
│   └── validators/
│       └── llm-validators.ts    # Request validators
```

#### Domain Client

```typescript
// clients/domain-client.ts
export class DomainClient {
  constructor(private baseUrl: string = 'http://localhost:8766') {}
  
  async health(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/domain/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
  
  async prompt(request: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/domain/llm/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new Error(`Domain error: ${response.status}`);
    }
    
    return response.json();
  }
}
```

#### Request/Response Transformation

```typescript
// routes/llm.ts
export function transformDomainResponse(domain: any): LLMPromptResponse {
  return {
    content: domain.content,
    model: domain.model,
    usage: {
      prompt_tokens: domain.usage.promptTokens,      // camelCase → snake_case
      completion_tokens: domain.usage.completionTokens
    }
  };
}
```

### CLI Architecture

```
cli/
├── src/
│   ├── index.ts                 # Entry point
│   ├── commands/
│   │   └── chat.ts             # Chat command implementation
│   ├── api/
│   │   └── edge-client.ts      # Edge API client
│   └── utils/
│       ├── input.ts            # Input handling
│       └── display.ts          # Output formatting
```

#### Edge Client

```typescript
// api/edge-client.ts
export class EdgeClient {
  constructor(private baseUrl: string) {}
  
  async health(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/health`);
    if (!response.ok) {
      throw new Error('Service unavailable');
    }
    return response.json();
  }
  
  async prompt(text: string): Promise<LLMPromptResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/llm/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: text })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }
    
    return response.json();
  }
}
```

## Data Flow Diagrams

### Health Check Flow

```
CLI                     Edge (8765)              Domain (8766)
 |                         |                         |
 |--GET /api/v1/health---->|                         |
 |                         |--GET /domain/health---->|
 |                         |<---200 OK---------------|
 |<--200 OK + timestamp----|                         |
 |                         |                         |
```

### Prompt Execution Flow

```
CLI                     Edge (8765)              Domain (8766)
 |                         |                         |
 |--POST prompt----------->|                         |
 |                         |--Validate request      |
 |                         |--Add auth bypass log   |
 |                         |--POST to Domain------->|
 |                         |                         |--Route to service
 |                         |                         |--Get echo provider
 |                         |                         |--Calculate tokens
 |                         |<--200 + response-------|
 |                         |--Transform response    |
 |<--200 + response--------|                         |
 |                         |                         |
```

### Error Flow - Validation Failure

```
CLI                     Edge (8765)              Domain (8766)
 |                         |                         |
 |--POST empty prompt----->|                         |
 |                         |--Validate: FAIL        |
 |<--400 Validation Error--|                         |
 |                         |                         |
```

### Error Flow - Domain Unavailable

```
CLI                     Edge (8765)              Domain (8766)
 |                         |                         |
 |--POST prompt----------->|                         |
 |                         |--POST to Domain-----X   |
 |                         |<--Connection refused    |
 |<--503 Service Error-----|                         |
 |                         |                         |
```

## Key Design Decisions

### 1. Prompt/Response Primitives

**Decision**: Use `prompt` as the fundamental LLM operation throughout the stack.

**Rationale**:
- Honest about what LLMs do - they respond to prompts
- Avoids premature abstraction (chat, completion, etc.)
- Leaves room for higher-level abstractions at Edge later
- Self-documenting API nomenclature

**Implementation**:
- Domain: `/domain/llm/prompt`
- Edge: `/api/v1/llm/prompt`
- Consistent naming across all layers

### 2. Token Counting Strategy

**Decision**: Use simple character-based estimation (4 characters ≈ 1 token).

**Rationale**:
- Close enough for mock data
- Matches rough tokenization of English text
- Easy to calculate without dependencies
- Establishes the pattern for real providers

**Implementation**:
```typescript
const tokens = Math.ceil(text.length / 4);
```

### 3. Error Handling Pattern

**Decision**: Use consistent error format with codes and messages.

**Rationale**:
- Machine-readable error codes
- Human-readable messages
- Optional details for validation errors
- Maps cleanly to HTTP status codes

**Implementation**:
```typescript
{
  error: {
    code: 'VALIDATION_FAILED',
    message: 'Validation failed',
    details: { prompt: 'Required field' }
  }
}
```

### 4. Authentication Bypass

**Decision**: Implement bypass mode with explicit logging.

**Rationale**:
- Focuses on core functionality first
- Makes bypass visible in logs
- Easy to replace with real auth later
- Prevents accidental production deployment

**Implementation**:
```typescript
console.log('Auth bypassed for development');
// Continue with request processing
```

## Testing Strategy

### Domain Tier Testing (90% Coverage Target)

#### Unit Tests
```typescript
// providers/llm/echo-provider.test.ts
describe('EchoProvider', () => {
  it('returns echo response', async () => {
    const provider = new EchoProvider();
    const response = await provider.prompt('Hello');
    expect(response.content).toBe('Echo: Hello');
  });
  
  it('calculates tokens correctly', async () => {
    const provider = new EchoProvider();
    const response = await provider.prompt('Test'); // 4 chars
    expect(response.usage.promptTokens).toBe(1);
    expect(response.usage.completionTokens).toBe(3); // "Echo: Test" = 10 chars
  });
});
```

#### Integration Tests
```typescript
// routes/llm.test.ts
describe('POST /domain/llm/prompt', () => {
  it('processes prompt request', async () => {
    const response = await request(app)
      .post('/domain/llm/prompt')
      .send({ prompt: 'Hello' });
    
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      content: 'Echo: Hello',
      model: 'echo-1.0',
      provider: 'echo'
    });
  });
});
```

### Edge Tier Testing (75% Coverage Target)

#### Unit Tests
```typescript
// validators/llm-validators.test.ts
describe('LLM Request Validation', () => {
  it('accepts valid request', () => {
    const valid = validateLLMPromptRequest({ prompt: 'Hello' });
    expect(valid).toBe(true);
  });
  
  it('rejects empty prompt', () => {
    const valid = validateLLMPromptRequest({ prompt: '' });
    expect(valid).toBe(false);
  });
});
```

#### Integration Tests
```typescript
// routes/llm.test.ts
describe('Edge LLM Routes', () => {
  beforeEach(() => {
    // Mock Domain client
    jest.spyOn(domainClient, 'prompt').mockResolvedValue({
      content: 'Echo: Test',
      model: 'echo-1.0',
      usage: { promptTokens: 1, completionTokens: 3 }
    });
  });
  
  it('transforms Domain response correctly', async () => {
    const response = await request(app)
      .post('/api/v1/llm/prompt')
      .send({ prompt: 'Test' });
    
    expect(response.body.usage.prompt_tokens).toBe(1);  // snake_case
  });
});
```

### CLI Testing

#### Unit Tests
```typescript
// api/edge-client.test.ts
describe('EdgeClient', () => {
  it('handles connection errors', async () => {
    const client = new EdgeClient('http://invalid:9999');
    await expect(client.health()).rejects.toThrow('Service unavailable');
  });
});
```

### E2E Test Checklist

- [ ] Services start successfully
- [ ] Health checks pass
- [ ] CLI connects to Edge
- [ ] Prompt submission works
- [ ] Echo response displayed
- [ ] Token counts shown
- [ ] Error handling works
- [ ] /exit command works
- [ ] Ctrl+C handled gracefully

## Performance Considerations

### Target Metrics
- Health check: < 10ms
- Echo response: < 50ms
- Total E2E: < 100ms

### Optimization Opportunities
- Connection pooling for Domain client
- Pre-compiled validators
- Minimal dependencies

## Security Considerations

### Current State
- No authentication (bypass mode)
- No input sanitization beyond length
- No rate limiting
- HTTP only (no HTTPS)

### Future Considerations
- JWT validation at Edge
- Input sanitization for prompts
- Rate limiting per IP/user
- HTTPS in production

## Implementation Guide

### Phase 1: Setup (1 hour)
1. Create project directories
2. Initialize npm packages
3. Set up TypeScript configs
4. Create JSON schemas

### Phase 2: Domain Service (4-5 hours)
1. Implement health endpoint
2. Create Echo provider
3. Implement LLM service
4. Add prompt endpoint
5. Write unit tests

### Phase 3: Edge Service (4-5 hours)
1. Implement health with Domain check
2. Create Domain client
3. Add request validation
4. Implement prompt endpoint
5. Write tests

### Phase 4: CLI (3-4 hours)
1. Set up CLI framework
2. Implement Edge client
3. Add health check
4. Create chat command
5. Add interactive mode

### Phase 5: Integration (2-3 hours)
1. Manual E2E testing
2. Fix integration issues
3. Performance validation
4. Documentation updates

Total: 14-18 hours