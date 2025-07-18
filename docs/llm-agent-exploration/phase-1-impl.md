# Phase 1 Implementation Plan

## Functional Scope - Acceptance Criteria

### 1. Jarvis Basic Chat Capability
**As a user, I can have a conversation with Jarvis**
- ✓ API supports querying Jarvis-specific conversation history (filtered by conversationId)
- ✓ API accepts a list of selected agents with each message (to support checkbox UI pattern)
- ✓ When agent list is empty or only contains "jarvis", message routes to Jarvis
- ✓ Jarvis maintains its own conversation separate from the main roundtable conversation
- ✓ Jarvis receives injected context from the main conversation for each request
- ✓ generateJarvisContext module handles context assembly for each request

### 2. Multi-Agent Roundtable Discussions
**As a user, I can control which agents participate in discussions**
- ✓ API accepts messages with a list of selected agents (supporting checkbox UI pattern)
- ✓ API can return list of available agents for UI to display
- ✓ System routes messages to all agents in the selected list
- ✓ Each agent responds with their perspective based on their configured personality
- ✓ All agent responses appear in the main conversation with proper authorId
- ✓ Messages table supports filtering by authorId (for agent-specific views)
- ✓ Optional: API also parses @mentions from message text as override/addition to selected list

### 3. Agent Configuration
**As a system operator, I can configure roundtable agents**
- ✓ Agents are stored in the database with comprehensive configuration:
  - name: string
  - systemPrompt: string  
  - model: string (e.g., "gpt-4", "claude-3-sonnet")
  - provider: string (e.g., "openai", "anthropic")
  - config: {
      temperature?: number
      maxTokens?: number
      topP?: number
      reasoning?: boolean (for o1 models)
      streamingSupported?: boolean
    }
- ✓ At least 3 example agents are pre-configured (e.g., alice, bob, carol)
- ✓ Each agent can use different LLM models/providers
- ✓ Agents have distinct personalities via their system prompts

### 4. Message Routing Flow
**The system intelligently routes messages to agents**
- ✓ Parser correctly extracts @mentions from user messages
- ✓ Parser creates appropriate prompts for each mentioned agent
- ✓ System executes LLM calls for all agents in parallel
- ✓ Failed agent calls don't block other agents from responding
- ✓ All responses are persisted to the messages table

### 5. Context Management
**Jarvis receives appropriate context for each interaction**
- ✓ generateJarvisContext module aggregates conversation history
- ✓ Phase 1 uses passthrough strategy (full conversation history)
- ✓ Context includes both main conversation and Jarvis's own history
- ✓ Context is freshly generated for each Jarvis request

### 6. Integration Testing
**The system has basic test coverage**
- ✓ Integration tests can create conversations
- ✓ Tests can invoke Jarvis and verify responses
- ✓ Tests can trigger roundtable discussions
- ✓ Tests verify multi-agent message routing
- ✓ Tests run without authentication (test endpoints)

### Out of Scope for Phase 1
- ❌ Streaming responses (complete messages only)
- ❌ UI implementation (Convex backend only)
- ❌ Complex context pruning/summarization
- ❌ Builder architecture
- ❌ Advanced flows (Parallel, Pipeline)
- ❌ User-created agents via UI
- ❌ Authentication in tests
- ❌ Error handling beyond basic try/catch
- ❌ Jarvis tool usage
- ❌ Memory persistence beyond conversation history

## System Design

### File Structure Evolution

**Current Convex Structure:**
```
convex/
├── _generated/
├── db/
│   ├── cleanup.ts
│   ├── conversations.ts
│   ├── messages.ts
│   └── migrations.ts
├── edge/
│   ├── aiHttpHelpers.ts
│   ├── aiModelBuilder.ts
│   ├── aiProviders.ts
│   └── aiService.ts
├── lib/
│   ├── env.ts
│   └── errors.ts
├── node/
│   ├── auth.ts
│   ├── chat.ts
│   └── startup.ts
├── http.ts
├── schema.ts
└── shared-types.ts
```

