# Liminal Chat Edge Server

This is the Edge server for Liminal Chat, built with Cloudflare Workers and Hono. It acts as a proxy between the CLI client and the Domain server.

## Architecture

```
CLI Client → [Edge Server] → Domain Server → LLM Providers
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server (runs on http://localhost:8787)
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm typecheck
```

## Configuration

Edit `wrangler.toml` to configure:
- `DOMAIN_URL`: URL of the domain server (default: http://localhost:8766)

## Endpoints

- `GET /health` - Health check endpoint
- `POST /api/v1/llm/prompt` - Send prompt to LLM (proxies to domain)
- `GET /api/v1/llm/providers` - Get available LLM providers (proxies to domain)

## Testing

The edge server includes unit tests that mock the domain server responses. Run tests with:

```bash
pnpm test
```

## Deployment

To deploy to Cloudflare Workers:

```bash
# Deploy to production
pnpm deploy

# Deploy to specific environment
wrangler deploy --env production
```

Make sure to update the `DOMAIN_URL` in `wrangler.toml` for production deployment.