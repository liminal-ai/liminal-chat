# Liminal Chat

A threshold between human and AI communication.

![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white)
![Test Coverage](https://img.shields.io/badge/Coverage-80%25+-brightgreen)

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

## Streaming Chat Examples

Liminal Chat supports real-time streaming responses for interactive conversations:

### CLI Streaming
```bash
# Start streaming chat with OpenRouter
pnpm cli:chat:openrouter

# Example session:
You: Write a 200 word story about space exploration
Assistant: [tokens appear incrementally in real-time]
Dr. Vega's gloved hands trembled as she pressed the ignition...
[streaming continues word by word]

Model: openai/gpt-4.1
Tokens used: 156 (prompt: 16, completion: 140)
```

### Streaming API
The Edge server provides SSE (Server-Sent Events) streaming:

```bash
# Streaming endpoint
POST /api/v1/llm/prompt/stream

# SSE Response Format:
event: content
data: {"type":"content","data":"Hello","eventId":"or-1234-abc"}

event: usage  
data: {"type":"usage","data":{"totalTokens":15},"eventId":"or-1234-def"}

event: done
data: {"type":"done","eventId":"or-1234-ghi"}
```

### Performance Characteristics
- **First token latency**: ≤ 500ms
- **Inter-chunk latency**: ≤ 100ms  
- **Reconnection time**: ≤ 2s (automatic with exponential backoff)
- **Memory usage**: ≤ 10MB for 10k token streams

### Interruption and Reconnection
```bash
# During streaming:
# - Press Ctrl+C to interrupt
# - CLI automatically reconnects with exponential backoff
# - Streams resume from last received event ID
```

## Development

- Uses pnpm workspaces for monorepo management
- TypeScript throughout
- TDD approach with comprehensive testing
- AI-assisted development patterns

See `docs/guides/` for detailed development practices.