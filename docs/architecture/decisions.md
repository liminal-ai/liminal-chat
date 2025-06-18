# Architecture Decisions

This document captures key architecture decisions made for the Liminal Type Chat project, extracted from development sessions and design discussions.

## Executive Summary

After extensive analysis including research on streaming innovations, we've established a clear Edge/Domain separation with specific responsibilities and a dual SQLite database strategy. The architecture acknowledges essential complexity rather than artificially creating it.

## Stack Decisions

### Domain Server
- **Runtime**: Node.js 20+ with TypeScript 5.8
- **Framework**: Express 4.21 (migrating to NestJS)
- **Database**: node-sqlite3-wasm (WebAssembly, no compilation issues)
- **Build**: tsx (dev) + tsup (production)
- **Testing**: Vitest 3.0
- **Linting**: Biome 1.9 (replaces ESLint + Prettier)

### Edge Server  
- **Runtime**: Cloudflare Workers with TypeScript 5.8
- **Framework**: Hono 4.7
- **Development**: Wrangler 3.91
- **Testing**: Vitest with @cloudflare/vitest-pool-workers
- **Platform Constraints**: Enforce architecture boundaries

### CLI Client
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Commander.js
- **HTTP**: Native fetch API
- **Output**: Chalk + Ora
- **Testing**: Vitest + mock-stdin + execa

## Authentication Architecture

### Provider Selection
- **User Auth**: WorkOS (Authorization Code Flow with PKCE) - Free up to 1M MAUs
- **Service Auth**: Okta (Client Credentials Flow) - Industry standard
- **Mixed Vendor Strategy**: Intentional security through diversity

### Token Caching
- **Primary**: Cloudflare Cache API (2-5ms response times)
- **Monitoring**: Log cache hits/misses
- **Fallback**: Switch to KV if cache hit rate <95%

### Development Modes
1. **Bypass Mode**: `AUTH_MODE=bypass` - No auth checks (fastest for development)
2. **Local Mode**: `AUTH_MODE=local` - Auth simulator for testing flows
3. **Real Mode**: `AUTH_MODE=real` - Actual provider integration

## 1. Edge/Domain Architecture Decision

**Decision: Keep Edge and Domain as separate tiers**

**Rationale:**
- Essential complexity exists (streaming, bundling, multi-client support)
- AI coding assistants respect service boundaries better than module boundaries
- Without clear boundaries, concerns get mixed (streaming in domain, business logic in edge)
- Every attempt to collapse revealed we were just recreating the separation differently

**Key Insight**: "The complexity isn't artificial" - we're acknowledging complexity that already exists, not creating it.

## 2. Streaming Architecture

**Flow:**
```
LLM Provider → Domain → Edge → Client
(1 token)     (1 token) (bundled) (smoothed)
```

### Domain Tier:
- **Manages all LLM interactions** (provider abstraction, prompt construction)
- Receives provider-specific token streams
- Normalizes to generic token format
- Passes through without bundling
- Pure business logic, no network optimization
- **Executes MCP tools** (see section 9)

### Edge Tier:
- Bundles tokens for client (10-20 tokens or 100ms timeout)
- Bundles tokens for database (50 tokens or 500ms timeout)
- Handles SSE formatting
- Manages reconnection and error recovery
- **No direct LLM interaction** (all LLM calls go through Domain)

### Client:
- Receives bundled tokens via SSE
- Applies typewriter effect for smooth UX
- Libraries like FlowToken handle this well

## 3. Token Bundling Strategy

**Research Findings:**
- Industry standard: 10-50 token bundles
- 100ms timeout prevents perception of stalling
- Client-side smoothing is universal

**Our Implementation:**
- **Client bundles**: 10-20 tokens or 100ms (optimized for UX)
- **Database bundles**: 50 tokens or 500ms (optimized for throughput)
- **Different bundle sizes for different consumers**
- **Bundling happens at Edge tier only**

## 4. Database Synchronization

**Pattern: Edge publishes to queue, Domain consumes**

```
Edge → High-speed Queue → Domain → Database
     ↓
   SQLite (overflow when queue full)
```

