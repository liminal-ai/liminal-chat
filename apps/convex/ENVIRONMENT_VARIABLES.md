# Environment Variables Reference

## Required Environment Variables

These environment variables must be set in the Convex deployment using `npx convex env set`.

### AI Provider API Keys

| Variable                       | Description              | Required | Example            |
| ------------------------------ | ------------------------ | -------- | ------------------ |
| `OPENAI_API_KEY`               | OpenAI API key           | No\*     | `sk-proj-...`      |
| `ANTHROPIC_API_KEY`            | Anthropic Claude API key | No\*     | `sk-ant-api03-...` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini API key    | No\*     | `AIzaSy...`        |
| `PERPLEXITY_API_KEY`           | Perplexity API key       | No\*     | `pplx-...`         |
| `VERCEL_API_KEY`               | Vercel v0 API key        | No\*     | `v1:...`           |
| `OPENROUTER_API_KEY`           | OpenRouter API key       | Yes\*\*  | `sk-or-v1-...`     |

\* At least one provider API key is required for the chat functionality to work.
\*\* OpenRouter is the default provider and is required unless you change the default.

### Authentication

| Variable           | Description                                        | Required | Example                               |
| ------------------ | -------------------------------------------------- | -------- | ------------------------------------- |
| `CLERK_ISSUER_URL` | Clerk issuer URL for JWT verification              | Yes      | `https://your-app.clerk.accounts.dev` |
| `DEV_AUTH_DEFAULT` | Bypass auth in development (REMOVE FOR PRODUCTION) | No       | `true`                                |

## Setting Environment Variables

### For Development

```bash
# Set a single variable
npx convex env set OPENAI_API_KEY "your-api-key"

# Set multiple variables from your old .env file
npx convex env set ANTHROPIC_API_KEY "sk-ant-..."
npx convex env set GOOGLE_GENERATIVE_AI_API_KEY "AIza..."
# ... etc
```

### For Production

```bash
# Use the --prod flag
npx convex env set --prod OPENAI_API_KEY "production-api-key"

# IMPORTANT: Don't set DEV_AUTH_DEFAULT in production!
```

### Viewing Current Variables

```bash
# List all environment variables
npx convex env list

# List production variables
npx convex env list --prod
```

## Local Development Files

### `.env.local`

This file is used by the Convex CLI and Next.js for local development. It should contain:

1. **Clerk Keys** - For authentication in development
2. **Convex Deployment Info** - Automatically added by `npx convex dev`

See `.env.local.example` for the template.

### Test Token Generator

The `test-token-generator.html` file requires a Clerk publishable key to function:

1. Get your publishable key from [Clerk Dashboard](https://dashboard.clerk.com)
2. Replace `<YOUR_CLERK_PUBLISHABLE_KEY>` in the file with your actual key
3. **IMPORTANT**: Never commit the file with your actual key - always reset to placeholder before committing

The publishable key starts with `pk_` and is safe to use in client-side code, but should not be committed to source control to prevent unauthorized usage.

## Security Best Practices

1. **Never commit API keys** to Git
2. **Use different keys** for development and production
3. **Rotate keys regularly**
4. **Remove `DEV_AUTH_DEFAULT`** before deploying to production
5. **Use environment-specific keys** (dev/staging/prod)

## Troubleshooting

### "API key not found" errors

1. Check if the key is set: `npx convex env list`
2. Ensure the key name matches exactly (case-sensitive)
3. Restart the Convex dev server after setting variables

### Environment variables not updating

1. Environment variables are cached during development
2. Restart `npx convex dev` to pick up changes
3. For production, changes are immediate after `npx convex env set --prod`

### Testing environment variables

Add this to any Convex function to debug:

```typescript
console.log('Environment check:', {
  hasOpenAI: !!process.env.OPENAI_API_KEY,
  hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
  // etc...
});
```
