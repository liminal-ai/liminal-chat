# Convex Environment Variables Setup Guide

## Current Situation

The confusion around .env files in Convex stems from a fundamental difference in how Convex handles environment variables compared to traditional Node.js applications.

### Key Understanding: Convex Environment Variables Are Different

1. **Traditional Node.js Apps**: Read from `.env` files at runtime using `process.env`
2. **Convex**: Environment variables are stored in the Convex cloud deployment, NOT in local `.env` files

## Current Setup Analysis

### 1. Local .env Files Found

- `/apps/liminal-api/.env.local` - Contains Clerk auth keys and Convex deployment info
- `/apps/web/.env.local` - Contains Next.js frontend environment variables
- `/.env` - Root level file with GEMINI_API_KEY (likely unused)
- `/apps/domain/.env` - Old NestJS app with all provider API keys

### 2. Convex Cloud Environment Variables

Running `npx convex env list` shows these are already set in the Convex deployment:

```
ANTHROPIC_API_KEY=sk-ant-api03...
CLERK_ISSUER_URL=https://deep-shrew-9.clerk.accounts.dev
DEV_AUTH_DEFAULT=true
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
OPENAI_API_KEY=sk-proj...
OPENROUTER_API_KEY=sk-or-v1...
PERPLEXITY_API_KEY=pplx-TK1r3a4L...
VERCEL_API_KEY=v1:cfya1ry8I0Ri1jwv...
```

### 3. How Convex Uses Environment Variables

- **In Convex Functions**: Access via `process.env.VARIABLE_NAME`
- **Example**: `apps/liminal-api/convex/ai/providers.ts` line 58:
  ```typescript
  return process.env[config.keyName];
  ```
- **Auth Config**: `apps/liminal-api/convex/auth.config.ts` uses `process.env.CLERK_ISSUER_URL`

## The Confusion Explained

1. **No .env file in Convex directory**: This is CORRECT. Convex doesn't read from local .env files for runtime variables.

2. **`.env.local` exists but contains different variables**: This file contains:

   - Clerk keys (for local development with Next.js)
   - Convex deployment info (used by Convex CLI)
   - NOT the AI provider API keys

3. **API keys work anyway**: Because they're already set in the Convex cloud deployment

## Setting Up Environment Variables Correctly

### For Development

1. **Set variables in Convex cloud** (already done):

   ```bash
   npx convex env set OPENAI_API_KEY "your-key"
   npx convex env set ANTHROPIC_API_KEY "your-key"
   # etc...
   ```

2. **View current variables**:
   ```bash
   npx convex env list
   ```

### For Production

1. **Use the --prod flag**:
   ```bash
   npx convex env set --prod OPENAI_API_KEY "production-key"
   ```

### Important Notes

1. **Security**: Never commit API keys to Git. The current `.env` files with keys should be in `.gitignore`.

2. **Local vs Cloud**:

   - `.env.local` = Used by Next.js and Convex CLI
   - Convex cloud env vars = Used by Convex functions at runtime

3. **Migration from Domain App**: The API keys from `/apps/domain/.env` have already been migrated to Convex cloud.

## Recommended Actions

1. **Add to .gitignore** (if not already):

   ```
   apps/domain/.env
   apps/liminal-api/.env.local
   apps/web/.env.local
   .env
   ```

2. **Create .env.example files** for documentation:

   ```bash
   # apps/liminal-api/.env.local.example
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   CONVEX_DEPLOYMENT=
   ```

3. **Document required environment variables**:
   - Create a list of all required API keys
   - Note which are for dev vs prod
   - Include setup instructions

## Verification

To verify environment variables are working:

1. **Check in Convex dashboard**:

   ```bash
   npx convex dashboard
   ```

   Navigate to Settings → Environment Variables

2. **Test in code**:

   ```typescript
   // In any Convex function
   console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
   ```

3. **Run the chat endpoints** to ensure AI providers work correctly.

## Summary

The "missing .env file" is not actually missing - Convex uses a different approach where environment variables are stored in the cloud deployment, not in local files. This provides better security and deployment consistency but can be confusing when migrating from traditional Node.js applications.
