# Liminal Chat Product Requirements Document

## 1. Executive Summary

Liminal Chat is an Integrated Development Environment (IDE) for AI-augmented knowledge and creative work. Traditional IDEs provide developers with integrated tools for writing, testing, debugging, and deploying code. Liminal Chat extends this concept beyond programming to all knowledge work - providing integrated tools for researching, writing, analyzing, and refining any intellectual output with AI assistance.

Just as a code IDE combines text editor, compiler, debugger, and version control into a unified workspace, Liminal Chat integrates multi-agent orchestration, parallel generation, pipeline processing, and artifact versioning into a cohesive environment. The platform is domain-agnostic but workflow-specific, allowing users to customize agent configurations and processing pipelines for their particular field - whether creative writing, business analysis, technical documentation, or research synthesis.

The platform introduces three core UI paradigms that fundamentally change how professionals collaborate with AI:
- **Roundtable discussions and review** with multiple specialized agents
- **Parallel generation** for exploring variations simultaneously  
- **Pipeline processing** for multi-stage refinement

Every UI workflow has a corresponding CLI command, enabling users to prototype interactively then automate via scripts. For example, a roundtable discussion explored in the UI can be re-run with different parameters using `liminal roundtable --agents writer,editor --artifact draft.md`.

## 2. Problem Statement

### 2.1 The Single-Agent Bottleneck

Current AI tools constrain users to sequential, single-agent interactions that fail to match the complexity of professional creative and technical work. This creates fundamental limitations:

- **Limited Perspectives**: One model, one viewpoint, missing the richness of multi-angle analysis
- **Sequential Processing**: Waiting for one response before exploring alternatives
- **No Workflow Composition**: Unable to chain specialized agents for multi-stage refinement
- **Poor Iteration Support**: Difficult to compare variations or synthesize best elements
- **Context Fragmentation**: Each conversation isolated, no artifact persistence across sessions

### 2.2 Missing IDE Capabilities for AI-Augmented Work

**Artifact Management Crisis**:
- AI systems generate 10-50x more artifacts than human-only workflows
- No tools exist to track artifact transience and lifecycle
- Workspace pollution from unlimited draft generation
- No intelligent decay or archival of unused content
- Inability to distinguish working artifacts from abandoned explorations

**Creative Professionals Need**:
- Side-by-side comparison of multiple drafts
- Iterative refinement with specialized editors
- Synthesis tools for combining best elements
- Version control for creative artifacts
- Automatic cleanup of unused generations

**Technical Professionals Need**:
- Multi-perspective code review and analysis
- Parallel solution exploration
- Automated pipeline processing
- Reproducible workflows via CLI
- Artifact lineage tracking

**Knowledge Workers Need**:
- Research synthesis from multiple viewpoints
- Structured debate and analysis tools
- Document evolution tracking
- Batch processing for repetitive tasks
- Smart filtering of active vs archived content

## 3. Product Vision & Objectives

### 3.1 Vision Statement

Build the definitive Integrated Development Environment for AI-augmented intellectual work - extending the IDE concept from code development to all domains of knowledge creation. Just as Visual Studio Code revolutionized programming with integrated tools and extensions, Liminal Chat will revolutionize knowledge work with integrated AI orchestration, domain-specific workflows, and professional-grade artifact management.

### 3.2 Core Objectives

1. **Transform AI interaction** from single-chat to rich AI collaboration UI patterns
2. **Enable parallel workflows** where 3-5 agents work simultaneously on variations
3. **Build composable pipelines** for multi-stage refinement and processing
4. **Implement artifact management with transience** - AI generates 10-50x more content than human workflows, requiring intelligent lifecycle management to prevent workspace pollution and maintain focus on active work
5. **Provide IDE-level features**: version control, diff/merge, workspace management
6. **Support dual modalities**: Rich GUI for exploration, CLI for automation

## 4. Target Users & Market Positioning

### 4.1 Primary User Segments

**Creative Professionals**
- Writers developing novels, screenplays, or technical documentation
- Musicians iterating on lyrics and compositional structures
- Content creators requiring multiple perspectives and rapid iteration

**Technical Professionals**
- Software developers needing multi-perspective code review
- System architects evaluating design trade-offs
- Technical writers creating comprehensive documentation

**Knowledge Workers**
- Researchers synthesizing information from multiple domains
- Business analysts creating strategic plans
- Consultants developing client deliverables

