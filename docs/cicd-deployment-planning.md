# CI/CD Deployment Planning

## Current State
- **Tests**: Working locally, broken in CI due to removed local-dev-service dependency
- **Deployment**: None - only local development
- **Environments**: Single Convex deployment for local development

## Immediate Need
Get proper staging environment and CI/CD pipeline before serious UI development phase.

## Tentative Decisions

### Environment Strategy
- **Local Development**: Current Convex deployment (keep existing)
- **Staging**: New Convex deployment + Vercel hosting
- **Production**: Future (when ready for users)

Skip "dev" environment - local + staging + production is sufficient.

### Authentication Isolation
- **Local/Dev WorkOS**: Current WorkOS app (development/testing)
- **Staging WorkOS**: New clean WorkOS app (real user flows)
- **Security Rationale**: Prevent development experimentation from compromising staging environment

### CI/CD Pipeline
- **Main branch → Staging deployment**: Automatic via Vercel
- **PR deployments**: Vercel preview URLs (UI-only, shares staging backend)
- **CI tests**: Should work now that local-dev-service dependency removed

### PR Deployment Limitations
- **UI changes**: PR deployments work for visual review
- **Backend changes**: PR previews may break (frontend code vs old backend)
- **Mixed changes**: Test locally, full validation after merge to staging
- **Convex constraint**: Can't create ephemeral Convex deployments per PR

### Development Workflow Approach
**Frontend-First for UI Innovation**:
- Mock data shapes in React
- Build interactions and discover requirements 
- Implement Convex backend once UX is validated
- Avoid premature backend optimization/versioning

**Backend-First for Known Requirements**:
- Well-defined API needs
- Stable data patterns

## Next Steps
1. Verify CI tests pass with local-dev-service removal
2. Create staging WorkOS application  
3. Create staging Convex deployment
4. Set up Vercel project with environment variables
5. Configure automatic deployments
6. Test end-to-end staging flow

## Open Questions
- Database seeding strategy for staging Convex?
- Branch-based vs environment-based deployment strategy?
- Monitoring/alerting for staging environment?

## Research Plan

### Convex Environment Management
**Research Areas**:
- How to create and manage multiple Convex deployments (dev/staging/prod)
- Environment variable management across Convex deployments
- Database migration/seeding strategies for staging environments
- Convex CLI commands for deployment management
- Best practices for Convex environment isolation

**Key Questions**:
- How to create new Convex deployment?
- How to configure different environment variables per deployment?
- How to seed staging with test data?
- How to handle schema changes across environments?

### Vercel Deployment Integration
**Research Areas**:
- Vercel project setup for Vite React applications
- Environment variable configuration in Vercel
- Automatic deployments from GitHub branches
- Preview deployments for PR review
- Custom domain configuration for staging

**Key Questions**:
- How to connect GitHub repo to Vercel project?
- How to configure different Convex URLs per environment in Vercel?
- How to set up automatic staging deployments on main branch?
- How do preview deployments work with environment variables?

### Blacksmith GitHub Actions
**Research Areas**:
- Blacksmith setup and configuration
- Performance benefits vs standard GitHub Actions
- Pricing and usage limits
- Integration with existing workflows (Playwright tests)
- Best practices for CI/CD pipelines with Blacksmith

**Key Questions**:
- How to migrate existing GitHub Actions to Blacksmith?
- What performance improvements can we expect?
- How to configure Blacksmith for Playwright test execution?
- Cost implications and usage patterns?

### WorkOS Multi-Environment Setup
**Research Areas**:
- Creating separate WorkOS applications for different environments
- Environment-specific configuration (redirect URLs, webhooks)
- User management across environments
- API key and credential management
- Testing workflows with staging WorkOS app

**Key Questions**:
- How to create new WorkOS application for staging?
- How to configure staging-specific redirect URLs?
- How to manage test users in staging environment?
- How to handle JWT configuration differences?

### Integration Architecture
**Research Areas**:
- End-to-end workflow: GitHub → Blacksmith → Vercel → Convex
- Environment variable flow across all systems
- Deployment triggers and dependencies
- Rollback strategies
- Monitoring and alerting setup

**Key Questions**:
- What's the complete deployment flow from PR to staging?
- How do all the environment variables connect?
- How to handle deployment failures?
- What monitoring do we need?

## Research Deliverables
After research, create:
1. **Step-by-step setup guide** for each service
2. **Environment variable mapping** across all systems  
3. **Deployment workflow documentation** 
4. **Implementation timeline and order**
5. **Contingency plans** for common issues