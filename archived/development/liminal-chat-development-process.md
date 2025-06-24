# Liminal Chat Development Process

## 1. Executive Summary

This document defines the AI-augmented development process for Liminal Chat, leveraging a three-way collaboration between the user (orchestrator), Augment Agent (architect/tech lead), and Claude Code (implementer). The process builds on proven practices from previous projects while adapting for our graph-based, multi-agent architecture.

## 2. Development Philosophy

### 2.1 Core Principles

1. **Contract-First Development**: Define OpenAPI contracts before implementation
2. **Walking Skeleton Approach**: Build complete vertical slices through all layers
3. **Test-Driven Development**: Tests serve as executable specifications for AI implementation
4. **AI-Augmented Collaboration**: Leverage each AI's strengths optimally
5. **Vertical Slices Over Horizontal Layers**: Complete features end-to-end rather than layer-by-layer

### 2.2 Quality Values

- **Tests as Specifications**: Primary communication between human intent and AI implementation
- **Architecture Compliance**: All code follows established patterns and principles
- **Incremental Delivery**: Working software at each milestone
- **Rapid Iteration**: 1-2 day feature cycles with AI assistance

## 3. Team Roles & Responsibilities

### 3.1 User (Project Orchestrator)
**Primary Responsibilities:**
- Feature prioritization and high-level direction
- Final decision making on architecture pivots
- Integration testing and user experience validation
- Business requirement clarification

**Workflow Involvement:**
- Initiates feature development
- Reviews and approves final implementations
- Makes go/no-go decisions on architectural changes

### 3.2 Augment Agent (Architect/Tech Lead)
**Primary Responsibilities:**
- **Planning**: Break features into detailed stories with acceptance criteria
- **Design**: Detailed technical design leveraging architecture documents
- **TDD**: Write comprehensive test suites before implementation
- **Specification**: Create detailed implementation tasks for Claude Code
- **Review**: Code review, architecture compliance, integration verification
- **Quality Gate**: Sign-off on completed work before moving to next feature

**Workflow Involvement:**
- Receives feature requests from user
- Creates implementation specifications
- Reviews Claude Code's work
- Ensures architectural consistency

### 3.3 Claude Code (Implementation Engineer)
**Primary Responsibilities:**
- Execute detailed implementation tasks provided by Augment Agent
- Write code following specifications to pass tests
- Handle mechanical coding work efficiently
- Implement to satisfy acceptance criteria

**Workflow Involvement:**
- Receives detailed specs from Augment Agent
- Implements code to pass provided tests
- Reports implementation challenges or questions

## 4. Development Workflow

### 4.1 Feature Development Cycle

```
1. User: "Let's build [feature]"
   ↓
2. Augment Agent: 
   - Break into user stories
   - Define OpenAPI contracts
   - Write TDD tests (unit + integration)
   - Create detailed implementation spec
   - Define acceptance criteria
   ↓
3. Claude Code: 
   - Implement following spec
   - Make tests pass
   - Handle edge cases
   ↓
4. Augment Agent: 
   - Review implementation
   - Verify architecture compliance
   - Check test coverage
   ↓
5. User: 
   - Integration test
   - UX validation
   - Approve or request changes
```

### 4.2 Contract-First Development Process

#### Step 1: Contract Definition
```typescript
// 1. Define OpenAPI contract
paths:
  /api/orchestration/roundtable:
    post:
      requestBody:
        $ref: '#/components/schemas/RoundtableRequest'
      responses:
        200:
          $ref: '#/components/schemas/OrchestrationSession'

// 2. Generate TypeScript types
interface RoundtableRequest {
  prompt: string;
  agentIds: string[];
  artifactId?: string;
}
```

#### Step 2: Walking Skeleton Implementation
```
Feature: "Agent Roundtable"
┌─────────────────┐
│   Next.js UI    │  @mention interface, streaming display
├─────────────────┤
│   NestJS API    │  POST /api/orchestration/roundtable
├─────────────────┤
│   Services      │  AgentOrchestrator.startSession()
├─────────────────┤
│   ArangoDB      │  session + stream records
└─────────────────┘
```

#### Step 3: TDD Test Creation
```typescript
// Augment Agent writes these before implementation
describe('RoundtableOrchestrator', () => {
  it('should start session with 3 agents', async () => {
    const request = {
      prompt: 'Review this design',
      agentIds: ['architect', 'critic', 'qa']
    };
    
    const session = await orchestrator.startSession(request);
    
    expect(session.agents).toHaveLength(3);
    expect(session.status).toBe('active');
    expect(session.streams).toHaveLength(3);
  });
});
```

### 4.3 Quality Gates

#### Before Implementation
- [ ] OpenAPI contract defined and validated
- [ ] TypeScript types generated from schemas
- [ ] Comprehensive test suite written
- [ ] Acceptance criteria clearly defined
- [ ] Architecture compliance verified

#### During Implementation
- [ ] All tests passing
- [ ] Code follows established patterns
- [ ] Error handling implemented
- [ ] Performance considerations addressed

#### Before Sign-off
- [ ] Integration tests passing
- [ ] Architecture review completed
- [ ] Code review approved
- [ ] Documentation updated
- [ ] User acceptance validated

## 5. Testing Strategy

### 5.1 Test-Driven Development with AI

**The TDD Cycle:**
1. **Red**: Augment Agent writes failing test defining desired behavior
2. **Green**: Claude Code writes minimal code to make test pass
3. **Refactor**: Both improve code quality while keeping tests green

**AI-Specific Adaptations:**
- Tests serve as precise specifications for Claude Code
- Augment Agent provides context and business logic in test descriptions
- Claude Code focuses on making tests pass efficiently