### 4.2 Two-Tier Product Strategy

#### Web Application Tier
- **Target**: Professional and corporate users needing structured AI assistance
- **Use Cases**: 
  - Research synthesis and analysis
  - Business planning and strategy documentation
  - Marketing content development
  - Design exploration and iteration
  - Corporate knowledge management
  - Team-based document collaboration
- **Access**: Browser-based, lower barrier to entry, IT-friendly deployment
- **Pricing**: Subscription + token passthrough
- **Corporate Features**: SSO support, team workspaces, usage analytics

#### Desktop Application Tier
- **Target**: Power users requiring deep integration and complex workflows
- **Use Cases**:
  - Long-form creative writing projects
  - AI-native software development
  - Multi-media content creation (music, video storyboarding)
  - Complex multi-stage pipelines
- **Access**: Tauri-based native application
- **Features**: Multi-window support, local file access, extended session management
- **Pricing**: Premium subscription + token passthrough

## 5. Core Features & Capabilities

### 5.1 AI Roundtable - Multi-Agent Discussion and Review

**Functionality**: Orchestrated discussion between 3-5 specialized AI agents for both general exploration and artifact-focused review/critique.

**Two Primary Modes**:

1. **General Discussion Mode**: 
   - Open-ended exploration of topics
   - Brainstorming and ideation
   - Multi-perspective problem solving
   - Strategic planning discussions

2. **Artifact Review Mode**:
   - Focused critique of specific artifacts
   - Multi-agent code review
   - Document analysis and feedback
   - Design evaluation from different perspectives

**Key Components**:
- Agent roster with visual presence indicators
- @mention-based routing system
- Message attribution and threading
- Artifact attachment and inline commenting
- Split view for artifact + discussion
- Lightweight routing model (GPT-4-mini or equivalent)
- Export discussion to new artifact or append to existing

**CLI Equivalent**: 
```bash
# General discussion
liminal roundtable --agents architect,security,qa --prompt "Discuss microservices vs monolith"

# Artifact review
liminal roundtable --agents editor,critic,factchecker --artifact draft.md --prompt "Review this article"
```

**Implementation Requirements**:
- Concurrent API calls to multiple models
- Message queue management
- Context window optimization per agent
- Artifact state management during discussion
- Inline annotation support
- Rate limiting and error handling

### 5.2 Parallel Generation - Simultaneous Drafting

**Functionality**: Generate 2-5 variations of content simultaneously using different agents or configurations.

**Key Components**:
- Split-screen interface with synchronized scrolling
- Real-time streaming from multiple endpoints
- Tagging and selection tools
- Synthesis workspace for combining elements
- Version snapshots of generation sets

**CLI Equivalent**:
```bash
liminal parallel-gen --agents writer1,writer2,writer3 --prompt "Draft introduction" --output-dir ./drafts
```

**Implementation Requirements**:
- Parallel API stream handling
- Diff visualization between versions
- Selection state management
- Synthesis agent for combining selections

### 5.3 Pipeline Processing - Serial Refinement

**Functionality**: Sequential processing through specialized agent stages with optional parallelism within stages.

**Key Components**:
- Visual pipeline editor
- Stage configuration (agent, prompt, parameters)
- Forward/backward navigation
- Conditional branching
- Stage-level version control

**CLI Equivalent**:
```bash
liminal pipeline run editorial-flow --input draft.md --stages draft,edit,fact-check,polish
```

**Implementation Requirements**:
- Pipeline state machine
- Inter-stage data transformation
- Checkpoint and resume capability
- Stage performance metrics

### 5.4 Agent Configuration System

**Agent Definition Parameters**:
- Unique identifier and handle
- System prompt (persona definition)
- Model selection and provider
- Generation parameters (temperature, max_tokens)
- Interaction style (verbose, minimal, confirmatory)
- Tool permissions (future)

**Interaction Styles**:
- **Guided Mode**: Proactive questions and suggestions
- **Confirmatory Mode**: Explicit confirmation before actions
- **Minimal Mode**: Direct responses without elaboration

**CLI Configuration**:
```bash
liminal agent create --name "TechEditor" --model gpt-4 --style minimal --temp 0.3
```

### 5.5 Artifact Management with Transience

