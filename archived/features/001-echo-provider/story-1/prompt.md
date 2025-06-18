# Story 1 Implementation Prompt

## Context
You are implementing Story 1 of the Echo Provider feature for Liminal Type Chat. This is a Domain service implementation that will establish patterns for all future development.

## ! Thinking Tokens
You should use 8k thinking tokens for this task to properly analyze the architecture and implement all components with tests.

## Task
Implement the Domain Echo Provider service according to the specifications in the story and design documents. You should use multiple specialized agents to implement different aspects of the service.

## Documents to Review
1. **Contracts**: `/documentation/new-plan/features/001-echo-provider/contracts.md` - Contains all API contracts and schemas
2. **Feature**: `/documentation/new-plan/features/001-echo-provider/feature.md` - Overall feature context
3. **Design**: `/documentation/new-plan/features/001-echo-provider/design.md` - Detailed design specifications
4. **Story**: `/documentation/new-plan/features/001-echo-provider/story-1/story.md` - Specific requirements for this story
5. **Architecture**: `/documentation/architecture/decisions.md` - Key architectural decisions

## Implementation Approach

### Agent Strategy
You should use 3-4 specialized agents:
1. **Setup Agent**: Create project structure, package.json, TypeScript config
2. **Implementation Agent**: Implement providers, services, and routes
3. **Test Agent**: Write comprehensive unit and integration tests
4. **Integration Agent**: Ensure everything works together, run tests, check coverage

### Key Requirements
1. Domain service runs on port 8766
2. Implements health endpoint at `/domain/health`
3. Implements LLM prompt endpoint at `/domain/llm/prompt`
4. Echo provider returns "Echo: {prompt}" format
5. Token calculation: ~4 characters = 1 token
6. 90% test coverage requirement
7. Follow the exact schema definitions from contracts.md

### Implementation Order
1. Set up project structure and dependencies
2. Create type definitions from contracts
3. Implement Echo provider
4. Implement LLM service with provider registration
5. Create Express routes (health and llm)
6. Write comprehensive tests
7. Verify coverage meets 90% threshold

## Execution Notes

Please output execution notes in the following format throughout the implementation:

```markdown
## Execution Log - Story 1: Domain Echo Provider

### Agent Assignments
- Agent 1 (Setup): [specific tasks]
- Agent 2 (Implementation): [specific tasks]
- Agent 3 (Test): [specific tasks]
- Agent 4 (Integration): [specific tasks]

### Implementation Progress
- [ ] Project setup complete
- [ ] Type definitions created
- [ ] Echo provider implemented
- [ ] LLM service implemented
- [ ] Routes implemented
- [ ] Tests written
- [ ] Coverage verified (target: 90%)

### Key Decisions Made
- [Document any implementation decisions]

### Issues Encountered
- [Document any challenges and solutions]

### Final Status
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Coverage: X%
- [ ] Service runs on port 8766
- [ ] Ready for integration
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
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

## Important Notes
- This is a greenfield implementation - create the domain-server directory from scratch
- Use Express.js 4.x for the server framework
- Use Jest 29.x for testing with ts-jest
- Follow TypeScript 5.x strict mode
- Node.js 20+ required
- Implement proper error handling
- Use the exact schema property names (camelCase for Domain)
- Remember: Domain knows nothing about Edge or authentication

## Success Criteria
Your implementation is complete when all items in the Definition of Done checklist (found in story.md) are checked off:
- Code compiles and runs correctly
- All tests pass with 90%+ coverage  
- Both endpoints work as specified
- Execution log is updated
- All patterns follow the design document

## Definition of Done Checklist
Review `/documentation/new-plan/features/001-echo-provider/story-1/story.md` for the complete Definition of Done checklist. Ensure you:
1. Check off each item as you complete it
2. Update the execution log as part of the checklist
3. Verify all items are complete before considering the story done

Begin by reviewing the documents listed above, then proceed with the multi-agent implementation. Good luck!