# Domain Server

Liminal Chat Domain Server - NestJS-based backend handling LLM provider integrations and business logic.

## Description

Built with [Nest](https://github.com/nestjs/nest) framework, this server provides LLM provider abstractions and streaming capabilities for Liminal Chat.

## Project setup

```bash
pnpm install
```

## Compile and run the project

```bash
# development
pnpm dev

# watch mode
pnpm start:dev

# production mode
pnpm start:prod
```

## Run tests

```bash
# unit tests
pnpm test

# e2e tests
pnpm test:e2e

# test coverage
pnpm test:cov
```

## Features

- **LLM Provider Abstractions**: Support for OpenRouter, OpenAI, and custom providers
- **Streaming Support**: Server-Sent Events (SSE) for real-time AI responses
- **Error Handling**: Comprehensive error mapping and retry logic
- **Health Checks**: Provider availability monitoring
- **Type Safety**: Full TypeScript coverage with shared types

## Configuration

Create a `.env` file with your provider API keys:

```bash
# OpenRouter (recommended)
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=openai/gpt-4.1

# OpenAI (optional)
OPENAI_API_KEY=your_openai_key
```

## Architecture

- `/domain` - Main HTTP endpoints and business logic
- `/llm` - LLM service orchestration
- `/providers` - Provider implementations (OpenRouter, OpenAI, etc.)
- `/health` - System health monitoring

## API Endpoints

- `POST /domain/llm/prompt` - Standard LLM completion
- `GET /domain/llm/prompt/stream` - Streaming LLM completion
- `GET /domain/llm/providers` - List available providers
- `GET /domain/health` - Health check

See the main project README for complete documentation.