**Transience Lifecycle**:
- **Live**: Actively edited or referenced artifacts
- **Touched**: User-edited or included in synthesis
- **Untouched**: Pure AI generations not yet reviewed
- **Archived**: Auto-moved after configurable decay period
- **Purged**: Removed after extended inactivity

**Version Control Features**:
- Automatic versioning on each edit
- Parent-child relationship tracking
- Branch and merge capabilities
- Metadata preservation (agent, timestamp, parameters)
- Heat map of artifact activity

**Intelligent Decay Policies**:
- Untouched AI drafts: 14-day default before archival
- Touched artifacts: 60-day retention
- User-edited content: Never auto-purged
- Configurable policies per workspace
- Bulk operations for cleanup

**Organization**:
- Hierarchical folder structure
- Tag-based categorization
- Full-text search across versions
- Filter by transience state
- Activity-based sorting

**Advanced Graph Features**:
- **Relationship Tracking**: Automatic detection of artifact dependencies and references
- **Scope Resolution**: Dynamic context boundaries for agent operations
- **Lineage Visualization**: Interactive graphs showing artifact evolution and relationships
- **Smart Cleanup**: Intelligent identification of orphaned or redundant artifacts
- **Cross-Team Discovery**: Controlled sharing and discovery of artifacts across teams

**CLI Operations**:
```bash
# Basic artifact management
liminal artifact list --state live --team myteam
liminal artifact show artifact-id --include-relationships
liminal artifact decay-status --workspace current

# Advanced operations
liminal artifact archive --older-than 30d --state untouched
liminal artifact restore artifact-id --include-children
liminal artifact graph --artifact-id abc123 --depth 3
liminal artifact cleanup --dry-run --team myteam

# Relationship management
liminal artifact link parent-id child-id --type synthesis
liminal artifact unlink relationship-id
liminal artifact scope --artifact-id abc123 --include-related
```

## 6. Technical Architecture

### 6.1 Platform Components

**Desktop Application**
- Native OS integration capabilities
- Multi-window management support
- Local file system access
- Extended session handling
- Rich UI canvas for complex workflows

**Web Application**
- Responsive, modern UI components
- Real-time collaboration features
- Progressive enhancement
- Cloud-based architecture

**Backend Services**
- Agent orchestration engine
- Artifact storage and versioning
- User authentication and authorization
- Usage tracking and billing
- High-performance streaming

**CLI Tool**
- Direct API access
- Batch processing capabilities
- Local workflow automation
- Shell script integration

### 6.2 Data Architecture

**Dual Persistence Strategy**:
1. **General Application Data**: NestJS with file system (development) or PostgreSQL (production)
   - User accounts, authentication, team management
   - Agent configurations and prompt templates
   - System settings and preferences

2. **Artifact Graph Database**: ArangoDB for specialized artifact management
   - Artifact nodes with metadata and content
   - Relationship edges (parent-child, synthesis, references)
   - Transience state tracking and decay policies
   - Team-level sharding for performance isolation

**Storage Implementation**:
- **Content Versioning**: Content-addressable storage with deduplication
- **Metadata Management**: Rich metadata with full audit trails
- **Search Integration**: Typesense for full-text search across artifacts
- **Export Capabilities**: JSON, Markdown, ZIP formats with relationship preservation

**Agent State Management**:
- **Session Persistence**: Context preservation across interactions
- **Configuration Storage**: Agent definitions with versioning
- **Cross-Session Continuity**: Conversation history and context restoration
- **State Export/Import**: Portable agent configurations and conversation data

### 6.3 Integration Requirements

**LLM Provider Integration**:
- Support for multiple LLM providers
- Provider abstraction layer
- Token cost transparency
- Local model support capability

**External Service Integration**:
- Version control system compatibility
- Cloud storage integration
- Third-party authentication support
- Payment processing capability

## 7. User Experience Design

### 7.1 UI Principles

- **Clarity over cleverness**: Function-forward interface design
- **Keyboard-first**: Full keyboard navigation and shortcuts
- **Progressive disclosure**: Advanced features accessible but not intrusive
- **State visibility**: Always clear what agents are doing
- **Interruptibility**: Any operation can be paused or cancelled

### 7.2 CLI Design Principles

- **Composability**: Commands work in pipes and scripts
- **Predictability**: Consistent parameter patterns
- **Discoverability**: Comprehensive help and examples
- **Machine-readable output**: JSON option for all commands





```