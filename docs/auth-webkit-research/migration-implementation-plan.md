# AuthKit Migration Implementation Plan

## Pre-Migration Assessment

### Current Backend Assets (PROVEN & PRODUCTION-READY)
- **Convex Backend**: 9.5/10 quality score from external reviews
- **AI Providers**: 6 providers (OpenAI, Anthropic, Google, Perplexity, Vercel, OpenRouter)
- **API Endpoints**: Streaming & non-streaming chat, conversation CRUD
- **Database Schema**: Conversations + messages with metadata
- **Testing**: 11/11 integration tests passing
- **CI/CD**: GitHub Actions with 6 quality gates
- **Documentation**: Comprehensive JSDoc + TypeDoc

### Current Limitations
- **No authentication** - anonymous user model
- **No user interface** - backend only
- **No team features** - single-user focused
- **No billing** - no revenue model

## Migration Strategy: Detailed Implementation

### Phase 1: Template Setup & Analysis (30 minutes)

#### Step 1.1: Clone and Setup
```bash
# From project root
cd /Users/leemoore/code/liminal-chat
git clone https://github.com/workos/next-b2b-starter-kit.git temp-authkit-analysis
cd temp-authkit-analysis

# Analyze structure
find . -name "*.ts" -o -name "*.tsx" | head -20
cat package.json | jq '.dependencies'
```

#### Step 1.2: Environment Requirements Analysis
- Document required API keys and setup steps
- Understand WorkOS account requirements
- Map their environment variables to our needs

#### Step 1.3: Schema Analysis
```bash
# Examine their Convex schema
cat convex/schema.ts
# Document their auth patterns
grep -r "auth" convex/ --include="*.ts"
```

### Phase 2: Schema Design & Merge Strategy (1 hour)

#### Step 2.1: Schema Mapping Design
Create merged schema that combines:

**Their B2B Foundation**:
```typescript
users: defineTable({
  workosId: v.string(),  // WorkOS user identifier
  email: v.string(),
  name: v.optional(v.string()),
  // ... their user fields
})

organizations: defineTable({
  workosId: v.string(),  // WorkOS org identifier  
  name: v.string(),
  slug: v.string(),
  // ... their org fields
})

memberships: defineTable({
  userId: v.id("users"),
  organizationId: v.id("organizations"), 
  role: v.string(),
  // ... their membership fields
})
```

**Our AI Features (Enhanced)**:
```typescript
conversations: defineTable({
  userId: v.id("users"),  // Link to WorkOS user
  organizationId: v.optional(v.id("organizations")), // Team context
  title: v.string(),
  type: v.union(v.literal('standard'), v.literal('roundtable'), v.literal('pipeline')),
  metadata: v.optional(v.object({
    provider: v.optional(v.string()),
    model: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    archived: v.optional(v.boolean()),
    teamShared: v.optional(v.boolean()), // NEW: Team sharing
  })),
  lastMessageAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})

messages: defineTable({
  conversationId: v.id("conversations"),
  authorType: v.union(v.literal('user'), v.literal('agent'), v.literal('system')),
  authorId: v.string(),
  type: v.union(
    v.literal('text'),
    v.literal('tool_call'), 
    v.literal('tool_output'),
    v.literal('chain_of_thought'),
    v.literal('error'),
  ),
  content: v.any(),
  createdAt: v.number(),
  updatedAt: v.number(),
  metadata: v.optional(v.object({
    model: v.optional(v.string()),
    provider: v.optional(v.string()),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
    totalTokens: v.optional(v.number()),
    finishReason: v.optional(v.string()),
    visibility: v.optional(v.array(v.string())),
  })),
})
```

#### Step 2.2: Migration Script Design
Plan data migration from current anonymous model:
```typescript
// Migration function to move anonymous data to user accounts
export const migrateAnonymousData = internalMutation({
  handler: async (ctx, { fromUserId, toUserId }: { fromUserId: string, toUserId: string }) => {
    // Move conversations from 'anonymous' to actual user
    // Update message ownership
    // Preserve conversation history
  }
})
```

### Phase 3: Frontend Integration (2 hours)

#### Step 3.1: Create Web App Structure
```bash
# Create new web app in our monorepo
mkdir -p /Users/leemoore/code/liminal-chat/apps/web
cd /Users/leemoore/code/liminal-chat

# Copy template structure
cp -r temp-authkit-analysis/app apps/web/
cp -r temp-authkit-analysis/components apps/web/
cp temp-authkit-analysis/package.json apps/web/
cp temp-authkit-analysis/next.config.js apps/web/
cp temp-authkit-analysis/tailwind.config.js apps/web/
```

#### Step 3.2: Update Package Configuration
```json
// apps/web/package.json
{
  "name": "@liminal/web",
  "dependencies": {
    // Keep their auth & UI dependencies
    "@workos-inc/authkit-nextjs": "latest",
    "@radix-ui/themes": "latest", 
    // Add our Convex integration
    "convex": "^1.25.2",
    // Add our AI SDK
    "@ai-sdk/react": "latest",
    "ai": "latest"
  }
}
```

