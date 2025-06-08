# Story 2: Edge API Endpoint

## Overview
Implement Edge service that exposes client-facing API and calls Domain service for LLM operations.

## Story Details
- **Priority**: High
- **Effort**: 3 points
- **Dependencies**: Contracts finalized (can be developed parallel to Story 1)
- **Estimated Time**: 4-6 hours

## Acceptance Criteria
- [ ] Edge service starts on port 8765
- [ ] Health endpoint returns status with timestamp at `/api/v1/health`
- [ ] Health endpoint checks Domain connectivity
- [ ] LLM prompt endpoint validates requests at `/api/v1/llm/prompt`
- [ ] Bypass auth logs appropriately
- [ ] Transforms between Edge/Domain formats (snake_case ↔ camelCase)
- [ ] Returns proper error responses per error codes
- [ ] Unit tests achieve 75% coverage

## Implementation Requirements

### 1. Project Structure
```
edge-server/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Server entry point
│   ├── routes/
│   │   ├── health.ts            # Health check with Domain check
│   │   └── llm.ts               # LLM prompt endpoint
│   ├── clients/
│   │   └── domain-client.ts     # HTTP client for Domain
│   ├── validators/
│   │   └── llm-validators.ts    # Request validators
│   └── middleware/
│       └── error-handler.ts      # Global error handling
├── tests/
│   ├── routes/
│   │   ├── health.test.ts
│   │   └── llm.test.ts
│   ├── clients/
│   │   └── domain-client.test.ts
│   └── validators/
│       └── llm-validators.test.ts
├── package.json
├── tsconfig.json
└── jest.config.js
```

### 2. Key Components

#### Domain Client
- HTTP client using fetch API
- Handles Domain service communication
- Proper error handling for connection failures
- Configurable base URL (default: http://localhost:8766)

#### Request Validation
- Uses AJV with compiled validators
- Validates against LLMPromptRequest schema
- Returns detailed validation errors

#### Response Transformation
- Transform Domain camelCase to Edge snake_case
- `promptTokens` → `prompt_tokens`
- `completionTokens` → `completion_tokens`

#### Error Handling
- Map Domain errors to Edge error codes
- Handle connection refused → SERVICE_UNAVAILABLE
- Validation errors → detailed error responses

### 3. Testing Requirements
- Mock Domain client for unit tests
- Test health check with/without Domain
- Test request validation edge cases
- Test response transformation
- Test error scenarios
- Integration tests with real HTTP calls

## Success Metrics
- All tests passing with 75% coverage
- Service starts without errors
- Health check includes Domain status
- Proper error responses for all scenarios
- Response transformation working correctly

## Notes
- Edge knows nothing about LLM implementation details
- All LLM logic stays in Domain
- Edge is responsible for client-facing concerns
- Auth is bypassed but logged
- This establishes the Edge/Domain communication pattern

## Definition of Done
- [ ] All code implemented according to specifications
- [ ] TypeScript compiles without errors (`npm run lint`)
- [ ] All tests pass (`npm test`)
- [ ] Test coverage meets 75% threshold (`npm run test:coverage`)
- [ ] Service starts and runs without errors (`npm start`)
- [ ] Health endpoint includes Domain connectivity check
- [ ] LLM prompt endpoint validates and transforms correctly
- [ ] Error responses follow standard format
- [ ] Manual integration testing with Domain service
- [ ] Execution log updated with implementation notes
- [ ] Auth bypass is logged appropriately
- [ ] Response transformation working (camelCase → snake_case)