**After Phase 1 Implementation:**
```
convex/
├── _generated/
├── db/
│   ├── agents.ts              [NEW - agent queries/mutations]
│   ├── cleanup.ts
│   ├── conversations.ts
│   ├── messages.ts
│   └── migrations.ts
├── edge/
│   ├── aiHttpHelpers.ts
│   ├── aiModelBuilder.ts
│   ├── aiProviders.ts
│   └── aiService.ts
├── lib/
│   ├── pocketflow/            [NEW - flow engine]
│   │   ├── core.ts            [Node and Flow base classes]
│   │   ├── index.ts           [Public exports]
│   │   └── types.ts           [Shared types]
│   ├── env.ts
│   └── errors.ts
├── agents/                    [NEW - agent modules]
│   └── jarvis/
│       ├── index.ts           [Jarvis configuration and tools]
│       └── generateContext.ts [Context assembly logic]
├── flows/                     [NEW - flow implementations]
│   └── roundtable.ts          [Message routing flow]
├── node/
│   ├── auth.ts
│   ├── chat.ts
│   ├── jarvis.ts              [NEW - Jarvis action handler]
│   ├── roundtable.ts          [NEW - Roundtable action handler]
│   └── startup.ts
├── http.ts                    [MODIFY - add new endpoints]
├── schema.ts                  [MODIFY - add agents table]
└── shared-types.ts
```

**Key Changes:**
- NEW: `agents/` directory for agent-specific modules
- NEW: `flows/` directory for PocketFlow implementations
- NEW: `lib/pocketflow/` for the flow engine core
- NEW: `db/agents.ts` for agent CRUD operations
- NEW: `node/jarvis.ts` and `node/roundtable.ts` for action handlers
- MODIFY: `schema.ts` to add agents table definition
- MODIFY: `http.ts` to add roundtable and Jarvis endpoints

### Data Model Extensions

**Agents Table**
A new table storing agent configurations with fields for:
- Unique agent name (identifier for routing)
- System prompt defining personality and expertise
- LLM provider selection (openai, anthropic, etc.)
- Model selection within provider
- Model configuration object containing temperature, max tokens, reasoning mode flags
- Active status for enabling/disabling agents

**Conversation Types**
Leverage existing conversation types to distinguish:
- "standard" conversations for regular chat
- "roundtable" conversations for multi-agent discussions
- "jarvis" conversations for dedicated Jarvis interactions

### Component Architecture

**PocketFlow Core**
A minimal flow engine implementation providing:
- Base Node class defining the execute contract
- Base Flow class managing sequential node execution
- Shared state pattern for passing data between nodes
- Simple error propagation without complex retry logic

**Message Routing Flow**
A PocketFlow implementation consisting of:
- ParseNode: Extracts selected agents and optional @mentions from input
- RouteNode: Builds routing instructions with agent-specific prompts
- ExecuteNode: Invokes aiService for each agent in parallel
- PersistNode: Saves all responses to messages table

Flow receives input containing:
- User message text
- List of selected agents from UI
- Main conversation ID
- Any additional context

Flow outputs array of created message IDs.

**Jarvis Agent Module**
Dedicated module containing:
- Jarvis-specific action handler (using 'use node')
- Integration with generateJarvisContext module
- Response generation using aiService
- Message persistence to both Jarvis conversation and optionally main conversation

**Context Generation Module**
The generateJarvisContext module acts as context orchestrator:
- Accepts multiple context sources (conversations, user preferences, etc.)
- Phase 1 implements passthrough strategy (concatenates all sources)
- Returns formatted context object with system prompt and message history
- Designed for future evolution to intelligent pruning

### Interaction Patterns

**Roundtable Message Flow**
```
User Input → HTTP Endpoint → Roundtable Action
                                    ↓
                            Create Flow Instance
                                    ↓
                    ParseNode → RouteNode → ExecuteNode → PersistNode
                                    ↓
                            Return Message IDs
```

**Jarvis Interaction Flow**
```
User Message → Jarvis Action → generateJarvisContext
                                        ↓
                                Gather All Context
                                        ↓
                                  Format Prompt
                                        ↓
                                  Call aiService
                                        ↓
                              Persist to Jarvis Convo
```

### API Design

**New Mutations**
- createAgent: Inserts agent configuration
- updateAgent: Modifies agent settings
- sendRoundtableMessage: Handles multi-agent message routing

**New Queries**
- listAgents: Returns active agents for UI display
- getAgentConfig: Retrieves specific agent configuration
- getJarvisConversation: Returns Jarvis-specific conversation

**New Actions**
- processRoundtable: Orchestrates multi-agent flow (uses node runtime)
- jarvisRespond: Handles Jarvis interactions (uses node runtime)

### Integration Points

**aiService Usage**
All LLM calls go through existing aiService which:
- Handles provider abstraction
- Manages model configuration
- Provides consistent error handling
- Returns formatted responses

