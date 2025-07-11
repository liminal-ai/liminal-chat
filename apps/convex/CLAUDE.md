# Convex Backend Agent

Stay in apps/convex/. Work within tier constraints.

## Directory Structure
```
convex/
├── edge/     # HTTP endpoints, LLM streaming (default runtime)
├── node/     # WorkOS auth, heavy operations ('use node' required)
├── db/       # Database queries and mutations
├── lib/      # Shared utilities
└── schema.ts # Database schema
```

## Tier Rules
- **edge/**: Default Convex runtime (V8 isolate). No 'use node'.
- **node/**: Node.js runtime. MUST have 'use node' at top of file.
- **db/**: Pure database operations. No HTTP, no 'use node'.

## Commands
```bash
npm run dev:start        # Start Convex dev server in background
npm run dev:stop         # Stop Convex dev server
npm run dev:restart      # Restart Convex dev server
npm run dev:logs         # View Convex dev server logs
npm run dev:dashboard    # Open Convex dashboard
npm run typecheck        # TypeScript validation
npm run lint             # ESLint checks
npm run test             # Integration tests
```

## Development Server
Always use PM2-managed commands to prevent terminal blocking:
- `npm run dev:start` - Starts server in background
- `npm run dev:logs` - Check output when needed
- Never use plain `convex dev` - it blocks the terminal

## Common Patterns

Edge function:
```typescript
// edge/http.ts - NO 'use node'
import { httpAction } from '../_generated/server';
```

Node function:
```typescript
// node/auth.ts - REQUIRES 'use node'
'use node';
import { action } from '../_generated/server';
```

Database operation:
```typescript
// db/messages.ts - NO 'use node'
import { query, mutation } from '../_generated/server';
```

