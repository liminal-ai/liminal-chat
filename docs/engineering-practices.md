# Engineering Practices

This document defines engineering standards for the Liminal Chat project using Convex + Vercel AI SDK.

## Code Style & Formatting

### Formatting Rules
- **Indentation**: 2 spaces (not tabs)
- **Quotes**: Single quotes for strings, backticks for template literals
- **Semicolons**: Required at end of statements
- **Trailing Commas**: Required for multi-line arrays and objects
- **Line Length**: 100 characters (120 for test files)

### Naming Conventions
- **Files**: `kebab-case.ts` (e.g., `context-thread.ts`, `user-repository.ts`)
- **Variables/Functions**: `camelCase` (e.g., `userId`, `getCurrentUser`)
- **Classes/Types/Interfaces**: `PascalCase` (e.g., `ContextThread`, `UserResponse`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_TOKENS`, `DEFAULT_MODEL`)
- **Convex Functions**: Descriptive action words (`create`, `update`, `list`, `get`)

### Import Order
```typescript
// 1. External libraries
import { streamText } from 'ai';
import { v } from 'convex/values';

// 2. Internal modules (absolute paths)
import { aiService } from '@/convex/ai/service';

// 3. Local files (relative paths)
import { requireAuth } from './lib/auth';

// 4. Type imports
import type { Doc } from './_generated/dataModel';
```

## TypeScript Standards

### Balanced Type Safety Approach
We use a pragmatic approach to TypeScript that prioritizes development velocity while maintaining type safety at critical boundaries.

```typescript
// ✅ GOOD: Allow `any` for rapid prototyping and external data
const webhookPayload: any = await request.json(); // External untyped data
const experimentalFeature: any = complexCalculation(); // Prototyping

// ✅ GOOD: Strict types for public APIs and core business logic
export async function createUser(data: CreateUserInput): Promise<User> {
  // Implementation
}

// ✅ GOOD: Use unknown for safer gradual typing
const response: unknown = await fetch('/api/data');
const data = response as ApiResponse; // Explicit cast when confident

// ❌ BAD: Using any for core business logic
function calculatePrice(items: any): any { // Should be fully typed
  return items.reduce((sum: any, item: any) => sum + item.price, 0);
}
```

### Type Guidelines
- **Public Functions**: Always include explicit return types
- **Convex Validators**: Use `v.string()`, `v.optional()` for runtime validation
- **Interfaces vs Types**: Interfaces for objects, types for unions/intersections
- **Underscore Convention**: `const _unused = value;` to show intentional non-use

### Progressive Type Enhancement
```typescript
// Phase 1: Get it working
type MessageContent = any; // TODO: Define structure

// Phase 2: Basic structure
type MessageContent = {
  text: string;
  metadata?: any;
};

// Phase 3: Full types
type MessageContent = {
  text: string;
  metadata?: {
    model: string;
    tokens: number;
    provider: string;
  };
};
```

## Convex Development Standards

### Function Organization
```typescript
// convex/users.ts - Group related functions
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await getAuth(ctx);
    if (!identity) return null;
    // Implementation
  },
});

export const updateUser = mutation({
  args: { 
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);
    // Implementation
  },
});
```

### Authentication Patterns
```typescript
// Always check auth for user-specific operations
import { requireAuth, getAuth } from './lib/auth';

// For queries that should work without auth
const identity = await getAuth(ctx);
if (!identity) return null;

// For mutations that require auth
const identity = await requireAuth(ctx); // Throws if not authenticated
```

### Schema Design
```typescript
// convex/schema.ts
export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),
    
  conversations: defineTable({
    userId: v.string(),
    title: v.string(),
    createdAt: v.number(),
    lastMessageAt: v.optional(v.number()),
    metadata: v.optional(v.any()), // Flexible for provider-specific data
  })
    .index("by_user", ["userId"])
    .index("by_user_updated", ["userId", "lastMessageAt"]),
});
```

### Environment Configuration
```typescript
// Use the env() helper, never process.env directly
import { env } from './lib/env';

