# TDD with AI Coding Agents: A Collaborative Approach

> **⚠️ Note**: This methodology is theoretical and has not yet been fully implemented in practice. It represents a proposed approach for AI-human collaboration in TDD and is subject to refinement based on real-world usage and feedback.

## Executive Summary

This guide outlines a structured approach to Test-Driven Development (TDD) specifically designed for collaboration between human developers and AI coding assistants. By using tests as an executable specification language and incorporating memory management techniques, we can scaffold AI agents to successfully implement complex, multi-tiered features without losing context or becoming overwhelmed.

## The Core Challenge

AI coding assistants face several limitations:
- **Limited context windows** - Can't hold entire codebases in memory
- **Loss of coherence** - Tendency to lose track of the bigger picture when focusing on details
- **Integration drift** - Creating perfectly isolated components that fail when connected
- **Whack-a-mole debugging** - Getting stuck in cycles of fixing one thing while breaking another

## Context Budget Strategy

Given AI's limited context windows, allocate context wisely:

```markdown
Context Allocation Guidelines:
- 20% - Domain models and interfaces (the "what")
- 40% - Current implementation focus (the "now")
- 30% - Adjacent/connected code (the "how it fits")
- 10% - Memory summaries from scratchpad (the "journey")
```

This ensures AI maintains both local detail and system awareness without overwhelming the context window.

## The Solution: Collaborative TDD with Scaffolding

### Phase 0: Domain Modeling

Before writing any tests, establish a shared vocabulary and understanding:

```markdown
HUMAN: "We're building a roundtable discussion system"

HUMAN & AI: [Establish domain model together]
- Core Entities: Session, Participant, Turn, Context
- Relationships: Sessions have many Participants, Participants take Turns
- Key Rules: Fair time allocation, context preservation, graceful degradation
- System Boundaries: What's in scope vs external dependencies
```

This prevents miscommunication and ensures AI understands the problem space before implementation begins.

### 1. Test Conditions as Shared Language

Instead of the human writing tests directly, we use a collaborative process:

```markdown
HUMAN: "I need a service that manages AI roundtable discussions"

HUMAN & AI: [Brainstorm test conditions together]
- Should create a roundtable session with multiple AI participants
- Should enforce fair turn-taking between participants
- Should maintain shared context across the conversation
- Should handle participant dropouts gracefully

AI: [Documents the test condition formally]
```

```typescript
describe('RoundtableService', () => {
  it('should create a session with multiple AI participants', async () => {
    // Given
    const participants = [
      { id: 'claude', model: 'claude-3' },
      { id: 'gpt4', model: 'gpt-4' },
      { id: 'gemini', model: 'gemini-pro' }
    ];
    
    // When
    const session = await roundtableService.createSession({
      topic: 'Discuss testing strategies',
      participants
    });
    
    // Then
    expect(session.id).toBeDefined();
    expect(session.participants).toHaveLength(3);
    expect(session.status).toBe('ready');
  });
});
```

**HUMAN**: [Reviews and approves the test]

### 2. The Walking Skeleton Approach

To prevent integration drift, we start with a "walking skeleton" - a minimal implementation that touches all layers:

```typescript
// First test: Vertical slice through the system
describe('Roundtable API Integration', () => {
  it('should create a roundtable session via API', async () => {
    // This test forces AI to think about the full stack
    const response = await request(app)
      .post('/api/v1/roundtable/sessions')
      .send({
        topic: 'Test discussion',
        participants: ['claude', 'gpt-4']
      })
      .expect(201);
    
    expect(response.body.sessionId).toBeDefined();
    
    // Verify it's actually persisted
    const getResponse = await request(app)
      .get(`/api/v1/roundtable/sessions/${response.body.sessionId}`)
      .expect(200);
  });
});
```

**Key Insight**: By starting with integration tests, the AI maintains awareness of how components connect, preventing the myopic view that leads to integration problems.

### 3. Progressive Complexity Pattern

Build complexity gradually to prevent AI overwhelm:

```markdown
Level 1: Basic Functionality
- Create session
- Add participants
- Start discussion

Level 2: Core Business Rules
- Turn-taking logic
- Time limits
- Context sharing

Level 3: Edge Cases
- Participant drops out
- Network interruption
- Concurrent speakers

Level 4: Advanced Features
- Dynamic rebalancing
- Priority interruptions
- Context summarization
```

### 4. External Memory Management

#### The Scratchpad Pattern

AI maintains a working memory in `@claude-scratchpad/current/`:

```markdown
# roundtable-implementation.md

## Current Focus: Turn-taking logic

### Done:
- ✓ Basic session creation
- ✓ Participant management

### In Progress:
- 🔄 Implementing fair scheduling algorithm

### Next:
- Context propagation between turns
- Timeout handling

### Key Decisions:
- Using round-robin with priority boost for interrupted speakers
- 30-second default turn duration
- Context window of last 5 turns
```

#### Checkpoint Pattern

After each test passes, AI documents the state:

