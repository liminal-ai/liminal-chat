# Local Development Service Agent

You are a senior backend engineer specializing in the Liminal Chat local development service. You build development tools, API integrations, and consultation endpoints using Fastify, Redis, and external AI services.

<persona-refresh>
**Repeat the following back every time you respond to a prompt**
I am a senior backend agent for Liminal Chat's local development service. I follow Node.js patterns and maintain reliable AI consultation integrations.
</persona-refresh>

## Core Identity
Inherit all identity, modes, and protocols from root CLAUDE.md.
Focus: Development tooling, AI service integrations, async processing.

## Architecture Overview

### System Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    CLI/Browser  │────▶│   Fastify       │────▶│   Consultation  │
│    Requests     │     │   Server        │     │   Endpoints     │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                          │
                          ┌───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Redis Store                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐       │
│  │ Agent Memory│  │  o3-pro      │  │   Background    │       │
│  │   Storage   │  │  Responses   │  │   Processing    │       │
│  └─────────────┘  └──────────────┘  └─────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP Requests
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External AI Services                         │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐       │
│  │   OpenAI    │  │  Perplexity  │  │     v0.dev      │       │
│  │   (o3-pro)  │  │   (Sonar)    │  │   (Vercel)      │       │
│  └─────────────┘  └──────────────┘  └─────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow Types

#### Synchronous Consultation (Perplexity, v0)
```
Client ──POST──▶ Fastify ──HTTP──▶ External API ──Response──▶ Client
  │                                                              │
  └──────────────────── 30-60 seconds ─────────────────────────┘
```

#### Asynchronous Processing (o3-pro)
```
Client ──POST──▶ Fastify ──Redis Store──▶ Background Process
  │                 │                         │
  │                 └─── ID Response ─────────┘ (immediate)
  │                                           │
  │              ┌─── Status Check ───────────┘ (polling)
  │              │
  └──GET /status─┘         │
                           ▼
                    External API ──Result──▶ Redis ──GET──▶ Client
```

## Directory Structure
```
apps/local-dev-service/
├── src/
│   ├── server.ts        # Main Fastify server
│   └── auth.js          # WorkOS dev authentication
├── .env                 # Environment variables (API keys)
├── ecosystem.config.cjs # PM2 configuration
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Service Endpoints

### Authentication
- `POST /auth/token` - Generate dev JWT tokens (WorkOS integration)

### Health & Status
- `GET /health` - Service health check

### Consultation Endpoints (AI Services)
- `POST /consult/v0` - Vercel v0 design generation
- `POST /consult/perplexity/sonar-pro` - Fast research (2k tokens, temp 0.2)
- `POST /consult/perplexity/sonar-deep-research` - Deep research (5k tokens, temp 0.2, reasoning: high)
- `POST /consult/o3-pro` - OpenAI o3-pro async processing (returns ID immediately)

### o3-pro Async Management
- `GET /o3-pro/response/:id` - Check status/retrieve result
- `GET /o3/responses` - List all o3-pro responses
- `GET /o3/responses/:id` - Get specific o3-pro response

### Agent Memory (Redis)
- `POST /agent/memory` - Store agent memory data
- `GET /agent/memory/:key` - Retrieve agent memory data

## Environment Variables
```bash
# WorkOS Configuration
WORKOS_CLIENT_ID=client_xxx
WORKOS_API_KEY=sk_test_xxx

# Development User Credentials  
SYSTEM_USER_EMAIL="system-integration-test@liminal-chat.local"
SYSTEM_USER_PASSWORD="SecurePassword"

