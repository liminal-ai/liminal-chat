# Liminal Chat Product Requirements Document

## 1. Executive Summary

Liminal Chat is an Integrated Development Environment (IDE) for AI-augmented knowledge and creative work. Traditional IDEs provide developers with integrated tools for writing, testing, debugging, and deploying code. Liminal Chat extends this concept beyond programming to all knowledge work - providing integrated tools for researching, writing, analyzing, and refining any intellectual output with AI assistance.

The platform is built around specialized **Builders** - persistent workspaces where users construct specific types of artifacts (documents, research, plans) with the help of **Jarvis**, an AI assistant that makes the complex system accessible. Users can work through natural language with Jarvis or directly manipulate the builders as they become more familiar with the system.

The platform introduces three core workflows that change how professionals collaborate with AI:
- **Roundtable discussions and review** with multiple specialized agents
- **Parallel generation** for exploring variations simultaneously  
- **Pipeline processing** for multi-stage refinement

## 2. Problem Statement

### 2.1 The Single-Agent Bottleneck

Current AI tools constrain users to sequential, single-agent interactions that fail to match the complexity of professional creative and technical work. This creates fundamental limitations:

- **Limited Perspectives**: One model, one viewpoint, missing multi-angle analysis
- **Sequential Processing**: Waiting for one response before exploring alternatives
- **No Workflow Composition**: Unable to chain specialized agents for multi-stage refinement
- **Poor Iteration Support**: Difficult to compare variations or synthesize best elements
- **Context Fragmentation**: Each conversation isolated, no artifact persistence across sessions

### 2.2 The Complexity Barrier

As AI systems become more powerful, they become harder to use effectively:
- **Feature Discovery**: Users don't know what's possible
- **Configuration Overhead**: Too many options and parameters
- **Workflow Design**: Difficult to compose multi-step processes
- **Context Management**: Hard to maintain state across sessions

### 2.3 Missing IDE Capabilities for AI-Augmented Work

**Artifact Management Challenges**:
- AI systems generate significantly more artifacts than human-only workflows
- No tools exist to track artifact lifecycle and relationships
- Workspace pollution from extensive draft generation
- No intelligent organization or archival of content
- Inability to distinguish active work from abandoned explorations

**Creative Professionals Need**:
- Side-by-side comparison of multiple drafts
- Iterative refinement with specialized editors
- Synthesis tools for combining elements
- Version control for creative artifacts
- Organization of generated content

**Technical Professionals Need**:
- Multi-perspective code review and analysis
- Parallel solution exploration
- Automated pipeline processing
- Reproducible workflows
- Artifact lineage tracking

**Knowledge Workers Need**:
- Research synthesis from multiple viewpoints
- Structured debate and analysis tools
- Document evolution tracking
- Batch processing for repetitive tasks
- Smart filtering of active vs archived content

## 3. Product Vision & Objectives

### 3.1 Vision Statement

Build an Integrated Development Environment for AI-augmented intellectual work - extending the IDE concept from code development to all domains of knowledge creation. The system uses AI not just for content generation but for managing its own complexity through Jarvis, making advanced multi-agent workflows accessible to all users.

### 3.2 Core Objectives

1. **Transform AI interaction** from single-chat to multi-agent collaboration
2. **Enable parallel workflows** where multiple agents work simultaneously
3. **Build composable pipelines** for multi-stage refinement and processing
4. **Implement intelligent artifact management** with lifecycle tracking
5. **Provide progressive accessibility** through Jarvis assistant
6. **Support multiple interaction modes** from natural language to direct manipulation

## 4. Jarvis: Your Builder Assistant

### 4.1 Core Concept

Jarvis is the AI assistant that makes Liminal Chat's complexity manageable. Rather than requiring users to learn a new system, Jarvis enables immediate productivity through natural language while gradually revealing more powerful features.

### 4.2 Interaction Layers

**Layer 1: Natural Language Only**
- Users tell Jarvis what they want to create
- Jarvis handles all builder navigation and tool usage
- Zero learning curve for new users

**Layer 2: Guided Exploration**  
- Users see Jarvis operating builders
- Can start direct manipulation with Jarvis guidance
- Jarvis explains features as they're discovered

**Layer 3: Power Usage**
- Users leverage advanced workflows directly
- Jarvis handles routine tasks and configuration
- Full control with AI assistance when needed

