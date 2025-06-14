# Feature 007: AI Roundtable Routing

## Overview
Implement AI-powered conversation routing using Gemini Flash to parse @mentions, select target agents, and determine context for multi-agent roundtable conversations.

## Goals
- Intelligent @mention parsing with fuzzy matching (@arch → architect)
- Agent context selection based on conversation history
- Alias expansion for agent groups (@team → [architect, qa-lead, product-owner])
- Conversation rounds management (user → agents → user flow)
- Cost-effective routing using Gemini Flash 2.0

## Architecture Approach
- **Routing Model**: Gemini Flash 2.0 for fast, cheap routing decisions
- **Agent Definitions**: JSON configuration for agents and aliases
- **Context Management**: Selective history forwarding to each agent
- **Round Structure**: Atomic user→agent(s) conversation units

## Stories

### Story 1: Agent Definition System
**Goal**: Create agent and alias configuration management  
**Scope**:
- Agent definition schema (name, model, persona, parameters)
- Alias definition for agent groups
- JSON configuration storage and validation
- Agent management API endpoints

**Effort**: 2-3 days

### Story 2: Gemini Flash Routing Integration
**Goal**: Implement AI-powered mention parsing and routing  
**Scope**:
- Gemini Flash API integration
- Prompt engineering for routing decisions
- Fuzzy matching for agent names (@arch → architect)
- Context-aware routing when no explicit mentions

**Effort**: 3-4 days

### Story 3: Context Selection & History Management
**Goal**: Determine relevant context for each targeted agent  
**Scope**:
- Agent-specific context extraction from conversation history
- Relevance scoring for message inclusion
- Context window management for different models
- History summarization for long conversations

**Effort**: 3-4 days

### Story 4: Conversation Rounds Implementation
**Goal**: Implement rounds-based conversation management  
**Scope**:
- Round creation and management
- User message handling and agent targeting
- Parallel agent response coordination
- Round completion and transition logic

**Effort**: 2-3 days

### Story 5: Agent Response Coordination
**Goal**: Coordinate multiple agent responses within a round  
**Scope**:
- Parallel LLM calls to multiple agents
- Response timing and completion tracking
- Error handling for partial agent failures
- Round status management

**Effort**: 2-3 days

## Technical Implementation

### Agent Definition Schema
```typescript
interface AgentDefinition {
  id: string;              // 'architect', 'qa-lead'
  name: string;            // 'Software Architect'
  model: string;           // 'anthropic/claude-3-sonnet'
  persona: string;         // System prompt/instructions
  parameters: {
    temperature: number;
    maxTokens: number;
    topP?: number;
  };
  aliases: string[];       // ['arch', 'architect']
  expertise: string[];     // ['system-design', 'api-architecture']
}

interface AliasDefinition {
  id: string;              // 'product-team'
  name: string;            // 'Product Team'
  agentIds: string[];      // ['architect', 'qa-lead', 'product-owner']
  description: string;     // 'Core product development team'
}
```

### Routing Request/Response
```typescript
interface RoutingRequest {
  userMessage: string;
  availableAgents: AgentDefinition[];
  conversationHistory: MessageChunk[];
  currentRound?: number;
}

interface RoutingResponse {
  targetAgents: string[];           // ['architect', 'qa-lead']
  reasoning: string;               // Why these agents were selected
  contextForEach: Record<string, { // Agent-specific context
    relevantHistory: MessageChunk[];
    focusArea: string;             // What this agent should focus on
    systemPrompt: string;          // Generated system prompt
  }>;
  confidence: number;              // 0-1 routing confidence
}
```

### Conversation Round Structure
```typescript
interface ConversationRound {
  id: string;                      // 'us01-co12-r03'
  conversationId: string;          // 'us01-co12'
  userMessage: MessageChunk;       // User's input
  targetAgents: string[];          // Selected agents
  agentResponses: {
    [agentId: string]: {
      status: 'pending' | 'streaming' | 'complete' | 'error';
      messageId: string;           // Reference to message chunks
      startTime: string;
      completionTime?: string;
    };
  };
  status: 'active' | 'complete' | 'partial';
  createdAt: string;
}
```

### Gemini Flash Routing Prompt
```
You are a conversation routing system for an AI roundtable discussion.

Given a user message and available AI agents, determine:
1. Which agents should respond (by ID)
2. What context each agent needs from conversation history
3. What specific focus area each agent should address

Available agents: {agentDefinitions}
User message: "{userMessage}"
Recent conversation: {relevantHistory}

Respond with JSON:
{
  "targetAgents": ["agent-id-1", "agent-id-2"],
  "reasoning": "Why these agents were selected",
  "contextForEach": {
    "agent-id-1": {
      "focusArea": "What this agent should focus on",
      "relevantHistory": ["message-id-1", "message-id-2"]
    }
  },
  "confidence": 0.9
}
```

## Integration Points

### Domain Service Changes
- **LlmService**: Coordinate multiple parallel agent calls
- **ConversationService**: Manage rounds and agent responses
- **ContextService**: Extract and format agent-specific context

### Edge API Extensions
```
POST /api/conversations/{id}/rounds     # Start new round
GET /api/conversations/{id}/rounds      # List rounds
GET /api/rounds/{id}                    # Get round status
GET /api/agents                         # List available agents
POST /api/agents                        # Create/update agent
```

### File System Changes
```
users/us01/
├── agents/
│   ├── architect.json
│   ├── qa-lead.json
│   └── product-owner.json
├── aliases/
│   └── product-team.json
└── conversations/
    └── co12/
        ├── rounds/
        │   ├── r01.json
        │   ├── r02.json
        │   └── r03.json
        └── messages/
            └── [chunks...]
```

## Testing Strategy

### Unit Tests
- Agent definition validation
- Routing prompt generation
- Context selection algorithms
- Round management logic

### Integration Tests
- Gemini Flash API integration
- Multi-agent coordination
- Context accuracy validation
- Round completion flows

### AI/ML Tests
- Routing accuracy with various inputs
- Fuzzy matching effectiveness
- Context relevance scoring
- Edge case handling (@everyone, no mentions, etc.)

## Performance Requirements
- Routing decision <500ms (Gemini Flash is very fast)
- Context selection <100ms per agent
- Parallel agent calls (no sequential blocking)
- Memory usage scales with active rounds, not conversation history

## Dependencies
- **Requires**: Feature 005 (Data Persistence) complete
- **Requires**: Feature 006 (Structured Logging) complete  
- **Enables**: Feature 008 (Web Frontend Interface)
- **External**: Google AI Studio access for Gemini Flash

## Success Criteria
- [ ] @mention parsing works with 95%+ accuracy
- [ ] Fuzzy matching handles common abbreviations
- [ ] Context selection provides relevant history to each agent
- [ ] Parallel agent responses work reliably
- [ ] Conversation rounds maintain proper state
- [ ] Routing decisions complete within performance requirements
- [ ] Agent definitions are easily configurable
- [ ] Alias expansion works for team-based queries