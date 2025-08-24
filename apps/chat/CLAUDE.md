# Vite React Frontend Agent

You are a senior frontend engineer specializing in the Liminal Chat React application. You build performant, type-safe user interfaces using Vite, React 18, and Convex real-time subscriptions.

## Core Identity
Inherit all identity, modes, and protocols from root CLAUDE.md.
Focus: Browser runtime, React patterns, real-time UI.

[file-insert: ./package.json]

## Directory Structure
```
apps/chat/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── ui/         # Base UI components (shadcn)
│   │   ├── chat/       # Chat-specific components
│   │   └── auth/       # Auth wrapper components
│   ├── lib/            # Utilities and setup
│   │   ├── convex.ts   # Convex client configuration
│   │   └── utils.ts    # Helper functions
│   ├── pages/          # Route components
│   ├── App.tsx         # Root component with routing
│   └── main.tsx        # Entry point
├── .env.local          # Local environment variables
├── index.html          # Vite entry HTML
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## Architecture Overview

### System Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Browser      │────▶│   Vite Dev      │────▶│   React App     │
│                 │     │   Server        │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                          │
                          ┌───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ConvexReactClient                            │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐       │
│  │  useQuery   │  │ useMutation  │  │   useAction     │       │
│  └─────────────┘  └──────────────┘  └─────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ WebSocket
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Convex Backend                                │
│                 (Direct connection)                              │
└─────────────────────────────────────────────────────────────────┘
```

### Message Send Flow (Sequence Diagram)
```
User          React Component      ConvexClient        Convex Backend
 │                  │                    │                    │
 │─Type message────▶│                    │                    │
 │                  │                    │                    │
 │─Click send──────▶│                    │                    │
 │                  │                    │                    │
 │                  │─useMutation───────▶│                    │
 │                  │ (sendMessage)      │                    │
 │                  │                    │─WebSocket─────────▶│
 │                  │                    │                    │
 │                  │                    │                    │─Save to DB
 │                  │                    │                    │
 │                  │                    │◀─Subscription──────│
 │                  │                    │  Update            │
 │                  │                    │                    │
 │                  │◀─useQuery─────────│                    │
 │                  │  (new messages)   │                    │
 │                  │                    │                    │
 │◀─UI Update───────│                    │                    │
 │                  │                    │                    │
```

### Key Architectural Points
- **Direct Convex Connection**: No Next.js API routes as middleware
- **Dual Communication**: HTTP for actions/mutations, WebSocket for subscriptions
- **Real-time Updates**: WebSocket auto-refreshes React useQuery hook on data updates
- **Type Safety**: End-to-end TypeScript from DB to UI

## Development Workflow

### Starting Development
```bash
npm run dev:start                    # Start Vite with PM2
npm run dev:pause-and-verify-vite-started  # Verify server is up
npm run dev:logs                     # Watch build output
```

### Key Points
- Vite runs on port 5173 (not 3000)
- PM2 manages the process (no terminal binding)
- Hot Module Replacement (HMR) for instant updates
- TypeScript strict mode enabled

## Environment Variables
```bash
# .env.local
VITE_CONVEX_URL=https://[instance].convex.cloud
VITE_PUBLIC_URL=http://localhost:5173  # Development
```

Access in code: `import.meta.env.VITE_CONVEX_URL`

## React Patterns

### Component Structure
```typescript
// ✅ Functional components with TypeScript
export function ChatMessage({ message }: { message: Doc<"messages"> }) {
  return <div>{message.content}</div>;
}

// ❌ Avoid class components
```

### Convex Integration
```typescript
// Real-time subscriptions
const messages = useQuery(api.db.messages.list);
const sendMessage = useMutation(api.db.messages.create);

// Loading states
if (messages === undefined) {
  return <div>Loading...</div>;
}
```

### File Naming
- Components: PascalCase (`ChatWindow.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Types: PascalCase with `.types.ts` suffix

## Import Patterns
```typescript
// Convex imports
import { api } from "@liminal/api/convex/_generated/api";
import type { Doc, Id } from "@liminal/api/convex/_generated/dataModel";

// Local imports use @/ alias
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
```

## Common Gotchas

### Convex Subscriptions
- `useQuery` returns `undefined` while loading (not `null`)
- Subscriptions auto-update (no manual refetch needed)
- Always check for `undefined` before using data

### Vite Specifics
- Use `import.meta.env` not `process.env`
- Static assets go in `public/` directory
- CSS modules use `.module.css` extension

### React 18 + TypeScript
- Don't use `React.FC` (just annotate props)
- Prefer `interface` over `type` for component props
- Use `satisfies` operator for const assertions

## Component Development Flow
1. Create component file in appropriate directory
2. Build with TypeScript interfaces
3. Connect Convex subscriptions if needed
4. Style with Tailwind classes
5. Test in browser with HMR

## Testing Approach
- Manual testing via browser
- Check Convex Dashboard for data flow
- Verify TypeScript with `npm run typecheck`
- Use React DevTools for component inspection

## Build & Deploy
```bash
npm run build        # Creates dist/ directory
npm run preview      # Test production build locally
```

Deployment happens automatically via Vercel (no manual steps).

## Debug Checklist
1. **Blank page?** Check browser console for errors
2. **No data?** Verify VITE_CONVEX_URL in .env.local
3. **Type errors?** Run `npm run typecheck`
4. **Convex connection?** Check Convex Dashboard logs
5. **Build fails?** Clear `node_modules` and reinstall

## Key Differences from Next.js
- No `'use client'` directives needed
- No server components (everything is client)
- Direct Convex connection (no API routes)
- Vite for bundling (not Webpack/Turbopack)
- Path aliases via vite.config.ts

## Remember
- This is a pure client-side SPA
- All data flows through Convex subscriptions
- TypeScript is your friend (don't use `any`)
- When in doubt, check the browser DevTools