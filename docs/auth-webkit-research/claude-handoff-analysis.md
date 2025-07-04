# Claude Desktop Session Handoff - AuthKit Strategy Analysis

## Auth Problem Summary

### Original Requirements
- **Multi-modal auth patterns**: Web (OAuth), CLI (device flow), M2M (client credentials)
- **Enterprise features**: SSO, team management, audit logs
- **Production readiness**: Not beta/alpha features

### Clerk Failures
- **M2M features in alpha/beta** - not production ready
- **Limited CLI support** - device flow needs custom implementation  
- **Multi-modal complexity** - not designed for diverse access patterns
- **Coding agent hallucinations** - presented beta as production features

### Current State
- **Auth stripped from backend** - anonymous user model
- **Backend working perfectly** - 11/11 integration tests passing
- **Clean foundation** - ready for proper auth integration

## AuthKit + Convex Solution

### Why AuthKit is Perfect Match

1. **Official WorkOS B2B Starter Kit** - production patterns
2. **Multi-modal support built-in**:
   - Web: Authorization Code + PKCE
   - CLI: Device authorization flow (production-ready)
   - M2M: Client credentials flow
3. **Enterprise features native**:
   - SSO/SAML
   - SCIM provisioning
   - RBAC
   - Audit logging
   - Admin portal
4. **Seamless Convex integration** - official documentation

### Template Details
- **Repository**: https://github.com/workos/next-b2b-starter-kit
- **Stack**: Next.js + AuthKit + Convex + Stripe + Radix UI
- **Owner**: WorkOS (official template)

## Migration Strategy Overview

### Phase 1: Template Setup (30 minutes)
```bash
git clone https://github.com/workos/next-b2b-starter-kit.git liminal-frontend
cd liminal-frontend
rm -rf .git
pnpm install
pnpm run setup  # Prompts for API keys
```

### Phase 2: Schema Merge (1 hour)
**Additive approach** - keep their B2B structure, add our AI features

**Their Schema (keep)**:
- `users`: clerkId, email, name
- `organizations`: name, slug
- `memberships`: userId, orgId, role

**Our Schema (add)**:
- `conversations`: userId, title, type, metadata
- `messages`: conversationId, authorType, content

**User ID Mapping**:
- Current: `userId: 'anonymous'` or `tokenIdentifier`
- Template: `clerkId` from WorkOS
- Migration: Map conversations to WorkOS user IDs

### Phase 3: Backend Migration (2-3 hours)
```bash
# Copy our AI infrastructure
cp -r ../liminal-chat/apps/liminal-api/convex/ai ./convex/
cp -r ../liminal-chat/apps/liminal-api/convex/lib ./convex/
cp ../liminal-chat/apps/liminal-api/convex/{chat,conversations,messages}.ts ./convex/
```

**Auth Integration**:
```typescript
// Update auth helpers for WorkOS
export function getUserId(identity: any): string {
  return identity.subject; // WorkOS user ID instead of tokenIdentifier
}
```

### Phase 4: Environment Setup (1 hour)
```bash
# Copy our 6 AI provider keys
npx convex env set OPENAI_API_KEY "your-key"
npx convex env set ANTHROPIC_API_KEY "your-key"
# ... all 6 providers
```

## What We Keep vs Replace

### ✅ Keep (Our Production-Ready Backend)
- **AI provider integrations** - 6 providers working
- **Conversation persistence** - battle-tested
- **Message handling** - comprehensive
- **HTTP endpoints** - streaming + non-streaming
- **Testing infrastructure** - 11/11 tests passing

### 🔄 Replace (Their Basic Setup)
- Simple Convex functions → Our mature AI backend
- Basic user management → Enhanced with conversation features
- Minimal HTTP endpoints → Our comprehensive AI API

### ➕ Add (Their Enterprise Features)
- **WorkOS authentication** - SSO, SAML, enterprise auth
- **Team/organization management** - B2B structure
- **Billing integration** - Stripe subscriptions
- **Admin portal** - user management UI

## Key Integration Points

### Team Features Extension
- Add `organizationId` field to conversations
- Team workspaces for AI collaboration
- Shared conversation libraries
- Organization-level billing for AI token usage

### Authentication Flow
- **Web**: WorkOS AuthKit handles OAuth flow
- **CLI**: WorkOS device authorization flow
- **API**: WorkOS Connect for M2M authentication

## Expected Timeline
- **Phase 1-2**: 1.5 hours (setup + schema planning)
- **Phase 3**: 2-3 hours (backend migration + auth integration)
- **Phase 4**: 1 hour (environment setup + testing)
- **Total**: 4.5-6.5 hours for complete migration

## End Result Vision
- **Our mature AI backend** - conversation persistence, 6 providers, streaming
- **Enterprise-ready auth** - SSO, teams, admin portal
- **Production UI patterns** - proven Next.js + AuthKit integration
- **Scalable architecture** - ready for B2B customers ($200-500/month)
- **v0 integration** - rapid UI component development

## Strategic Advantages
1. **Keep technical advantages** - our proven backend
2. **Gain enterprise credibility** - WorkOS reputation
3. **Proven UI patterns** - battle-tested template
4. **B2B SaaS ready** - team billing, SSO, admin portals