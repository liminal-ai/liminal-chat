# Convex HTTP Endpoints Documentation

## Important: Domain Distinction

Convex uses different domains for different types of access:

- **WebSocket/Query/Mutation API**: `https://<deployment-name>.convex.cloud`
- **HTTP Actions/Endpoints**: `https://<deployment-name>.convex.site`

## Available HTTP Endpoints

All HTTP endpoints are available at: `{BASE_URL}`

Replace `{BASE_URL}` with your Convex HTTP endpoint URL (format: `https://<deployment-name>.convex.site`)

### 1. Health Check

```bash
GET /health
```

Returns database connectivity status and basic health information.

Example:

```bash
curl {BASE_URL}/health
```

### 2. Test Endpoint

```bash
GET /test
```

Returns authentication status and basic test information.

Example:

```bash
# Without authentication
curl {BASE_URL}/test

# With authentication (replace YOUR_JWT with actual Clerk JWT token)
curl -H 'Authorization: Bearer YOUR_JWT' {BASE_URL}/test
```

### 3. Clerk Webhook

```bash
POST /clerk-webhook
```

Webhook endpoint for Clerk authentication events. This is used internally by Clerk.

## Testing

Use the provided test script:

```bash
./test-endpoints.sh
```

## Common Issues

1. **404 Not Found**: Make sure you're using `.convex.site` domain, NOT `.convex.cloud`
2. **Deployment not found**: Ensure `npx convex dev` is running for development
3. **Changes not reflected**: The Convex dev server should auto-deploy changes, but you can force it with `npx convex dev --once`

## Environment Variables

The following environment variables are configured:

- `CONVEX_URL`: The WebSocket/Query/Mutation API URL (`.convex.cloud`)
- `CONVEX_HTTP_URL`: The HTTP Actions URL (`.convex.site`)
