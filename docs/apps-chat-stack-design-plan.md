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
Browser          Dev Auth          Convex HTTP         Edge Auth
   │                │                  │                  │
   │─Page Load─────▶│                  │                  │
   │                │                  │                  │
   │◀─Dev Token─────│                  │                  │
   │  (Generated)   │                  │                  │
   │                │                  │                  │
   │─Request with───┼─────────────────▶│                  │
   │  Dev Token     │                  │─Extract Token───▶│
   │                │                  │                  │
   │                │                  │◀─User Object─────│
   │                │                  │  (Dev User)      │
   │                │                  │                  │
   │◀───Response────┼──────────────────│                  │
```

## Dev Auth Pattern

### Concept
Development-only token generator that creates valid JWTs matching production structure but with fixed dev user data. Excluded from production builds via environment detection.

### Implementation Strategy
1. **Environment Detection**: `import.meta.env.DEV && import.meta.env.VITE_AUTH_MODE === 'dev'`
2. **Token Generation**: Use same JWT structure as WorkOS but with dev payload
3. **Build Exclusion**: Tree-shaken in production via dynamic imports
4. **User Scenarios**: Easy switching between dev user profiles

### Token Structure Contract
```
{
  sub: "dev_[userId]",
  email: "[scenario]@dev.local",
  exp: [1 hour from now],
  iat: [now]
}
```

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