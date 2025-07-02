# Liminal Chat Development Log

## Project Overview

**Liminal Chat** is an open-source, privacy-first AI chat platform that enables users to bring their own API keys (BYOK) and engage in AI Roundtable conversations where multiple AI perspectives collaborate. The project is undergoing a major architectural migration from a NestJS/ArangoDB/Cloudflare Workers stack to a modern Convex + Vercel AI SDK + Next.js architecture.

## Current Architecture

```
CLI → Convex (Backend) + Vercel AI SDK (LLM Integration) → Multiple AI Providers
```

### Technology Stack
- **Backend**: Convex (serverless functions, database, real-time subscriptions)
- **LLM Integration**: Vercel AI SDK (unified interface for AI providers)
- **Frontend**: Next.js 14+ with App Router, React 19, Tailwind CSS, shadcn/ui
- **Authentication**: Clerk (integrated with Convex)
- **CLI**: Commander.js based command-line interface
- **Monorepo**: pnpm workspaces

## Migration Status (as of July 2, 2025)

### ✅ Completed Features
1. **Feature 001: Convex Foundation** - Complete
   - Convex backend initialized and deployed
   - Clerk authentication integrated
   - Database schema defined (users, conversations, messages)
   - Development environment configured

### 🚧 In Progress (Features 2-8)
- Feature 2: Vercel AI SDK single provider integration (Partially complete)
- Feature 3: Testing infrastructure setup (Partially complete)
- Feature 4: Multi-provider support (Partially complete)
- Feature 5: Model/Provider DTOs with persistence (Not started)
- Feature 6: Model tools registry (Not started)
- Feature 7: Agent system with orchestration (Not started)
- Feature 8: CLI alignment with core APIs (Not started)

## Verified Configurations and Setup

### 1. Environment Variables (Convex Cloud)
All API keys are stored in Convex cloud, NOT in local .env files. Verified working keys:

```bash
# To view current environment variables:
npx convex env list

# Confirmed working API keys:
✅ OPENAI_API_KEY          # Working - tested with gpt-4o-mini
✅ ANTHROPIC_API_KEY       # Working - tested with claude-3-5-sonnet
✅ GOOGLE_GENERATIVE_AI_API_KEY  # Working - tested with gemini-2.0-flash
✅ PERPLEXITY_API_KEY      # Working - tested with sonar-pro
✅ VERCEL_API_KEY          # Working - tested with v0-1.0-md
✅ OPENROUTER_API_KEY      # Fixed during session - working with google/gemini-2.5-flash
✅ CLERK_ISSUER_URL        # Set for JWT verification
✅ DEV_AUTH_DEFAULT=true    # Development auth bypass enabled
```

### 2. Project Structure Clarification
```
/apps/liminal-api/          # The backend application package
  ├── convex/               # Convex functions directory (deployed to cloud)
  │   ├── _generated/       # Auto-generated Convex types
  │   ├── ai/               # AI provider integration
  │   ├── lib/              # Shared libraries (auth, etc.)
  │   ├── schema.ts         # Database schema
  │   ├── http.ts           # HTTP endpoints
  │   ├── chat.ts           # Chat actions
  │   ├── conversations.ts  # Conversation CRUD
  │   ├── messages.ts       # Message handling
  │   └── users.ts          # User management
  ├── tests/                # Integration tests
  ├── package.json          # Dependencies
  └── .env.local            # Local Convex CLI config only
```

### 3. Authentication Implementation

#### Dev User Setup
Implemented a default dev user in the database:
- **Clerk User ID**: `user_2zINPyhtT9Wem9OeVW4eZDs21KI`
- **Database ID**: `j978wkvbjwmcryxbybz910fza97jza8k`
- **Email**: `dev@liminal.chat`
- **Name**: `Dev User`

#### Auth Helper Functions
Created three auth helper functions in `/convex/lib/auth.ts`:
1. `requireAuth(ctx)` - For mutations/queries that require auth
2. `getAuth(ctx)` - For queries that work with or without auth
3. `getAuthForAction(ctx)` - Special version for actions (no DB access)

### 4. Verified Working Endpoints

#### Health Check
```bash
GET https://modest-squirrel-498.convex.site/health
# Returns: { status: "healthy", database: { connected: true, userCount: 1 }}
```

#### Chat Endpoints (All Working)
```bash
# Simple text completion
POST /api/chat-text
{
  "prompt": "Hello",
  "provider": "openai"  # or anthropic, google, perplexity, vercel, openrouter
}
# Returns: { text, usage, finishReason, model, provider, conversationId }

# Streaming chat (Vercel AI SDK format)
POST /api/chat
{
  "messages": [{"role": "user", "content": "Hello"}],
  "provider": "openai"
}
# Returns: Streaming response with data chunks

# Completion endpoint
POST /api/completion
{
  "prompt": "Complete this",
  "provider": "openai"
}
# Returns: Streaming response
```

#### Conversation Endpoints
```bash
# List conversations
GET /api/conversations
# Returns: { page: [], isDone: true } (empty due to auth context)

# Get specific conversation
GET /api/conversations/:id
# Returns: 404 (auth context issue in tests)

# Create conversation
POST /api/conversations
# Update conversation
PATCH /api/conversations/:id
# Delete conversation
DELETE /api/conversations/:id
```

