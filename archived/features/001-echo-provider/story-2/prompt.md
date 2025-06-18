# Story 2 Implementation Prompt

## Context
You are implementing Story 2 of the Echo Provider feature for Liminal Type Chat. This is the Edge service implementation that provides the client-facing API and communicates with the Domain service.

## ! Thinking Tokens
You should use 6k thinking tokens for this task to properly implement the Edge service with proper validation and error handling.

## Task
Implement the Edge API service according to the specifications in the story and design documents. You should use multiple specialized agents to implement different aspects of the service.

## Documents to Review
1. **Contracts**: `/documentation/new-plan/features/001-echo-provider/contracts.md` - Contains all API contracts and schemas
2. **Feature**: `/documentation/new-plan/features/001-echo-provider/feature.md` - Overall feature context
3. **Design**: `/documentation/new-plan/features/001-echo-provider/design.md` - Detailed design specifications
4. **Story**: `/documentation/new-plan/features/001-echo-provider/story-2/story.md` - Specific requirements for this story
5. **Architecture**: `/documentation/architecture/decisions.md` - Key architectural decisions
6. **Error Codes**: `/server/src/utils/error-codes.ts` - Standard error codes to use

## Implementation Approach

### Agent Strategy
You should use 3-4 specialized agents:
1. **Setup Agent**: Create project structure, package.json, TypeScript config
2. **Implementation Agent**: Implement domain client, validators, and routes
3. **Test Agent**: Write comprehensive unit and integration tests
4. **Integration Agent**: Ensure everything works together, run tests, check coverage

### Key Requirements
1. Edge service runs on port 8765
2. Implements health endpoint at `/api/v1/health` with timestamp
3. Health check verifies Domain connectivity
4. Implements LLM prompt endpoint at `/api/v1/llm/prompt`
5. Validates requests using AJV against schemas
6. Transforms responses (camelCase → snake_case)
7. Auth bypass with explicit logging
8. 75% test coverage requirement

### Implementation Order
1. Set up project structure and dependencies
2. Create validators from JSON schemas
3. Implement Domain client
4. Create Express routes (health and llm)
5. Add error handling middleware
6. Write comprehensive tests
7. Verify coverage meets 75% threshold

## Execution Notes

Please output execution notes in the following format throughout the implementation:

```markdown
## Execution Log - Story 2: Edge API Endpoint

### Agent Assignments
- Agent 1 (Setup): [specific tasks]
- Agent 2 (Implementation): [specific tasks]
- Agent 3 (Test): [specific tasks]
- Agent 4 (Integration): [specific tasks]

### Implementation Progress
- [ ] Project setup complete
- [ ] JSON schemas copied
- [ ] Validators implemented
- [ ] Domain client implemented
- [ ] Routes implemented
- [ ] Error handling added
- [ ] Tests written
- [ ] Coverage verified (target: 75%)

### Key Decisions Made
- [Document any implementation decisions]

### Issues Encountered
- [Document any challenges and solutions]

### Final Status
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Coverage: X%
- [ ] Service runs on port 8765
- [ ] Can communicate with Domain on 8766
- [ ] Ready for CLI integration
```

## Technical Setup

### Dependencies to Use
```json
{
  "engines": {
    "node": ">=20.0.0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "ajv": "^8.17.1",
    "ajv-formats": "^3.0.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/node": "^20.17.46",
    "typescript": "^5.1.6",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "ts-jest": "^29.1.1",
    "@types/jest": "^29.5.3",
    "supertest": "^6.3.3",
    "@types/supertest": "^2.0.12"
  }
}
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowJs": false,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "coverage"]
}
```

### Jest Configuration
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts'  // Exclude server entry point
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  }
};
```

## Important Notes
- This is a greenfield implementation - create the edge-server directory from scratch
- Edge service knows nothing about LLM implementation details
- Focus on request validation and response transformation
- Copy JSON schemas from the contracts document
- Use fetch API for HTTP calls (built into Node 20+)
- Auth is bypassed but must be logged
- Remember: Edge handles client concerns, Domain handles business logic

## Success Criteria
Your implementation is complete when all items in the Definition of Done checklist (found in story.md) are checked off:
- Code compiles and runs correctly
- All tests pass with 75%+ coverage
- Edge endpoints work as specified
- Domain integration is verified
- Execution log is updated

## Definition of Done Checklist
Review `/documentation/new-plan/features/001-echo-provider/story-2/story.md` for the complete Definition of Done checklist. Ensure you:
1. Check off each item as you complete it
2. Update the execution log as part of the checklist
3. Test integration with the Domain service
4. Verify all items are complete before considering the story done

Begin by reviewing the documents listed above, then proceed with the multi-agent implementation. Good luck!