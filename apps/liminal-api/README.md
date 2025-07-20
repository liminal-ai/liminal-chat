# Liminal API - Convex Backend

This is the Convex backend for Liminal Chat, providing real-time data synchronization, authentication with WorkOS, and HTTP endpoints for integration with Vercel AI SDK.

**CI/CD Status**: Phase 1 complete with staging deployment configured.

## Architecture Overview

- **Database**: Convex real-time database with TypeScript schema validation
- **Authentication**: WorkOS integration for user management
- **HTTP Actions**: Node.js runtime endpoints for AI SDK integration
- **Real-time**: WebSocket-based real-time updates

## Prerequisites

- Node.js 18+ (for Node.js runtime in HTTP actions)
- npm or pnpm
- WorkOS account for authentication
- Convex account

## Getting Started

### 1. Install Dependencies

From the project root:

```bash
cd apps/liminal-api
npm install
# or
pnpm install
```

### 2. Set Up Convex

Initialize Convex in your project:

```bash
npx convex dev
```

This will:

- Create a new Convex project (if not already created)
- Generate TypeScript types
- Start the development server
- Deploy your functions to the cloud

Your Convex deployment URL will be displayed, e.g., `https://modest-squirrel-498.convex.cloud`

### 3. Set Up WorkOS Authentication

1. Create a WorkOS application at [workos.com](https://workos.com)
2. In WorkOS Dashboard, configure your application
3. Set up SSO/OIDC configuration with:
   - Redirect URIs for your application
   - Required scopes and claims
4. Copy your WorkOS Client ID and API Key

### 4. Configure Convex Authentication

1. In the Convex dashboard, go to **Settings** → **Environment Variables**
2. Add the following:

   ```
   WORKOS_CLIENT_ID=client_your_workos_client_id
   WORKOS_API_KEY=sk_live_your_workos_api_key
   ```

3. Deploy the auth configuration:
   ```bash
   npx convex deploy
   ```

### 5. Set Up Environment Variables

Create a `.env.local` file in the liminal-api directory:

```env
# Convex deployment URL
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# WorkOS public key (from WorkOS dashboard)
NEXT_PUBLIC_WORKOS_CLIENT_ID=client_your_workos_client_id

# Optional: for local development
CONVEX_DEPLOYMENT=development
```

## Verifying the Setup

### 1. Check HTTP Endpoints

The following endpoints are available for testing:

#### Health Check

```bash
curl https://your-deployment.convex.cloud/health
```

Expected response:

```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "userCount": 0,
    "hasSampleUser": false
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Test Endpoint (Node.js Runtime Verification)

```bash
curl https://your-deployment.convex.cloud/test
```

Expected response:

```json
{
  "status": "success",
  "message": "Test endpoint working",
  "nodeRuntime": {
    "verified": true,
    "version": "v18.x.x",
    "platform": "linux",
    "randomBytes": "..."
  },
  "auth": {
    "authenticated": false,
    "tokenIdentifier": null,
    "email": null,
    "name": null
  },
  "environment": {
    "CONVEX_DEPLOYMENT": "production",
    "NODE_ENV": "production",
    "envVarsHash": "..."
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Test Authentication

With a valid WorkOS JWT token:

```bash
curl -H "Authorization: Bearer YOUR_WORKOS_JWT" https://your-deployment.convex.cloud/test
```

The response should show `authenticated: true` with user details.

### 3. Test Database Functions

Using the Convex CLI:

```bash
# Test authentication
npx convex run users:testAuth

# Get current user (requires auth)
npx convex run users:getCurrentUser

# Get user count
npx convex run users:getUserCount
```

## Available Functions

### HTTP Endpoints

- `GET /health` - Health check with database connectivity test
- `GET /test` - Comprehensive test endpoint with Node.js runtime verification
- `POST /workos-webhook` - WorkOS webhook for user synchronization (if implemented)

### Convex Functions

#### users.ts

- `getCurrentUser` - Get authenticated user profile
- `syncUser` - Create/update user from WorkOS data
- `testAuth` - Test authentication status
- `getUserCount` - Get total number of users
- `getSampleUser` - Get sanitized sample user data

## Integration with Vercel AI SDK

The HTTP actions are designed to work with Vercel AI SDK:

1. **Node.js Runtime**: The `"use node"` directive enables full Node.js APIs
2. **Environment Variables**: Access to process.env for configuration
3. **Authentication**: Integrated with WorkOS for user context
4. **Database Access**: Direct queries to Convex database

Example integration:

```typescript
// In your Vercel AI SDK route
import { ConvexHttpClient } from 'convex/browser';

const client = new ConvexHttpClient(process.env.CONVEX_URL);
const response = await fetch(`${process.env.CONVEX_URL}/test`);
```

## Development Workflow

1. Start Convex dev server:

   ```bash
   npx convex dev
   ```

2. Make changes to functions in the `convex/` directory

3. Changes are automatically deployed to your development instance

4. Test using the Convex dashboard or CLI:
   ```bash
   npx convex logs
   npx convex dashboard
   ```

## Production Deployment

1. Set production environment variables in Convex dashboard
2. Deploy to production:
   ```bash
   npx convex deploy --prod
   ```

## Troubleshooting

### Node.js Runtime Not Working

- Ensure the file starts with `"use node";`
- Check that you're importing Node.js modules correctly
- Verify in the `/test` endpoint that Node.js version is shown

### Authentication Issues

- Verify WorkOS Client ID and API Key are correctly set in Convex
- Check that WorkOS SSO/OIDC is properly configured
- Ensure Authorization header is properly formatted

### Database Queries Failing

- Check schema definitions in `schema.ts`
- Verify indexes are properly defined
- Use Convex dashboard to inspect data

## Next Steps

- Set up WorkOS webhooks for automatic user synchronization (if needed)
- Configure production environment variables
- Integrate with your frontend application
- Add custom HTTP actions for AI model interactions
