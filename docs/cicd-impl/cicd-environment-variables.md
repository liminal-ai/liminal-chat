# Environment Variable Mapping

## Overview

This document provides a comprehensive mapping of environment variables across all systems (Convex, Vercel, WorkOS, GitHub) and environments (development, staging, production).

## Environment Variable Categories

### 1. WorkOS Authentication Variables

| Variable | Development | Staging | Production | Description |
|----------|-------------|---------|------------|-------------|
| `WORKOS_CLIENT_ID` | `client_01DEV...` | `client_01STAGING...` | `client_01PROD...` | WorkOS application client ID |
| `WORKOS_API_KEY` | `sk_test_...` | `sk_test_...` | `sk_live_...` | WorkOS API key (server-side only) |
| `WORKOS_COOKIE_PASSWORD` | Generated locally | Unique 32-char string | Unique 32-char string | Session encryption password |
| `VITE_WORKOS_CLIENT_ID` | Same as above | Same as above | Same as above | Client-side WorkOS client ID |
| `VITE_WORKOS_REDIRECT_URI` | `http://localhost:3000/callback` | `https://staging.domain.com/callback` | `https://domain.com/callback` | OAuth callback URL |

### 2. Convex Database Variables

| Variable | Development | Staging | Production | Description |
|----------|-------------|---------|------------|-------------|
| `CONVEX_DEPLOYMENT` | Auto-generated dev name | `staging-deployment-name` | `production-deployment-name` | Convex deployment identifier |
| `CONVEX_URL` | Auto-generated dev URL | Staging deployment URL | Production deployment URL | Convex API endpoint |
| `CONVEX_DEPLOY_KEY` | Not needed (dev) | Staging deploy key | Production deploy key | CI/CD deployment authorization |
| `VITE_CONVEX_URL` | Same as CONVEX_URL | Same as CONVEX_URL | Same as CONVEX_URL | Client-side Convex endpoint |

### 3. Vercel Deployment Variables

| Variable | Development | Staging | Production | Description |
|----------|-------------|---------|------------|-------------|
| `VERCEL_ENV` | `development` | `preview`/custom | `production` | Vercel environment type |
| `VERCEL_URL` | N/A | Auto-generated | Auto-generated | Vercel deployment URL |
| `VERCEL_GIT_COMMIT_SHA` | N/A | Auto-populated | Auto-populated | Git commit hash |
| `VERCEL_GIT_COMMIT_REF` | N/A | Auto-populated | Auto-populated | Git branch name |
| `VERCEL_PROJECT_PRODUCTION_URL` | N/A | Production domain | Production domain | Canonical production URL |

### 4. Application Configuration Variables

| Variable | Development | Staging | Production | Description |
|----------|-------------|---------|------------|-------------|
| `VITE_APP_ENV` | `development` | `staging` | `production` | Application environment |
| `VITE_LOG_LEVEL` | `debug` | `info` | `warn` | Logging verbosity |
| `VITE_API_BASE_URL` | Convex dev URL | Convex staging URL | Convex production URL | API base URL |
| `NODE_ENV` | `development` | `production` | `production` | Node.js environment |

### 5. CI/CD Variables (GitHub Secrets)

| Variable | Purpose | Scope | Description |
|----------|---------|-------|-------------|
| `CONVEX_STAGING_DEPLOY_KEY` | Staging deployments | Repository | Convex staging deploy key |
| `CONVEX_PRODUCTION_DEPLOY_KEY` | Production deployments | Repository | Convex production deploy key |
| `VERCEL_TOKEN` | Vercel deployments | Repository | Vercel API token |
| `WORKOS_STAGING_API_KEY` | Staging auth | Repository | WorkOS staging API key |
| `WORKOS_PRODUCTION_API_KEY` | Production auth | Repository | WorkOS production API key |

## Environment-Specific Configuration

### Development Environment (.env.local)

```bash
# WorkOS Configuration
WORKOS_CLIENT_ID=client_01DEV1234567890ABCDEF
WORKOS_API_KEY=sk_test_1234567890abcdef
WORKOS_COOKIE_PASSWORD=abcdef1234567890abcdef1234567890

# Convex Configuration (auto-generated)
CONVEX_DEPLOYMENT=liminal-chat-dev-username
CONVEX_URL=https://amazing-animal-123.convex.cloud

# Application Configuration
VITE_APP_ENV=development
VITE_LOG_LEVEL=debug
VITE_WORKOS_CLIENT_ID=client_01DEV1234567890ABCDEF
VITE_CONVEX_URL=https://amazing-animal-123.convex.cloud
VITE_WORKOS_REDIRECT_URI=http://localhost:3000/callback

# Node.js Environment
NODE_ENV=development
```

### Staging Environment (Vercel)

**Environment Variables in Vercel Dashboard**:
```bash
# WorkOS Configuration
WORKOS_CLIENT_ID=client_01STAGING1234567890ABCDEF
WORKOS_API_KEY=sk_test_staging1234567890abcdef
WORKOS_COOKIE_PASSWORD=staging1234567890abcdef1234567890ab

# Convex Configuration
CONVEX_DEPLOY_KEY=[Set in GitHub Secrets]
VITE_CONVEX_URL=https://staging-deployment.convex.cloud

# Application Configuration
VITE_APP_ENV=staging
VITE_LOG_LEVEL=info
VITE_WORKOS_CLIENT_ID=client_01STAGING1234567890ABCDEF
VITE_WORKOS_REDIRECT_URI=https://staging.liminal-chat.com/callback

# Node.js Environment
NODE_ENV=production
```

### Production Environment (Vercel)