### Key Decisions:
- **Don't block client streaming for DB writes**
- **Use SQLite as overflow buffer** when queue is full
- **Fire-and-forget with monitoring** - client UX is priority
- **Edge bundles for both client AND domain** - reduces queue traffic

### Overflow Strategy:
- Primary: High-speed queue (Redis Streams, etc.)
- Overflow: SQLite file (./data/overflow.db)
- Automatic replay when queue has capacity
- Structured queries possible on overflow data

## 5. Database Architecture

**Decision: Two SQLite databases**

### Main Database (liminal.db):
- Users, authentication, sessions
- Thread metadata and relationships
- Provider configurations
- Lower write volume, relational queries
- **Migration path**: Can move to PostgreSQL when needed

### Messages Database (messages.db):
- All message content
- Optimized for streaming writes
- Simple schema, minimal indexes
- **Stays in SQLite longer** - perfect for append-heavy workload

### Messages Schema:
- **No token-by-token storage** - just periodic updates
- Update every ~50 tokens during streaming
- Simple status: pending/streaming/complete/error
- Optional chunks table for progress history
- UUID primary keys for future distribution

## 6. Overall Architecture Benefits

1. **Clear Separation of Concerns**
   - Domain: Business logic, pure functions
   - Edge: Client adaptation, streaming, bundling
   - Each tier has single responsibility

2. **Resilience**
   - Client streaming continues even if DB is slow
   - Queue + overflow handles bursts
   - Each tier can scale independently

3. **Future Flexibility**
   - Easy to add new Edge tiers (CLI, Slack, Discord)
   - Can migrate main DB to PostgreSQL
   - Can shard messages DB by date/thread
   - Ready for AI Roundtable features

4. **AI-Agent Friendly**
   - Service boundaries prevent architectural violations
   - Clear contracts between services
   - Harder to accidentally mix concerns

## 7. Key Insights from Research

1. **SSE remains dominant** - Used by OpenAI, Anthropic, Google
2. **HTTP/2 multiplexing** - Automatic benefits, up to 100 streams
3. **Token bundling is standard** - Not our invention
4. **Client-side smoothing is universal** - Expected UX pattern
5. **Litestream for SQLite backups** - Continuous replication to S3

## 8. Implementation Priority

1. Keep current Edge/Domain separation as **separate processes**
2. **CLI as first UI** consuming Edge API
3. Implement contract-first development with OpenAPI/JSON Schema
4. Implement token bundling at Edge (start with fixed sizes)
5. Add SQLite messages.db alongside main DB
6. Simple fire-and-forget to Domain initially
7. Add queue + overflow when needed
8. Monitor and tune bundle sizes based on metrics

## 9. MCP (Model Context Protocol) Tools Placement

**Decision: MCP tools belong in Domain**

### Initial Confusion:
- First thought: Tools might need client-specific permissions/context → Edge
- This would create complex bidirectional flow between Domain and Edge
- Would require callback mechanisms or WebSockets between tiers

### Key Realization:
- **This is a single-user/team power tool, not multi-tenant SaaS**
- File access = server's file system (your code, docs)
- Database access = the application's database
- No per-user permissions for tools needed

### Why Domain is Correct:
1. **Tool execution is business logic** - Part of the AI assistant's capabilities
2. **Simpler control flow** - Tools execute synchronously within Domain's stream
3. **No bidirectional protocol needed** - Domain just yields tokens (including tool results)
4. **Consistent tool behavior** - Same tools work across all Edge types (web, CLI, Slack)

### Implementation:
```
LLM: "I need to read file.txt"
  ↓
Domain: Execute MCP file_read tool
  ↓
Domain: Format result as tokens
  ↓
Domain: Continue LLM generation with result
  ↓
Edge: Bundle and stream all tokens to client
```

This keeps Edge simple (just bundling/SSE) and Domain cohesive (all AI logic including tools).

## 10. Process Separation & Service Auth

**Decision: Deploy Edge and Domain as separate Node.js processes**