**Message Storage**
Leverages existing messages table with:
- authorType "agent" for all AI responses
- authorId containing agent name
- Proper conversation association
- Metadata for token usage tracking

**HTTP Endpoints**
New endpoints for:
- Creating roundtable messages with agent selection
- Querying available agents
- Managing Jarvis conversations
These follow existing patterns in http.ts

## Implementation Work Plan

### Stage 1: Data Foundation

**1.1 Agent Table Schema**
- Modify `convex/schema.ts` to add agents table definition
- Success: Schema deploys without errors, table visible in Convex dashboard
- Validation: Can manually insert test agent records via dashboard

**1.2 Agent Database Operations**
- Create `convex/db/agents.ts` with basic CRUD operations
- Success: Can create, read, update, list agents via mutations/queries
- Validation: Test each operation via Convex dashboard function runner

**1.3 Seed Initial Agents**
- Create migration or seed script for alice, bob, carol agents
- Success: Three distinct agents exist with different personalities and models
- Validation: Query returns all three agents with correct configurations

### Stage 2: PocketFlow Engine

**2.1 Core Flow Abstractions**
- Create `convex/lib/pocketflow/core.ts` with Node and Flow base classes
- Success: Classes can be extended, basic state passing works
- Validation: Unit test showing data flows through 2-3 simple nodes

**2.2 Flow Type System**
- Create `convex/lib/pocketflow/types.ts` and `index.ts` exports
- Success: TypeScript properly types state transitions between nodes
- Validation: Build succeeds with strict type checking

### Stage 3: Jarvis Implementation

**3.1 Context Generation Module**
- Create `convex/agents/jarvis/generateContext.ts` 
- Success: Module accepts multiple inputs and returns formatted context
- Validation: Test with mock conversation data returns proper structure

**3.2 Jarvis Agent Module**
- Create `convex/agents/jarvis/index.ts` with configuration
- Success: Module exports Jarvis config and integration points
- Validation: Can import and access Jarvis configuration

**3.3 Jarvis Action Handler**
- Create `convex/node/jarvis.ts` action that uses generateContext and aiService
- Success: Jarvis responds to messages with context awareness
- Validation: HTTP endpoint test shows Jarvis responding appropriately

### Stage 4: Roundtable Flow

**4.1 Message Routing Flow**
- Create `convex/flows/roundtable.ts` implementing ParseNode, RouteNode, ExecuteNode, PersistNode
- Success: Flow processes input and produces routing instructions
- Validation: Test with sample input produces expected agent routing

**4.2 Roundtable Action Handler**
- Create `convex/node/roundtable.ts` that orchestrates the flow
- Success: Multiple agents respond to single user message
- Validation: Database shows messages from multiple agents after invocation

### Stage 5: API Integration

**5.1 HTTP Endpoint Updates**
- Modify `convex/http.ts` to add Jarvis and roundtable endpoints
- Success: New endpoints accessible and properly routed
- Validation: Curl commands successfully hit new endpoints

**5.2 Message Filtering Queries**
- Enhance message queries to support filtering by authorId
- Success: Can retrieve agent-specific message streams
- Validation: Query for specific agent returns only their messages

### Stage 6: Integration Testing

**6.1 Jarvis Integration Tests**
- Create Playwright tests for Jarvis conversations
- Success: Tests create conversation, send message, verify Jarvis response
- Validation: Tests pass consistently in CI

**6.2 Roundtable Integration Tests**
- Create Playwright tests for multi-agent routing
- Success: Tests verify multiple agents respond to single prompt
- Validation: Tests confirm each agent's response appears

**6.3 End-to-End Validation**
- Comprehensive test covering both Jarvis and roundtable in same conversation
- Success: Both features work together without interference
- Validation: All acceptance criteria from scope section are met

### Implementation Notes

**Dependency Chain:**
- Stage 2 (PocketFlow) must complete before Stage 4 (Roundtable)
- Stages 3 (Jarvis) and 4 (Roundtable) can proceed in parallel after Stage 2
- Stage 5 depends on both Stage 3 and 4
- Stage 6 requires all previous stages

**Testing Strategy:**
- Each work item includes inline validation
- No item considered complete until validation passes
- Integration tests provide final verification
- Use test endpoints to bypass auth complexity

**Risk Mitigation:**
- If PocketFlow proves complex, can simplify to direct function calls initially
- If streaming becomes necessary, defer to Phase 2
- Context generation can start simple (passthrough) and evolve