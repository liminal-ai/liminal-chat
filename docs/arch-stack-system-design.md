# Liminal Chat Architecture & System Design

## Target Architecture

Full-stack TypeScript application with edge-first performance, simplified streaming, and clean separation of concerns.

### Stack Overview

```
Frontend:  Vite + React + TypeScript
Backend:   Convex (Edge Runtime + PlanetScale Postgres)  
AI:        Vercel AI SDK → Direct Providers
Hosting:   Static CDN (Frontend) + Convex Cloud (Backend)
```

## Directory Structure

### Current State
```
liminal-chat/
├── apps/
│   ├── web/                 # Next.js (to be replaced)
│   └── liminal-api/         # Convex backend
│       └── convex/
└── packages/
```

### Target State
```
liminal-chat/
├── apps/
│   ├── chat/                # Vite React frontend
│   │   ├── src/
│   │   │   ├── components/  # UI components
│   │   │   ├── lib/         # Utilities, Convex client
│   │   │   ├── pages/       # Route components
│   │   │   └── main.tsx     # Entry point
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── liminal-api/         # Convex backend
│       └── convex/
│           ├── edge/        # Edge runtime functions
│           ├── db/          # Database operations
│           └── http.ts      # HTTP endpoints
└── packages/
```

## Architecture Flow

### Request Flow
```
Browser → CDN → Convex HTTP → Edge Runtime → AI Provider
   ↑                              ↓
   └──── useQuery ←── Convex DB ←─┘
```

### Data Flow
```
1. User Input      → POST /api/conversation
2. Edge Runtime    → Save message to DB
3. Edge Runtime    → Load conversation history  
4. Edge Runtime    → Stream from AI provider
5. Edge Runtime    → Batch tokens → Update DB
6. React useQuery  → Auto-update UI
```

## Sequence Diagrams

### Streaming Chat Flow
```
Browser         Convex HTTP      Edge Runtime       AI Provider       Database
   |                |                 |                  |                |
   |--POST /api/--->|                 |                  |                |
   |   conversation |--requireAuth--->|                  |                |
   |                |                 |                  |                |
   |                |<---Auth OK------|                  |                |
   |                |                 |                  |                |
   |                |--saveMessage--->|                  |                |
   |                |                 |--INSERT--------->|                |
   |                |                 |                  |                |
   |                |--loadHistory--->|                  |                |
   |                |                 |<--Messages-------|                |
   |                |                 |                  |                |
   |                |--streamText---->|--API Request--->|                |
   |                |                 |                  |                |
   |                |                 |<--Token Stream--|                |
   |                |                 |                  |                |
   |                |                 |--Batch(20)----->|                |
   |                |                 |   UPDATE Message |                |
   |                |                 |                  |                |
   |<-useQuery updates automatically--|<-----------------|                |
   |                |                 |                  |                |
```

### Provider Switching Flow
```
Edge Runtime              AI Service               Provider Adapter
     |                        |                           |
     |--streamText(provider)->|                           |
     |                        |--Select adapter--------->|
     |                        |                           |
     |                        |<--Stream chunks----------|
     |                        |                           |
     |<--Normalized chunks----|                           |
     |                        |                           |
```

## System Components

### Frontend (apps/chat)
- **Framework**: Vite + React 19
- **State**: Convex real-time subscriptions
- **Routing**: TanStack Router or React Router
- **UI**: Copy components from v0, adapt as needed
- **Auth**: Token from Convex

### Backend (apps/liminal-api/convex)
- **Runtime**: Edge (V8 isolate) for all functions
- **Database**: PlanetScale Postgres via Convex
- **AI Integration**: Vercel AI SDK in edge runtime
- **Streaming**: Chunk to database pattern

### AI Service Layer
```
convex/edge/
├── aiService.ts       # Vercel AI SDK wrapper
├── aiProviders.ts     # Provider configuration
└── streamAdapters.ts  # Per-provider stream normalization
```

## Migration Path

### Phase 1: Frontend Setup (Current Sprint)
1. Create `apps/chat` with Vite
2. Setup Convex client connection
3. Port conversation list page
4. Port chat interface
5. Verify real-time updates work

### Phase 2: Streaming Implementation
1. Convert `simpleChatAction` to edge runtime
2. Add streaming with chunk batching
3. Implement message update pattern
4. Test with multiple providers

### Phase 3: Cleanup
1. Remove `apps/web` (Next.js)
2. Remove Node.js runtime functions
3. Consolidate all functions to edge

## Key Design Decisions

### Streaming Pattern
- **Approach**: Stream to database, useQuery for UI updates
- **Batch Size**: 20 tokens initial, tunable
- **Rationale**: Simplifies architecture, leverages Convex strengths

### Provider Architecture  
- **Pattern**: Adapter per provider format
- **Location**: Edge runtime for performance
- **Flexibility**: Easy provider addition/switching

### Frontend Framework
- **Choice**: Vite over Next.js
- **Rationale**: No SSR needs, faster builds, cleaner architecture

### Runtime Strategy
- **Decision**: Edge runtime everywhere
- **Benefits**: 10x faster cold starts, unified environment

## Performance Targets

