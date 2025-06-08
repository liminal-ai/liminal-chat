# Liminal Chat

A threshold between human and AI communication.

## Architecture

This monorepo contains three main applications:

- **apps/cli**: Command-line interface for chatting with AI providers
- **apps/domain**: NestJS server handling business logic and provider integrations
- **apps/edge**: Cloudflare Workers server for edge processing and routing

## Quick Start

```bash
# Install dependencies
pnpm install

# Start all services
pnpm dev

# Or start individually:
cd apps/domain && pnpm dev    # Domain server on port 8766
cd apps/edge && pnpm dev      # Edge server (wrangler)
cd apps/cli && pnpm dev       # CLI interactive mode
```

## Project Structure

```
liminal-chat/
├── apps/
│   ├── cli/                 # CLI chat client
│   ├── domain/              # NestJS domain server
│   └── edge/                # Cloudflare Workers edge server
├── packages/
│   ├── shared-types/        # Shared TypeScript types
│   └── shared-utils/        # Shared utilities
├── docs/
│   ├── architecture/        # Architecture decisions
│   ├── features/            # Feature specifications
│   ├── guides/              # Development guides
│   └── product/             # Product documentation
└── scripts/                 # Build and deployment scripts
```

## Available AI Models

### OpenRouter Integration

Liminal Chat supports the following models through OpenRouter:

- **OpenAI GPT-4.1** (default) - 1M context window
- **OpenAI o3** - 200k context window
- **OpenAI o4 Mini** - 200k context window
- **OpenAI o4 Mini High** - 200k context window
- **Anthropic Claude Opus 4** - 200k context window
- **Anthropic Claude Sonnet 4** - 200k context window
- **Anthropic Claude 3.7 Sonnet** - 200k context window
- **Google Gemini 2.5 Pro Preview** - 1M context window
- **Google Gemini 2.5 Flash Preview** - 1M context window
- **DeepSeek R1** - 128k context window
- **DeepSeek V3** - 163k context window

To use OpenRouter:
1. Get an API key from https://openrouter.ai
2. Set `OPENROUTER_API_KEY` in `apps/domain/.env`
3. Optionally set `OPENROUTER_MODEL` to override the default (openai/gpt-4.1)

## Development

- Uses pnpm workspaces for monorepo management
- TypeScript throughout
- TDD approach with comprehensive testing
- AI-assisted development patterns

See `docs/guides/` for detailed development practices.