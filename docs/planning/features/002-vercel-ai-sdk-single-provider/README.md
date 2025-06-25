# Feature 002: Vercel AI SDK & Single Provider Setup

## Quick Start

```bash
# 1. Install dependencies
cd apps/liminal-api
npm install ai @openrouter/ai-sdk-provider

# 2. Set environment variable in Convex dashboard
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# 3. Deploy and test
npx convex deploy
npx convex dashboard  # Test simpleChat function

# 4. CLI integration
cd apps/cli
npm run dev chat --provider=convex
```

## File Structure

```
docs/planning/features/002-vercel-ai-sdk-single-provider/
├── README.md           # This file
├── feature.md          # Complete feature overview  
├── story-1.md          # Single Provider Setup & Test
└── story-2.md          # Core Chat Endpoint
```

## Implementation Order

1. **Story 1**: Prove basic Vercel AI SDK + OpenRouter integration works
2. **Story 2**: Add streaming and CLI integration

## Key Simplifications

**Before (NestJS)**: 200+ lines of custom OpenRouter provider
**After (Convex + Vercel)**: <20 lines using official patterns

## Success Definition

✅ CLI command `liminal chat --provider=convex` works with streaming responses via OpenRouter

This replaces the complex NestJS domain service with a simple Convex HTTP action. 