### Rationale:
1. **Enforces real boundaries** - AI agents cannot violate architecture
2. **Proves the architecture** - If it works separated, the design is sound
3. **Natural upgrade path** - Can move Edge to Workers/Deno later
4. **Forces good contracts** - Can't cheat with shared memory

### Implementation:
```bash
# Development
npm run domain   # Port 8766
npm run edge     # Port 8765, calls localhost:8766

# Production (Phase 1)
docker-compose up  # Same machine, different containers

# Production (Phase 2+)
- Domain on beefy server (SQLite, CPU)
- Edge on Cloudflare Workers (global, fast)
```

### Service-to-Service Auth (CCF):
```typescript
// Edge creates service token
const serviceToken = await new SignJWT({
  sub: 'edge-service',
  scopes: ['read:threads', 'write:messages']
}).sign(EDGE_PRIVATE_KEY);

// Domain validates service token + user context
const payload = await jwtVerify(token, EDGE_PUBLIC_KEY);
const userId = req.headers['x-user-id']; // Forwarded from Edge
```

## 11. CLI as First UI

**Decision: Build CLI before Web UI**

### Rationale:
1. **Superior E2E Testing Platform**
   - No browser automation flakiness
   - Precise streaming validation
   - Load testing capabilities
   - CI/CD friendly

2. **Same Edge API**
   - Proves API is truly client-agnostic
   - No special CLI routes needed
   - Battle-tests the API design

3. **Faster Development**
   - No webpack/bundling complexity
   - Immediate feedback loop
   - Power user as first customer

### CLI Authentication:
```typescript
// Start with API keys (simple, CI-friendly)
app.use(async (req, res, next) => {
  const auth = req.headers.authorization;
  
  if (auth?.startsWith('Bearer lt_sk_')) {
    // API key auth (CLI)
    req.user = await validateAPIKey(auth.slice(7));
  } else if (req.cookies.session) {
    // Session auth (future Web UI)
    req.user = await validateSession(req.cookies.session);
  }
});
```

### Example CLI Testing:
```bash
# Streaming validation
liminal chat "explain this" --measure-ttft --measure-token-rate

# Load testing
liminal test concurrent --sessions 10

# Error scenarios
liminal test network --simulate-disconnect --at-token 50
```

## 12. Contract-First Development with Walking Skeleton

**Decision: Define OpenAPI/JSON Schema contracts before implementation**

### Process:
1. **Define contracts** for each feature slice
2. **Generate validation** from schemas
3. **Implement in parallel** across tiers
4. **Integration works** by design

### Walking Skeleton Slices:
Each feature is a complete vertical slice through all tiers:
```
┌─────────────┐
│   Feature   │  Example: "Add message reaction"
├─────────────┤
│     CLI     │  $ liminal react msg123 👍
├─────────────┤
│    Edge     │  POST /api/v1/messages/:id/reactions
├─────────────┤
│   Domain    │  POST /domain/messages/:id/reactions  
├─────────────┤
│  Database   │  INSERT INTO message_reactions
└─────────────┘
```

### Contract Definition Example:
```yaml
# Edge API Contract
/api/v1/messages/{id}/reactions:
  post:
    requestBody:
      schema:
        type: object
        properties:
          emoji: { type: string, pattern: '^(:\w+:|[\u{1F300}-\u{1F9FF}])$' }
    responses:
      200:
        schema:
          type: object
          properties:
            reactions:
              type: array
              items:
                type: object
                properties:
                  emoji: { type: string }
                  count: { type: integer }
                  userReacted: { type: boolean }
```

## 13. AI Agent Development Pattern

**Decision: Use orchestrator + 4 specialized agents pattern**

### Architecture:
```
┌─────────────────────────────────────────┐
│      Claude Code Orchestrator           │
│    (Defines contracts, coordinates)     │
└────────┬────────┬────────┬────────┬────┘
         │        │        │        │
    ┌────▼───┐ ┌──▼───┐ ┌─▼────┐ ┌▼─────┐
    │Domain  │ │Edge  │ │CLI   │ │Test  │
    │Agent   │ │Agent │ │Agent │ │Agent │
    └────────┘ └──────┘ └──────┘ └──────┘
```

