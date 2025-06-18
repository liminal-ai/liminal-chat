# Authentication Implementation Plan

## Story Breakdown

### Story 1: Bypass Mode Foundation
Set up basic auth structure with bypass mode for development.

**Tasks:**
- Create auth middleware interfaces for both tiers
- Implement bypass mode in Domain
- Add AUTH_MODE environment variable
- Verify Edge can call Domain with mock tokens

**Acceptance:**
- Edge calls Domain successfully
- Domain accepts any token when AUTH_MODE=bypass
- Production builds exclude bypass code

### Story 2: Okta CCF Integration
Implement real service-to-service authentication.

**Tasks:**
- Set up Okta dev tenant
- Configure client credentials app
- Implement token fetching in Edge
- Implement token validation in Domain
- Add proper error handling

**Acceptance:**
- Edge obtains valid tokens from Okta
- Domain validates tokens correctly
- Invalid tokens are rejected
- Token expiry is handled

### Story 3: Cache API Implementation
Add token caching to reduce Okta calls.

**Tasks:**
- Implement Cache API storage
- Add cache hit/miss logging
- Handle cache eviction gracefully
- Monitor cache performance

**Acceptance:**
- Tokens are cached for 15 minutes
- Cache hits avoid Okta calls
- Metrics show hit rate
- Misses are handled correctly

### Story 4: WorkOS User Authentication
Implement user login flow.

**Tasks:**
- Set up WorkOS account
- Implement login redirect flow
- Handle callback and token exchange
- Create user session management
- Add logout functionality

**Acceptance:**
- Users can login via WorkOS
- Sessions persist correctly
- Protected routes require auth
- Logout clears session

### Story 5: Local Auth Simulator
Create local development auth service.

**Tasks:**
- Build minimal OAuth/OIDC simulator
- Support token endpoint
- Generate properly formatted tokens
- Configure Domain to trust local issuer in dev

**Acceptance:**
- Simulator runs on localhost only
- Returns valid token format
- Domain accepts simulator tokens in dev
- Cannot be accessed remotely

### Story 6: Developer Experience Polish
Complete the three-mode system and documentation.

**Tasks:**
- Create mode-switching logic
- Add npm scripts for each mode
- Write setup documentation
- Create troubleshooting guide
- Add auth testing utilities

**Acceptance:**
- `npm run dev` uses bypass mode
- `npm run dev:auth` uses simulator
- `npm run dev:prod` uses real auth
- Clear documentation exists
- Common errors have helpful messages

## Timeline Estimate

- Story 1: 4 hours (foundation)
- Story 2: 8 hours (Okta learning curve)
- Story 3: 4 hours (caching)
- Story 4: 6 hours (WorkOS integration)
- Story 5: 6 hours (simulator)
- Story 6: 4 hours (polish)

**Total: ~32 hours (4 days)**

## Risk Mitigation

### Risks
1. Okta configuration complexity
2. Cache API eviction behavior unknown
3. Local simulator security holes
4. WorkOS integration surprises

### Mitigations
1. Start with Okta early, use their support
2. Monitor cache carefully, have KV fallback ready
3. Bind to localhost only, use different ports
4. Prototype WorkOS flow in isolation first

## Definition of Done

- All tests pass
- No auth code in feature development
- Production cannot use bypass/simulator
- Documentation complete
- Metrics dashboard showing auth health
- Zero auth todos in codebase