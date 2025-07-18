# Phase 1 Implementation Lead Document

## Mission Statement
Implement Jarvis as a basic conversational agent and multi-agent roundtable discussions using a minimal PocketFlow engine for message routing in Convex backend.

## Core Architecture Decisions

### 1. Jarvis Context Isolation
- **Separate conversation** for Jarvis ↔ User dialogue
- **Injected context** from main conversation per request  
- **No persistence** of other agents' messages in Jarvis convo
- **Clean history** - just user + Jarvis exchanges

### 2. Message Routing Architecture
```
User Input (with selected agents list) → Roundtable Action
                    ↓
            PocketFlow Instance
                    ↓
    ParseNode → RouteNode → ExecuteNode → PersistNode
                    ↓
            Messages saved with authorId
```

### 3. Agent Storage Model
- Agents stored in database (not hardcoded)
- Each agent has: name, systemPrompt, model, provider, config
- Config includes: temperature, maxTokens, topP, reasoning flag

## File Structure Map

```
convex/
├── agents/                    [NEW]
│   └── jarvis/
│       ├── index.ts           # Jarvis configuration
│       └── generateContext.ts # Context assembly (passthrough for Phase 1)
├── flows/                     [NEW]
│   └── roundtable.ts          # PocketFlow implementation
├── lib/
│   └── pocketflow/            [NEW]
│       ├── core.ts            # Node and Flow base classes
│       ├── types.ts           # TypeScript types
│       └── index.ts           # Public exports
├── db/
│   └── agents.ts              [NEW - CRUD operations]
├── node/
│   ├── jarvis.ts              [NEW - Jarvis action handler]
│   └── roundtable.ts          [NEW - Roundtable action handler]
├── schema.ts                  [MODIFY - add agents table]
└── http.ts                    [MODIFY - add new endpoints]
```

## Implementation Patterns

### PocketFlow Pattern
```typescript
// Base node structure
abstract class Node<TState> {
  abstract execute(state: TState): Promise<TState>;
}

// Flow with sequential execution
class Flow<TState> {
  nodes: Node<TState>[];
  async run(initialState: TState): Promise<TState>;
}

// Shared state for roundtable
interface RoundtableState {
  message: string;
  selectedAgents: string[];
  agentInstructions: AgentInstruction[];
  messageIds: Id<"messages">[];
}
```

### Convex Function Patterns
```typescript
// Action pattern (node/ directory with 'use node')
export const jarvisRespond = action({
  args: {
    conversationId: v.id("conversations"),
    message: v.string(),
    selectedAgents: v.array(v.string())
  },
  returns: v.object({ messageId: v.id("messages") }),
  handler: async (ctx, args) => {
    // Cannot use ctx.db directly!
    const context = await generateJarvisContext(ctx, args);
    const response = await aiService.generateText({...});
    const messageId = await ctx.runMutation(internal.db.messages.create, {...});
    return { messageId };
  }
});

// Query with index pattern
const messages = await ctx.db
  .query("messages")
  .withIndex("by_conversation", q => q.eq("conversationId", id))
  .order("desc")
  .take(10);
```

## Agent Prompting Guide

### Initial Setup Prompt
```
I need you to implement Phase 1 of Liminal Chat in the Convex backend. 

Context:
- Work from apps/convex/ directory only
- Follow tier constraints (edge/node/db)
- Use 'use node' for actions in node/ directory
- Implement according to the work plan in stage order

First, ensure npm run dev:start is running, then begin with Stage 1.
```

### Per-Stage Prompts

**Stage 1: Data Foundation**
```
Implement the agents table:
1. Add agents table to schema.ts with fields: name, systemPrompt, provider, model, config
2. Create db/agents.ts with create, get, list, update mutations/queries
3. Create a seed script or mutation to add alice, bob, carol agents

Test each operation in the dashboard function runner.
```

**Stage 2: PocketFlow Engine**
```
Create the PocketFlow engine in lib/pocketflow/:
1. core.ts with abstract Node and Flow classes
2. types.ts with shared types
3. index.ts with exports

The Flow should execute nodes sequentially, passing state between them.
Include a simple test to verify state flows through 2-3 nodes.
```

**Stage 3: Jarvis Implementation**
```
Implement Jarvis in agents/jarvis/:
1. generateContext.ts - passthrough strategy (concatenate all sources)
2. index.ts - Jarvis configuration
3. node/jarvis.ts - action handler using generateContext and aiService

Jarvis should maintain its own conversation separate from main conversation.
```

