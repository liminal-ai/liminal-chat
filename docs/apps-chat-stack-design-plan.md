# Apps/Chat Stack Design Plan

## Stack Choices

| Component | Choice | Version | Reasoning |
|-----------|--------|---------|-----------|
| Build Tool | Vite | 6.0.x | Fast HMR, edge-compatible, production proven |
| Framework | React | 18.3.1 | v0 compatibility, stable ecosystem |
| Router | React Router | 6.26.x | LLM fluency, standard patterns |
| Styling | Tailwind CSS | 3.4.x | v0 alignment, not v4 beta conflicts |
| Components | shadcn/ui | Latest | Copy-paste control, v0 native |
| Icons | lucide-react | 0.456.0 | Match Next.js, shadcn standard |
| Types | TypeScript | 5.7.3 | Align with Convex, latest stable |
| State | Convex React | 1.25.x | Real-time subscriptions |

## Directory Structure

```
apps/chat/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn components
│   │   ├── chat/            # Chat-specific components
│   │   └── auth/            # Auth wrapper components
│   ├── lib/
│   │   ├── convex.ts        # ConvexReactClient setup
│   │   ├── auth.ts          # Auth mode switching
│   │   └── dev-auth.ts      # Dev token generator
│   ├── pages/               # Route components
│   │   ├── conversations.tsx
│   │   ├── chat/
│   │   │   └── [id].tsx
│   │   └── health.tsx
│   ├── App.tsx              # Router setup
│   └── main.tsx             # Entry point
├── .env.local               # Local environment
├── .env.example             # Environment template
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Architecture Flow

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Browser       │────▶│  Vite Dev    │────▶│  React App      │
│                 │     │  Server      │     │                 │
└─────────────────┘     └──────────────┘     └────────┬────────┘
                                                       │
                          ┌────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    ConvexReactClient                         │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  useQuery   │  │ useMutation  │  │   useAction     │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Convex Backend                            │
│                 (Direct connection)                          │
└─────────────────────────────────────────────────────────────┘
```

## Auth Flow - Production

```
Browser          Convex HTTP         Edge Auth          WorkOS
   │                 │                   │                │
   │─Request────────▶│                   │                │
   │                 │─Extract Token────▶│                │
   │                 │                   │─Verify JWT────▶│
   │                 │                   │                │
   │                 │                   │◀──JWKS/Valid───│
   │                 │                   │                │
   │                 │◀──User Object─────│                │
   │                 │                   │                │
   │◀──Response──────│                   │                │
```

## Auth Flow - Development

```
Browser          Local Dev         WorkOS API        Convex Backend
   │             Service                │                  │
   │             (localhost)            │                  │
   │                │                   │                  │
   │─Check──────────│                   │                  │
   │ localStorage   │                   │                  │
   │                │                   │                  │
   │─POST /auth/────▶│                   │                  │
   │  token         │──Authenticate────▶│                  │
   │ (if expired)   │  with password    │                  │
   │                │◀──JWT + refresh───│                  │
   │◀─JWT───────────│                   │                  │
   │                │                   │                  │
   │─Store in───────│                   │                  │
   │ localStorage   │                   │                  │
   │                │                   │                  │
   │─API Request────┼───────────────────┼─────────────────▶│
   │ with JWT       │                   │                  │
   │                │                   │                  │
   │◀──Response─────┼───────────────────┼──────────────────│
```

## Dev Auth Pattern

### Concept
Local development service generates real WorkOS JWTs using password authentication. Tokens are stored in localStorage and managed by the React app. The local service runs only on localhost, preventing accidental exposure of auth endpoints.

### Implementation Strategy
1. **Local Service**: Fastify server on localhost:8081 handles WorkOS authentication
2. **Token Storage**: Valid JWTs stored in localStorage with expiry tracking
3. **Auto Refresh**: React hook checks expiry and refreshes before token expires
4. **Security**: Service only accessible from localhost, no public endpoints

### Token Flow
1. React app checks localStorage for valid token
2. If missing/expired, calls localhost:8081/auth/token
3. Local service authenticates with WorkOS using dev credentials
4. Returns real JWT that matches production structure
5. React stores token and uses for all Convex requests

