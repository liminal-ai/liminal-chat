# CI/CD Research Findings

## Executive Summary

Based on comprehensive research into Convex, Vercel, Blacksmith GitHub Actions, and WorkOS, this document provides detailed findings and recommendations for implementing a robust CI/CD deployment pipeline for Liminal Chat.

## 1. Convex Environment Management

### Key Findings

**Multiple Deployment Support**:
- Convex supports unlimited deployments per project
- Each team member gets their own development deployment automatically
- Production deployment shared across team
- Staging environments created via separate Convex projects

**Environment Variable Management**:
- Per-deployment environment variables via CLI: `npx convex env set KEY value`
- Supports up to 100 environment variables per deployment
- Maximum 40 character names, 8KiB values
- System variables automatically provided (CONVEX_CLOUD_URL, CONVEX_SITE_URL)

**Deploy Key Types**:
- **Development Deploy Keys**: For dev deployments, scoped to single deployment
- **Project Deploy Keys**: For production, scoped to entire project  
- **Team Deploy Keys**: For organization-wide access

**Database Seeding Strategies**:
1. **Manual via Dashboard**: Simple JSON document creation
2. **CLI Import**: `npx convex import --table mytable data.csv` supports CSV, JSON, JSONL, ZIP
3. **Code-based Seeding**: Recommended approach using `internalMutation` functions
   ```typescript
   // convex/init.ts
   export default internalMutation({
     args: {},
     handler: async (ctx, args) => {
       // Idempotent seeding logic
     }
   });
   ```

### Staging Environment Setup

**Best Practice**: Use separate Convex project for staging
```bash
# Deploy to staging project
CONVEX_DEPLOY_KEY=your_staging_key npx convex deploy
```

## 2. Vercel Deployment Integration

### Key Features

**GitHub Integration**:
- Automatic deployments on push to configured branches
- Preview deployments for PRs  
- Branch-based URLs: `*-git-*.vercel.app`
- Repository dispatch events for CI/CD triggers

**Environment Management**:
- Production, Preview, Development environments
- Custom environments supported via `--target=staging`
- Environment-specific variable configuration
- Framework-specific prefixed variables (NEXT_PUBLIC_, VITE_, etc.)

**CLI Commands**:
```bash
# Deploy to production
vercel --prod

# Deploy to staging environment  
vercel deploy --target=staging

# Pull environment variables locally
vercel env pull --environment=production
```

**Environment Variables**:
- System variables automatically provided:
  - `VERCEL_ENV`: production|preview|development
  - `VERCEL_GIT_COMMIT_SHA`: Git commit hash
  - `VERCEL_GIT_COMMIT_REF`: Git branch name
  - `VERCEL_PROJECT_PRODUCTION_URL`: Production domain

### Integration with Convex

**Build Command Pattern**:
```bash
npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name VITE_CONVEX_URL
```

## 3. Blacksmith GitHub Actions

### Performance Benefits

**Speed Improvements**:
- 2x faster hardware (bare metal gaming CPUs)
- 4x faster cache downloads (co-located artifacts)
- 40x faster Docker builds (persistent layer caching)
- Instant provisioning (no queue times)

**Cost Savings**:
- 50% cheaper per-minute pricing vs GitHub
- Combined with 2x speed = 75% total cost reduction
- Example: 10min job @ $0.008/min = $0.08 → 5min @ $0.004/min = $0.02

