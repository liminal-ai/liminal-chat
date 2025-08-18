# CI/CD Deployment Workflows

## Overview

This document defines the end-to-end deployment workflows for Liminal Chat across development, staging, and production environments. Each workflow integrates GitHub Actions (via Blacksmith), Convex backend deployment, Vercel frontend deployment, and WorkOS authentication management.

## Workflow Types

### 1. Development Workflow
**Trigger**: Local development work
**Environment**: Developer's local machine + personal Convex deployment
**Purpose**: Feature development and initial testing

### 2. Feature Branch Workflow  
**Trigger**: Push to feature branch, PR creation
**Environment**: Preview deployments + staging Convex
**Purpose**: Code review and feature testing

### 3. Staging Workflow
**Trigger**: Merge to `main` branch
**Environment**: Staging environment (staging.liminal-chat.com)
**Purpose**: Integration testing and pre-production validation

### 4. Production Workflow
**Trigger**: Manual deployment or version tag
**Environment**: Production (liminal-chat.com)
**Purpose**: Live deployment to end users

---

## 1. Development Workflow

### Developer Local Setup
```bash
# Initial setup (one-time)
npm install
npx convex dev  # Creates personal dev deployment

# Daily development workflow
npm run dev:start     # Start Convex in background
npm run dev           # Start frontend dev server
```

### Environment State
- **Convex**: Personal dev deployment (auto-generated name)
- **Frontend**: Local dev server on http://localhost:3000
- **WorkOS**: Development application (test keys)
- **Database**: Personal dev database with test data

### Typical Development Session
```bash
# Start development
npm run dev:start && npm run dev

# Make changes to code
# Files auto-deploy to Convex on save
# Frontend hot-reloads on changes

# Test changes locally
# Use Convex dashboard for backend testing
# Use browser for frontend testing

# Check logs if issues
npm run dev:logs
npx convex logs
```

### Development Exit Points
- **Continue Development**: Keep working locally
- **Create Feature Branch**: Push to GitHub for review
- **Test Production Build**: Build locally before pushing

---

## 2. Feature Branch Workflow

### GitHub Actions Pipeline (.github/workflows/feature-branch.yml)
```yaml
name: Feature Branch Testing
on:
  push:
    branches-ignore: [main]
  pull_request:
    branches: [main]

jobs:
  test-and-preview:
    runs-on: blacksmith-4vcpu  # 2x faster than ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        
      - name: Run type checking
        run: npm run typecheck
        
      - name: Run linting
        run: npm run lint
        
      - name: Run tests
        run: npm test
        
      - name: Deploy Convex to staging
        run: npx convex deploy
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_STAGING_DEPLOY_KEY }}
          
      - name: Build frontend
        run: npm run build
        env:
          VITE_CONVEX_URL: ${{ vars.STAGING_CONVEX_URL }}
          VITE_WORKOS_CLIENT_ID: ${{ vars.STAGING_WORKOS_CLIENT_ID }}
          VITE_APP_ENV: staging
          
      - name: Deploy to Vercel preview
        run: npx vercel deploy --token ${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

### Preview Deployment Process
1. **Code Quality Checks**: TypeScript, ESLint, tests run on Blacksmith
2. **Convex Staging Deploy**: Backend functions deploy to staging environment
3. **Vercel Preview Deploy**: Frontend deploys to unique preview URL
4. **Integration Test**: Automated tests run against preview deployment
5. **PR Comment**: Bot comments preview URL and test results

### Preview Environment State
- **Convex**: Shared staging deployment
- **Frontend**: Unique Vercel preview URL (e.g., `liminal-chat-git-feature-branch.vercel.app`)
- **WorkOS**: Staging application (allows preview domain callbacks)
- **Database**: Staging database (shared, reset-safe test data)

### Feature Branch Commands
```bash
# Create feature branch
git checkout -b feature/new-chat-interface

# Push to trigger CI/CD
git push -u origin feature/new-chat-interface

# Monitor deployment
# Check GitHub Actions tab for pipeline status
# Preview URL posted in PR comments

# Test preview deployment
# Visit preview URL
# Test authentication flow
# Verify new features work

# Update based on feedback
git commit -am "Address PR feedback"
git push  # Triggers new preview deployment
```

---

## 3. Staging Workflow

### GitHub Actions Pipeline (.github/workflows/staging.yml)
```yaml
name: Deploy to Staging
on:
  push:
    branches: [main]

