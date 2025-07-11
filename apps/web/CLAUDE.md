# Next.js Frontend Agent

Stay in apps/web/. Always use port 3000.

## Core Architecture
```
Next.js 15 + App Router
    ↓
Convex Client (real-time subscriptions)
    ↓
React 19 + TypeScript + Tailwind
```

## Critical Port Rule
**ALWAYS use port 3000** - Auth callback URLs are configured for localhost:3000. Using port 3001 breaks authentication.

Before starting dev server:
```bash
# Check if port 3000 is already in use
lsof -ti:3000
# If output shows PID, kill it first
kill -9 <PID>
# Then start on port 3000
npm run dev -- --port 3000
```

## Directory Structure
```
app/                    # App Router
├── (auth)/            # Auth group routes
│   ├── login/
│   └── signup/
├── (chat)/            # Main app group
│   ├── page.tsx       # Chat interface
│   └── [id]/          # Conversation view
├── api/               # Not used (Convex handles API)
└── layout.tsx         # Root layout

components/
├── ui/                # shadcn/ui components
├── chat/              # Chat-specific components
└── providers/         # Context providers
```

## Key Patterns

### Server Components (default)
```typescript
// No 'use client' directive
export default async function Page() {
  // Server-side rendering
  return <Component />;
}
```

### Client Components (when needed)
```typescript
'use client';
// For interactivity, hooks, browser APIs
```

### Convex Integration
```typescript
// Real-time subscriptions
const messages = useQuery(api.messages.list);

// Mutations
const send = useMutation(api.messages.send);

// Optimistic updates handled by Convex
```

Import from these path aliases:
```typescript
import { api } from '@db/api';           // Convex API
import { Id } from '@db/types';          // Convex types
import { useQuery } from 'convex/react'; // Convex hooks
```

## Tech Stack
- **Framework**: Next.js 15.3.4 with App Router
- **UI Library**: React 18.3.1
- **Styling**: Tailwind CSS 3.4.16
- **Components**: shadcn/ui (Radix + Tailwind, "new-york" style)
- **State**: Convex subscriptions + React state
- **Auth**: WorkOS via middleware

## Commands
```bash
npm run dev:start        # Stop any existing, start on 3000, verify working
npm run dev:stop         # Kill process on port 3000
npm run dev:restart      # Full stop and restart
npm run dev:verify       # Check if server responds
npm run build            # Build for production
npm run typecheck        # TypeScript validation
npm run lint             # ESLint checks
```

## Development Server
```bash
/start-nextjs               # Complete restart and verification
npm run dev:start           # Start server (fire-and-forget)
npm run dev:stop            # Kill process on port 3000
npm run dev:restart         # Stop and restart
npm run dev:logverify       # Wait 2s, show last 10 log lines
npm run dev:curlverify      # Check if server responds
npm run dev:logs            # Real-time output for debugging
```

Always use port 3000 (auth callbacks require it).

## Common Patterns

Page component:
```typescript
'use client';
import { useQuery } from 'convex/react';
import { api } from '@db/api';

export default function MyPage() {
  const data = useQuery(api.db.conversations.list, {});
  // ...
}
```

Server component:
```typescript
// No 'use client' - runs on server
export default function ServerPage() {
  // Server-side logic
}
```

