# CI/CD Contingency Plans

## Overview

This document outlines contingency plans for common issues that may arise during CI/CD implementation. Each plan includes problem identification, immediate response, and permanent resolution steps.

---

## Blacksmith Issues

### Issue: Blacksmith Runners Not Starting
**Symptoms**: GitHub Actions stuck in queue, no Blacksmith console activity

**Immediate Response**:
```yaml
# Temporary rollback - edit workflow files
runs-on: ubuntu-latest  # Revert to GitHub runners
```

**Investigation Steps**:
1. Check Blacksmith console for service status
2. Verify repository is properly connected to Blacksmith
3. Check GitHub Actions logs for error messages
4. Contact Blacksmith support if service-wide issue

**Permanent Resolution**:
- Wait for Blacksmith service restoration
- Update workflows back to `blacksmith-4vcpu`
- Test thoroughly before considering resolved

### Issue: Slower Performance Than Expected
**Symptoms**: Build times not improved or worse than GitHub runners

**Investigation Steps**:
1. Check actual runner size allocated (`blacksmith-2vcpu` vs `blacksmith-4vcpu`)
2. Verify cache configuration is working
3. Compare job complexity to allocated resources
4. Check Blacksmith console for resource utilization

**Resolution Options**:
```yaml
# Option 1: Increase runner size
runs-on: blacksmith-8vcpu  # For heavy workloads

# Option 2: Split heavy jobs
jobs:
  test:
    runs-on: blacksmith-2vcpu  # Light jobs
  build:
    runs-on: blacksmith-4vcpu  # Heavy jobs
```

### Issue: Blacksmith Service Outage
**Symptoms**: All Blacksmith runners failing, service status page shows issues

**Immediate Response**:
1. Revert all workflows to GitHub runners
2. Notify team of temporary rollback
3. Monitor Blacksmith status page for updates

**Permanent Resolution**:
- Wait for service restoration
- Test one workflow at a time when service returns
- Consider gradual rollout back to Blacksmith

---

## Convex Staging Issues

### Issue: Staging Deploy Key Invalid
**Symptoms**: GitHub Actions failing with "Invalid deploy key" error

**Immediate Response**:
```bash
# Verify deploy key in Convex dashboard
# Check GitHub Secrets for correct key value
```

**Investigation Steps**:
1. Regenerate deploy key in Convex dashboard
2. Update GitHub Secret with new key
3. Test deployment manually
4. Check key permissions and project association

**Resolution**:
```bash
# Update GitHub Secret
CONVEX_STAGING_DEPLOY_KEY=new_key_value

# Test deployment
npx convex deploy --deployment staging
```

### Issue: Staging Environment Variables Missing
**Symptoms**: Functions failing with undefined environment variables

**Investigation Steps**:
```bash
# Check current environment variables
npx convex env list --deployment staging

# Verify all required variables are set
# Compare with production environment variables
```

**Resolution**:
```bash
# Set missing environment variables
npx convex env set WORKOS_CLIENT_ID "client_01STAGING..." --deployment staging
npx convex env set WORKOS_API_KEY "sk_test_..." --deployment staging
npx convex env set WORKOS_COOKIE_PASSWORD "$(openssl rand -base64 32)" --deployment staging
```

### Issue: Staging Database Schema Mismatch
**Symptoms**: Functions failing due to schema incompatibility

**Immediate Response**:
1. Stop automatic staging deployments
2. Check schema differences between dev and staging
3. Plan schema migration strategy

**Resolution Options**:
```bash
# Option 1: Reset staging database (if safe)
# Drop all data and redeploy schema
npx convex run internal.admin.resetDatabase --deployment staging

# Option 2: Manual schema migration
# Review schema differences
# Apply migrations incrementally
```

---

## WorkOS Authentication Issues

### Issue: Authentication Redirects Failing
**Symptoms**: Users getting "Invalid redirect URI" errors

**Investigation Steps**:
1. Check WorkOS application redirect URL configuration
2. Verify environment variables match application settings
3. Test redirect URLs manually
4. Check protocol (http vs https) mismatches

**Resolution**:
```bash
# Update WorkOS application settings
# Add missing redirect URLs:
# https://staging.liminal-chat.com/callback
# https://*-git-*-liminal-chat.vercel.app/callback

# Verify environment variables
VITE_WORKOS_REDIRECT_URI=https://staging.liminal-chat.com/callback
```

### Issue: Session Validation Failures
**Symptoms**: Users logged out repeatedly, session errors

**Investigation Steps**:
1. Check `WORKOS_COOKIE_PASSWORD` consistency across services
2. Verify password is exactly 32 characters
3. Check for recent password changes
4. Test session creation and validation

**Resolution**:
```bash
# Generate new consistent password
NEW_PASSWORD=$(openssl rand -base64 32)

# Update in all environments simultaneously
npx convex env set WORKOS_COOKIE_PASSWORD "$NEW_PASSWORD" --deployment staging
# Update in Vercel environment variables
# Update in local development .env
```

### Issue: WorkOS API Key Expired/Invalid
**Symptoms**: Authentication requests failing with 401/403 errors