const apiKey = env('OPENAI_API_KEY');
const isDev = env('DEV_AUTH_DEFAULT') === 'true';

// Set environment variables
// npx convex env set OPENAI_API_KEY "sk-..."
```

## Vercel AI SDK Integration

### Provider Pattern
```typescript
// Use centralized AI service
import { aiService } from './ai/service';

// Simple text generation
const response = await aiService.generateText({
  provider: 'openai',
  model: 'gpt-4o',
  messages: [{ role: 'user', content: prompt }],
});

// Streaming responses
const stream = await aiService.streamText({
  provider: 'anthropic',
  model: 'claude-3.5-sonnet',
  messages,
});
```

### Model Configuration
```typescript
// Use ModelBuilder for consistent setup
import { model } from './ai/modelBuilder';

const modelInstance = model(provider)
  .apiKey(apiKey)
  .headers({ 'X-Custom': 'value' })
  .config({ temperature: 0.7 })
  .build();
```

### Error Handling
```typescript
// Use our error utilities
import { createApiKeyError, createModelError } from './lib/errors';

if (!apiKey) {
  throw createApiKeyError('openai', 'OPENAI_API_KEY');
}

if (!availableModels.includes(requestedModel)) {
  throw createModelError('openai', requestedModel, availableModels);
}
```

## Next.js App Router Standards

### Component Structure
```typescript
// app/chat/page.tsx - Server Component by default
export default async function ChatPage() {
  const conversations = await getConversations();
  return <ConversationList conversations={conversations} />;
}

// app/chat/components/chat-input.tsx - Client Component
'use client';
import { useState } from 'react';

export function ChatInput() {
  const [input, setInput] = useState('');
  // Interactive component
}
```

### Data Fetching
```typescript
// Use server components for initial data
async function ConversationPage({ params }: { params: { id: string } }) {
  const conversation = await convexQuery(api.conversations.get, { 
    id: params.id 
  });
  return <Conversation data={conversation} />;
}

// Use hooks for client-side updates
'use client';
import { useQuery } from 'convex/react';

function LiveMessages({ conversationId }: { conversationId: string }) {
  const messages = useQuery(api.messages.list, { conversationId });
  // Real-time updates
}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE"
  }
}
```

### Convex Error Patterns
```typescript
import { ConvexError } from 'convex/values';

// Throw user-facing errors
throw new ConvexError('Conversation not found');

// Internal errors get logged but return generic message
try {
  // operation
} catch (error) {
  console.error('Internal error:', error);
  throw new ConvexError('An error occurred');
}
```

### Client Error Handling
```typescript
// Handle Convex errors gracefully
try {
  await convexMutation(api.messages.create, { content });
} catch (error) {
  if (error instanceof ConvexError) {
    toast.error(error.message);
  } else {
    toast.error('Failed to send message');
  }
}
```

## Testing Standards

### Test Organization
```
apps/liminal-api/
├── tests/
│   ├── integration.spec.ts    # API integration tests
│   ├── auth.spec.ts           # Authentication tests
│   └── fixtures/              # Test data
```

### Coverage Requirements
- **Convex Functions**: 75% minimum
- **Next.js Components**: 70% minimum
- **Utilities**: 90% minimum

### Test Patterns
```typescript
// Integration test example
test('should create conversation with auth', async ({ page }) => {
  // Arrange
  await authenticateUser(page);
  
  // Act
  const response = await page.request.post('/api/conversations', {
    data: { title: 'Test Conversation' }
  });
  
  // Assert
  expect(response.status()).toBe(201);
  const conversation = await response.json();
  expect(conversation).toHaveProperty('id');
});
```

### Test Data
```typescript
// Use consistent test data
export const TEST_USER = {
  tokenIdentifier: 'test_user_123',
  email: 'test@liminal.chat',
  name: 'Test User',
};