#### Step 3.3: Environment Integration
```bash
# apps/web/.env.local
WORKOS_API_KEY=your_workos_api_key
WORKOS_CLIENT_ID=your_client_id
WORKOS_REDIRECT_URI=http://localhost:3000/callback
CONVEX_URL=https://modest-squirrel-498.convex.site
```

### Phase 4: Backend Auth Integration (2-3 hours)

#### Step 4.1: Copy Our Backend Infrastructure
```bash
# Copy our proven backend code
cp -r apps/liminal-api/convex/ai apps/web/convex/
cp -r apps/liminal-api/convex/lib apps/web/convex/
cp apps/liminal-api/convex/{chat,conversations,messages}.ts apps/web/convex/
```

#### Step 4.2: Update Auth Helpers
```typescript
// apps/web/convex/lib/auth.ts
import { AuthJWT } from '@workos-inc/authkit-nextjs';

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  
  // WorkOS provides subject as user ID
  return {
    userId: identity.subject,
    email: identity.email,
    // ... other WorkOS claims
  };
}

export async function getAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  
  return {
    userId: identity.subject,
    email: identity.email,
  };
}
```

#### Step 4.3: Update Function Signatures
```typescript
// Update conversations.ts
export const create = mutation({
  args: { /* same args */ },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    
    const now = Date.now();
    return await ctx.db.insert('conversations', {
      userId: auth.userId,  // Real user ID instead of 'anonymous'
      title: args.title,
      type: args.type || 'standard',
      // ... rest unchanged
    });
  },
});
```

### Phase 5: CLI Integration (1 hour)

#### Step 5.1: CLI Auth Setup
```bash
mkdir -p apps/cli
cd apps/cli
npm init -y
npm install commander @workos-inc/node axios
```

#### Step 5.2: CLI Auth Flow
```typescript
// apps/cli/src/auth.ts
import { WorkOS } from '@workos-inc/node';

export class CLIAuth {
  private workos: WorkOS;
  
  constructor() {
    this.workos = new WorkOS(process.env.WORKOS_API_KEY);
  }
  
  async deviceFlow(): Promise<string> {
    // Implement WorkOS device authorization flow
    // Return JWT for CLI usage
  }
  
  async getStoredToken(): Promise<string | null> {
    // Check for stored auth token
  }
}
```

### Phase 6: Testing Integration (1 hour)

#### Step 6.1: System User Setup
```typescript
// Create system user for testing
export const createSystemUser = internalMutation({
  handler: async (ctx) => {
    const systemUser = await ctx.db.insert('users', {
      workosId: 'system_user_for_testing',
      email: 'system@liminal.chat',
      name: 'System User',
    });
    return systemUser;
  }
});
```

#### Step 6.2: Update Integration Tests
```typescript
// tests/integration.spec.ts
import { AuthJWT } from '@workos-inc/authkit-nextjs';

describe('Authenticated API', () => {
  let authToken: string;
  
  beforeAll(async () => {
    // Generate system user JWT for testing
    authToken = await generateSystemUserJWT();
  });
  
  test('creates conversation with auth', async () => {
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'Test Chat' }),
    });
    
    expect(response.status).toBe(200);
  });
});
```

## Timeline & Milestones

### Day 1 (4-6 hours)
- [ ] Complete template analysis and setup
- [ ] Design merged schema 
- [ ] Create web app structure
- [ ] Basic auth integration working

### Day 2 (2-3 hours) 
- [ ] Backend auth middleware complete
- [ ] Frontend auth flow working
- [ ] Basic conversation creation with auth

### Day 3 (2-3 hours)
- [ ] CLI auth implementation
- [ ] Updated integration tests
- [ ] System user setup for M2M

## Success Criteria

### Technical Milestones
- [ ] Web app login/logout works with WorkOS
- [ ] Backend enforces authentication on protected endpoints
- [ ] CLI can authenticate and make API calls
- [ ] Integration tests pass with authenticated endpoints
- [ ] System user can be used for M2M calls

### Feature Validation
- [ ] Create conversation through web UI
- [ ] Send messages through authenticated API
- [ ] CLI can list and create conversations
- [ ] Team/organization context works

## Risk Mitigation

### Backup Plan
- Keep current public API backend running
- New auth system runs in parallel initially
- Can rollback to anonymous model if needed

### Testing Strategy
- All auth integration tested before removing public API
- System user provides reliable M2M auth
- CLI auth flow validated before CLI features built

## Next Phase: Revolutionary UI Development

Once auth is solid, we can build:
1. **AI Roundtable** - Multi-agent discussions
2. **Parallel Generation** - Simultaneous drafting  
3. **Pipeline Processing** - Multi-stage workflows
4. **Team Features** - Organization-level AI collaboration