# Liminal Chat

AI consultation platform providing unified access to multiple language models.

## Overview

Liminal Chat integrates OpenAI, Anthropic, Perplexity, and Vercel AI services through a Convex-powered backend with React frontends. The platform supports both synchronous and asynchronous AI consultations.

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   React Apps    │────▶│    Convex    │────▶│   AI Services   │
│   (Vite/Next)   │     │   Backend    │     │   (Multiple)    │
└─────────────────┘     └──────────────┘     └─────────────────┘
         │                      │                      │
         │                      │                      │
    WebSocket            Real-time DB           HTTP/Streaming
    (Live sync)          (Reactive)             (AI responses)
```

### Core Components

- **Frontend Applications**: React (Vite) for chat interface, Next.js for future web app
- **Backend**: Convex serverless functions with real-time database
- **Authentication**: Dual-mode system (local development / WorkOS production)
- **AI Integration**: Multi-provider consultation endpoints with streaming support
- **Local Services**: Development server for AI consultations and auth tokens

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8.15.9
- Redis (for async operations)
- Convex account

### Installation

```bash
# Clone repository
git clone https://github.com/liminal-ai/liminal-chat.git
cd liminal-chat

# Install dependencies
pnpm install

# Configure environment variables
cp apps/liminal-api/.env.example apps/liminal-api/.env
cp apps/local-dev-service/.env.example apps/local-dev-service/.env
```

### Development

```bash
# Start all services (Convex + frontend)
pnpm dev