## Implementation Phases

### Phase 1: Foundation (Sprint 1)
1. Initialize Vite + React + TypeScript
2. Configure path aliases matching Next.js patterns
3. Setup Convex client connection
4. Create health check page verifying connectivity
5. Install base dependencies

### Phase 2: Auth Integration (Sprint 1)
1. Implement auth mode detection
2. Create dev token generator (dev environment only)
3. Add auth context provider
4. Verify both dev and prod auth flows
5. Create auth-gated test page

### Phase 3: UI Migration (Sprint 2)
1. Setup React Router with existing routes
2. Install shadcn/ui with same config
3. Port conversations list page
4. Port chat interface
5. Verify real-time updates

### Phase 4: Feature Parity (Sprint 2)
1. Complete all page migrations
2. Remove 'use client' directives
3. Update imports from Next.js specific
4. Test all user flows
5. Performance optimization

## Key Design Decisions

### Router Configuration
- Declarative routes in App.tsx
- Protected route wrapper component
- Path structure matches current URLs
- Lazy loading for code splitting

### State Management
- Convex subscriptions for server state
- Local React state for UI state
- No additional state library needed
- Real-time updates via useQuery

### Development Experience
- Fast refresh via Vite HMR
- Dev auth removes login friction
- Same code paths as production
- Easy scenario testing

### Build & Deploy
- Static output to dist/
- Environment variables at build time
- Deploy to any static host
- Separate from Convex deployment

## Environment Configuration

### Development
```
VITE_CONVEX_URL=https://[dev-instance].convex.cloud
VITE_AUTH_MODE=dev
VITE_DEV_USER_ID=dev_user_123
```

### Production
```
VITE_CONVEX_URL=https://[prod-instance].convex.cloud
VITE_AUTH_MODE=production
```

## Local Dev Service

### Why We Need It
1. **Security**: Cannot expose dev auth endpoints on public Convex backend
2. **API Keys**: Keep sensitive keys (WorkOS, Perplexity, v0) local only
3. **Agent Tooling**: Enable Claude/agents to use research and code generation
4. **Extensibility**: Central place for all local dev tools

### Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│  localhost  │────▶│   WorkOS    │
│  React App  │     │   :8081     │     ├─────────────┤
│   Claude    │     │             │────▶│ Perplexity  │
│   Agents    │     │  Fastify    │     ├─────────────┤
└─────────────┘     │  Service    │────▶│  v0 Model   │
                    └─────────────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │   Unified   │
                    │     API     │
                    └─────────────┘
```

### Directory Structure

```
apps/local-dev-service/
├── src/
│   ├── plugins/
│   │   ├── auth/           # WorkOS JWT generation
│   │   ├── perplexity/     # Search integration
│   │   └── v0/             # Component generation
│   ├── routes/
│   │   ├── auth.ts         # POST /auth/token
│   │   ├── search.ts       # POST /search
│   │   └── generate.ts     # POST /v0/generate
│   ├── server.ts           # Fastify setup
│   └── config.ts           # Environment config
├── package.json
├── tsconfig.json
└── .env.example
```

### Initial Dev Tooling

#### 1. JWT Token Generation
- **Endpoint**: `POST /auth/token`
- **Purpose**: Generate real WorkOS JWTs for dev user
- **Response**: `{ token: string, expiresAt: number }`

#### 2. Perplexity Search
- **Endpoint**: `POST /search`
- **Purpose**: Research capabilities for Claude
- **Payload**: `{ query: string, options?: {...} }`
- **Response**: Search results with sources

#### 3. v0 Component Generation
- **Endpoint**: `POST /v0/generate`
- **Purpose**: Generate and iterate on React components
- **Payload**: `{ prompt: string, code?: string }`
- **Response**: Generated component code

### Security Measures
- Only binds to localhost (127.0.0.1)
- Validates origin headers
- No CORS for external domains
- Dies if PORT !== 8081

### Future Extensions
- Cache management endpoints
- Debug tools for Convex data
- Mock data generators
- Performance profiling
- Local LLM testing