### 4.3 Context Management

Jarvis maintains hierarchical context:

**User Context**: Preferences and patterns across all products
**Product Context**: Workflow preferences within a product type  
**Project Context**: Current project facts and decisions
**Builder Context**: Active work and recent changes

### 4.4 Intelligent Architecture

Jarvis achieves its sophisticated assistance through a resilient, multi-strategy approach:
- Multiple parallel retrieval strategies ensure relevant context
- Self-organizing memory system adapts to user patterns
- Graceful degradation when some strategies fail
- Intelligence emerges from collective contribution rather than rigid rules

This architecture enables Jarvis to handle complex, ambiguous requests while remaining responsive and helpful.

### 4.5 Builder Navigation

Jarvis helps users navigate between builders, understanding when to:
- Switch the user to a different builder
- Update content in the background while user continues working
- Suggest relevant builders based on current task
- Maintain context across builder transitions

## 5. Core Architecture

### 5.1 Conceptual Hierarchy

**Liminal Chat Framework**
The underlying system providing core primitives and patterns.

**Templates** 
Pre-configured product patterns:
- Document Creation (books, scripts, documentation)
- Research & Analysis (market research, academic papers)
- Strategic Planning (business plans, project proposals)

**Products**
Specific applications built on the framework:
- Creative Writing
- Business Analysis  
- Research Hub
- Campaign Designer

**Builders**
Persistent workspaces within products:
- Character Builder, World Builder (Creative Writing)
- Data Builder, Insight Builder (Business Analysis)
- Source Builder, Synthesis Builder (Research)

**Flows**
Workflows available within builders:
- Edit Flow (direct manipulation with Jarvis help)
- Roundtable Flow (multi-agent discussion/review)
- Parallel Flow (simultaneous generation)
- Pipeline Flow (sequential processing)

### 5.2 The Builder Model

Each Builder is a focused workspace for constructing specific artifact types. Builders provide:
- Specialized tools for their domain
- Persistent state across sessions
- Integration with relevant flows
- Contextual Jarvis assistance

**Example: Character Builder**
- Tools: Character profiles, relationship graphs, backstory generation
- Flows: Roundtable review, parallel variations
- Jarvis: Helps develop consistent, compelling characters

### 5.3 The View System

While working in one builder, users can see read-only views of other builders in sidebars:
- Quick reference without context switching
- Click to navigate or ask Jarvis to update
- Real-time sync when changes occur
- Maintains focus while providing context

## 6. Target Users & Market Positioning

### 6.1 Primary User Segments

**Creative Professionals**
- Writers developing novels, screenplays, or documentation
- Content creators requiring multiple perspectives
- Designers exploring variations

**Technical Professionals**
- Developers needing multi-perspective review
- Architects evaluating design trade-offs
- Technical writers creating documentation

**Knowledge Workers**
- Researchers synthesizing information
- Analysts creating reports and plans
- Consultants developing deliverables

### 6.2 Product Tiers

#### Web Application
- **Target**: Professional and corporate users
- **Access**: Browser-based, lower barrier to entry
- **Features**: Core builders and flows, team collaboration

#### Desktop Application  
- **Target**: Power users with complex workflows
- **Access**: Native application with extended capabilities
- **Features**: Multi-window support, local file access, advanced flows

## 7. Core Features & Capabilities

### 7.1 Roundtable Flow - Multi-Agent Discussion

**Functionality**: User-orchestrated discussion between multiple specialized agents for exploration and review.

**Modes**:
- **Discussion Mode**: Open-ended exploration and brainstorming
- **Review Mode**: Focused critique of specific artifacts

**Interaction Pattern**:
The user directs every turn of the conversation:
1. User addresses specific agents: "@alice @bob what do you think of this chapter?"
2. Addressed agents respond in parallel
3. User reviews responses
4. User directs next interaction: "@charlie respond to @alice's point about pacing"
5. Process continues with user maintaining full control

**Key Design Principles**:
- No autonomous agent-to-agent communication
- User decides who speaks and when
- Each user prompt triggers a new workflow step
- Prevents runaway conversations or infinite loops
- Maintains clear interaction boundaries

**Key Components**:
- Agent roster with specialized roles
- Message routing based on @mentions
- Parallel agent execution
- Threaded discussion interface
- Individual response streams per agent

