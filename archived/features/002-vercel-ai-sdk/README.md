# Feature 002: Vercel AI SDK Integration

This feature replaces the Echo Provider with real LLM providers using the Vercel AI SDK.

## What This Adds
- Real AI responses from OpenAI, Anthropic, and Google
- Easy provider switching via configuration
- Unified interface for multiple LLM providers
- Accurate token usage tracking

## What Stays the Same
- API endpoints and contracts (no breaking changes)
- No streaming (still request/response)
- Echo provider remains for testing
- Domain/Edge architecture unchanged

## Key Benefits
- One SDK for multiple providers
- Excellent TypeScript support
- Future-ready for streaming
- Battle-tested in production

## Stories
1. **Story 1**: Vercel SDK setup + OpenAI provider
2. **Story 2**: Anthropic provider
3. **Story 3**: Provider selection & error handling
4. **Story 4**: Testing & documentation

## Configuration
```bash
# .env file
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEFAULT_PROVIDER=openai
```

## No Authentication Required
Like Feature 001, this runs without authentication for easy development.