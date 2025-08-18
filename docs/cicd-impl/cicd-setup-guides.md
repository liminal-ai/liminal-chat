# CI/CD Setup Guides

## Overview

This document provides step-by-step setup instructions for each component of the CI/CD pipeline: Blacksmith GitHub Actions, Convex staging environment, Vercel staging deployment, and WorkOS multi-environment configuration.

## 1. Blacksmith GitHub Actions Setup

### Prerequisites
- GitHub repository with existing GitHub Actions workflows
- Admin access to GitHub repository settings

### Step 1: Sign Up for Blacksmith
1. Visit [blacksmith.sh](https://blacksmith.sh)
2. Click "Try for free" (no credit card required)
3. Connect your GitHub account
4. Select repositories to enable Blacksmith on

### Step 2: Update GitHub Actions Workflows
Replace runner references in `.github/workflows/*.yml`:

```yaml
# Before
jobs:
  test:
    runs-on: ubuntu-latest
    
# After  
jobs:
  test:
    runs-on: blacksmith-4vcpu  # or blacksmith-2vcpu, blacksmith-8vcpu, etc.
```

### Step 3: Configure Advanced Features (Optional)

**Docker Layer Caching** (add to workflow if needed):
```yaml
jobs:
  build:
    runs-on: blacksmith-4vcpu
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t myapp .
        # Docker layer caching automatically enabled
```

**Priority Support** (Enterprise):
- Contact Blacksmith team for dedicated Slack channel
- Available for $500/month or included in Enterprise plan

### Step 4: Monitor Performance
1. Access Blacksmith Console at [app.blacksmith.sh](https://app.blacksmith.sh)
2. View job execution times and cost savings
3. Monitor cache hit rates and optimization opportunities

### Expected Results
- 2x faster job execution
- 75% cost reduction
- Improved CI/CD observability

---

## 2. Convex Staging Environment Setup

### Prerequisites
- Existing Convex project with working dev deployment
- Convex CLI installed (`npm install -g convex`)
- Team admin access to Convex dashboard

### Step 1: Create Staging Project
```bash
# Create new directory for staging configuration
mkdir convex-staging-config
cd convex-staging-config

# Initialize new Convex project
npx convex dev
# This will prompt you to create a new project - name it "liminal-chat-staging"
```

### Step 2: Generate Staging Deploy Key
1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Navigate to your new staging project
3. Go to Settings → Deploy Keys
4. Click "Create Deploy Key"
5. Name it "Staging Deploy Key"
6. Copy the generated key (starts with `convex_deploy_key_`)

### Step 3: Configure Environment Variables
```bash
# Set up staging-specific environment variables
npx convex env set WORKOS_CLIENT_ID "client_01STAGING..."
npx convex env set WORKOS_API_KEY "sk_test_..."  # Use test key for staging
npx convex env set WORKOS_COOKIE_PASSWORD "$(openssl rand -base64 32)"

# Add any other environment-specific variables
npx convex env set APP_ENV "staging"
npx convex env set LOG_LEVEL "debug"
```

### Step 4: Deploy Initial Schema and Functions
```bash
# Copy schema and functions from main project
cp -r ../apps/liminal-api/convex/* ./convex/

# Deploy to staging
npx convex deploy
```

### Step 5: Seed Staging Data
```bash
# Run initialization/seeding function
npx convex run init  # Assumes you have convex/init.ts

# Or import test data
npx convex import --table users staging-users.json
npx convex import --table conversations staging-conversations.json
```

### Step 6: Configure CI/CD Integration
Add staging deploy key to GitHub secrets:
1. Go to GitHub repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `CONVEX_STAGING_DEPLOY_KEY`
4. Value: The deploy key from Step 2

### Expected Results
- Isolated staging environment for testing
- Separate database with staging data
- Independent deployment pipeline

---

## 3. Vercel Staging Environment Setup

### Prerequisites
- Vercel account connected to GitHub
- Existing Vercel project for development
- Admin access to Vercel project settings

### Step 1: Create Custom Environment
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Click "Add" and select "Custom Environment"
5. Name it "staging"

### Step 2: Configure Staging Environment Variables
Add environment variables for staging environment:

```bash
# Convex staging deployment URL
VITE_CONVEX_URL=https://your-staging-deployment.convex.cloud

# WorkOS staging credentials  
VITE_WORKOS_CLIENT_ID=client_01STAGING...
VITE_WORKOS_REDIRECT_URI=https://staging.liminal-chat.com/callback

# Other staging-specific variables
VITE_APP_ENV=staging
VITE_LOG_LEVEL=debug
```

### Step 3: Configure Custom Domain (Optional)
1. In Vercel project settings, go to Domains
2. Add custom domain: `staging.liminal-chat.com`
3. Configure DNS records as instructed by Vercel
4. Wait for SSL certificate provisioning

### Step 4: Set Up Automatic Deployments
Create or update `.github/workflows/staging-deploy.yml`:

```yaml
name: Deploy to Staging
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: blacksmith-4vcpu
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        
      - name: Deploy Convex to staging
        run: npx convex deploy
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_STAGING_DEPLOY_KEY }}
      
      - name: Deploy to Vercel staging
        run: vercel --target preview --token ${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

### Step 5: Configure PR Preview Deployments
Update `vercel.json` to handle preview deployments:

```json
{
  "buildCommand": "npm run build",
  "framework": "vite",
  "env": {
    "VITE_CONVEX_URL": "@convex-url",
    "VITE_WORKOS_CLIENT_ID": "@workos-client-id"
  },
  "build": {
    "env": {
      "VITE_CONVEX_URL": "@convex-staging-url",
      "VITE_WORKOS_CLIENT_ID": "@workos-staging-client-id"
    }
  }
}
```

### Expected Results
- Staging environment accessible at custom domain
- Automatic deployments on main branch
- PR preview deployments for testing

---

## 4. WorkOS Multi-Environment Setup

### Prerequisites
- Existing WorkOS account and application
- Admin access to WorkOS dashboard
- Understanding of redirect URL patterns

### Step 1: Create Staging Application
1. Go to [WorkOS Dashboard](https://dashboard.workos.com)
2. Click "Create Application"
3. Name: "Liminal Chat - Staging"
4. Environment: Select "Development" (or "Production" if available)

### Step 2: Configure Staging Application Settings

**Redirect URLs**:
```
# Local development (keep existing)
http://localhost:3000/callback
http://localhost:5173/callback

# Staging environment
https://staging.liminal-chat.com/callback
https://liminal-chat-staging.vercel.app/callback

# Vercel preview deployments (wildcard)
https://*-git-*-liminal-chat.vercel.app/callback
```

**Authentication Methods**:
- Email/Password: Enabled
- Google OAuth: Configure with staging credentials
- GitHub OAuth: Configure with staging credentials

### Step 3: Generate API Credentials
1. In staging application settings, go to API Keys
2. Copy the Client ID (starts with `client_01`)
3. Generate new API Key (starts with `sk_test_` or `sk_live_`)
4. Store securely - these will be used in environment variables

### Step 4: Configure Environment Variables

**Development** (`.env.local`):
```bash
WORKOS_CLIENT_ID=client_01DEV...
WORKOS_API_KEY=sk_test_...
WORKOS_COOKIE_PASSWORD=$(openssl rand -base64 32)
```

**Staging** (Vercel environment variables):
```bash
VITE_WORKOS_CLIENT_ID=client_01STAGING...
WORKOS_API_KEY=sk_test_...  # Server-side only
WORKOS_COOKIE_PASSWORD=different_32_char_password
```

### Step 5: Update Application Code
Ensure your application can handle multiple environments:

```javascript
// utils/workos.js
const workosClientId = process.env.VITE_WORKOS_CLIENT_ID || process.env.WORKOS_CLIENT_ID;
const workosApiKey = process.env.WORKOS_API_KEY;

export const workos = new WorkOS(workosApiKey, {
  clientId: workosClientId,
});
```

### Step 6: Test Authentication Flow
1. Deploy to staging environment
2. Navigate to staging URL
3. Test sign-up flow with test email
4. Verify authentication works end-to-end
5. Test sign-out functionality

### Step 7: Set Up Production Application (Future)
When ready for production:
1. Create new WorkOS application for production
2. Configure production domain redirect URLs
3. Use production API keys (`sk_live_*`)
4. Update environment variables in production Vercel environment

### Expected Results
- Isolated authentication for each environment
- Clean separation of user data between dev/staging/production
- Consistent authentication experience across environments

---

## 5. Integration Testing

### End-to-End Verification

**Test Development Environment**:
```bash
# Ensure local development still works
npm run dev
# Test auth flow, database operations, etc.
```

**Test Staging Environment**:
```bash
# Create PR to trigger staging deployment
git checkout -b test-staging-deployment
git commit --allow-empty -m "Test staging deployment"
git push -u origin test-staging-deployment

# Create PR and verify:
# 1. Blacksmith runs tests faster
# 2. Vercel creates preview deployment  
# 3. Convex staging deployment succeeds
# 4. WorkOS auth works in staging
```

**Test Production Deployment** (when ready):
```bash
# Deploy to production
git checkout main
git tag v1.0.0
git push origin v1.0.0

# Verify production deployment
```

### Monitoring Setup

**GitHub Actions Monitoring**:
- Monitor job durations in Blacksmith dashboard
- Set up Slack notifications for failed deployments
- Track cost savings and performance improvements

**Application Monitoring**:
- Configure error tracking (Sentry, LogRocket, etc.)
- Set up uptime monitoring for staging/production
- Monitor Convex function performance
- Track WorkOS authentication success rates

### Troubleshooting Common Issues

**Blacksmith Issues**:
- If jobs fail to start: Check runner configuration
- If performance isn't improved: Verify cache configuration
- If costs are higher: Check runner size allocation

**Convex Issues**:
- If deployments fail: Check deploy key permissions
- If functions error: Verify environment variables
- If schema migration fails: Check for breaking changes

**Vercel Issues**:
- If builds fail: Check build command and environment variables
- If domains don't work: Verify DNS configuration
- If environment variables missing: Check environment configuration

**WorkOS Issues**:
- If auth fails: Verify redirect URLs and client IDs
- If sessions don't persist: Check cookie password configuration
- If users can't sign up: Verify API key permissions

## Next Steps

1. **Execute Implementation**: Follow guides in priority order
2. **Monitor Performance**: Track improvements and identify issues
3. **Optimize Configuration**: Fine-tune settings based on usage patterns
4. **Document Learnings**: Update guides based on real-world experience
5. **Plan Production**: Prepare for production deployment when staging is validated