- **Cold Start**: < 100ms (edge vs 500ms+ Node.js)
- **Query Response**: < 10ms p99 (PlanetScale)
- **First Token**: < 500ms
- **Full Response**: Dependent on model

## Security Model

- **API Keys**: Environment variables in Convex
- **Auth**: Edge runtime validation
- **Conversation Access**: User-scoped queries
- **Rate Limiting**: Per-user at edge

## Deployment

### Frontend
```
Build: npm run build → dist/
Deploy: Any static host (Vercel, Netlify, Cloudflare)
```

### Backend
```
Deploy: npx convex deploy
Automatic: PlanetScale + Edge Runtime
```

## Next Steps

1. **Sprint 1**: Frontend migration
2. **Sprint 2**: Streaming implementation  
3. **Sprint 3**: Provider flexibility
4. **Sprint 4**: Roundtable UI components

---

## Summary of Design Decisions

### Type Sharing Architecture

**Decision**: pnpm workspace package linking

```
Type Flow: Convex generates → @liminal/api exports → apps/chat imports
```

**Implementation**:
- Convex generates types in apps/liminal-api/convex/_generated
- Package name @liminal/api declared in liminal-api package.json
- Consumer apps add dependency: "@liminal/api": "workspace:*"
- Import pattern: `import { api } from '@liminal/api/convex/_generated/api'`

**Rationale**:
- Types compile into bundle at build time (no runtime filesystem dependency)
- Standard pnpm workspace pattern understood by build tools
- Supports multiple consuming applications
- Avoids deployment path resolution issues

### Development Port Strategy

**Decision**: Vite default port 5173 with PM2 process management

```
Process Architecture:
Developer → npm script → PM2 daemon → Vite server (5173)
         ↓
    Terminal freed for other commands
```

**PM2 Benefits**:
- Prevents terminal binding issues with AI assistants
- Survives command timeouts and terminal closures
- Provides unified log management
- Enables fire-and-forget development workflow

**Script Pattern**:
- dev:start launches PM2 managed Vite process
- dev:stop cleanly terminates process
- dev:logs shows recent output
- Plain "dev" warns to use PM2 commands

**Rationale**:
- Eliminates AI assistant confusion about React port conventions
- Prevents cascade failures from stuck terminal processes
- Maintains Vite ecosystem expectations
- Clear operational boundaries via PM2

### Component Migration Strategy

**Decision**: Copy-as-reference approach

```
Migration Flow:
apps/web/components → Copy when needed → apps/chat/components
                           ↓
                   Use as Convex integration examples
                           ↓
                   Reference for Roundtable UI patterns
```

**Approach**:
- Copy shadcn components on demand during migration
- Study Convex subscription patterns in existing components
- Extract patterns, not preserve implementations
- Components serve as learning artifacts, not production code

**Rationale**:
- Aligns with shadcn philosophy of component ownership
- Provides concrete Convex integration examples
- No long-term maintenance burden
- Freedom to evolve Roundtable UI independently

### Deployment Architecture

**Decision**: Vercel static hosting with PR preview deployments

```
Deployment Flow:
GitHub PR → Vercel Build → Static CDN Distribution
    ↓            ↓               ↓
PR Comment   Preview URL    Edge Network
```

**Configuration**:
- Framework preset: Vite (auto-detected)
- Build command: cd apps/chat && npm run build
- Output directory: apps/chat/dist
- Environment variable: VITE_CONVEX_URL per environment

**PR Preview Benefits**:
- Unique URL per pull request (liminal-chat-pr-123.vercel.app)
- Automatic PR comments with preview links
- Test against different Convex environments
- Zero-configuration preview deployments

**Rationale**:
- Pure static hosting matches Vite output
- No SSR complexity or cold starts
- Leverages Vercel's CDN infrastructure
- Streamlines PR review workflow

### Development Workflow Design

**Decision**: PM2-managed local development with self-documenting scripts

```
Script Architecture:
npm run dev → Warning message → Use explicit PM2 commands
         ↓
    dev:start → Stop existing → Start PM2 daemon → Terminal freed
    dev:logs → Stream output for debugging
    dev:pause-and-verify-vite-started → Health check
```

**Package.json Philosophy**:
- Scripts as documentation - implementation visible, not abstracted
- Self-documenting names over separate documentation
- Explicit commands prevent accidental process spawning
- Terminal freedom for high-velocity development

**Key Script Decisions**:

1. **PM2 Process Management**
   - Direct `pm2` commands (not npx or relative paths)
   - Defensive stop-then-start pattern
   - Process name consistency across monorepo

2. **Developer Experience**
   - Override `npm run dev` with guidance message
   - Explicit command names (dev:pause-and-verify-vite-started)
   - Streaming logs by default for real-time feedback

3. **AI Assistant Compatibility**
   - Prevents terminal binding timeout failures
   - Clear success/failure messages in verification scripts
   - Standard patterns reduce confusion across stack changes

**Deployment Considerations**:
- PM2 scripts are development-only
- Production uses standard `vite build`
- Zero-config Vercel deployment preserved
- No runtime dependencies on monorepo structure

**Workflow Objectives**:
- Maximize developer velocity with reliable tooling
- Eliminate common failure modes (stuck terminals, port conflicts)
- Maintain deployment simplicity (git push → deployed)
- Support both human and AI-assisted development patterns