# Repository Move Checklist

## Pre-Move Preparation

### 1. Document Current Integrations
- [ ] List all GitHub Apps installed on repository
- [ ] Document webhook URLs and configurations  
- [ ] Note any external services with repository-specific URLs
- [ ] Export important configuration files

### 2. GitHub Apps Audit
```bash
# Check current installations
gh api repos/OWNER/REPO/installations
gh api repos/OWNER/REPO/hooks

# Document app permissions
gh api orgs/ORG/installations
```

### 3. Service Dependencies
- [ ] CodeRabbit AI code review
- [ ] Vercel deployment webhooks
- [ ] Snyk security scanning
- [ ] Any custom CI/CD integrations

## Post-Move Recovery

### 1. Immediate Validations
```bash
# Verify new repository URL
git remote -v
gh repo view --json owner,name,url

# Check surviving integrations
gh api repos/NEW_OWNER/REPO/hooks
gh api orgs/NEW_ORG/installations
```

### 2. Reinstall Missing Apps

**CodeRabbit:**
1. Visit: https://github.com/apps/coderabbitai/installations/new
2. Select organization account (not personal)
3. Grant required permissions
4. Configure at: https://app.coderabbit.ai/settings/organization

**Other Apps:**
- Follow same pattern: uninstall from old, reinstall on new

### 3. Validate Configuration Files
- [ ] `.coderabbit.yml` - Review path-based configs
- [ ] `vercel.json` - Update any hardcoded URLs
- [ ] `.github/workflows/` - Check repository references

### 4. Test All Integrations
- [ ] Create test PR to trigger automated reviews
- [ ] Verify deployment pipelines work
- [ ] Test security scanning triggers
- [ ] Validate webhook deliveries

## Common Issues & Solutions

### GitHub Apps Not Triggering
**Cause:** App installed on old repository location
**Solution:** Reinstall app on new organization/owner

### Webhooks Still Point to Old Repo
**Cause:** External services configured with old URLs
**Solution:** Update webhook URLs in external service dashboards

### Configuration Files Reference Old Paths
**Cause:** Hardcoded repository paths in config files
**Solution:** Update configuration files with new paths

## Emergency Rollback

If critical integrations fail:
1. Keep old repository as backup temporarily
2. Update DNS/URLs to point back to old repo
3. Fix integrations with time pressure removed
4. Re-attempt move when ready

## Best Practices

- **Test in staging first** if possible
- **Move during low-activity periods**
- **Keep old repo for 48h minimum** as backup
- **Document everything** before starting
- **Have rollback plan ready**

## Repository URLs to Update

After move from `leegmoore/liminal-chat` to `liminal-ai/liminal-chat`:

- Git remotes: ✅ Updated automatically by GitHub
- GitHub Apps: ❌ Require manual reinstallation  
- Webhooks: ❌ Require manual reconfiguration
- External service configs: ❌ Manual update needed

Generated: 2025-08-17