export function createTestMessage(overrides = {}) {
  return {
    content: 'Test message',
    authorType: 'user',
    authorId: TEST_USER.tokenIdentifier,
    ...overrides,
  };
}
```

## Security Best Practices

### Authentication
- Always validate auth state in Convex functions
- Use Clerk for production authentication
- Development auth only in non-production environments
- Validate webhook signatures

### Environment Variables
```typescript
// Never commit secrets
// ❌ BAD
const API_KEY = 'sk-1234567890';

// ✅ GOOD
const apiKey = env('OPENAI_API_KEY');
if (!apiKey) {
  throw createApiKeyError('openai', 'OPENAI_API_KEY');
}
```

### Input Validation
```typescript
// Use Convex validators
export const createMessage = mutation({
  args: {
    conversationId: v.id('conversations'),
    content: v.string(),
    authorType: v.union(v.literal('user'), v.literal('agent')),
  },
  handler: async (ctx, args) => {
    // Args are automatically validated
  },
});
```

## Documentation Standards

### TSDoc Comments
```typescript
/**
 * Creates a new conversation for the authenticated user.
 * 
 * @param args - The conversation creation arguments
 * @param args.title - The title of the conversation
 * @param args.type - Type of conversation: "standard", "roundtable", or "pipeline"
 * @returns The ID of the created conversation
 * @throws {ConvexError} If user is not authenticated
 * 
 * @example
 * ```typescript
 * const id = await ctx.runMutation(api.conversations.create, {
 *   title: "My Conversation",
 *   type: "standard"
 * });
 * ```
 */
export const create = mutation({
  // Implementation
});
```

### Documentation Maintenance
- Update `api-for-claude.md` when adding functions
- Keep examples current and working
- Document environment requirements
- Include common error scenarios

## Development Workflow

### Commands (from project root)
```bash
# Development
pnpm --filter liminal-api dev              # Start Convex backend
pnpm --filter web dev                      # Start Next.js frontend
pnpm --filter @liminal/cli dev             # Run CLI

# Quality checks
pnpm lint                                  # Lint all packages
pnpm typecheck                             # TypeScript validation
pnpm test                                  # Run tests

# Documentation
pnpm --filter liminal-api docs             # Generate HTML docs
pnpm --filter liminal-api docs:llm         # Generate AI-friendly docs
```

### Git Workflow
```bash
# Feature branches
git checkout -b feature/your-feature

# Before committing
pnpm lint
pnpm typecheck
pnpm test

# Commit with conventional commits
git commit -m "feat: add conversation archiving"
git commit -m "fix: handle missing user in auth"
git commit -m "docs: update API documentation"
```

### Deployment
```bash
# Deploy Convex backend
pnpm --filter liminal-api deploy

# Deploy Next.js to Vercel
vercel --prod
```

## Performance Guidelines

### Convex Optimization
- Use indexes for common query patterns
- Paginate large result sets
- Avoid large documents (split into relations)
- Use `ctx.runQuery` for read operations in actions

### Next.js Optimization
- Use Server Components by default
- Implement proper loading states
- Optimize images with next/image
- Use dynamic imports for large components

### AI/LLM Optimization
- Implement streaming for long responses
- Cache model instances in AI service
- Use appropriate models for tasks (fast vs quality)
- Handle rate limits gracefully

## Monitoring & Debugging

### Logging
```typescript
// Development logging
console.log('[ConversationCreate]', { userId, title });

// Error logging with context
console.error('[MessageCreate] Failed:', {
  error: error.message,
  conversationId,
  userId,
});
```

### Convex Dashboard
- Monitor function execution times
- Check error rates
- Review log output
- Validate environment configuration

### Health Checks
```typescript
// Implement health endpoints
export const health = query({
  handler: async (ctx) => {
    return {
      status: 'healthy',
      timestamp: Date.now(),
      services: {
        database: await checkDatabase(ctx),
        auth: await checkAuth(ctx),
      },
    };
  },
});
```