### 5.2 Test Organization

```
apps/api/src/
├── modules/
│   └── orchestration/
│       ├── orchestration.service.ts
│       ├── orchestration.service.spec.ts      # Unit tests
│       ├── orchestration.controller.ts
│       └── orchestration.controller.spec.ts   # Unit tests
└── test/
    ├── integration/
    │   └── orchestration.integration.spec.ts  # Integration tests
    └── e2e/
        └── roundtable.e2e.spec.ts             # End-to-end tests
```

### 5.3 Test Categories

**Unit Tests (Fast, Isolated)**
- Service logic testing
- Utility function validation
- Mock external dependencies

**Integration Tests (Medium, Component)**
- Service + database interactions
- API endpoint testing
- Real-time collaboration features

**End-to-End Tests (Slow, Full Stack)**
- Complete user workflows
- Multi-agent orchestration
- CLI + API integration

## 6. Error Handling Standards

### 6.1 Error Classification

```typescript
// Adapted from archived practices
export class LiminalError extends Error {
  constructor(
    public message: string,
    public code: LiminalErrorCode,
    public retryable: boolean = false,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
  
  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        retryable: this.retryable,
        details: this.details
      }
    };
  }
}
```

### 6.2 Error Codes

```typescript
export enum LiminalErrorCode {
  // Agent Orchestration
  AGENT_NOT_FOUND = 'AGENT_NOT_FOUND',
  ORCHESTRATION_FAILED = 'ORCHESTRATION_FAILED',
  STREAM_INTERRUPTED = 'STREAM_INTERRUPTED',
  
  // Artifact Management
  ARTIFACT_NOT_FOUND = 'ARTIFACT_NOT_FOUND',
  ARTIFACT_LOCKED = 'ARTIFACT_LOCKED',
  VERSION_CONFLICT = 'VERSION_CONFLICT',
  
  // System Errors
  GRAPH_DB_ERROR = 'GRAPH_DB_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}
```

### 6.3 Error Handling Patterns

**Service Level:**
```typescript
async startRoundtable(request: RoundtableRequest): Promise<OrchestrationSession> {
  try {
    const agents = await this.validateAgents(request.agentIds);
    return await this.createSession(agents, request);
  } catch (error) {
    if (error instanceof AgentNotFoundError) {
      throw new LiminalError(
        `Agent not found: ${error.agentId}`,
        LiminalErrorCode.AGENT_NOT_FOUND,
        false,
        { agentId: error.agentId }
      );
    }
    throw error;
  }
}
```

**Controller Level:**
```typescript
@Post('roundtable')
async startRoundtable(@Body() request: RoundtableRequest) {
  try {
    return await this.orchestrationService.startRoundtable(request);
  } catch (error) {
    // NestJS exception filters handle LiminalError conversion
    throw error;
  }
}
```

## 7. Code Review Process

### 7.1 Augment Agent Review Checklist

**Architecture Compliance:**
- [ ] Follows established service patterns
- [ ] Uses correct data models and interfaces
- [ ] Implements proper error handling
- [ ] Maintains separation of concerns

**Code Quality:**
- [ ] TypeScript types are accurate and complete
- [ ] Functions are focused and testable
- [ ] Dependencies are properly injected
- [ ] Performance considerations addressed

**Integration:**
- [ ] API contracts maintained
- [ ] Database operations optimized
- [ ] Real-time features work correctly
- [ ] CLI integration functional

### 7.2 Sign-off Criteria

**Technical Sign-off:**
- All tests passing (unit, integration, e2e)
- Code review completed and approved
- Architecture compliance verified
- Performance benchmarks met

**User Acceptance:**
- Feature works as specified
- User experience is intuitive
- Integration with existing features smooth
- No regressions introduced

## 8. Documentation Standards

### 8.1 Code Documentation

**JSDoc Requirements:**
```typescript
/**
 * Starts a roundtable discussion with specified agents
 * @param request - The roundtable configuration
 * @returns Promise resolving to the orchestration session
 * @throws LiminalError when agents are not found or unavailable
 */
async startRoundtable(request: RoundtableRequest): Promise<OrchestrationSession>
```

**Inline Comments:**
- Complex business logic explanations
- Performance optimization rationale
- Integration points with external systems

### 8.2 Feature Documentation

**Required for Each Feature:**
- User story and acceptance criteria
- API contract documentation
- Integration test examples
- CLI usage examples
- Troubleshooting guide

## 9. Performance Standards

### 9.1 Response Time Targets

- Agent response initiation: <500ms
- Parallel generation sync: <100ms drift
- UI operation response: <50ms
- Graph traversal queries: <100ms
- Lock acquisition: <100ms

### 9.2 Scalability Requirements

- Team size limit: 5 concurrent active users
- Maximum concurrent agents: 5 per session
- Artifact graph depth: Optimized for 10-level hierarchies
- Search result limits: 1000 artifacts per query

## 10. Deployment & CI/CD

### 10.1 Test Pipeline

**On Every Commit:**
- Unit tests (all)
- Linting and formatting checks
- Type checking
- Security scanning

**On Pull Request:**
- All unit tests
- Integration tests
- E2E smoke tests
- Coverage verification

**Pre-Release:**
- Full test suite
- Performance benchmarks
- Manual exploratory testing
- Documentation review

### 10.2 Quality Metrics

**Code Coverage:**
- Unit tests: >80%
- Integration tests: >70%
- Critical paths: 100%

**Performance:**
- Response time targets met
- Memory usage within limits
- Database query optimization verified

This development process ensures high-quality, consistent implementation while leveraging the strengths of our AI-augmented development team.
