# Technical Architecture

## Overview

Liminal Type Chat follows a multi-tier architecture pattern separating concerns between Edge (API) and Domain (Business Logic) layers. This document outlines the technical design, implementation patterns, and architectural decisions.

## Architecture Principles

### Core Design Principles
1. **Separation of Concerns**: Clear boundaries between UI, API, and domain logic
2. **Provider Agnosticism**: No provider-specific code in domain layer
3. **Local-First**: Data sovereignty and privacy by design
4. **Extensibility**: Plugin architecture for future capabilities
5. **Security First**: Defense in depth with multiple security layers

### Architectural Patterns
- **Edge-to-Domain Pattern**: API transformation at boundaries
- **Repository Pattern**: Data access abstraction
- **Factory Pattern**: Provider and service instantiation
- **Strategy Pattern**: LLM provider selection
- **Observer Pattern**: Real-time streaming updates

## System Architecture

### Layer Structure

```
┌─────────────────────────────────────────────┐
│              Client (React)                 │
│         - UI Components                     │
│         - State Management                  │
│         - API Clients                       │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│            Edge Tier (Express)              │
│      - REST API (/api/v1/*)                 │
│      - Authentication & Authorization       │
│      - Request Transformation               │
│      - MCP Integration                      │
│      - Response Formatting                  │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│           Domain Tier (Services)            │
│      - Business Logic                       │
│      - Data Models                          │
│      - Provider Abstraction                 │
│      - Core Services                        │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│         Infrastructure Layer                │
│      - Database (SQLite)                    │
│      - LLM Providers                        │
│      - Storage Services                     │
│      - Security Services                    │
└─────────────────────────────────────────────┘
```

### Data Flow

1. **Client → Edge**: HTTP requests with authentication
2. **Edge → Domain**: Service calls with transformed data
3. **Domain → Infrastructure**: Repository and provider calls
4. **Response Path**: Reverse flow with transformations

## Key Components

### Edge Tier

**Responsibilities:**
- HTTP request handling
- Authentication and authorization
- Input validation and sanitization
- Response transformation
- API versioning
- MCP tool execution

**Key Patterns:**
- Route handlers for RESTful endpoints
- Middleware for cross-cutting concerns
- OpenAPI specification compliance
- SSE for streaming responses

### Domain Tier

**Responsibilities:**
- Business logic implementation
- Data model management
- Provider-agnostic operations
- Transaction coordination
- Business rule enforcement

**Key Services:**
- `ContextThreadService`: Conversation management
- `ChatService`: LLM interaction orchestration
- `HealthService`: System monitoring
- `EnvironmentService`: Configuration management

### Infrastructure Layer

**Database:**
- SQLite for local-first storage
- Migrations for schema evolution
- Repository pattern for data access

**Providers:**
- `LlmServiceFactory`: Provider selection
- `AnthropicService`: Claude integration
- `OpenAIService`: GPT integration (planned)
- Streaming support via AsyncIterables

## Security Architecture

### Defense in Depth

1. **Authentication Layer**
   - Cookie-based sessions (simplified from OAuth)
   - Session management with secure tokens
   - CSRF protection

2. **Authorization Layer**
   - User-scoped data access
   - API key encryption at rest
   - Request validation

3. **Security Headers**
   - CSP for XSS protection
   - HSTS for transport security
   - X-Frame-Options for clickjacking prevention

4. **Data Protection**
   - Encryption service for sensitive data
   - Secure key storage
   - No telemetry or external data sharing

## Streaming Architecture

### SSE Implementation
- Server-Sent Events for real-time responses
- Edge tier multiplexing
- Backpressure handling
- Connection recovery

### Flow Control
```typescript
Domain AsyncIterable → Edge SSE Stream → Client EventSource
```

## Critical Issues (From AI Analysis)

### High Priority Technical Debt

1. **PKCE Storage Scalability**
   - Current: In-memory storage
   - Issue: Won't work in multi-server deployments
   - Solution: Implement database-backed storage

2. **Incomplete Security Implementation**
   - Missing Helmet integration for headers
   - Incomplete Edge-Domain auth bridge
   - No rate limiting implementation

3. **Error Handling Inconsistency**
   - Varying patterns across routes
   - Information leakage risks
   - Need standardization using error utilities

### Performance Optimizations Needed

1. **Token Validation**
   - Current: Database lookup on each request
   - Solution: Implement caching layer

2. **Connection Pooling**
   - Missing for LLM providers
   - Needed for scalability

## Future Architecture (AI Roundtable)

### Multi-Model Orchestration
- Named AI panelists with specific roles
- Context management across perspectives
- @mention-based conversation routing
- Collective intelligence synthesis

### Technical Requirements
- Provider abstraction maturity
- Context window optimization
- Response coordination
- UI/UX for multi-perspective display

## Development Guidelines

### Adding New Features
1. Define domain models and services
2. Implement repository if needed
3. Create domain service with tests (90% coverage)
4. Add edge route with OpenAPI spec
5. Implement client integration

### Testing Strategy
- Domain: 90% coverage requirement
- Edge: 75% coverage requirement
- Integration tests for critical paths
- Performance benchmarks for streaming

### Code Organization
```
server/src/
├── routes/
│   ├── edge/      # Client-facing API
│   └── domain/    # Internal API
├── services/      # Business logic
├── providers/     # External integrations
├── models/        # Data models
└── utils/         # Shared utilities
```

## Monitoring and Observability

### Health Checks
- `/domain/health` - Core system health
- `/domain/health/db` - Database connectivity
- `/api/v1/health` - Edge tier health

### Logging Strategy
- Structured logging with context
- Environment-aware log levels
- No sensitive data in logs

### Performance Metrics
- Response time tracking
- Streaming performance
- Error rates and types

## Deployment Architecture

### Local Deployment
- Single Node.js process
- SQLite file-based storage
- Client served from Express

### Future Scaling Considerations
- Horizontal scaling needs distributed session storage
- Database migration to PostgreSQL
- CDN for static assets
- Load balancer for multiple instances

## Technology Stack

### Core Technologies
- **Runtime**: Node.js 20.x
- **Framework**: Express.js
- **Database**: SQLite (PostgreSQL ready)
- **Frontend**: React with TypeScript
- **Testing**: Jest, Vitest
- **Build**: Vite, TypeScript

### Key Dependencies
- `@anthropic-ai/sdk`: Claude integration
- `express`: Web framework
- `sqlite3`: Database driver
- `jsonschema`: Request validation
- `bcrypt`: Password hashing

## Conclusion

The Liminal Type Chat architecture prioritizes security, extensibility, and local-first principles while maintaining clear separation of concerns. The identified technical debt items should be addressed to ensure scalability and production readiness.