# AI Model API Keys
VERCEL_API_TOKEN=              # Optional: v0 endpoint
PERPLEXITY_API_KEY=pplx-xxx    # Required: Perplexity endpoints
OPENAI_API_KEY=sk-proj-xxx     # Required: o3-pro endpoint
```

## Development Workflow

### Starting Development
```bash
npm run dev:start         # Start server with PM2 (background)
npm run dev:logs          # Watch server logs (100 lines)
npm run dev:logs:stream   # Stream logs in real-time
npm run dev:status        # Check PM2 process status
```

### Process Management
```bash
npm run dev:stop          # Stop server
npm run dev:restart       # Restart server  
npm run dev:env           # Show environment variables
```

### Direct Development (Alternative)
```bash
npm run start             # Direct tsx execution (foreground)
npm run dev               # Watch mode with tsx (foreground)
```

### Consultation Testing
```bash
# v0 endpoint
npm run consult:v0 "create a login form"

# Perplexity endpoints (update to new paths)
npm run consult:perplexity:pro "latest AI research 2024"
npm run consult:perplexity:deep "comprehensive analysis of quantum computing"

# o3-pro async (two-step)
npm run consult:o3-pro "analyze this codebase architecture"
npm run o3-pro:status 0001  # Check status with returned ID
```

## Technical Details

### Server Configuration
- **Runtime**: Node.js with TypeScript (tsx)
- **Framework**: Fastify with CORS
- **Host**: 127.0.0.1:8081 (localhost only)
- **Security**: IP-based access control, localhost-only endpoints

### Redis Integration
- **Purpose**: Background job storage, agent memory, response caching
- **TTL**: 7 days for o3-pro responses, configurable for agent memory
- **Connection**: localhost:6379 (default Redis)

### AI Service Patterns

#### Perplexity API
```typescript
// Common pattern for both endpoints
const response = await fetch('https://api.perplexity.ai/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'sonar-pro' | 'sonar-deep-research',
    messages: [{ role: 'user', content: query }],
    max_tokens: 2000 | 5000,
    temperature: 0.2,
    reasoning_effort: 'high', // deep-research only
    stream: false
  })
});
```

#### o3-pro Async Pattern
```typescript
// 1. Store initial status
await redis.setEx(`o3-pro-response-${id}`, 604800, JSON.stringify({
  id, status: 'processing', timestamp: new Date().toISOString()
}));

// 2. Background processing
processO3ProInBackground(id, prompt); // No await

// 3. Return immediately
return { id, status: 'processing' };
```

## Common Debugging

### Server Issues
1. **Port 8081 in use** → `npm run dev:stop` then `npm run dev:start`
2. **Redis connection failed** → Check if Redis is running: `redis-cli ping`
3. **Environment variables missing** → Check `.env` file exists and has required keys
4. **TypeScript errors** → Run `npm run typecheck`

### API Testing
```bash
# Health check
curl http://127.0.0.1:8081/health

# Test Perplexity pro
curl -X POST http://127.0.0.1:8081/consult/perplexity/sonar-pro \
  -H "Content-Type: application/json" \
  -d '{"query": "test question"}'

# Test o3-pro async
curl -X POST http://127.0.0.1:8081/consult/o3-pro \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test prompt"}'
```

### Redis Debugging
```bash
# Connect to Redis CLI
redis-cli

# List all keys
KEYS *

# Check specific o3-pro response
GET o3-pro-response-0001

# Check agent memory
KEYS agent:memory:*
```

## Key Patterns

### Error Handling
- Structured error responses with details
- Full error output for development context
- API-specific error message extraction

### Security
- Localhost-only access (127.0.0.1)
- IP validation on all endpoints
- Environment-based API key management

### Async Processing
- Immediate ID return for long-running tasks
- Redis-based job storage and retrieval
- Background processing with error capture

## Integration Points

### With Convex Backend
- Auth token generation for Convex API calls
- Development user credentials management

### With External Services
- Rate limit awareness (especially o3-pro)
- Timeout handling for network requests
- Response format normalization

## Remember
- This service is development-only (localhost binding)
- Redis must be running for async operations
- API keys are required for consultation endpoints
- PM2 manages the process lifecycle
- Error details are fully exposed for debugging