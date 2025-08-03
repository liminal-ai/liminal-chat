# Local Dev Service

A Fastify-based local development service that provides JWT tokens for authentication during development.

## Features

- High-performance Fastify server
- Localhost-only security (only accessible from 127.0.0.1)
- JWT token generation using WorkOS password authentication
- Token caching for 50 minutes
- PM2 process management

## Setup

1. Copy the example env file:
```bash
cp .env.example .env
```

2. Configure environment variables in `.env`:
```env
# WorkOS Configuration
WORKOS_CLIENT_ID=your_workos_client_id
WORKOS_API_KEY=your_workos_api_key

# Development User Credentials
# This should be a real user created in WorkOS for development
DEV_USER_EMAIL=dev@example.com
DEV_USER_PASSWORD=your_dev_password
```

3. Start the service:
```bash
npm run dev:start
```

## Endpoints

### Health Check
```bash
curl http://127.0.0.1:8081/health
```

### Get Auth Token
```bash
curl -X POST http://127.0.0.1:8081/auth/token
```

Returns:
```json
{
  "token": "eyJ...",
  "expiresAt": 1234567890000,
  "email": "dev@example.com"
}
```

## PM2 Commands

- `npm run dev:start` - Start the service in background
- `npm run dev:stop` - Stop the service
- `npm run dev:restart` - Restart the service
- `npm run dev:logs` - View recent logs

## Development

- `npm run dev` - Run in watch mode (foreground)
- `npm run typecheck` - Check TypeScript types

## Security

- Service only accepts connections from localhost (127.0.0.1)
- Additional IP check on `/auth/token` endpoint
- No external access possible