**Environment Variables in Vercel Dashboard**:
```bash
# WorkOS Configuration
WORKOS_CLIENT_ID=client_01PROD1234567890ABCDEF
WORKOS_API_KEY=sk_live_prod1234567890abcdef
WORKOS_COOKIE_PASSWORD=prod1234567890abcdef1234567890abcdef

# Convex Configuration
VITE_CONVEX_URL=https://production-deployment.convex.cloud

# Application Configuration
VITE_APP_ENV=production
VITE_LOG_LEVEL=warn
VITE_WORKOS_CLIENT_ID=client_01PROD1234567890ABCDEF
VITE_WORKOS_REDIRECT_URI=https://liminal-chat.com/callback

# Node.js Environment
NODE_ENV=production
```

## Variable Management Workflows

### Setting Up New Environment

**Step 1: Generate WorkOS Credentials**
```bash
# 1. Create WorkOS application for environment
# 2. Copy Client ID and API Key
# 3. Generate cookie password
openssl rand -base64 32
```

**Step 2: Configure Convex Environment**
```bash
# Deploy to new Convex project
npx convex deploy

# Set environment variables
npx convex env set WORKOS_CLIENT_ID "client_01..."
npx convex env set WORKOS_API_KEY "sk_..."
npx convex env set WORKOS_COOKIE_PASSWORD "..."
```

**Step 3: Configure Vercel Environment**
```bash
# Add environment variables with proper scoping
vercel env add VITE_WORKOS_CLIENT_ID --scope preview
vercel env add VITE_CONVEX_URL --scope preview  
vercel env add VITE_APP_ENV --scope preview

# Or via dashboard at vercel.com/[team]/[project]/settings/environment-variables
```

### Rotating Secrets

**WorkOS API Keys**:
1. Generate new API key in WorkOS dashboard
2. Update environment variables in all systems
3. Test functionality in staging
4. Deploy to production
5. Delete old API key

**Convex Deploy Keys**:
1. Generate new deploy key in Convex dashboard
2. Update GitHub secret
3. Test CI/CD pipeline
4. Delete old deploy key

**Session Passwords**:
1. Generate new 32-character password
2. Update in all environments simultaneously
3. Note: This will invalidate all existing sessions

### Environment Variable Validation

**Pre-deployment Checks**:
```bash
# Verify required variables are set
#!/bin/bash
REQUIRED_VARS=(
  "WORKOS_CLIENT_ID"
  "WORKOS_API_KEY" 
  "WORKOS_COOKIE_PASSWORD"
  "VITE_CONVEX_URL"
  "VITE_APP_ENV"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo "❌ Missing required environment variable: $var"
    exit 1
  fi
done

echo "✅ All required environment variables are set"
```

## Security Best Practices

### Variable Classification

**Public Variables** (can be exposed to client):
- `VITE_*` prefixed variables
- `NEXT_PUBLIC_*` prefixed variables
- `REACT_APP_*` prefixed variables

**Private Variables** (server-side only):
- API keys without public prefix
- Deploy keys
- Session passwords
- Database credentials

### Access Control

**GitHub Secrets**:
- Only accessible to repository collaborators
- Used in GitHub Actions workflows
- Cannot be viewed after creation

**Vercel Environment Variables**:
- Team-level access control
- Environment-specific isolation
- Encrypted at rest

**Convex Environment Variables**:
- Project-level access control
- Deploy key required for modification
- Audit logging available

### Monitoring and Alerts

**Failed Authentication**:
- Monitor WorkOS authentication failure rates
- Alert on unusual authentication patterns
- Track session validation errors

**Deployment Failures**:
- Monitor CI/CD pipeline failures
- Alert on environment variable-related errors
- Track deployment success rates

**Configuration Drift**:
- Regular audits of environment variables
- Automated checks for required variables
- Documentation updates when variables change

## Troubleshooting Common Issues

### Authentication Errors

**Invalid WorkOS Client ID**:
```
Error: Invalid client_id parameter
```
- Check `WORKOS_CLIENT_ID` matches application in WorkOS dashboard
- Verify environment-specific client ID is used

**Session Validation Failures**:
```
Error: Invalid session cookie
```
- Check `WORKOS_COOKIE_PASSWORD` is consistent across services
- Verify password is exactly 32 characters
- Ensure password matches between auth creation and validation

### Deployment Errors

**Convex Deploy Key Invalid**:
```
Error: Invalid deploy key
```
- Verify `CONVEX_DEPLOY_KEY` in GitHub secrets
- Check deploy key has correct permissions
- Ensure deploy key is for correct project/environment

**Missing Environment Variables**:
```
Error: VITE_CONVEX_URL is not defined
```
- Check variable is set in Vercel environment settings
- Verify variable name spelling and casing
- Ensure environment-specific configuration

### Configuration Mismatches

**CORS Errors**:
```
Error: CORS policy blocked request
```
- Check WorkOS redirect URLs include current domain
- Verify Convex HTTP action URLs are configured
- Ensure consistent protocol (http/https)

## Variable Migration Guide

### Adding New Variable

1. **Define in all environments**: Development → Staging → Production
2. **Update documentation**: Add to this mapping document
3. **Add to validation**: Include in environment check scripts
4. **Deploy incrementally**: Test in development, then staging, then production

### Removing Variable

1. **Mark as deprecated**: Add comment in code
2. **Remove from new deployments**: Stop setting in new environments
3. **Clean up existing**: Remove from all environments
4. **Update documentation**: Remove from mapping document

### Renaming Variable

1. **Add new variable**: Set alongside old variable
2. **Update code**: Use new variable name
3. **Test thoroughly**: Ensure functionality unchanged
4. **Remove old variable**: After confirming new variable works
5. **Update documentation**: Reflect new variable name

This mapping ensures consistent configuration across all environments and provides a reference for troubleshooting deployment issues.