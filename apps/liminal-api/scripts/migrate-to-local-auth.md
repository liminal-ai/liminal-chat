# Migration Guide: WorkOS Direct → Local Dev Service

## Overview

We've migrated from direct WorkOS authentication in tests to using a centralized local dev service. This simplifies credential management and provides a single source of truth for development authentication.

## What Changed

### Before (Direct WorkOS)
- Tests called WorkOS APIs directly
- Each test process managed its own token cache
- Required WorkOS credentials in test environment

### After (Local Dev Service)  
- Tests request tokens from `http://127.0.0.1:8081/auth/token`
- Single token cache in local-dev-service
- Only local-dev-service needs WorkOS credentials

## Migration Steps

1. **Update Environment Variables**
   
   Move from liminal-api tests to local-dev-service:
   ```bash
   # From: apps/liminal-api/.env
   # To: apps/local-dev-service/.env
   
   WORKOS_CLIENT_ID=your_client_id
   WORKOS_API_KEY=your_api_key
   DEV_USER_EMAIL=system@example.com
   DEV_USER_PASSWORD=your_password
   ```

2. **Start Local Dev Service**
   ```bash
   cd apps/local-dev-service
   npm run dev:start
   ```

3. **Run Tests**
   ```bash
   cd apps/liminal-api
   npm test
   ```

## Benefits

- **Centralized Auth**: One service handles all dev authentication
- **Simpler Config**: Only configure WorkOS credentials once
- **Better Caching**: Shared token cache across all tools
- **Easier Debugging**: Single place to monitor auth issues

## Rollback

If needed, you can temporarily revert:

1. Replace `local-dev-auth.ts` import with `system-auth.ts` in `auth-fixture.ts`
2. Restore WorkOS env vars to test environment
3. Comment out the local dev service check in `playwright.config.ts`

## Future Plans

- React app will use same endpoint via `useAuthFromDev` hook
- CLI tools can authenticate through local service
- Potential for mock auth mode in tests