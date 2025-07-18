# Deep User Flow Discussion - Liminal Chat Vision

## Executive Summary

Liminal Chat represents a paradigm shift in AI-augmented knowledge work. Rather than a chat interface with plugins, it's a system of specialized **Builders** (persistent workspaces) where users construct complex artifacts with the help of **Jarvis**, their builder assistant. The system achieves 10-50x productivity gains not through speed, but through intelligent management of complexity and cognitive load.

## The Core Insight: Jarvis as Builder Assistant

The breakthrough realization: complex AI systems require an AI assistant to be usable. Jarvis isn't just a feature - it's what makes the entire system accessible. Users can:
- Just tell Jarvis what they want (zero learning curve)
- Watch Jarvis operate the builders (learning by observation)
- Work alongside Jarvis (collaborative creation)
- Eventually use advanced features with Jarvis's guidance

## The Book Writing Use Case - A Deep Dive

### Initial Experience

User logs into Liminal Chat and selects "Creative Writing" product (internally called NovelCraft or similar). Jarvis immediately engages:

**Jarvis**: "I see you're starting a new book project. What's your story about?"

User provides a high-level concept: "A detective story set in 1920s Chicago where magic is real but hidden."

### The Wizard Phase

Jarvis guides through initial setup:
- **Working Title**: "Shadows Over the Windy City"
- **Genre**: Urban Fantasy Mystery
- **Length Target**: Novel (80,000 words)
- **Starting Point**: "Do you have an outline, some scenes, or just the concept?"

Based on responses, Jarvis creates the initial project structure and determines where to begin.

### Builder Navigation

The interface shows:
- **Main Viewport**: Currently active builder
- **Left Sidebar**: Views of other builders (read-only)
- **Right Sidebar**: Jarvis chat (always present)
- **Top Bar**: Builder switcher and project info

Available Builders for Creative Writing:
1. **World Builder** - Setting, magic system, locations
2. **Character Builder** - Cast, relationships, backstories
3. **Outline Builder** - Plot structure, chapter summaries
4. **Chapter Builder** - Actual prose drafting

### World Builder Deep Dive

User clicks into World Builder (or Jarvis navigates there based on conversation).

