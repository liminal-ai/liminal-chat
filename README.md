# Liminal Chat

Open-source AI chat platform with bring-your-own-key (BYOK) support and AI Roundtable conversations.

## Architecture

```
CLI → Convex (Backend) + Vercel AI SDK (LLM Integration) → Multiple AI Providers
```

## Current Status

### Working
- Convex backend with Clerk authentication
- 6 AI provider integrations (OpenAI, Anthropic, Google, Perplexity, Vercel, OpenRouter)
- Streaming and non-streaming chat endpoints
- Conversation and message persistence
- 11/11 integration tests passing

### In Progress
- Migrating from NestJS/ArangoDB to Convex + Vercel AI SDK
- Frontend and CLI temporarily removed for rebuild

## Quick Start

```bash
# Install dependencies
pnpm install

# Start Convex backend
pnpm --filter liminal-api dev

# Run tests
pnpm test:integration

# Lint
pnpm lint
```

## Project Structure

```
liminal-chat/
├── apps/
│   └── liminal-api/        # Convex backend
├── docs/                   # Documentation
├── scripts/               # Development scripts
└── agent-management/      # AI agent docs
```

## Environment Setup

Set these in Convex cloud (not .env files):
```bash
npx convex env set OPENAI_API_KEY "your-key"
npx convex env set ANTHROPIC_API_KEY "your-key"
# ... other provider keys
```

See `development-log.md` for detailed setup and progress.