jobs:
  deploy-staging:
    runs-on: blacksmith-4vcpu
    environment: staging  # GitHub environment protection
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run full test suite
        run: npm run test:full
        
      - name: Deploy Convex to staging
        run: npx convex deploy
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_STAGING_DEPLOY_KEY }}
          
      - name: Seed staging database
        run: npx convex run internal.seed.initStaging
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_STAGING_DEPLOY_KEY }}
          
      - name: Build frontend for staging
        run: npm run build
        env:
          VITE_CONVEX_URL: ${{ vars.STAGING_CONVEX_URL }}
          VITE_WORKOS_CLIENT_ID: ${{ vars.STAGING_WORKOS_CLIENT_ID }}
          VITE_WORKOS_REDIRECT_URI: https://staging.liminal-chat.com/callback
          VITE_APP_ENV: staging
          VITE_LOG_LEVEL: debug
          
      - name: Deploy to Vercel staging
        run: vercel --target preview --token ${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          
      - name: Run smoke tests against staging
        run: npm run test:smoke:staging
        env:
          STAGING_URL: https://staging.liminal-chat.com
          
      - name: Notify team of deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Staging deployment completed: https://staging.liminal-chat.com'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Staging Deployment Process
1. **Quality Gate**: Full test suite must pass
2. **Convex Production Deploy**: Deploy to staging Convex project
3. **Database Seeding**: Run staging-specific initialization
4. **Frontend Build**: Build with staging environment variables  
5. **Vercel Staging Deploy**: Deploy to staging.liminal-chat.com
6. **Smoke Tests**: Automated tests verify core functionality
7. **Team Notification**: Slack notification with deployment status

### Staging Environment State
- **Convex**: Dedicated staging project (`liminal-chat-staging`)
- **Frontend**: https://staging.liminal-chat.com
- **WorkOS**: Staging application with staging domain callbacks
- **Database**: Staging database with production-like test data

### Manual Staging Verification
```bash
# Verify staging deployment locally
curl https://staging.liminal-chat.com/health
curl https://staging-convex.liminal-chat.com/health

# Test authentication flow
# Visit https://staging.liminal-chat.com
# Sign up with test email
# Verify conversation creation works
# Test agent interactions

# Monitor staging logs
npx convex logs --deployment staging

# Check staging metrics
# Vercel dashboard for frontend performance
# Convex dashboard for backend metrics
# WorkOS dashboard for auth metrics
```

---

## 4. Production Workflow

### GitHub Actions Pipeline (.github/workflows/production.yml)
```yaml
name: Deploy to Production
on:
  workflow_dispatch:  # Manual trigger
    inputs:
      version:
        description: 'Version to deploy (e.g., v1.2.3)'
        required: true
        type: string
  push:
    tags:
      - 'v*'

jobs:
  deploy-production:
    runs-on: blacksmith-4vcpu
    environment: production  # Requires approval
    steps:
      - uses: actions/checkout@v4
      
      - name: Verify staging deployment
        run: npm run test:smoke:staging
        env:
          STAGING_URL: https://staging.liminal-chat.com
          
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run comprehensive test suite
        run: npm run test:comprehensive
        
      - name: Create production backup
        run: npx convex export --deployment production
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_PRODUCTION_DEPLOY_KEY }}
          
      - name: Deploy Convex to production
        run: npx convex deploy --prod
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_PRODUCTION_DEPLOY_KEY }}
          
      - name: Build frontend for production
        run: npm run build
        env:
          VITE_CONVEX_URL: ${{ vars.PRODUCTION_CONVEX_URL }}
          VITE_WORKOS_CLIENT_ID: ${{ vars.PRODUCTION_WORKOS_CLIENT_ID }}
          VITE_WORKOS_REDIRECT_URI: https://liminal-chat.com/callback
          VITE_APP_ENV: production
          VITE_LOG_LEVEL: warn
          NODE_ENV: production
          
      - name: Deploy to Vercel production
        run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          
      - name: Run production smoke tests
        run: npm run test:smoke:production
        env:
          PRODUCTION_URL: https://liminal-chat.com
          
      - name: Update DNS and CDN cache
        run: |
          # Flush Cloudflare cache if applicable
          # Update any DNS-based routing
          
      - name: Create GitHub release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.event.inputs.version || github.ref_name }}
          release_name: Release ${{ github.event.inputs.version || github.ref_name }}
          draft: false
          prerelease: false
          
      - name: Notify stakeholders
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed: https://liminal-chat.com'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Production Deployment Process
1. **Manual Approval**: GitHub environment protection requires approval
2. **Staging Verification**: Automated tests confirm staging is working
3. **Backup Creation**: Export current production database
4. **Comprehensive Testing**: Full test suite validation
5. **Convex Production Deploy**: Deploy backend to production project
6. **Frontend Production Build**: Build with production environment variables
7. **Vercel Production Deploy**: Deploy to liminal-chat.com
8. **Production Verification**: Smoke tests verify core functionality
9. **Release Creation**: GitHub release with version tag
10. **Stakeholder Notification**: Slack notification to team and stakeholders

### Production Environment State
- **Convex**: Production project (`liminal-chat-production`)
- **Frontend**: https://liminal-chat.com
- **WorkOS**: Production application with live API keys
- **Database**: Production database with real user data

### Production Deployment Commands
```bash
# Manual deployment via GitHub Actions
# 1. Go to Actions tab in GitHub
# 2. Select "Deploy to Production" workflow
# 3. Click "Run workflow"
# 4. Enter version number (e.g., v1.2.3)
# 5. Approve deployment when prompted

# Alternative: Tag-based deployment
git tag v1.2.3
git push origin v1.2.3  # Triggers production deployment

# Monitor production deployment
# GitHub Actions logs show real-time progress
# Slack notifications provide status updates

# Verify production deployment
curl https://liminal-chat.com/health
npm run test:smoke:production

# Monitor production health
npx convex logs --deployment production
# Check Vercel dashboard for performance metrics
# Monitor WorkOS dashboard for authentication metrics
# Check error tracking (Sentry, LogRocket, etc.)
```

---

## Workflow Integration Points

### Database Migrations
```bash
# Development
npx convex dev  # Auto-applies schema changes

# Staging
npx convex deploy  # Applies migrations to staging

# Production  
npx convex deploy --prod  # Applies migrations to production
# Note: Convex handles migrations automatically
```

### Environment Variable Management
```bash
# Development
# Set in .env.local file

# Staging/Production
# Set in GitHub repository secrets/variables
# Deployed automatically via CI/CD pipeline
```

### Rollback Procedures
```bash
# Convex rollback (if needed)
npx convex rollback --to-version [previous-version]

# Vercel rollback
vercel rollback [deployment-url]

# Emergency rollback
# Use Vercel dashboard to promote previous deployment
# Revert Git commit and redeploy if necessary
```

---

## Monitoring and Observability

### Key Metrics to Monitor

**GitHub Actions (Blacksmith)**:
- Build duration and success rate
- Cost savings vs standard GitHub runners
- Queue times and resource utilization

**Convex Backend**:
- Function execution times and error rates
- Database query performance
- API response times

**Vercel Frontend**:
- Page load times and Core Web Vitals
- Build success rate and duration
- CDN cache hit rates

**WorkOS Authentication**:
- Login success rates
- Session validation performance
- OAuth provider response times

### Alerting Strategy

**Critical Alerts** (immediate response):
- Production deployment failures
- Authentication system outages
- Database connectivity issues
- High error rates (>5%)

**Warning Alerts** (within 1 hour):
- Staging deployment failures
- Performance degradation
- Elevated error rates (1-5%)
- Resource utilization spikes

**Info Alerts** (daily digest):
- Successful deployments
- Performance trends
- Cost optimization opportunities

### Dashboard Recommendations

**Primary Dashboard**: 
- Deployment pipeline status
- Environment health checks
- Key performance metrics
- Error rates and recent alerts

**Secondary Dashboards**:
- Cost tracking (Blacksmith savings, Vercel usage, etc.)
- Performance trends over time
- User authentication analytics
- Database performance metrics

---

## Troubleshooting Common Issues

### Deployment Failures

**Convex Deploy Fails**:
```bash
# Check deploy key permissions
npx convex deploy --verbose

# Verify environment variables
npx convex env list

# Check schema compatibility
npx convex dev  # Test locally first
```

**Vercel Deploy Fails**:
```bash
# Check build logs
vercel logs [deployment-url]

# Verify environment variables
vercel env ls

# Test build locally
npm run build
```

**WorkOS Auth Issues**:
```bash
# Verify redirect URLs
# Check WorkOS dashboard configuration
# Confirm client ID matches environment
# Test with staging credentials first
```

### Performance Issues

**Slow Builds**:
- Verify Blacksmith runner size is appropriate
- Check for cache configuration issues
- Review dependency installation process

**Slow Deployments**:
- Monitor Convex function deployment times
- Check Vercel build performance
- Verify CDN cache configuration

**Runtime Performance**:
- Monitor Convex function execution times
- Check Vercel server response times
- Review database query performance

This workflow documentation provides the foundation for reliable, fast, and cost-effective CI/CD operations across all environments while maintaining high quality and security standards.