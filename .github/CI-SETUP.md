# Backend CI/CD Setup Guide

## Overview

The Backend CI/CD workflow provides automated quality gates and staging deployment for the Convex backend (`apps/liminal-api`).

## Required Repository Configuration

### Secrets (Repository Settings → Secrets and variables → Actions → Secrets)

1. **CONVEX_STAGING_DEPLOY_KEY**
   - Convex deployment key for staging environment
   - Generate: `npx convex auth create-key --name "GitHub Actions Staging"`
   - Used for automated staging deployment

### Variables (Repository Settings → Secrets and variables → Actions → Variables)

1. **CONVEX_STAGING_URL**
   - Your staging Convex deployment URL
   - Example: `https://your-staging-deployment.convex.site`
   - Used for health checks after deployment

### Gate Control Variables (Optional - for disabling quality gates)

Set these to `"true"` only when absolutely necessary:

- **DISABLE_FORMAT_CHECK** - Disables Prettier format checking
- **DISABLE_SECURITY_CHECK** - Disables TruffleHog security scanning ⚠️ **CRITICAL RISK**
- **DISABLE_DEPENDENCY_AUDIT** - Disables pnpm audit for vulnerable dependencies
- **DISABLE_LINT_CHECK** - Disables ESLint checking
- **DISABLE_TYPECHECK** - Disables TypeScript compilation checking
- **DISABLE_INTEGRATION_TESTS** - Disables integration test execution

## Workflow Triggers

### Pull Requests
- Triggers on PRs to `main` branch
- Runs all quality gates
- **Does NOT deploy** to staging
- Must pass all enabled gates to merge

### Main Branch Pushes
- Triggers on pushes to `main` branch
- Runs all quality gates
- **Deploys to staging** if gates pass
- Runs health check against staging

## Quality Gates

### 1. Format Check
- **Command**: `pnpm format:check` and `pnpm format:fix`
- **Behavior**: Auto-fixes formatting issues
- **Failure**: Blocks merge if formatting fails

### 2. Security Scan (Critical)
- **Commands**: 
  - `pnpm precommit:trufflehog` - Secret detection
  - `pnpm precommit:env-files` - Environment file check
  - `pnpm precommit:api-keys` - API key pattern scan
- **Behavior**: Stops immediately on any security issues
- **Failure**: Blocks merge - **NEVER disable this in production**

### 3. Dependency Audit
- **Command**: `pnpm audit --prod`
- **Behavior**: Checks for vulnerable production dependencies
- **Failure**: Blocks merge on critical vulnerabilities

### 4. Lint Check
- **Command**: `pnpm lint`
- **Behavior**: ESLint checking across all packages
- **Failure**: Blocks merge on linting errors

### 5. TypeScript Check
- **Command**: `pnpm typecheck`
- **Behavior**: TypeScript compilation verification
- **Failure**: Blocks merge on type errors

### 6. Integration Tests
- **Command**: `pnpm test` (in `apps/liminal-api`)
- **Behavior**: Runs all 11 integration tests
- **Failure**: Blocks merge on test failures

## Staging Deployment

### When It Runs
- Only on pushes to `main` branch
- Only after all quality gates pass
- Automatically deploys and validates

### Process
1. Deploy to Convex staging using `CONVEX_STAGING_DEPLOY_KEY`
2. Wait 10 seconds for deployment readiness
3. Run health check against `CONVEX_STAGING_URL/health`
4. Report success/failure in GitHub summary

### Health Check
- **Endpoint**: `GET /health`
- **Expected**: 200 status with healthy response
- **Timeout**: Standard curl timeout
- **Failure**: Marks deployment as failed

## Disabled Gates Warning

When any quality gates are disabled:

- **Prominent warnings** shown during each disabled step
- **Summary section** lists all disabled gates at the end
- **Critical security warning** for disabled security checks
- **Instructions** for re-enabling via repository variables

## Setup Steps

### 1. Create Preview Deploy Key
**Important**: Convex uses Preview Deployments for staging environments.

1. Open Convex Dashboard: `npx convex dashboard`
2. Navigate to Settings → Deploy Keys
3. Click "Create Preview Deploy Key"
4. Name it "GitHub Actions Staging"
5. Copy the generated key

### 2. Get Staging URL
Preview deployments use dynamic URLs. The staging URL will be:
- Format: `https://[deployment-name].convex.site`
- Example: `https://modest-squirrel-498-staging.convex.site`

Note: Preview deployment URLs are created automatically when you first deploy with the deploy key.

### 3. Configure Repository
1. Go to Repository Settings → Secrets and variables → Actions
2. Add **CONVEX_STAGING_DEPLOY_KEY** secret (the preview deploy key from step 1)
3. Add **CONVEX_STAGING_URL** variable (the preview deployment URL)
4. Optionally configure gate control variables

**Note**: The staging URL will be available after the first successful deployment with the deploy key.

### 4. Test Workflow
1. Create a test PR with backend changes
2. Verify all quality gates run and pass
3. Merge PR to `main`
4. Verify staging deployment succeeds

## Troubleshooting

### Common Issues

**"Quality gate disabled" warnings**
- Check repository variables for enabled disable flags
- Remove or set to `"false"` to re-enable

**Staging deployment fails**
- Verify `CONVEX_STAGING_DEPLOY_KEY` is valid
- Check staging environment exists and is accessible
- Ensure all required environment variables are set in staging

**Health check fails**
- Verify `CONVEX_STAGING_URL` is correct
- Check staging deployment succeeded
- Verify `/health` endpoint is accessible

**Format/lint/type errors**
- Run local commands to reproduce:
  - `pnpm format:check` and `pnpm format:fix`
  - `pnpm lint`
  - `pnpm typecheck`

### Emergency Procedures

**Disable security gate (EMERGENCY ONLY)**
```
Repository Settings → Variables → New:
Name: DISABLE_SECURITY_CHECK
Value: true
```
⚠️ **This creates a critical security risk - re-enable ASAP**

**Skip staging deployment**
- Staging only runs on `main` branch pushes
- Use feature branches to avoid staging deployment
- Or temporarily disable via pull request workflow

## Monitoring

### Success Indicators
- ✅ All quality gates pass
- ✅ Staging deployment completes
- ✅ Health check returns 200
- ✅ No disabled gate warnings

### Failure Indicators
- ❌ Any quality gate fails
- ❌ Staging deployment fails
- ❌ Health check fails
- ⚠️ Security gates are disabled

### GitHub Integration
- Status checks appear on PRs
- Deployment status in Actions tab
- Summary reports for each run
- Automatic PR protection (when configured)