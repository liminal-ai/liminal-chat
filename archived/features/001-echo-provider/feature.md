# Feature 001: Echo Provider

> **Important**: This feature does NOT include streaming support. Streaming is planned for a later milestone. All Echo Provider functionality uses simple request/response patterns.

## Overview

The Echo Provider feature is our architectural proof-of-concept that establishes the foundation for all future Liminal Type Chat development. While functionally simple (echoing prompts back to users), it proves out our entire technology stack and establishes critical patterns for contract-driven development, service separation, and LLM integration.

## Goals

1. **Prove Architecture**: Validate Domain/Edge separation with separate processes
2. **Establish Patterns**: Create reusable patterns for all future features
3. **Contract-First Development**: Demonstrate API-first workflow
4. **CLI Foundation**: Build initial CLI that will become our primary testing tool
5. **LLM Primitive Pattern**: Establish prompt/response as core abstraction

## Architecture Alignment

### Domain/Edge Separation
- **Domain Service** (port 8766): Handles LLM provider logic
- **Edge Service** (port 8765): Manages client connections and API translation
- Separate Node.js processes enforce architectural boundaries

### CLI-First Approach
- CLI serves as both user interface and E2E testing framework
- Faster development iteration than web UI
- Better streaming validation capabilities
- CI/CD friendly

### Contract-Driven Development
- All contracts defined before implementation
- JSON Schema for request/response validation
- OpenAPI specifications for both tiers
- Generated TypeScript types ensure consistency

## Success Criteria

### Functional Requirements
- [ ] CLI can connect to Edge service
- [ ] User can input prompts and receive echo responses
- [ ] Echo responses format: "Echo: {prompt}"
- [ ] Token usage displayed with each response
- [ ] `/exit` command terminates CLI session
- [ ] Health check prevents CLI startup if services unavailable

### Technical Requirements
- [ ] Domain service runs on port 8766
- [ ] Edge service runs on port 8765
- [ ] Both services have health endpoints
- [ ] Request validation using JSON Schema
- [ ] Proper error responses with standard error codes
- [ ] Unit tests for all components (90% Domain, 75% Edge)

### Architectural Requirements
- [ ] Clean separation between Domain and Edge concerns
- [ ] No shared code between services
- [ ] Provider pattern established in Domain
- [ ] Request/response transformation in Edge
- [ ] Bypass authentication implemented

## Technical Approach

### Contract-Driven Workflow
1. Define JSON schemas for all requests/responses
2. Create OpenAPI specifications referencing schemas
3. Generate TypeScript types from schemas
4. Implement services conforming to contracts
5. Validate all requests/responses against schemas

### LLM Primitive Operations
- Core abstraction: `prompt` → `response`
- Domain exposes `/domain/llm/prompt` endpoint
- Edge exposes `/api/v1/llm/prompt` endpoint
- No higher-level abstractions (chat, conversations) yet

### Echo Provider Implementation
```typescript
class EchoProvider implements LLMProvider {
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

### Authentication Bypass
- Edge logs: "Auth bypassed for development"
- No token validation
- No user context required
- Foundation for future auth implementation

### CLI Features
- Health check on startup (fail fast)
- Interactive prompt loop
- `/exit` command for clean shutdown
- Colored output for better UX
- Non-zero exit codes for scriptability

## Out of Scope

- **Streaming**: No SSE or real-time updates
- **Real LLM Providers**: Only echo implementation
- **Persistence**: No database integration
- **User Management**: No user context
- **Production Concerns**: No HTTPS, rate limiting, or monitoring
- **Advanced CLI Features**: No history, autocomplete, or configuration

## Patterns Established

### Error Handling
- Consistent error response format
- Mapped HTTP status codes
- Detailed validation messages
- Proper error propagation between tiers

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- CLI as manual E2E test tool
- Contract validation tests

### Schema Management
- Separate schema files for reusability
- Edge vs Domain schema conventions
- Build-time schema compilation for Edge

### Service Communication
- HTTP REST between services
- JSON request/response format
- Health checks for service discovery
- Structured logging for debugging

## Risk Mitigation

- **Risk**: Over-engineering for simple echo
- **Mitigation**: Focus on patterns, not features

- **Risk**: Contract changes during development
- **Mitigation**: Complete contract review before implementation

- **Risk**: Integration issues between services
- **Mitigation**: Implement health checks first

## Success Metrics

- All tests passing (unit + integration)
- CLI successfully echoes prompts
- Clean separation verified (no cross-imports)
- Response time < 100ms for echo
- Zero errors in manual E2E testing

## Future Foundation

This feature establishes:
- Service communication patterns
- Error handling standards
- Testing approaches
- CLI framework
- Provider abstraction

All future features build on these foundations.