### 5. Testing Infrastructure

#### Test Results (10/11 Passing)
```bash
npm test

✅ System health check
✅ Basic chat functionality  
✅ Streaming format compliance
✅ Error handling
✅ Concurrent request handling
✅ Provider switching (all 6 providers)
✅ Response time check
✅ List conversations endpoint
✅ Create conversation via API
✅ Streaming chat preserves conversation
❌ Create conversation and persist messages (404 on GET)
```

#### Test Configuration
- Framework: Playwright
- Target: Convex HTTP Actions at `https://modest-squirrel-498.convex.site`
- Philosophy: Real API calls, no mocks
- Cost optimization: Uses cheapest models for each provider

### 6. Database Schema

```typescript
// Users table
{
  tokenIdentifier: string,  // Clerk user ID
  email: string,
  name?: string,
  imageUrl?: string,
  createdAt: number,
  updatedAt: number
}

// Conversations table  
{
  userId: string,           // tokenIdentifier from Clerk
  title: string,
  type: "standard" | "roundtable" | "pipeline",
  metadata?: {
    provider?: string,
    model?: string,
    tags?: string[],
    archived?: boolean
  },
  lastMessageAt: number,
  createdAt: number,
  updatedAt: number
}

// Messages table
{
  conversationId: Id<"conversations">,
  authorType: "user" | "agent" | "system",
  authorId: string,
  type: "text" | "tool_call" | "tool_output" | "chain_of_thought" | "error",
  content: any,
  createdAt: number,
  metadata?: {
    model?: string,
    provider?: string,
    promptTokens?: number,
    completionTokens?: number,
    totalTokens?: number,
    finishReason?: string,
    visibility?: string[]
  }
}
```

### 7. Provider Configuration

All providers are configured in `/convex/ai/providers.ts` with the following verified models:
- **OpenAI**: gpt-4o-mini (default)
- **Anthropic**: claude-3-5-sonnet-20241022
- **Google**: gemini-2.0-flash-exp
- **Perplexity**: sonar-pro
- **Vercel**: v0-1.0-md
- **OpenRouter**: google/gemini-2.5-flash (default)

### 8. Development Workflow

```bash
# Start Convex dev server
cd apps/liminal-api
npm run dev

# In another terminal - start Next.js
cd apps/web  
npm run dev

# Run tests
cd apps/liminal-api
npm test

# Initialize dev user (run once)
npx convex run users:initializeDevUser

# Check Convex dashboard
# https://dashboard.convex.dev/d/modest-squirrel-498
```

## Key Findings and Clarifications

1. **Convex Environment Variables**: Unlike traditional Node.js apps, Convex stores environment variables in the cloud. Use `npx convex env set KEY value` to set them, not .env files.

2. **Testing Approach**: Tests run against deployed Convex functions, not a local server. This is why tests use `https://modest-squirrel-498.convex.site` instead of localhost.

3. **Auth in Actions**: Convex actions don't have direct database access, requiring special auth handling for action contexts.

4. **Conversation Persistence**: Now working! Chat endpoints return a `conversationId` and messages are properly stored.

5. **OpenRouter Issue**: The original API key was invalid/expired. Updated during session and now working.

## Remaining Issues

1. **Conversation List/Get**: The endpoints exist but return empty results or 404, likely due to auth context not properly propagating in all queries.
   - **Update (July 2, 2025)**: Fixed auth propagation in messages queries. However, discovered that Convex HTTP router doesn't support path parameters (`:id`), causing 404s on `/api/conversations/:id` routes.

2. **CLI Integration**: Still points to old edge server URLs, needs updating to use Convex endpoints.

3. **Web UI**: Minimal implementation, needs actual chat interface.

4. **Agent System**: Completely missing from the Convex implementation.

## Recent Updates (July 2, 2025)

### Authentication Improvements
- Fixed `messages.getAll` and other message queries to use `getAuthOptional` helper
- Ensured consistent auth handling across all queries
- Created comprehensive authentication documentation at `/docs/technical/authentication.md`

### Discovered Issues
- **Convex HTTP Router Limitation**: Convex's HTTP router doesn't support Express-style path parameters (`:id`)
  - Routes like `/api/conversations/:id` return "No matching routes found"
  - Need to refactor to use query parameters or different routing approach
  - This affects RESTful endpoint design

### Test Status
- 10 out of 11 integration tests passing
- Last failing test expects `/api/conversations/:id` to work (path parameter issue)

## Next Steps

1. Refactor conversation GET/UPDATE/DELETE endpoints to work without path parameters
   - Option A: Use query parameters (`/api/conversations?id=...`)
   - Option B: Create separate named endpoints (`/api/conversations/get`, `/api/conversations/update`)
2. Update CLI to connect to Convex endpoints
3. Build functional chat UI in Next.js
4. Implement agent system (Feature 7)
5. Complete remaining features (5, 6, 8)

---

*Last updated: July 2, 2025*
*Session: Migration review, dev user implementation, and auth fixes*