### Benefits:
1. **No cross-contamination** - Agents can't access other tiers
2. **Forced contracts** - Must communicate via APIs
3. **Parallel work** - All agents work simultaneously
4. **Natural documentation** - Contracts become specs

### Agent Boundaries:
```typescript
// Domain Agent
context: {
  files: ['src/services/**', 'src/providers/db/**'],
  forbidden: ['express', 'http', 'client concerns']
}

// Edge Agent  
context: {
  files: ['src/routes/edge/**'],
  apis: ['Domain HTTP endpoints'],
  forbidden: ['direct DB access', 'LLM providers']
}
```

## LLM Provider Strategy

### Implementation Order
1. **Echo Provider**: Testing and architecture validation
2. **Anthropic**: Primary provider, best streaming support
3. **OpenAI**: Most common, wide ecosystem support
4. **Gemini**: Flexibility and cost optimization

### Streaming-First Design
- All providers implement streaming interface
- Non-streaming is just collecting streamed tokens
- Consistent abstraction across all providers
- Provider-specific token extraction handled in Domain

### Vercel AI SDK Integration
Current simple prompt/response model will evolve to support:
- Conversation context (multi-turn)
- Structured outputs (JSON schemas)
- Tool calling (MCP integration)
- Multi-modal inputs (images)

**Strategy**: Start simple, design knowing migration path to richer primitives.

## Feature Progression Strategy

### Build Order (Revised)
1. **Feature 001: Echo Provider** - CLI → Domain direct (no Edge/auth/DB)
2. **Feature 002: Vercel AI SDK** - Add SDK with OpenAI provider
3. **Feature 003: Security Layers** - Add Edge tier + authentication
4. **Feature 004: Streaming** - Transform all providers to streaming

### Testing Philosophy
- **TDD Approach**: Write contracts first, tests second, implementation third
- **Vertical Slices**: Each feature is complete end-to-end
- **Coverage Requirements**: Domain 90%, Edge 75%
- **Human-AI Collaboration**: Human designs, AI implements to pass tests

### Key Non-Goals (Initially)
- Database persistence
- Conversation history
- Message management
- User profiles
- Just stateless prompt → response

## Final Architecture Clarity

The architecture conversation revealed that our "complex" Edge/Domain design is actually just acknowledging the essential complexity of building a production LLM streaming system. Attempts to simplify it just moved the complexity around rather than eliminating it.

**Domain owns**:
- All LLM provider interactions
- MCP tool execution
- Business logic and data persistence
- Message content management

**Edge owns**:
- Token bundling for different consumers
- SSE formatting and streaming
- Client-specific adaptations
- Network optimization

This separation ensures each tier has a single, clear responsibility.

## Key Insights

1. **Platform as Architecture**: Using Workers constraints to enforce boundaries
2. **Complexity is Real**: Edge/Domain separation acknowledges essential complexity
3. **Streaming is Core**: Not an afterthought - design for it from day one
4. **Mixed Vendors**: Security through diversity in auth providers
5. **Developer Experience Matters**: Three-mode auth system balances security and productivity

## 10. Testing Strategy Adjustment (June 2025)

**Decision: Defer automated network-outage simulation tests for Edge → Domain API until a suitable tooling strategy is available.**

**Context & Rationale**:
- Playwright's `APIRequestContext` cannot currently inject lower-level network failures (e.g., connection drops, DNS timeouts) that would be required to validate Edge's resilience behaviour.
- Implementing a bespoke proxy or chaos-testing harness is out of scope for Story 004 due to time and complexity constraints.
- Functional error-handling paths remain testable via controlled Domain responses; only _network-level_ outage scenarios are postponed.

**Consequences**:
1. Acceptance-criteria items related to "Connection resilience" are partially covered (Domain error propagation ✅, network-outage ❌ deferred).
2. A follow-up story will introduce chaos-testing using a dedicated proxy or Cloudflare Workers Durable Object to simulate outages.
3. Risk acknowledged: real network failures may surface untested behaviours until the follow-up story is complete. Mitigation is manual smoke testing before releases.