# Authentication Design

## Provider Selection

### User Authentication: WorkOS
- **Why**: Superior developer experience, free up to 1M MAUs
- **Implementation**: ACF with PKCE for secure browser flows
- **Features**: Social login, enterprise SSO auto-detection

### Service Authentication: Okta  
- **Why**: Industry standard CCF implementation
- **Implementation**: Client Credentials Flow for Edge→Domain
- **Features**: Token introspection, audit logging, proven security

### Mixed Vendor Benefits
- Avoid single-vendor attack vectors
- Best tool for each job
- WorkOS excels at user auth
- Okta excels at service auth

## Token Caching Strategy

### Cloudflare Cache API
- **Speed**: 2-5ms reads (vs 10-50ms for KV)
- **Cost**: Free (vs KV usage charges)
- **Risk**: Possible eviction under memory pressure

### Monitoring Approach
- Log all cache hits/misses
- Track eviction patterns
- Monitor Okta costs from misses
- Switch to KV if hit rate <95%

### Token Lifetime
- 15-minute tokens (Okta default)
- Refresh at 80% lifetime (12 minutes)
- Cache for full duration

## Local Development Modes

### Three-Mode System
1. **Bypass Mode** (`AUTH_MODE=bypass`)
   - No auth checks
   - Fastest development
   - Default for `npm run dev`

2. **Local Mode** (`AUTH_MODE=local`)
   - Local auth simulator
   - Tests full auth flow
   - Works offline

3. **Real Mode** (`AUTH_MODE=real`)
   - Actual Okta/WorkOS
   - Production fidelity
   - Pre-release validation

## Security Boundaries

### Production Protection
- Bypass code removed at build time
- Production only trusts production issuers
- Environment detection prevents mode confusion

### Issuer Trust
```
Production Domain:
- Trusts: okta.company.com
- Rejects: localhost, *.dev.okta.com

Development Domain:
- Trusts: localhost:8888 OR okta.company.com
- Configurable per environment
```

### Network Isolation
- Auth simulator binds to 127.0.0.1 only
- Different ports than production
- Self-signed certificates

## Implementation Strategy

### Pass 1: Foundation
- Hard-coded service tokens
- Focus on Edge↔Domain communication
- Prove architecture without auth complexity

### Pass 2: Real Authentication
- Okta CCF setup and configuration
- WorkOS user authentication
- Cache API implementation
- Monitoring and metrics

### Pass 3: Developer Experience
- Local auth simulator service
- Environment-based configuration
- Test fixtures and utilities
- Comprehensive documentation

## Error Handling

### User Auth Failures
- Clear error messages
- Redirect to login
- Preserve intended destination

### Service Auth Failures  
- Automatic retry with backoff
- Circuit breaker for Okta outages
- Fallback to cached tokens if valid

### Cache Misses
- Log for analysis
- Fetch fresh token
- Continue request flow

## Monitoring & Observability

### Key Metrics
- Cache hit rate
- Token fetch latency
- Auth failure reasons
- Okta API usage

### Alerts
- Cache hit rate <90%
- Okta errors >1%
- Token refresh failures
- Unusual auth patterns