**Pricing Structure**:
- **Free Tier**: 3,000 minutes/month on 2 vCPU runners
- **Pay-as-you-go**: $0.004/minute for 2 vCPU (vs GitHub's $0.008)
- **Enterprise**: SLAs, dedicated support, custom runners

### Migration Process

**Simple Drop-in Replacement**:
```yaml
# Before
runs-on: ubuntu-latest

# After  
runs-on: blacksmith-4vcpu
```

**Additional Features**:
- GitHub Actions observability dashboard
- Docker layer caching (+$0.50/GB)
- Priority Slack support (+$500/mo)

## 4. WorkOS Multi-Environment Setup

### Environment Strategy

**Recommended Approach**:
- **Development/Testing**: Current WorkOS app
- **Staging**: New dedicated WorkOS application  
- **Production**: Future separate WorkOS application

### Configuration Management

**Environment Variables**:
```bash
# Development
WORKOS_CLIENT_ID="client_01DEV..."
WORKOS_API_KEY="sk_test_..."

# Staging  
WORKOS_CLIENT_ID="client_01STAGING..."
WORKOS_API_KEY="sk_live_..."

# Production
WORKOS_CLIENT_ID="client_01PROD..."
WORKOS_API_KEY="sk_live_..."
```

**Redirect URLs**:
- Development: `http://localhost:3000/callback`
- Staging: `https://staging.liminal-chat.com/callback`
- Production: `https://liminal-chat.com/callback`

### Session Management

**Secure Session Handling**:
```javascript
// 32-character password for session encryption
WORKOS_COOKIE_PASSWORD=$(openssl rand -base64 32)

// Session configuration
const session = workos.userManagement.loadSealedSession({
  sessionData: req.cookies['wos-session'],
  cookiePassword: process.env.WORKOS_COOKIE_PASSWORD,
});
```

## 5. Integration Architecture

### End-to-End Workflow

**Development Flow**:
1. Local development with `npx convex dev`
2. Push to feature branch
3. Blacksmith runs tests (2x faster)
4. Vercel creates preview deployment
5. WorkOS handles auth with dev credentials

**Staging Flow**:
1. Merge to `main` branch
2. Blacksmith runs full test suite
3. Convex deploys to staging project
4. Vercel deploys to staging environment
5. WorkOS uses staging application settings

**Production Flow**:
1. Manual trigger or tag-based deployment
2. Blacksmith runs production tests
3. Convex deploys to production
4. Vercel deploys to production
5. WorkOS uses production application

### Monitoring & Observability

**GitHub Actions (Blacksmith)**:
- Built-in observability dashboard
- Global log search across CI runs
- Performance metrics and caching stats

**Vercel**:
- Real-time function logs
- Performance monitoring
- Error tracking and alerts

**Convex**:
- Function execution logs via `npx convex logs`
- Real-time dashboard monitoring
- Query performance metrics

## 6. Security Considerations

### Environment Isolation

**Secrets Management**:
- GitHub Secrets for deploy keys and API tokens
- Vercel environment variables for staging/production
- Never commit secrets to repository

**Access Control**:
- Convex deploy keys scoped to specific environments
- WorkOS applications isolated per environment
- Vercel team access controls

### Best Practices

1. **Principle of Least Privilege**: Deploy keys only have necessary permissions
2. **Environment Separation**: No shared credentials between dev/staging/prod
3. **Secret Rotation**: Regular rotation of API keys and deploy keys  
4. **Audit Logging**: Enable audit logs in WorkOS for production

## Recommendations

### Immediate Implementation Priority

1. **Phase 1**: Blacksmith integration (immediate 75% cost savings)
2. **Phase 2**: Staging Convex project setup
3. **Phase 3**: Staging WorkOS application  
4. **Phase 4**: Vercel staging environment configuration
5. **Phase 5**: End-to-end workflow automation

### Risk Mitigation

1. **Gradual Migration**: Start with Blacksmith, then add staging environments
2. **Parallel Testing**: Run old and new CI/CD in parallel initially
3. **Rollback Plan**: Keep existing workflows until new system proven
4. **Monitoring**: Implement comprehensive logging from day one

### Cost-Benefit Analysis

**Expected Savings**:
- GitHub Actions: 75% cost reduction with Blacksmith
- Development Time: 50% faster feedback loops
- Infrastructure: Simplified multi-environment management

**Investment Required**:
- Setup time: ~2-3 days engineering effort
- Ongoing maintenance: Minimal (mostly automated)
- Learning curve: Low (drop-in replacements)

## Next Steps

See companion documents:
- [Step-by-Step Setup Guides](./cicd-setup-guides.md)
- [Environment Variable Mapping](./cicd-environment-variables.md)  
- [Deployment Workflow Documentation](./cicd-deployment-workflows.md)
- [Implementation Timeline](./cicd-implementation-timeline.md)
- [Contingency Plans](./cicd-contingency-plans.md)