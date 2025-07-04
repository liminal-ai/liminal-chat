# WorkOS Template Integration Plan

## Sequence Overview

1. **Template Setup** - Get vanilla template working
2. **Baseline Testing** - Create regression test suite
3. **Version Upgrades** - Update to target versions
4. **AI Integration** - Connect to existing backend
5. **Feature Migration** - Port remaining capabilities

## Phase 1: Template Setup

### 1.1 Environment Setup
```bash
cd workos-pivot-poc
cp -r template-original poc-1
cd poc-1
rm -rf .git
git init
git add .
git commit -m "Initial commit: WorkOS B2B template foundation"
```

### 1.2 Service Configuration
- Create WorkOS account and get API keys
- Create Stripe account and get test keys
- Run `pnpm run setup` and complete all prompts
- Configure webhooks for WorkOS and Stripe
- Test OAuth flow (Google, Microsoft)
- Test billing flow with test cards
- Verify admin/user role assignment

### 1.3 Functionality Validation
**Auth Flow**:
- User registration via OAuth
- Organization creation
- Admin vs user redirects
- Session persistence

**Team Management**:
- Organization settings
- Member invitation
- Role assignment

**Billing**:
- Plan selection and purchase
- Feature gates (audit logs on Enterprise)
- Billing portal access

**Webhooks**:
- User creation/update/deletion
- Organization events
- Stripe payment events

## Phase 2: Baseline Testing

### 2.1 Test Infrastructure
```bash
pnpm add -D @playwright/test vitest jsdom
mkdir -p tests/{e2e,integration}
```

### 2.2 Core Test Coverage
**Authentication Tests**:
- OAuth registration flow
- Role-based access control
- Session management

**Team Tests**:
- Organization CRUD
- Member management
- Role enforcement

**Billing Tests**:
- Checkout flow
- Subscription activation
- Feature gate enforcement

**Webhook Tests**:
- Event processing
- Data synchronization
- Error handling

### 2.3 Regression Suite
- Automated test run on every change
- Performance baseline measurement
- Visual regression for UI changes

## Phase 3: Version Upgrades

### 3.1 Convex Upgrade
```bash
# Update package.json
"convex": "^1.25.2"
"convex-helpers": "^0.1.95"

pnpm install
pnpm run dev
```
- Run regression tests
- Verify all webhooks work
- Check auth flows
- Test billing integration

### 3.2 React 19 Upgrade
```bash
pnpm add react@19 react-dom@19
pnpm add -D @types/react@19 @types/react-dom@19
```
- Update components to remove forwardRef
- Test auth components
- Run full regression suite
- Fix any compatibility issues

### 3.3 Tailwind v4 Upgrade
```bash
pnpm add tailwindcss@4.0
```
- Update configuration
- Test component styling
- Verify responsive design
- Check admin dashboard layout

### 3.4 Add AI SDK Frontend
```bash
pnpm add @ai-sdk/react @ai-sdk/ui
```
- Add React hooks for AI features
- No backend changes needed

## Phase 4: AI Integration

### 4.1 API Proxy Setup
Create Next.js API routes that forward to Convex:

```typescript
// app/api/chat/route.ts
export async function POST(request: Request) {
  const { user } = await auth();
  const { messages } = await request.json();
  
  const response = await fetch(`${CONVEX_URL}/api/chat`, {
    method: 'POST',
    headers: { 'X-User-ID': user.id },
    body: JSON.stringify({ messages })
  });
  
  return response;
}
```

### 4.2 Chat Components
```typescript
// components/ChatInterface.tsx
import { useChat } from '@ai-sdk/react';

export function ChatInterface() {
  const { messages, input, handleSubmit } = useChat({
    api: '/api/chat'
  });
  // Component implementation
}
```

### 4.3 Auth Context Bridge
- Map WorkOS user IDs to Convex operations
- Handle organization context
- Implement user scoping for conversations

## Phase 5: Feature Migration

### 5.1 Schema Extension
Add to Convex schema:
```typescript
conversations: defineTable({
  userId: v.string(),           // WorkOS user ID
  organizationId: v.string(),   // Team context
  title: v.string(),
  // ... existing fields
})
```

### 5.2 Team Features
- Organization-scoped conversations
- Shared team libraries
- Usage tracking per organization
- Admin controls for AI access

### 5.3 Provider Selection
- UI for choosing AI providers
- User preferences storage
- Organization-level provider policies

### 5.4 Conversation Management
- List/create/delete conversations
- Search and filtering
- Export capabilities

## Testing Gates

### After Each Phase
1. Run full regression test suite
2. Manual verification of core flows
3. Performance check (response times)
4. Error monitoring review

### Integration Validation
1. Auth flow works end-to-end
2. AI chat creates persistent conversations
3. Team features respect organization boundaries
4. Billing integration tracks AI usage

## Success Criteria

### Template Foundation
- All template features functional
- Webhooks processing correctly
- Auth flows working
- Billing integration complete

### Version Compatibility
- No regressions after upgrades
- All tests passing
- Performance maintained
- New features accessible

### AI Integration
- Chat interface working
- Conversations persisting
- Team context enforced
- Provider selection functional

## Risk Mitigation

### Backup Strategy
- Git branch before each major change
- Database backups before schema changes
- Environment variable documentation
- Rollback procedures documented

### Issue Tracking
- Document all encountered problems
- Solutions for common development issues
- Performance baseline maintenance
- Monitoring alert thresholds