# Or start services individually
pnpm convex:start  # Convex backend
pnpm web:start     # Frontend app
```

The application runs at:
- Frontend: http://localhost:5173
- Convex Dashboard: https://dashboard.convex.dev
- Local Dev Service: http://127.0.0.1:8081

## Project Structure

```
liminal-chat/
├── apps/
│   ├── chat/               # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/ # UI components
│   │   │   ├── lib/        # Utilities and hooks
│   │   │   └── pages/      # Demo pages
│   │   └── vite.config.ts
│   │
│   ├── liminal-api/        # Convex backend
│   │   ├── convex/
│   │   │   ├── db/         # Database operations
│   │   │   ├── edge/       # Edge runtime functions
│   │   │   ├── node/       # Node runtime functions
│   │   │   └── http.ts     # HTTP endpoints
│   │   └── tests/          # Playwright integration tests
│   │
│   ├── local-dev-service/  # Development utilities
│   │   └── src/
│   │       ├── server.ts   # Fastify server
│   │       └── auth.js     # Auth token generation
│   │
│   └── web/                # Next.js app (future)
│
├── docs/                   # Documentation
│   ├── engineering-practices.md
│   └── cicd-impl/         # CI/CD documentation
│
└── .github/workflows/      # GitHub Actions
```

## Features

### AI Model Support

| Provider | Models | Endpoint | Use Case |
|----------|--------|----------|----------|
| OpenAI | GPT-4.1, GPT-4.1-mini, GPT-4.1-nano, o3-pro | `/consult/gpt/*` | General purpose, reasoning |
| Anthropic | Claude models | Via Convex | Conversational AI |
| Perplexity | Sonar Pro, Deep Research | `/consult/perplexity/*` | Web search, research |
| Vercel | v0 | `/consult/v0` | UI/UX generation |

### Authentication Modes

**Development Mode** (`VITE_AUTH_MODE=dev`)
- Local auth server generates JWT tokens
- System user for testing
- No external dependencies

**Production Mode** (`VITE_AUTH_MODE=workos`)
- WorkOS AuthKit integration
- Enterprise SSO support
- Session management

### Real-time Capabilities

- Live message streaming
- Cross-tab synchronization
- Reactive database updates
- WebSocket connections

## API Documentation

### Consultation Endpoints

```bash
# GPT-4.1 consultation
curl -X POST http://127.0.0.1:8081/consult/gpt/4.1 \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Your question here"}'

# Perplexity research
curl -X POST http://127.0.0.1:8081/consult/perplexity/sonar-pro \
  -H "Content-Type: application/json" \
  -d '{"query": "Research topic"}'

# Async o3-pro (returns ID immediately)
curl -X POST http://127.0.0.1:8081/consult/o3-pro \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Complex reasoning task"}'
```

### Convex Functions

Access via Convex Dashboard or CLI:

```bash
# Run a query
npx convex run api.db.messages.list

# Execute a mutation
npx convex run api.db.messages.create

# Check function logs
npx convex logs
```

## Testing

### Test Suites

```bash
# All tests
pnpm test

# Integration tests with UI
pnpm test:integration:ui

# Specific test suites
pnpm --filter @liminal/api test:auth
pnpm --filter @liminal/api test:agents
pnpm --filter @liminal/api test:smoke
```

### Test Coverage

- Authentication flows
- Agent management
- Conversation persistence
- GPT consultation endpoints
- Local development auth

## Development Workflow

### Code Quality

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Formatting
pnpm format:fix
```

### Pre-commit Security

The project includes comprehensive security scanning:

```bash
# Run security checks
pnpm precommit:trufflehog    # Secret scanning
pnpm precommit:api-keys      # API key detection
pnpm precommit:sensitive-files # Sensitive file detection
```

### Commit Process

```bash
# Automated commit preparation
/commitprep  # Runs all checks, formats code, validates

# After review
git commit -m "feat: your message"
git push
```

## CI/CD Pipeline

### GitHub Actions Workflows

- **backend-ci.yml**: Backend testing and validation
- **security-review-pr.yml**: PR security scanning (trigger with `/security-scan`)
- **claude-code-review.yml**: AI-powered code review
- **Deployment**: Automatic Vercel deployment on main branch

### Security Features

- TruffleHog secret scanning
- Custom API key detection
- Dependency vulnerability checks
- AI-powered security review

## Environment Variables

### Required for Development

```bash
# apps/liminal-api/.env
OPENAI_API_KEY=sk-proj-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
WORKOS_CLIENT_ID=client_xxx
WORKOS_API_KEY=sk_test_xxx

# apps/local-dev-service/.env
SYSTEM_USER_EMAIL=system@liminal-chat.local
SYSTEM_USER_PASSWORD=secure-password
PERPLEXITY_API_KEY=pplx-xxx
VERCEL_API_TOKEN=xxx  # Optional
```

### Production Deployment

Set via Convex Dashboard:
```bash
npx convex env set OPENAI_API_KEY "your-key"
npx convex env set ANTHROPIC_API_KEY "your-key"
npx convex env set WORKOS_CLIENT_ID "your-id"
npx convex env set WORKOS_API_KEY "your-key"
```

## Deployment

### Vercel (Frontend)

Automatic deployment on push to main branch. Manual deployment:

```bash
cd apps/chat
vercel --prod
```

### Convex (Backend)

```bash
# Development
npx convex dev

# Production
npx convex deploy --prod
```

## Monitoring

### Logs

```bash
# Convex function logs
pnpm convex:logs

# Local dev service logs
pnpm --filter local-dev-service dev:logs

# PM2 process status
pnpm --filter local-dev-service dev:status
```

### Dashboard Access

- Convex: https://dashboard.convex.dev
- Vercel: https://vercel.com/dashboard

## Contributing

1. Fork the repository
2. Create a feature branch from `main`
3. Make changes following engineering practices (see `docs/engineering-practices.md`)
4. Run `/commitprep` before committing
5. Submit PR

### Development Guidelines

- Follow TypeScript strict mode
- Use Convex patterns for backend functions
- Implement proper error handling
- Add tests for new features
- Document API changes

## Troubleshooting

### Common Issues

**Port conflicts**
```bash
# Stop services
pnpm dev:stop
# Restart
pnpm dev:start
```

**Redis connection errors**
```bash
# macOS
brew services start redis
# Linux
sudo systemctl start redis
```

**Type errors after schema changes**
```bash
# Restart TypeScript server in your IDE
# Or restart Convex dev server
pnpm convex:restart
```

**Authentication issues**
- Check `VITE_AUTH_MODE` in `apps/chat/.env`
- Verify WorkOS credentials if using production mode
- Ensure local dev service is running for dev mode

## License

Private repository. All rights reserved.

## Support

- Internal documentation: `/docs` directory
- GitHub Issues: [Report issues](https://github.com/liminal-ai/liminal-chat/issues)
- Convex Discord: [Community support](https://convex.dev/community)