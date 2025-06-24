# Feature 001: Authentication Foundation

## Overview
Implement complete authentication system for Liminal Type Chat with user authentication (ACFw/PKCE) and service-to-service authentication (CCF) between Edge and Domain tiers.

## Goals
- Secure user authentication via WorkOS
- Secure service-to-service auth via Okta CCF
- Developer-friendly local development
- "Build once, never touch again" implementation

## Architecture

### Components
- **User Auth**: WorkOS (ACFw/PKCE)
- **Service Auth**: Okta (Client Credentials Flow)
- **Edge Token Caching**: Cloudflare Cache API with monitoring
- **Local Development**: Three-mode system (bypass/local/real)

### Security Architecture
- Production accepts only legitimate auth providers
- Development modes physically isolated from production
- Build-time removal of bypass code paths
- Environment-based trust boundaries

## Acceptance Criteria

### User Authentication
- [ ] Users can login via WorkOS
- [ ] Sessions persist appropriately  
- [ ] Logout works correctly
- [ ] API endpoints reject unauthorized requests

### Service Authentication
- [ ] Edge obtains CCF tokens from Okta
- [ ] Domain validates Edge tokens
- [ ] Token caching reduces Okta calls
- [ ] Cache metrics are logged

### Developer Experience
- [ ] Bypass mode for rapid development
- [ ] Local auth simulator for offline testing
- [ ] Real mode for production validation
- [ ] Mode switching via environment variable
- [ ] No auth code needed for feature development

### Security
- [ ] Bypass mode impossible in production
- [ ] Local simulator can't be accessed remotely
- [ ] Production only trusts production issuers
- [ ] All auth decisions are logged

## Implementation Phases

### Pass 1: Bypass Mode
Get Edge→Domain communication working without real auth

### Pass 2: Production Auth
Implement real WorkOS and Okta integration

### Pass 3: Developer Experience  
Add local simulator and environment switching

## Success Metrics
- Zero auth-related bugs after implementation
- Sub-50ms auth overhead on requests
- 95%+ cache hit rate for service tokens
- Developers can work offline