**Interface Elements**:
- Wiki-style editor for locations, rules, history
- Image uploads for maps, mood boards
- Interconnected pages with [[wiki-links]]
- Tags for organization (#location #magic-rule #historical-event)

**Jarvis Integration**:
- User: "Add a speakeasy that's a front for a wizard's guild"
- Jarvis creates the entry, asks follow-up questions
- Auto-links to relevant existing pages
- Suggests implications for the magic system

**Advanced Flow - Roundtable Review**:
- User: "Let's review the magic system for consistency"
- Jarvis spawns specialized agents:
  - Continuity Expert (checks for contradictions)
  - Genre Expert (ensures it fits urban fantasy conventions)
  - Mystery Expert (verifies it doesn't break mystery plotting)
- Results presented as discussion, user can accept/modify suggestions

### Character Builder Experience

**Core Interface**:
- Character cards with portraits (AI-generated or uploaded)
- Relationship graph (visual connections between characters)
- Detailed profiles (backstory, motivations, secrets)

**Jarvis Character Development**:
- User: "I need a femme fatale who's actually the police chief's daughter"
- Jarvis generates initial profile
- User: "Make her less stereotypical"
- Jarvis adjusts, explains changes
- Character auto-appears in relationship graph

**The "Vamp" Feature**:
- User mentions character in outline but hasn't created them
- Jarvis can "vamp" - improvise consistent character details
- These get flagged for user review/modification later

### Outline Builder Mechanics

**Structure**:
- Three-act breakdown
- Chapter summaries
- Scene cards within chapters
- Plot thread tracking

**Jarvis Outlining**:
- Suggests story structure based on genre
- Identifies plot holes or pacing issues
- Can regenerate sections while preserving others
- Links outline elements to characters/world elements

### Chapter Builder - The Parallel Flow

This is where the advanced flows shine:

**Parallel Generation Setup**:
- User: "Let's write chapter one. Set up three drafting agents."
- Three panels appear, each with configuration:
  - Agent 1: Conservative, noir-focused, Chandler-inspired
  - Agent 2: Balanced, modern sensibilities, snappy dialogue
  - Agent 3: Experimental, heavy magic elements, literary

**Configuration Options** (dropdowns/sliders):
- Creativity Level (Conservative → Wild)
- Tone (Dark → Light)
- Pacing (Slow burn → Action-packed)
- Voice (Period authentic → Modern)

**The Drafting Process**:
- Agents write simultaneously (user sees progress)
- Each produces different interpretation of chapter
- User can:
  - Copy sections between drafts
  - Ask specific agent to regenerate portions
  - Merge favorite elements into their draft
  - Direct Jarvis: "Make agent 2's opening more like agent 1's"

### The View System

While in Chapter Builder, user can see:
- **Character View** (left sidebar): Quick reference list
- **Outline View** (left sidebar): Current chapter context
- **World View** (optional): Relevant locations/rules

Clicking any element in a view offers options:
- "Edit in Character Builder" (switches builders)
- "Tell Jarvis to update" (stays in current builder)

Views auto-update via Convex sync when changes occur.

### Progressive Complexity

**New User Path**:
1. Just talks to Jarvis: "Write a scene where the detective discovers magic"
2. Jarvis asks clarifying questions, creates content
3. User never directly touches builders

**Intermediate Path**:
1. User explores builders Jarvis is using
2. Starts making direct edits
3. Uses Jarvis for complex tasks: "Add foreshadowing to chapter 3"

**Power User Path**:
1. Configures parallel agents with specific parameters
2. Runs roundtable reviews at key milestones
3. Creates custom world-building taxonomies
4. Still uses Jarvis for tedious tasks

## Derived Conceptual Abstractions

### 1. Products
Top-level applications built on Liminal Chat framework:
- Creative Writing
- Business Analysis
- Research Hub
- D&D Campaign Manager

### 2. Builders
Persistent workspaces within products:
- Focus on constructing specific artifact types
- Contain editors, tools, and workflows
- Scoped context for Jarvis

### 3. Flows
Advanced workflows available within builders:
- **Edit Flow**: Direct manipulation with Jarvis assistance
- **Roundtable Flow**: Multi-agent review and critique
- **Parallel Flow**: Multiple simultaneous generations
- **Pipeline Flow**: Sequential transformation stages

### 4. Agents
Actors within flows:
- **Jarvis**: Meta-agent with memory and builder access
- **Specialized Agents**: Configured for specific tasks
- **User**: Treated as special agent in the system

### 5. Views
Read-only representations of other builders:
- Provide context without builder switching
- Enable quick navigation
- Support "tell Jarvis to update" pattern

## Jarvis Memory Architecture

### Hierarchical Context Management

**User Memory** (Cross-product):
- Preferences: "Likes detailed feedback"
- Patterns: "Works best with examples"
- Style: "Prefers concise explanations"

**Product Memory** (Creative Writing):
- Common workflows used
- Typical agent configurations
- Learned shortcuts

**Project Memory** (Current Book):
- All established facts
- Style decisions
- Character relationships
- World rules

**Builder Memory** (Session/Recent):
- Current focus area
- Recent edits
- Open questions
- Active flows

### Context Scoping

Jarvis only loads relevant context:
- In Character Builder: Full character data, compressed world/outline
- In Chapter Builder: Full outline, character summaries, recent chapters
- Switching builders: Full reload of target builder context

## Technical Architecture Implications

### Builder as Convex Module
Each builder is a self-contained module with:
- Dedicated tables
- Specific actions/mutations
- Defined flows
- Jarvis tool definitions

### Flow as Composable Mixin
Flows are generic implementations that builders configure:
```
RoundtableFlow + CharacterBuilder = Character consistency review
RoundtableFlow + ChapterBuilder = Prose quality review
```

### Agent Configuration
Agents are parameterized at runtime:
- Model selection (GPT-4, Claude, etc.)
- Temperature and other params
- System prompts based on configuration
- Memory access levels

### State Management
- Convex real-time sync for views
- Optimistic updates for user edits
- Background updates from Jarvis actions
- Conflict resolution for parallel edits

## The Magic: Progressive Disclosure

The system works because complexity is optional:

**Entry Point**: "Just tell Jarvis what you want"
- Zero learning curve
- Immediate productivity
- Natural language interface

**Growth Path**: See how Jarvis uses builders
- Learn by observation
- Try direct manipulation
- Jarvis always there to help

**Power Usage**: Leverage advanced flows
- Configure specialized agents
- Run complex workflows
- But still delegate tedium to Jarvis

## Why This Achieves 10-50x Productivity

1. **Context Never Lost**: Jarvis maintains all project state
2. **Cognitive Load Managed**: One builder focus at a time
3. **Tedium Automated**: Jarvis handles repetitive tasks
4. **Flow State Enabled**: No tool friction or decision paralysis
5. **Quality Multiplied**: Parallel generation and review
6. **Iteration Accelerated**: Quick regeneration and refinement

## The Business Model Insight

Traditional software: Users must learn the tool
Liminal Chat: Tool teaches itself through Jarvis

This means:
- No training required
- No documentation needed
- No onboarding friction
- Natural feature discovery
- Users cannot fail

The complexity that enables massive productivity gains becomes completely opt-in. Users get value immediately through Jarvis, then naturally grow into power users as they discover features organically.

## Next Steps

1. Implement Jarvis with sophisticated context management
2. Build first builder (recommend Chapter Builder for impact)
3. Add view system for cross-builder visibility  
4. Implement one advanced flow (Parallel Generation)
5. Test progressive disclosure with real users
6. Iterate based on how users naturally work

The vision is clear: Liminal Chat isn't just another AI tool. It's a new paradigm where AI doesn't just generate content but actively helps manage the complexity of creative and analytical work. Jarvis as your builder assistant makes this possible.

---

# Design Evolution Update - Post Deep User Flow Discussion

## Overview

This section captures the significant design evolution that occurred after the initial Deep User Flow Discussion. The conversation evolved from abstract patterns to concrete implementation strategies, culminating in a revolutionary approach to AI-native software architecture.

## Major Design Decisions and Evolution

### 1. Implementation Architecture: The Hybrid Approach

After analyzing PocketFlow patterns and Convex Components, we arrived at a hybrid architecture that leverages the best of both:

**Rejected Approaches:**
- **Pure Convex Components**: Too chat-centric, would fight our Builder abstraction
- **Pure PocketFlow**: Would require reimplementing durability, retries, streaming

**Chosen Approach: Hybrid Architecture**
```typescript
// Use Convex Components as infrastructure while implementing our patterns
interface Builder {
  id: string;
  type: 'character' | 'world' | 'chapter';
  state: BuilderState;
  availableFlows: Flow[];
}

// Jarvis uses AI Agent component
const jarvisAgent = new Agent(components.agent, {
  chat: claude.chat("claude-3-5-sonnet"),
  tools: createBuilderTools(),
});

// Flows use Workflow component for durability
class RoundtableFlow implements Flow {
  async execute(builder: Builder, config: FlowConfig) {
    return workflow.start(ctx, internal.flows.roundtable, {...});
  }
}
```

### 2. Builder Organization Evolution

**Initial Concept**: Single file per builder (module)
**Evolution**: Directory structure for complex builders

```
convex/
├── builders/
│   ├── character/
│   │   ├── index.ts          // Public API exports
│   │   ├── mutations.ts      // Create, update, delete
│   │   ├── queries.ts        // Get, list, search
│   │   ├── actions.ts        // LLM operations
│   │   ├── jarvis.ts         // Jarvis config & tools
│   │   └── types.ts          // Shared types
```

**Rationale**: 
- Manageable file sizes
- Parallel development
- Clear separation of concerns
- Jarvis configuration isolated from core logic

### 3. Jarvis Integration Pattern

Each builder exports Jarvis-specific configuration, making Jarvis truly contextual:

```typescript
// convex/builders/character/jarvis.ts
export const jarvisConfig = {
  // Context loader - what Jarvis needs when in this builder
  loadContext: query({
    handler: async (ctx, args) => {
      return {
        summary: `Project has ${characters.length} characters`,
        recentActivity: recentEdits,
        guidelines: "Focus on character consistency"
      };
    }
  }),

  // Builder-specific tools
  tools: {
    createCharacter: createTool({...}),
    analyzeRelationships: createTool({...})
  },

  // Memory hints for this builder
  memoryConfig: {
    importance: {
      characterNames: "critical",
      relationships: "high"
    }
  }
};
```

### 4. The Workflow Philosophy Shift: From Abstraction to Schematic

**Critical Decision**: Embrace "copy-paste" philosophy over abstraction (shadcn pattern)

**Before**: Try to create configurable workflows
**After**: Generate bespoke workflows from templates

```bash
# CLI generates customizable workflows
npx liminal-chat generate builder fantasy-map \
  --workflows roundtable,parallel,pipeline
```

**Benefits**:
- Each workflow can be totally different
- No abstraction overhead
- Natural evolution through user feedback
- Clear ownership
- No version conflicts

### 5. The Self-Documenting AI Pattern (Revolutionary)

**The Breakthrough**: Every object in the system provides its own AI documentation

```typescript
// Each workflow exports Jarvis documentation
export const jarvisDocs = {
  name: "Character Roundtable Review",
  description: "Multi-agent discussion to review a character",
  
  when_to_use: [
    "User asks to 'review' or 'critique' a character",
    "Character feels flat or inconsistent"
  ],
  
  required_context: {
    characterId: "The character to review"
  },
  
  example_invocations: [
    "Let's review Sarah's character",
    "Run a roundtable on the villain"
  ],
  
  expected_outcomes: [
    "List of suggested improvements",
    "Character depth analysis"
  ]
};
```

**Context Aggregation Pattern**:
```typescript
// Builder aggregates all its components' documentation
export const getJarvisContext = query({
  handler: async (ctx, args) => {
    return {
      builder: {
        name: "Character Builder",
        current_state: await getBuilderState(ctx)
      },
      available_workflows: {
        roundtable: roundtableDocs,
        parallel: parallelDocs
      },
      available_tools: {
        createCharacter: {
          description: "Create a new character",
          when_to_use: "User wants to add a character"
        }
      }
    };
  }
});
```

## The Paradigm Shift

### Traditional Software Development
- Humans write docs → Humans read docs → Humans use APIs
- Central documentation
- Complexity through abstraction

### Our AI-Native Architecture  
- Code self-documents → AI reads context → AI orchestrates usage
- Distributed documentation that aggregates
- Complexity through local context + AI navigation

### The Meta Pattern
```typescript
interface AILiterate<T> {
  implementation: T;
  forJarvis: {
    what: string;
    when: string[];
    how: Examples[];
    why: string;
    next: string[];
  };
}
```

## Key Architectural Insights

### 1. Complexity Management Through Locality
- Knowledge lives with the code
- Each component knows how to be used
- Context aggregates up to Jarvis
- No central knowledge base to maintain

### 2. Builder-Centric, Not Chat-Centric
- Builders are persistent workspaces
- Flows are tools within builders
- Jarvis navigates between builders
- Chat is just the interface to Jarvis

### 3. Workflows as First-Class Citizens
Each workflow is:
- Self-contained implementation
- Self-documenting for Jarvis
- Customizable per builder
- Generated from templates but owned by builder

### 4. Progressive Implementation Strategy
1. Jarvis with AI Agent component (sophisticated context management)
2. First Builder with basic operations
3. One Flow implementation (recommend Parallel)
4. View system for cross-builder visibility
5. Self-documentation pattern throughout

## The Revolutionary Insight

We're building an **AI-navigable system** where:
- Code is written for dual audiences (machines to execute, AI to orchestrate)
- Documentation IS the interface
- Complexity is managed through local context aggregation
- The AI assistant isn't a feature - it's the runtime

This solves the fundamental problem: as systems get more complex, they become harder to use. But with our approach, more complexity means more self-documentation, making the system MORE navigable for Jarvis, not less.

## Agent Architecture: Two Fundamentally Different Systems

### The Architectural Split

Through our design evolution, we've identified two distinct orchestration needs that require fundamentally different approaches:

#### 1. Builder Workflows (Deterministic with Fuzzy Nodes)

**Pattern**: Traditional workflow orchestration with LLM injection points
```
User Input → Parse/Route → Agent Nodes → Update State → Complete
```

**Characteristics**:
- Linear or branching flows with clear paths
- User-driven progression
- Deterministic execution with non-deterministic nodes
- Success/failure states matter
- State machines with AI-powered transitions

**Examples**:
- Roundtable discussions (user directs each turn)
- Parallel generation (spawn, wait, merge)
- Pipeline processing (stage 1 → stage 2 → stage 3)
- Document creation workflows

**Implementation**: Convex Workflow is perfect for these patterns. The workflow handles orchestration while individual steps can use LLMs for fuzzy matching, content generation, or routing decisions.

#### 2. Intelligent Agent Systems (Self-Organizing Swarms)

**Pattern**: Resilient, parallel, best-effort systems that achieve goals through emergence
```
Goal → Multiple Parallel Strategies → Shared State Influence → Emergent Result
         ↓                               ↓                        ↓
    Some Fail                    Nodes Affect Each Other    Intelligence Emerges
```

**Characteristics**:
- Highly decomposable decision-making
- Self-organizing behavior
- Failure-tolerant (some nodes failing is expected)
- No predetermined paths
- Intelligence from interaction, not sequence

**Examples**:
- Jarvis context assembly
- Memory management and compression
- Multi-strategy information retrieval
- Pattern recognition across artifacts
- Continuity checking

**Implementation**: This is where PocketFlow patterns shine. Nodes operate semi-independently, influencing shared state and creating conditions for other nodes to act.

### Memory System Architecture Example

The memory system perfectly illustrates why intelligent agents need swarm patterns:

```typescript
// Traditional Approach (Brittle)
workflow.define({
  handler: async (step) => {
    const recent = await step.runQuery(getRecentMemories);
    const compressed = await step.runAction(compressMemories, recent);
    const relevant = await step.runAction(findRelevant, compressed);
    return relevant; // Fails if any step fails
  }
});

// Swarm Approach (Resilient)
class MemorySwarm extends Flow {
  nodes = {
    recent: new RecentMemoryNode(),        // Last 24h
    semantic: new SemanticSearchNode(),    // Embedding search
    pattern: new UserPatternNode(),        // User habits
    context: new BuilderContextNode(),     // Current builder
    temporal: new TemporalNode(),          // Time-based
    compressed5x: new CompressionNode(5),  // Medium compression
    compressed20x: new CompressionNode(20) // High compression
  };
  
  // Nodes work in parallel, influence shared state
  // If semantic search fails, others compensate
  // Multiple compression levels provide fallbacks
  // Result emerges from collective effort
}
```

### The Key Insight: Autonomy Through Emergence

**Traditional Orchestration**: "Do A, then B, then C"
- Predetermined paths
- Fragile to failures
- Limited adaptability

**Swarm Intelligence**: "Achieve goal X using available strategies"
- Multiple approaches in parallel
- Graceful degradation
- Emergent behavior
- Self-healing

### Jarvis Memory Management Deep Dive

For Jarvis specifically, we envision a sophisticated tiered memory system:

**Memory Tiers**:
1. **Raw Logs** (1x): Full fidelity user interactions
2. **Compressed** (5x): Key points and decisions
3. **Deep Compressed** (20x): High-level patterns and insights

**Memory Maps**: Navigation structures injected into context
- Topic indices
- Temporal markers
- Relationship graphs
- Access patterns

**The Swarm Approach**:
```python
# Multiple nodes working together
class JarvisMemorySystem:
    # Async background processes (cron-triggered)
    compression_swarm = [
        ChunkIdentifierNode(),      # Find compressible chunks
        Compression5xNode(),        # Medium compression
        Compression20xNode(),       # Heavy compression
        MemoryMapGeneratorNode(),   # Create navigation
        LinkMaintenanceNode()       # Update relationships
    ]
    
    # Real-time context assembly (query-triggered)
    retrieval_swarm = [
        CurrentSessionNode(),       # Active conversation
        RecentBuilderNode(),        # Recent in this builder
        UserPreferenceNode(),       # Known patterns
        ProjectContextNode(),       # Project-wide relevance
        SemanticMatchNode()         # Content similarity
    ]
    
    # Each node contributes what it can
    # System remains functional even with failures
    # Intelligence emerges from collective contribution
```

### Design Principles for Intelligent Agents

1. **Decomposability**: Break complex decisions into simple nodes
2. **Parallelism**: Multiple strategies working simultaneously
3. **Resilience**: System functions despite individual failures
4. **Emergence**: Intelligence from interaction, not prescription
5. **Shared State**: Nodes influence common context
6. **Best Effort**: Perfect isn't required, coverage is

### When to Use Each Pattern

**Use Traditional Workflows When**:
- User action triggers specific sequence
- Clear success/failure criteria
- State machine behavior needed
- Reproducibility matters

**Use Swarm Patterns When**:
- Building autonomous intelligence
- Multiple valid approaches exist
- Resilience more important than perfection
- Emergent behavior desired

### Implementation Strategy

**Phase 1-3**: Focus on builder workflows with Convex Workflow
- Get user-facing features working
- Prove out the builder/flow patterns
- Simple Jarvis with basic context

**Phase 4+**: Introduce swarm intelligence for Jarvis
- Implement PocketFlow-inspired patterns
- Build sophisticated memory system
- Enable truly autonomous agent behavior

The beauty of this split is that user-facing features can ship quickly with traditional patterns, while the intelligent agent layer can evolve separately using more sophisticated swarm architectures.

## Implementation Architecture Decisions

### Component Selection: Build vs Buy

After deep analysis of Convex components, we've made critical decisions about what to use vs build:

#### Convex Workflow Component: ADOPT
Perfect fit for our builder workflows with no conflicts. Provides:
- Durable execution that survives restarts
- Built-in retry logic and error handling
- State management across workflow steps
- Reactive status tracking

Maps directly to our Roundtable, Parallel, and Pipeline flows.

#### Convex AI Agent Component: BUILD CUSTOM
Despite attractive features (vector search, usage tracking, streaming), we're building custom because:
- **Schema Conflicts**: AI Agent uses threads/messages model that conflicts with our conversations/messages design
- **Single Assistant Assumption**: Doesn't support multi-agent conversations natively
- **Conceptual Mismatch**: Thread-based vs our conversation-based model

**What We'll Build Ourselves**:
- Vector search for Jarvis memory (when needed)
- Usage tracking tailored to our multi-agent needs
- Custom agent orchestration

#### Our Schema: VALIDATED
Our original conversations/messages schema has proven prescient:
- Messages attached to agents, not conversations
- Supports multiple agents in one conversation
- Supports multiple users in one conversation
- Enables Jarvis to join any conversation
- Rich message types (chain_of_thought, tool_call)

The key insight: attaching identity at the message level, not conversation level, enables all our advanced patterns.

### Agent Architecture: Bespoke Modules

After considering various patterns, we've decided on **bespoke agent modules** over configurable agents:

#### Why Bespoke Agents Win

**1. Code Navigability**
- Coding agents can read `builders/character/agents/noir-expert.ts`
- Immediate understanding vs reconstructing from config tables
- Version control shows meaningful evolution

**2. Specialized Behavior**
- Noir expert: custom period dialogue parsing
- Continuity checker: special memory access patterns
- Awkward as config, natural as code

**3. Self-Documentation**
```typescript
// agents/noir-expert.ts
export const agentDocs = {
  name: "Noir Expert",
  expertise: ["1940s atmosphere", "hardboiled dialogue"],
  when_to_use: ["Period authenticity needed"],
  special_capabilities: ["Period slang detection"]
};
```

**4. Flexible Persistence**
- Each agent implements exactly what it needs
- Some need vector search, others don't
- Some need memory, others are stateless

#### Two-Tier Agent System

**Tier 1: Bespoke Agents** (Core System)
- Full custom code
- Specialized tools and memory
- Complex behaviors
- Self-documenting modules

**Tier 2: Simple User Agents** (User Customization)
- Just: name, model, system prompt, temperature
- For roundtables: "aggressive editor", "write like Hemingway"
- Jarvis can generate from natural language
- No complex capabilities, just personality

This avoids building an overly flexible agent framework while giving users the customization they need.

### Tool Architecture: Complete Modules

Tools aren't just functions - they're complete interaction modules:

```typescript
// tools/character-analysis.ts
export const tool = {
  // Function implementation
  execute: async (character: Character) => { ... },
  
  // LLM instruction
  instructions: "Analyzes character depth and consistency",
  
  // Input validation
  validateInput: (input) => { ... },
  
  // Output formatting
  formatOutput: (result) => { ... },
  
  // Retry logic
  retryStrategy: { maxAttempts: 3, backoff: 'exponential' },
  
  // Error templates
  errorMessages: { ... },
  
  // For Jarvis
  jarvisDocs: {
    when_to_use: ["Character feels flat"],
    example_usage: "Analyze Sarah's character depth"
  }
};
```

Each tool teaches agents how to use it, not just what to call.

### Multi-Agent Conversation Patterns

Our schema naturally supports multi-agent conversations:

**1. Message-Level Identity**
```typescript
{
  conversationId: "conv_123",
  authorType: "agent",
  authorId: "noir-expert",
  content: "The shadows tell a different story..."
}
```

**2. User-Directed Orchestration**
- User: "@noir-expert @psych what do you think?"
- System routes to addressed agents
- Agents respond in parallel
- No autonomous agent-to-agent loops

**3. Visibility Through Queries**
```typescript
// Each agent can query relevant messages
const context = await getMessagesForAgent(conversationId, agentId);
```

### Registry Patterns: Organic Growth

Rather than building registries upfront:
- Agents: Discovered through file system conventions
- Workflows: Exported from builder modules
- Tools: Listed in agent definitions

Registries emerge when actually needed:
- When Jarvis needs cross-builder discovery
- When tools need sharing between builders
- When workflows need central management

### Key Architectural Principles

**1. Locality of Complexity**
- Each component fully self-contained
- Knowledge lives with implementation
- No central configuration to maintain

**2. Dual Audience Code**
- Machines execute
- AI orchestrates
- Both needs considered in design

**3. Progressive Implementation**
- Start with simple patterns
- Add sophistication where needed
- Let usage drive complexity

**4. Ownership Over Abstraction**
- Builders own their agents
- Agents own their tools  
- Clear boundaries, no magic

## Implementation Details

### View System Architecture

**Reactive Updates**: Leveraging Convex's native sync capabilities
- Views use Convex hooks to subscribe to artifact changes
- Automatic UI updates when underlying data changes
- No manual subscription management needed

**View Design**: Bespoke per builder type
- Each builder defines its own view components
- Refined through usage and user feedback
- Common pattern: Click view → Save current state → Load target builder

**View Content**: Context-appropriate summaries
- Character views: Name, key traits, relationships
- Chapter views: Title, word count, scene list
- Outline views: Structure with expand/collapse

### Artifact Graph Implementation

**Storage in Convex**: No separate graph database needed
- Artifacts table with project scoping
- ArtifactRelationships join table for edges
- Bidirectional indexes for efficient traversal

**Tagging System**:
- Builder tags (character, world, chapter)
- Type tags (outline, scene, draft)
- Custom user tags
- Hierarchical tag relationships

**Graph Queries**:
- "What artifacts reference this character?"
- "What chapters use this location?"
- "Show dependency tree for this chapter"

### Agent Creation Interface

**Embeddable Editor Component**: Not a full builder
- Can be integrated into any builder
- Simple form: name, model, system prompt, temperature
- Preview pane showing example outputs
- Save to project's agent registry

**User Agent Capabilities**:
- Limited to prompt/personality configuration
- No complex tools or memory
- Designed for creative personas ("write like Hemingway")
- Jarvis can generate from natural language

### Development Approach

**Exploratory Early Phases**:
- Feel out architecture patterns
- Rapid iteration on core concepts
- Minimal planning, maximum learning
- Let pain points guide solutions

**Progressive Formalization**:
- More detailed planning after foundations solid
- Roadmap emerges from usage patterns
- Avoid premature optimization

### Performance Boundaries

**Initial Limits**:
- Roundtable: 2-5 agents (may scope to 3-4)
- Artifact size: No limits initially
- Conversation retention: Keep everything for memory system development
- Response times: Optimize when painful

**Future Considerations**:
- Memory compression tiers over time
- Archiving strategies for old conversations
- Formal performance assessment before release

### State Management Philosophy

**Start Minimal**:
- Only essential state (current artifact, selected tab)
- No complex UI state initially
- Let usage reveal what matters

**Evolution Path**:
- Add state persistence as pain points emerge
- Cursor position, expanded sections, etc.
- Undo/redo when users request it

### Error Handling Strategy

**Priority Order**:
1. Core flows first
2. Observability infrastructure
3. Error recovery patterns

**Rationale**: Can't fix what you can't see. Build visibility before resilience.

**Likely Error Scenarios**:
- Rate limits from LLM providers
- Agent failures in workflows
- Network interruptions during streaming
- Jarvis confusion/hallucination

### Cost Tracking Approach

**Initial**: Capture raw data only
- Token counts in message metadata
- Model/provider information
- No quotas or limits

**Future Evolution**:
- Usage analytics when patterns clear
- Cost allocation when pricing model defined
- User visibility based on actual needs

## Technical Implementation Plan

### Phase 1: Foundation
- Custom Jarvis implementation using our schema
- Single builder (Chapter Builder) with full directory structure
- Basic self-documentation pattern
- Convex Workflow for flow orchestration

### Phase 2: Flows
- Parallel Generation workflow using Convex Workflow
- Bespoke agent modules for drafting
- Workflow self-documentation
- Simple user agent creation

### Phase 3: Multi-Builder
- Character and World builders
- View system implementation
- Cross-builder Jarvis context
- Tool modules with complete interaction patterns

### Phase 4: Advanced Intelligence
- Vector search for Jarvis memory (custom implementation)
- PocketFlow-inspired swarm patterns for context assembly
- Sophisticated usage tracking
- CLI for generating new builders/workflows

## Summary

The design has evolved from a traditional "framework with AI features" to a truly AI-native architecture where:

1. **Every component teaches AI how to use it** - Self-documentation is primary interface
2. **Complexity becomes navigable through locality** - Knowledge lives with implementation
3. **Bespoke over configurable** - Custom agents, workflows, tools as code
4. **Message-level identity** - Enables multi-agent, multi-user conversations
5. **Two orchestration patterns** - Workflows for builders, swarms for intelligence
6. **Progressive implementation** - Start simple, add sophistication where needed
7. **The system gets smarter as it grows** - More features = more navigable

Key implementation decisions:
- **Keep our schema** - It's better designed for multi-agent conversations
- **Use Convex Workflow** - Perfect fit for builder orchestration
- **Build custom Jarvis** - Tailored to our unique needs
- **Bespoke agent modules** - Code over configuration
- **Tools as complete modules** - Not just functions
- **Organic registries** - Emerge when needed

This represents a fundamental shift in how complex software can be built - not by hiding complexity, but by making it AI-navigable through self-documentation and local context aggregation. The architecture is optimized for AI agents (both Jarvis and external coding agents) to understand and operate the system effectively.