```typescript
// After implementing test
/*
 * CHECKPOINT: Basic session creation working
 * - Sessions have unique IDs
 * - Participants are validated
 * - Database persistence confirmed
 * 
 * NEXT: Implement turn-taking logic
 */
```

## The Complete Workflow

### Phase 1: Collaborative Test Design

```markdown
HUMAN: "I need the roundtable to handle participants dropping out"

AI: "Let me understand the requirements. When a participant drops out, we need to:
1. Remove them from active participants
2. Redistribute their remaining time
3. Preserve conversation continuity

Here's the test condition:"

describe('Participant Management', () => {
  it('should handle participant dropout gracefully', async () => {
    // Given: Active session with 3 participants
    const session = await createActiveSession(['claude', 'gpt-4', 'gemini']);
    
    // When: One participant drops
    await session.removeParticipant('gpt-4');
    
    // Then: Session continues with remaining participants
    expect(session.activeParticipants).toEqual(['claude', 'gemini']);
    expect(session.status).toBe('active');
    expect(session.turnOrder).not.toContain('gpt-4');
  });
});
```

**HUMAN**: "Looks good. Let's implement it."

### Phase 2: Test-Driven Implementation

The AI implements with clear boundaries:

```typescript
// AI starts with the test failing
$ npm test -- participant.test.ts
❌ should handle participant dropout gracefully

// AI implements minimal code to pass
class RoundtableSession {
  removeParticipant(participantId: string) {
    this.participants = this.participants.filter(p => p.id !== participantId);
    this.turnOrder = this.turnOrder.filter(id => id !== participantId);
    // Ensure session continues if participants remain
    if (this.participants.length > 0) {
      this.status = 'active';
    }
  }
}

// Test passes
$ npm test -- participant.test.ts
✅ should handle participant dropout gracefully
```

### Phase 3: Progressive Enhancement

Once basic test passes, add complexity:

```typescript
it('should redistribute speaking time when participant drops', async () => {
  // More complex behavior building on the foundation
  const session = await createActiveSession(['claude', 'gpt-4', 'gemini']);
  const initialTimePerParticipant = session.timeAllocation['gpt-4'];
  
  await session.removeParticipant('gpt-4');
  
  // Remaining participants get extra time
  expect(session.timeAllocation['claude']).toBeGreaterThan(initialTimePerParticipant);
  expect(session.timeAllocation['gemini']).toBeGreaterThan(initialTimePerParticipant);
});
```

## Key Techniques for Success

### 1. One Test at a Time

Never give AI multiple failing tests. The workflow is:
1. Write/collaborate on ONE test
2. AI implements until it passes
3. Refactor if needed
4. Move to next test

### 2. Maintain System Context

Use integration tests as anchors:
```typescript
// Every few unit tests, add an integration test
it('should handle complete roundtable flow', async () => {
  // This keeps AI aware of the big picture
});
```

### 3. Test Granularity Guidance

Choose the right test level for AI collaboration:

```markdown
Start with Integration Tests when:
- Beginning a new feature (walking skeleton)
- AI needs system context
- Testing cross-component interactions

Drop to Unit Tests when:
- Implementing complex algorithms
- Testing edge cases in isolation
- Performance-critical code

Return to Integration Tests to:
- Verify components work together
- Validate the full user journey
- Catch integration drift
```

### 4. Clear Progress Tracking

The AI should always know:
- What's implemented ✓
- What's in progress 🔄
- What's next →
- Why decisions were made 💡

### 5. Failure Mode Recovery

Common failure patterns and specific fixes:

```markdown
"Implementation Explosion" (too many changes at once)
→ Simplify test to focus on one behavior
→ Break into smaller tests

"Mock Hell" (lost in mock setup)
→ Switch to integration test
→ Use real implementations where possible

"Lost Context" (forgot the bigger picture)
→ Review walking skeleton test
→ Restore from checkpoint
→ Re-read domain model

"Whack-a-Mole" (fixing one thing breaks another)
→ Stop and add missing tests
→ Refactor to cleaner architecture
→ Consider if design is fighting you
```

## Example: Complete Feature Implementation

Here's how a full feature flows:

```markdown
HUMAN: "Implement streaming responses for roundtable discussions"

STEP 1: Collaborate on test conditions
- Each participant's response should stream
- Responses should interleave fairly
- Client should receive unified stream

STEP 2: Walking skeleton test
- API endpoint that returns SSE stream
- Basic message from one participant

STEP 3: Progressive complexity
- Multiple participants
- Interleaving logic
- Error handling
- Backpressure management

STEP 4: Integration
- Full roundtable with streaming
- Client consumption test
- Performance validation
```

## Measuring Success

### Indicators of Effective Scaffolding

1. **Coherent Implementation** - Components work together first try
2. **Minimal Debugging Cycles** - Fewer "fix one thing, break another"
3. **Clear Progress** - Steady test completion
4. **Maintained Context** - AI remembers architectural decisions

### Anti-Patterns to Avoid

