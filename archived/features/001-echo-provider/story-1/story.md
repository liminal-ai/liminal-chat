# Story 1: Domain Echo Provider

## Overview
Implement the Domain service with echo provider that accepts prompts and returns echo responses with mock token counts.

## Story Details
- **Priority**: High
- **Effort**: 3 points
- **Dependencies**: Contracts finalized
- **Estimated Time**: 4-6 hours

## Acceptance Criteria
- [ ] Domain service starts on port 8766
- [ ] Health endpoint returns `{"status": "healthy"}`
- [ ] LLM prompt endpoint accepts POST requests at `/domain/llm/prompt`
- [ ] Echo provider returns "Echo: {prompt}" format
- [ ] Token usage calculated (4 chars ≈ 1 token)
- [ ] Unit tests achieve 90% coverage
- [ ] Service can run standalone

## Implementation Requirements

### 1. Project Structure
```
domain-server/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Server entry point
│   ├── routes/
│   │   ├── health.ts            # Health check endpoint
│   │   └── llm.ts               # LLM endpoints
│   ├── services/
│   │   └── llm/
│   │       ├── llm-service.ts   # LLM service orchestrator
│   │       └── types.ts         # Shared types
│   └── providers/
│       └── llm/
│           ├── echo-provider.ts  # Echo implementation
│           └── types.ts          # Provider interface
├── tests/
│   ├── providers/
│   │   └── llm/
│   │       └── echo-provider.test.ts
│   ├── services/
│   │   └── llm/
│   │       └── llm-service.test.ts
│   └── routes/
│       ├── health.test.ts
│       └── llm.test.ts
├── package.json
├── tsconfig.json
└── jest.config.js
```

### 2. Key Interfaces
- `LLMProvider` interface with `prompt(text: string)` method
- `LLMProviderResponse` with content, model, and usage
- `LLMPromptRequest` matching the schema
- `LLMPromptResponse` matching the schema

### 3. Testing Requirements
- Unit tests for EchoProvider
- Unit tests for LLMService
- Integration test for health endpoint
- Integration test for prompt endpoint
- Contract validation tests against JSON schemas

## Success Metrics
- All tests passing with 90% coverage
- Service starts without errors
- Health check responds in < 10ms
- Echo responses in < 50ms
- Proper error handling for edge cases

## Notes
- This is a standalone service - no dependencies on Edge
- Echo provider is the foundation for future LLM providers
- Focus on clean architecture and testability
- Establish patterns for all future Domain services

## Definition of Done
- [ ] All code implemented according to specifications
- [ ] TypeScript compiles without errors (`npm run lint`)
- [ ] All tests pass (`npm test`)
- [ ] Test coverage meets 90% threshold (`npm run test:coverage`)
- [ ] Service starts and runs without errors (`npm start`)
- [ ] Health endpoint responds correctly
- [ ] LLM prompt endpoint works as expected
- [ ] Manual testing completed and documented
- [ ] Execution log updated with implementation notes
- [ ] Code follows project conventions and patterns
- [ ] No console errors or warnings during operation