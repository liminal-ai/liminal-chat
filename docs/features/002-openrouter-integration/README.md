# Feature 002: OpenRouter Integration

## Overview
This feature replaces the Vercel AI SDK with direct OpenRouter API integration, providing access to 200+ LLM models while following strict TDD practices with cross-tier testing.

## Stories

### [Story 1: Basic OpenRouter Provider](./story-1/story.md)
- **Goal**: Replace Vercel AI SDK with direct HTTP implementation
- **Scope**: Domain tier provider implementation  
- **Testing**: E2E mocked, integration, and unit tests
- **Effort**: 1-2 days

### [Story 2: SSE Streaming Implementation](./story-2/story.md)
- **Goal**: Add streaming support across all tiers
- **Scope**: Domain streaming, Edge proxy, CLI display
- **Testing**: Full tier streaming tests
- **Effort**: 2-3 days

### [Story 3: Model Selection & Configuration](./story-3/story.md)
- **Goal**: Enable model selection from CLI
- **Scope**: CLI flags, config, validation
- **Testing**: Config precedence and validation
- **Effort**: 1-2 days

### [Story 4: Resilience & Error Handling](./story-4/story.md)
- **Goal**: Production-ready error handling
- **Scope**: Retries, timeouts, user messages
- **Testing**: Error scenarios across tiers
- **Effort**: 2-3 days

## Implementation Approach

### TDD Process (Per Story)
1. **Red**: Write failing cross-tier tests first
2. **Green**: Implement minimal code to pass
3. **Refactor**: Improve design with safety net

### Testing Strategy
Each story includes:
- **E2E Tests**: Full CLI → Edge → Domain → OpenRouter flow
- **Integration Tests**: Tier boundary validation
- **Unit Tests**: Component logic verification

### Cross-Tier Validation
Every story validates behavior across all architectural tiers:
```
CLI (input validation) → 
Edge (routing/auth) → 
Domain (business logic) → 
OpenRouter (external API)
```

## Quick Start

### For Developers
1. Read the [feature overview](./feature.md)
2. Pick a story (start with Story 1)
3. Write tests first (see story's test specs)
4. Implement until tests pass
5. Refactor and document

### Story Dependencies
```
Story 1 (Basic Provider) 
    ↓
Story 2 (Streaming) 
    ↓
Story 3 (Model Selection)
    ↓
Story 4 (Resilience)
```

## Success Metrics
- **Test Coverage**: 90% per story
- **No Regressions**: All existing tests pass
- **Performance**: <100ms overhead
- **Reliability**: 99.9% success rate with retries

## Architecture Benefits
- **Direct Control**: No SDK abstraction layer
- **Multi-Model**: Access to 200+ models
- **Cost Efficient**: OpenRouter pricing
- **Future Ready**: Clean interfaces for expansion