**Stage 4: Roundtable Flow**
```
Implement roundtable in flows/roundtable.ts:
1. ParseNode - extracts selected agents from input
2. RouteNode - creates agent-specific prompts
3. ExecuteNode - calls aiService for each agent in parallel
4. PersistNode - saves all responses

Then create node/roundtable.ts to orchestrate the flow.
```

## Validation Checklist

### Per Component Validation

**Schema Changes**
- [ ] `npx convex dev` shows no errors
- [ ] Agents table visible in dashboard
- [ ] Can insert test records

**Agent CRUD**
- [ ] createAgent mutation works
- [ ] listAgents returns all agents
- [ ] Each agent has complete config

**PocketFlow Engine**
- [ ] State passes through nodes correctly
- [ ] TypeScript types are correct
- [ ] No runtime errors in test

**Jarvis**
- [ ] Responds to messages
- [ ] Has separate conversation
- [ ] Receives main conversation context
- [ ] Uses configured model/provider

**Roundtable**
- [ ] Routes to all selected agents
- [ ] Parallel execution works
- [ ] All responses saved with correct authorId
- [ ] No agent blocks others

**Integration Tests**
- [ ] All existing tests still pass
- [ ] New tests for Jarvis pass
- [ ] New tests for roundtable pass

### Dashboard Testing Scripts

**Test Agent Creation**
```javascript
// In dashboard function runner
await createAgent({
  name: "alice",
  systemPrompt: "You are a critical reviewer...",
  provider: "openai",
  model: "gpt-4",
  config: { temperature: 0.7, maxTokens: 500 }
})
```

**Test Jarvis**
```javascript
// Create Jarvis conversation, then:
await jarvisRespond({
  conversationId: "[jarvis-convo-id]",
  message: "Hello Jarvis",
  selectedAgents: ["jarvis"]
})
```

**Test Roundtable**
```javascript
await processRoundtable({
  conversationId: "[main-convo-id]", 
  message: "Let's discuss the plot",
  selectedAgents: ["alice", "bob", "carol"]
})
```

## Common Issues & Solutions

**"Cannot use ctx.db in action"**
- Move database calls to mutations/queries
- Use ctx.runMutation/ctx.runQuery from actions

**"Function not found"**
- Check import: api vs internal
- Verify file path in function reference
- Ensure dev server is running

**Types not updating**
- Restart TypeScript server
- Check if dev server is running
- Look for deployment errors in logs

**Schema validation fails**
- Check existing data matches new schema
- Use optional fields for backwards compatibility
- Clear data if testing

## Success Criteria

1. **User can chat with Jarvis** in dedicated conversation
2. **Multiple agents respond** to roundtable discussions
3. **Each agent uses** their configured model/prompt
4. **Messages are properly attributed** via authorId
5. **Context flows correctly** to Jarvis
6. **All tests pass** including new integration tests

## Key Design Principles

1. **Separation of Concerns**
   - Jarvis has isolated conversation
   - Agents are data, not code
   - PocketFlow handles routing logic

2. **Parallel Execution**
   - Agents don't block each other
   - Failures isolated per agent
   - All responses collected

3. **Progressive Enhancement**
   - Passthrough context → smart context later
   - Simple routing → complex flows later
   - Basic agents → sophisticated agents later

4. **Type Safety**
   - Use Id<"table"> types
   - Validate all inputs/outputs
   - Let TypeScript guide implementation

## Development Workflow Reminders

### Agent Development Flow
1. **Write code** → Save file
2. **Check deployment** → Look for "✓ Deployed" in logs
3. **If fails** → Share exact error from logs
4. **If succeeds** → Test specific function in dashboard

### Required Setup
- `npm run dev:start` must be running (PM2 managed)
- Dashboard is primary testing tool
- Never ask agent to run plain `convex dev`

### Convex Patterns to Enforce
```typescript
// ALWAYS include returns validator
export const myQuery = query({
  args: { /* ... */ },
  returns: v.null(), // Even if returning null!
  handler: async (ctx, args) => {
    return null;
  }
});

// Actions need 'use node' at top of file
'use node';
import { action } from '../_generated/server';

// No .filter() in queries - use indexes
// No ctx.db in actions - use ctx.runQuery/runMutation
```

## What Success Looks Like

When Phase 1 is complete:
1. Dashboard shows agents table with alice, bob, carol
2. Can create a conversation and message Jarvis
3. Can send "@alice @bob discuss X" and see both responses
4. Each response has correct authorId
5. Jarvis conversation separate from main conversation
6. All integration tests pass

## Final Notes for Agent Direction

- **Stay focused**: Only implement what's in the work plan
- **Test incrementally**: Each stage should be testable independently  
- **Use dashboard**: Don't create complex test scripts
- **Report status**: Share deployment success/failure
- **Follow patterns**: Use existing code as reference