**Investigation Steps**:
1. Check WorkOS dashboard for key status
2. Verify key permissions and environment
3. Test key with simple API call
4. Check for key rotation requirements

**Resolution**:
```bash
# Generate new API key in WorkOS dashboard
# Update in all environments
npx convex env set WORKOS_API_KEY "sk_test_new_key..." --deployment staging

# Update GitHub Secrets
WORKOS_STAGING_API_KEY=sk_test_new_key...
```

---

## Vercel Staging Issues

### Issue: Staging Domain Not Resolving
**Symptoms**: staging.liminal-chat.com not accessible

**Investigation Steps**:
1. Check DNS propagation status
2. Verify domain configuration in Vercel
3. Test domain from different locations
4. Check SSL certificate status

**Resolution**:
```bash
# Check DNS status
dig staging.liminal-chat.com
nslookup staging.liminal-chat.com

# Verify Vercel domain configuration
# Re-add domain if necessary
# Wait for DNS propagation (up to 48 hours)
```

### Issue: Staging Build Failures
**Symptoms**: Vercel deployments failing during build process

**Investigation Steps**:
1. Check Vercel build logs for specific errors
2. Verify environment variables are set correctly
3. Test build process locally
4. Check for dependency conflicts

**Resolution**:
```bash
# Test build locally with staging variables
npm run build
# Check for missing environment variables
# Verify all staging configurations

# Common fixes:
# Update Node.js version in Vercel settings
# Add missing environment variables
# Fix build command or configuration
```

### Issue: Staging Environment Variables Not Applied
**Symptoms**: Frontend showing development/production behavior instead of staging

**Investigation Steps**:
1. Check Vercel environment variable configuration
2. Verify variables are set for "staging" environment
3. Check build logs for variable values
4. Test with manual deployment

**Resolution**:
```bash
# Verify environment variables in Vercel dashboard
# Ensure they're set for "staging" environment
# Redeploy to apply changes

# Common staging variables:
VITE_APP_ENV=staging
VITE_CONVEX_URL=https://staging-deployment.convex.cloud
VITE_WORKOS_CLIENT_ID=client_01STAGING...
```

---

## Integration Issues

### Issue: Staging Frontend Can't Connect to Backend
**Symptoms**: Frontend loads but API calls fail

**Investigation Steps**:
1. Check Convex staging deployment status
2. Verify frontend is using correct Convex URL
3. Test backend endpoints directly
4. Check CORS configuration

**Resolution**:
```bash
# Verify Convex staging deployment
npx convex logs --deployment staging

# Check frontend environment variables
# Ensure VITE_CONVEX_URL points to staging
VITE_CONVEX_URL=https://staging-deployment.convex.cloud

# Test backend directly
curl https://staging-deployment.convex.cloud/api/health
```

### Issue: Database Seeding Failures
**Symptoms**: Staging environment has empty or corrupt data

**Investigation Steps**:
1. Check seeding function logs
2. Verify seeding function permissions
3. Test seeding functions manually
4. Check for data conflicts

**Resolution**:
```bash
# Manual seeding process
npx convex run internal.seed.initStaging --deployment staging

# Reset and reseed if necessary
npx convex run internal.admin.clearStagingData --deployment staging
npx convex run internal.seed.fullStagingSetup --deployment staging
```

---

## Emergency Procedures

### Complete Rollback Plan
If implementation causes critical issues:

**Step 1: Immediate Rollback**
```bash
# Revert GitHub Actions workflows
git checkout HEAD~1 -- .github/workflows/
git commit -m "Emergency rollback of CI/CD changes"
git push origin main
```

**Step 2: Restore Previous State**
```bash
# Disable staging deployments
# Point development back to original setup
# Notify team of rollback

# If necessary, revert environment variables
# If necessary, restore previous authentication setup
```

**Step 3: Post-Incident Analysis**
1. Document what went wrong
2. Identify root cause
3. Plan corrected implementation
4. Test thoroughly before retry

### Communication Plan
**During Incidents**:
- Immediate Slack notification to team
- Status updates every 30 minutes
- Clear ownership of resolution

**Post-Resolution**:
- Summary of issue and resolution
- Lessons learned documentation
- Updated procedures if necessary

### Monitoring and Alerts
**Critical Alerts** (immediate response):
- Production deployment failures
- Authentication system complete failure
- Database connectivity loss

**Warning Alerts** (1 hour response):
- Staging environment issues
- Performance degradation
- Partial functionality loss

**Recovery Validation**:
- All alerts cleared
- Full functionality tested
- Performance baselines restored
- Team notified of resolution

---

## Prevention Strategies

### Testing Before Implementation
1. Test each component in isolation
2. Use feature branches for all changes
3. Validate in staging before production
4. Have rollback plan ready

### Monitoring During Implementation
1. Watch metrics closely during rollout
2. Test frequently during implementation
3. Validate each step before proceeding
4. Document issues immediately

### Team Coordination
1. Clear ownership for each component
2. Regular communication during implementation
3. Escalation procedures defined
4. Backup personnel identified

This contingency planning ensures rapid response to issues while maintaining system stability and team confidence throughout the CI/CD implementation process.