**Within Builders**:
- Character Builder: Character consistency review
- Chapter Builder: Prose quality discussion
- Research Builder: Source evaluation roundtable

### 7.2 Parallel Flow - Simultaneous Generation

**Functionality**: Generate multiple variations simultaneously using different approaches.

**Key Components**:
- Split-screen interface for comparisons
- Real-time generation from multiple agents
- Selection and synthesis tools
- Version tracking

**Within Builders**:
- Chapter Builder: Multiple draft variations
- Outline Builder: Different plot structures
- Analysis Builder: Various analytical frameworks

### 7.3 Pipeline Flow - Sequential Processing

**Functionality**: Multi-stage refinement through specialized agents.

**Key Components**:
- Visual pipeline representation
- Stage configuration
- Progress tracking
- Result comparison across stages

**Within Builders**:
- Document Builder: Draft → Edit → Polish pipeline
- Research Builder: Gather → Analyze → Synthesize pipeline
- Code Builder: Generate → Review → Refactor pipeline

### 7.4 Agent System

**Agent Types**:
- **Jarvis**: Meta-agent with builder awareness
- **Specialized Agents**: Configured for specific tasks within flows
- **User**: Treated as participant in multi-agent flows

**Configuration**:
- Agents can be configured by users or Jarvis
- Parameters include model, style, and specialization
- Configuration complexity hidden until needed

### 7.5 Artifact Management

**Lifecycle States**:
- **Active**: Currently being edited or referenced
- **Recent**: Accessed within configured timeframe
- **Archived**: Moved to storage after inactivity
- **Linked**: Part of artifact relationship graph

**Organization**:
- Hierarchical structure within builders
- Tag-based categorization
- Full-text search
- Relationship visualization

**Features**:
- Automatic versioning
- Parent-child tracking
- Synthesis relationships
- Cross-builder references

## 8. Technical Architecture

### 8.1 Core Technologies

**Frontend**:
- Next.js for web application
- Tauri for desktop application
- React-based UI components
- Real-time synchronization

**Backend**:
- Convex for real-time data sync
- Serverless architecture
- Multi-model LLM integration
- Stream processing for parallel flows

**Data Layer**:
- Document-based storage for artifacts
- Graph relationships for artifact connections
- User and project segregation
- Efficient versioning system

### 8.2 Builder Implementation

Each builder is implemented as:
- Dedicated data schemas
- Specialized UI components
- Integrated flow configurations
- Jarvis tool definitions

Builders are modular and can be:
- Shared across similar products
- Customized per product needs
- Extended with new flows
- Enhanced with domain tools

### 8.3 Integration Points

**LLM Providers**:
- Multiple provider support
- Model selection per agent
- Stream handling for real-time display
- Cost tracking and limits

**External Services**:
- Authentication providers
- File storage systems
- Export formats
- API access for automation

## 9. User Experience Design

### 9.1 Progressive Disclosure

The interface reveals complexity gradually:
1. Start with Jarvis chat interface
2. Show builders as Jarvis uses them
3. Enable direct manipulation when ready
4. Reveal advanced flows through usage

### 9.2 Navigation Patterns

**Primary Navigation**:
- Builder tabs or sidebar
- Jarvis command bar
- Quick switcher (keyboard shortcut)

**Context Preservation**:
- Maintain state when switching builders
- Resume where user left off
- Jarvis remembers context across sessions

### 9.3 Responsive Design

**Adaptive Layouts**:
- Single builder on mobile/tablet
- Multiple builders on desktop
- Collapsible sidebars for focus
- Keyboard-first navigation

## 10. Implementation Approach

### 10.1 Development Phases

**Phase 1: Foundation**
- Core builder infrastructure
- Jarvis integration
- Basic edit flow
- Single product prototype

**Phase 2: Advanced Flows**
- Parallel generation
- Roundtable implementation
- Pipeline processing
- Multi-builder views

**Phase 3: Scale**
- Multiple products
- Template system
- Team features
- Advanced artifact management

### 10.2 Success Metrics

**User Engagement**:
- Time spent in builders
- Artifacts created and retained
- Flow usage patterns
- Jarvis interaction frequency

**Product Quality**:
- User retention rates
- Feature discovery metrics
- Task completion rates
- Error/confusion reduction

**Business Metrics**:
- Subscription conversion
- Token usage patterns
- Product expansion rate
- User satisfaction scores