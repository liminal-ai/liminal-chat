# Liminal Chat Integration Tests

This directory contains integration tests for the Convex backend using Playwright.

## Overview

The test suite focuses on wide integration coverage with minimal maintenance burden:

- No mocks - real API calls to actual providers
- Low-cost models to minimize expenses
- Fast execution (< 30 seconds for smoke tests)
- User journey focused rather than implementation details

## Test Structure

- `smoke-test.spec.ts` - Basic connectivity and health checks
- `providers.spec.ts` - Multi-provider integration validation
- `streaming.spec.ts` - Vercel AI SDK streaming functionality
- `critical-path.spec.ts` - End-to-end user flows

## Running Tests

```bash
# Install dependencies (from project root)
pnpm install

# Run all integration tests
pnpm test:integration

# Run smoke tests only (fast)
pnpm test:smoke

# Run specific provider tests
pnpm test:providers

# Interactive UI mode
pnpm test:integration:ui
```

## Configuration

### Required Environment Variables

At minimum, you need:

- `OPENROUTER_API_KEY` - Primary provider for tests

Optional (tests will skip if not present):

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `PERPLEXITY_API_KEY`
- `VERCEL_API_KEY`

### Test Models

Tests use the cheapest available models:

- OpenAI: `gpt-4o-mini` (default)
- Anthropic: `claude-3-haiku-20240307` (overrides expensive default)
- Google: `gemini-2.0-flash-exp` (default)
- Perplexity: `llama-3.1-sonar-small-128k-online` (overrides sonar-pro)
- OpenRouter: `google/gemini-2.5-flash` (default)

## Cost Estimate

With ~12 tests running 50 times/day in CI:

- Average tokens per test: ~200
- Monthly cost: ~$2-5 using cheapest models

## CI/CD Integration

See `ci-example.yml` for GitHub Actions setup. Key points:

- Smoke tests run on every PR
- Full integration suite runs on merge to main
- Uses Convex test deployment URL
- Requires API keys in GitHub secrets

## Writing New Tests

Follow these patterns:

1. Use test utilities from `test-utils/`
2. Check for API keys with `hasApiKey()`
3. Use minimal prompts from `TEST_PROMPTS`
4. Focus on behavior, not implementation
5. Keep tests fast and independent