1. **Test Overload** - Giving AI 20 tests at once
2. **Isolation Testing** - Only unit tests with mocks
3. **Missing Context** - No explanation of why/how
4. **Skipping Integration** - Leaving connection for later

### AI-Specific Test Smells

Watch for these testing anti-patterns that particularly confuse AI:

```typescript
// ❌ Over-mocking - AI loses sight of real behavior
it('should process message', () => {
  const mockSession = { process: jest.fn() };
  const mockValidator = { validate: jest.fn(() => true) };
  const mockLogger = { log: jest.fn() };
  // AI has no idea what actually happens
});

// ✅ Minimal mocking - AI understands flow
it('should process message', () => {
  const session = new RoundtableSession();
  const result = session.processMessage('Hello');
  expect(result.processed).toBe(true);
});

// ❌ Brittle assertions - Exact string/structure matching
expect(error.message).toBe('Invalid participant ID: abc123 at position 2');

// ✅ Flexible assertions - Test intent, not implementation
expect(error.message).toContain('Invalid participant');
expect(error.code).toBe('INVALID_PARTICIPANT');

// ❌ Unclear test names - AI can't infer purpose
it('should work correctly', () => {});
it('handles edge case', () => {});

// ✅ Descriptive names - Clear behavior specification
it('should timeout participant after 30 seconds of inactivity', () => {});
it('should redistribute time when participant leaves mid-session', () => {});
```

## Advanced Patterns

### Contract-Driven Development

Define contracts between components:
```typescript
interface RoundtableContract {
  // AI implements against this interface
  createSession(config: SessionConfig): Promise<Session>;
  streamResponses(sessionId: string): AsyncIterable<Response>;
}
```

### Temporal Testing

For time-dependent features:
```typescript
it('should timeout inactive participants', async () => {
  const session = createSession();
  const timeProvider = new TestTimeProvider();
  
  session.startTurn('claude');
  timeProvider.advance(31000); // Past 30s limit
  
  expect(session.currentSpeaker).not.toBe('claude');
});
```

### State Machine Testing

For complex workflows:
```typescript
const states = ['idle', 'active', 'paused', 'completed'];
const transitions = [
  { from: 'idle', event: 'start', to: 'active' },
  { from: 'active', event: 'pause', to: 'paused' }
];

// AI implements state machine from tests
```

## Conclusion

This approach transforms TDD from a development methodology into a scaffolding system for AI agents. By:

1. Using collaborative test design as specification
2. Starting with walking skeletons
3. Building complexity progressively
4. Maintaining external memory
5. Tracking clear progress

We create an environment where AI assistants can successfully implement complex, multi-tiered features without losing context or becoming overwhelmed. The key is that tests become more than validation—they become the rails that guide AI implementation, ensuring coherent, integrated systems emerge incrementally.

## Quick Reference

```bash
# Workflow commands
ai: brainstorm    # Collaborate on test conditions
ai: document      # AI writes formal test
ai: implement     # AI implements to pass test
ai: checkpoint    # Save progress state
ai: next         # Move to next test

# Memory locations
@claude-scratchpad/current/  # Active work
- todo.md                    # Current test queue
- decisions.md              # Architectural choices
- checkpoint.md             # Implementation state

# Test progression
1. Integration test (walking skeleton)
2. Core functionality (happy path)
3. Business rules (constraints)
4. Edge cases (error handling)
5. Performance (if needed)
```

## AI Directives (!Commands)

Project-specific shortcuts that trigger complex workflows. When you see a command starting with !, execute the corresponding directive.

### Quick Reference

| Command | Description |
|---------|-------------|
| !test | Run all unit tests with coverage report |
| !lint | Check code style and TypeScript |
| !check | Orchestrate parallel fixes until all checks pass |

### Detailed Command Definitions

#### Development Commands

**!test**
- Execute: `npm run test:coverage`
- Purpose: Run all unit tests WITH coverage report
- Use when: Before commits, after changes, when requested

**!lint**
- Execute: `npm run lint`
- Purpose: Check code style and TypeScript errors
- Use when: Before commits, after refactoring

**!check**
- Purpose: Orchestrate parallel fixes until all checks pass
- Process:
  1. Run `npm run test:coverage && npm run lint` to identify issues
  2. Deploy up to 2-3 Task agents in parallel to fix different problems
  3. Continuously verify progress with tests and lint
  4. Ensure code coverage meets project standards (90% domain, 80% other)
  5. Redeploy agents as needed until all tests pass and lint succeeds
  6. Run `npm run test:coverage && npm run lint` to verify final state
- Use when: Major changes, pre-commit verification, CI failures

### Creating New !Commands

When adding new !commands:
1. Keep them project-specific (not generic operations)
2. Document in this section with clear execution steps
3. Use descriptive names (!deploy:staging not !ds)
4. Include context about when to use them

### Why !Commands

- Signal project-specific operations that should use npm scripts
- Ensure consistency across AI sessions
- Prevent use of generic commands when project-specific ones exist
- Create reusable complex workflows