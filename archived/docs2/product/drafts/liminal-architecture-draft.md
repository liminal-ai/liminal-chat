# Liminal Chat Architecture Document

## 1. Architecture Vision & Principles

### 1.1 Vision
Liminal Chat is architected as an Integrated Development Environment (IDE) for AI-augmented knowledge and creative work. The architecture extends IDE concepts - integrated tools, version control, workspace management, and collaborative debugging - to all forms of intellectual output through multi-agent orchestration.

### 1.2 Core Architectural Principles

1. **Graph-First Document Model**: All artifacts exist as nodes in a semantic, versioned graph with rich relationships
2. **Transience-Aware Design**: Architecture assumes 10-50x artifact generation vs traditional workflows  
3. **Team-Level Sharding**: Each team gets isolated graph instances for performance and security
4. **Write-Optimized**: Fast artifact creation and edge updates take precedence over read optimization
5. **Lock-Based Consistency**: One active editor (human or agent) per artifact at any time
6. **Progressive Disclosure**: Simple operations stay simple; complex workflows are possible but not required
7. **CLI/UI Parity**: Every UI workflow has a corresponding CLI command for automation

### 1.3 System Boundaries

- **In Scope**: Multi-agent orchestration, artifact versioning, collaborative editing, workflow automation
- **Out of Scope**: General file storage, email/calendar integration, video conferencing
- **Future Scope**: External tool integration, custom agent development, enterprise SSO

## 2. High-Level Architecture

### 2.1 Platform Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Desktop Application                       │
│  - Native OS integration and multi-window management        │
│  - Rich UI canvas for complex workflows                     │
│  - Local file system access for power users                │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Web Application                         │
│  - Browser-based access for broader adoption               │
│  - Real-time collaboration features                        │
│  - Progressive enhancement for offline capability           │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                         CLI Tool                            │
│  - Direct API access for automation                         │
│  - Batch processing capabilities                            │
│  - Shell script integration                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                         │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │ Agent           │  │ Artifact         │  │ Search &   ││
│  │ Orchestration   │  │ Graph Engine     │  │ Indexing   ││
│  └─────────────────┘  └──────────────────┘  └────────────┘│
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │ Transience      │  │ Lock             │  │ Auth &     ││
│  │ Manager         │  │ Coordinator      │  │ Teams      ││
│  └─────────────────┘  └──────────────────┘  └────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                              │
│  - Team-sharded graph databases                             │
│  - Content-addressable artifact storage                     │
│  - Full-text search indices                                 │
│  - Transience state tracking                                │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Architecture

1. **Command Flow**: User/CLI → API Gateway → Service Layer → Graph Engine
2. **Artifact Flow**: Create → Version → Link → Transform → Archive/Purge
3. **Agent Flow**: Prompt → Route → Execute → Stream → Persist
4. **Search Flow**: Query → Scope Resolution → Index Lookup → Relevance Ranking

## 3. Core Subsystems

### 3.1 Artifact Graph Engine

The heart of Liminal Chat is a graph-based document persistence system where every artifact is a versioned node with semantic relationships.

#### 3.1.1 Artifact Identity Model

**Core artifact data needs**:
- Unique identifiers for global referencing
- Type classification (text, code, outline, plan, synthesis)
- Ownership tracking (who created it - user or which agent)
- Version management with parent-child relationships
- Transience state for lifecycle management
- Flexible metadata storage for extensibility

**Version tracking needs**:
- Content snapshots with timestamps
- Creator attribution (user or agent)
- Commit-like messages for change context
- Lineage tracking to parent versions
- Agent context preservation (prompts, parameters used)

#### 3.1.2 Relationship Model

**Edge types needed**:
- Parent-child hierarchies
- Synthesis sources (which artifacts were combined)
- Cross-references between related artifacts
- View membership (which artifacts appear in which views)
- Fork relationships for branched work
- Response chains for conversations

#### 3.1.3 Write Optimization Strategies

- **Scoped Writes**: All writes resolve scope before edge creation
- **Batch Operations**: Multiple edges created under single transaction ID
- **Local Edit Zones**: Agents can only create nodes within defined boundaries
- **Edge Bucketing**: Related edges grouped for efficient updates

### 3.2 Transience Management System

AI systems generate 10-50x more artifacts than human workflows. Without intelligent lifecycle management, the system becomes unusable.

#### 3.2.1 Transience Lifecycle

| State | Description | Default Retention | Auto-Action |
|-------|-------------|-------------------|-------------|
| **Live** | Actively edited or primary artifacts | Indefinite | None |
| **Touched** | User-edited or included in synthesis | 60 days | Archive warning |
| **Untouched** | Pure AI generations, unreviewed | 14 days | Auto-archive |
| **Archived** | Cold storage, excluded from normal search | 90 days | Deletion warning |
| **Purged** | Permanently removed | - | - |

#### 3.2.2 Decay Engine Implementation

**Scheduling Infrastructure**:
- **Primary**: BullMQ for distributed job processing with Redis backing
- **Jobs**: Daily decay assessment, weekly cleanup, monthly archival
- **Monitoring**: Job success/failure tracking with alerting
- **Scaling**: Horizontal worker scaling based on artifact volume

**Processing Pipeline**:
- **Batch Size**: Configurable chunks (default: 1000 artifacts per batch)
- **Parallel Processing**: Multiple workers for different teams
- **Rate Limiting**: Respect database connection limits and API quotas
- **Error Handling**: Retry logic with exponential backoff
- **Progress Tracking**: Real-time progress updates for long-running operations

**Storage Tier Management**:
- **Hot (Redis)**: Active artifacts, recent access patterns, lock states
- **Warm (ArangoDB)**: Live and touched artifacts with full metadata
- **Cold (S3-compatible)**: Archived artifacts with compressed content
- **Transition Logic**: Automatic promotion/demotion based on access patterns

**Visualization & User Control**:
- **Activity Heat Maps**: D3.js visualizations showing artifact usage over time
- **Decay Dashboard**: Real-time view of artifacts approaching state transitions
- **User Controls**:
  - Manual state promotion (untouched → touched → live)
  - Bulk operations (archive all untouched older than X days)
  - Custom decay policies per workspace or artifact type
  - Whitelist/blacklist for specific artifacts

**Policy Engine**:
- **JSON Configuration**: Flexible rule definitions per team
- **Default Policies**: Sensible defaults with user override capability
- **Rule Types**: Time-based, access-based, relationship-based, user-defined
- **Policy Inheritance**: Team → workspace → artifact hierarchy
- **Audit Trail**: Complete history of policy changes and their effects

**Example Policy Configuration**:
```json
{
  "team_policies": {
    "default": {
      "untouched_retention_days": 14,
      "touched_retention_days": 60,
      "archive_retention_days": 90
    },
    "creative_writing": {
      "untouched_retention_days": 7,
      "touched_retention_days": 180,
      "never_purge_user_edited": true
    }
  }
}
```

### 3.3 Multi-Agent Orchestration

Three core UI paradigms enable sophisticated AI collaboration:

#### 3.3.1 Roundtable Architecture

**Purpose**: Orchestrated discussion between 3-5 specialized agents for collaborative analysis and review

**Core Components**:
- **Agent Roster Panel**: Visual presence indicators, agent status (active/thinking/idle)
- **Routing Engine**: GPT-4-mini for intelligent @mention parsing and context routing
- **Message Threading**: Hierarchical conversation structure with reply chains
- **Artifact Integration**: Inline artifact embedding with annotation capabilities
- **Export System**: Convert discussions to new artifacts or append to existing ones

**Two Primary Modes**:

1. **General Discussion Mode**:
   - Open-ended exploration and brainstorming
   - Multi-perspective problem analysis
   - Strategic planning and ideation
   - Cross-agent dialogue and debate

2. **Artifact Review Mode**:
   - Focused critique of specific artifacts
   - Split-pane view (artifact + discussion)
   - Inline commenting and annotation
   - Version comparison during review

**User Experience Flow**:
```
User Input → @mention Parsing → Context Assembly → Agent Selection →
Parallel Generation → Response Streaming → Thread Integration →
Optional Artifact Creation
```

**Implementation Details**:
- **Concurrent Streaming**: Multiple SSE connections for real-time agent responses
- **Context Management**: Shared conversation context with agent-specific perspectives
- **Rate Limiting**: Intelligent queuing to respect provider API limits
- **Error Handling**: Graceful degradation when agents are unavailable
- **State Persistence**: Full conversation history with replay capability

#### 3.3.2 Parallel Generation Architecture

**Purpose**: Generate 2-5 variations simultaneously for rapid exploration and comparison

**Core Components**:
- **Multi-Pane Interface**: React Split Pane with resizable panels for each generation
- **Streaming Display**: Real-time token streaming via Vercel AI SDK's `streamText`
- **Selection Tools**: Highlight and tag system for marking preferred sections
- **Synthesis Workspace**: Dedicated area for combining selected elements
- **Diff Visualization**: Side-by-side comparison using diff2html or Monaco Diff Editor
- **Version Management**: Snapshot system for generation sets

**User Experience Features**:
- **Synchronized Scrolling**: Optional sync across all generation panes
- **Progress Indicators**: Real-time progress bars for each generation stream
- **Tagging System**: Color-coded tags for categorizing content sections
- **Quick Actions**: One-click selection, rejection, or synthesis of content blocks
- **Export Options**: Save individual generations or synthesized combinations

**Implementation Architecture**:
- **Concurrent Streaming**: Multiple parallel API calls with shared context
- **Rate Limit Management**: Intelligent queuing using p-limit per provider
- **Stream Synchronization**: Coordinated display updates across all panes
- **Memory Management**: Efficient handling of multiple large text streams
- **Error Recovery**: Individual stream failure handling without affecting others

**Performance Constraints**:
- **Maximum Concurrency**: 5 simultaneous generations (API and UI performance boundary)
- **Context Optimization**: Shared context window with agent-specific variations
- **Bandwidth Management**: Adaptive streaming based on connection quality
- **Memory Limits**: Automatic cleanup of completed generations

#### 3.3.3 Pipeline Processing Architecture

**Purpose**: Sequential refinement through specialized agent stages with branching and checkpointing

**Core Components**:
- **Visual Pipeline Editor**: Drag-and-drop interface for stage configuration
- **Stage Configuration**: Agent selection, prompt templates, parameter tuning
- **Conditional Logic**: Branch conditions based on content analysis or user input
- **Checkpoint System**: Save/restore points with rollback capability
- **Progress Tracking**: Real-time pipeline execution status and metrics
- **Template Library**: Pre-built pipelines for common workflows

**Pipeline Features**:
- **Stage Types**:
  - Processing (transform content)
  - Review (quality gates)
  - Branch (conditional routing)
  - Merge (combine parallel paths)
- **Parallel Stages**: Multiple agents working on same content simultaneously
- **Human-in-the-Loop**: Manual review and approval gates
- **Dynamic Routing**: AI-driven stage selection based on content analysis

**State Machine Implementation**:
```
Init → Stage[1] → Checkpoint → Stage[2] → Branch → Stage[3a/3b] → Merge → Complete
         ↓           ↓           ↓          ↓           ↓         ↓
      Failure    Rollback    Retry    Conditional   Parallel   Final Review
```

**Execution Engine**:
- **Queue Management**: BullMQ for stage execution with priority handling
- **State Persistence**: Full pipeline state in ArangoDB with recovery capability
- **Resource Management**: Intelligent agent allocation and load balancing
- **Error Handling**: Stage-level retry logic with exponential backoff
- **Monitoring**: Real-time metrics and performance analytics per stage

### 3.4 Lock Coordination System

Prevents conflicts between multiple editors (human or AI).

#### 3.4.1 Lock Model

**Lock data requirements**:
- Artifact identifier being locked
- Editor information (user vs agent, ID, display name)
- Timing data (when acquired, when expires)
- Lock type (exclusive for editing, advisory for warnings)

#### 3.4.2 Lock Rules

1. Only one active editor per artifact
2. Locks expire after inactivity timeout (default: 5 minutes)
3. Owner can force-break locks
4. Queue system for lock requests using BullMQ
5. Presence indicators via Socket.IO or Ably

#### 3.4.3 Real-time Collaboration Stack

- **Presence**: Ably or Pusher for user presence
- **Lock State**: Redis with pub/sub for instant updates
- **Conflict Resolution**: Last-write-wins with optional merge UI
- **Edit Broadcasting**: WebSocket for live cursor positions

### 3.5 Search & Indexing Architecture

#### 3.5.1 Full-Text Search with Graph Scoping

**Search query capabilities needed**:
- Text search with fuzzy matching
- Scope limitation to specific subgraphs
- Filtering by transience state, artifact type, author
- Date range filtering
- Relevance boosting for recent/active/user-touched items

#### 3.5.2 Viewport Scoping

Dynamic search scopes based on current context:
- "Everything in this workspace"
- "All children of this artifact"  
- "These 5 parallel versions"
- "Artifacts in current pipeline"

### 3.6 Team Architecture

#### 3.6.1 Team Size Constraints

- **Optimal**: 1-3 concurrent humans + N agents
- **Maximum**: 5 active editors per workspace
- **Rationale**: Beyond 3 humans, coordination overhead exceeds productivity gains

#### 3.6.2 Team-Level Sharding

Each team gets:
- Isolated graph database instance
- Dedicated search indices
- Independent transience policies
- Separate usage quotas

Benefits:
- Predictable performance
- Security isolation
- Independent scaling
- Simplified backup/migration

## 4. Document Editing Architecture

### 4.1 Read/Edit Mode Separation

Clear boundaries between viewing and editing states prevent state pollution and simplify synchronization.

**Key principle**: Complete component swap between read and edit modes
- Forces clean state reset on mode changes
- Prevents state leakage between modes
- Simplifies save/cancel logic
- Uses React key prop to force unmount/remount

### 4.2 Editor Technology Stack

- **Rich Text**: Lexical (Meta) or TipTap for extensibility
- **Code Editing**: Monaco Editor (VS Code) for syntax highlighting
- **Markdown**: react-markdown with remark/rehype plugins
- **Collaborative Features**: Yjs or ShareJS for CRDT support (future)

### 4.3 Generative UI Integration

**Capabilities needed**:
- Stream React components directly from AI models
- Define tools that return UI components
- Support for data visualizations, forms, and interactive elements
- Type-safe component generation with validation

## 5. Integration Architecture

### 5.1 LLM Provider Integration

**Requirements**:
- Provider abstraction layer
- Unified streaming interface
- Token cost transparency
- Fallback provider support
- Local model capability

**Interface requirements**:
- Streaming generation for real-time responses
- Batch/complete generation for non-interactive use
- Cost estimation before execution
- Provider-agnostic interface for easy switching

### 5.2 External Service Integration

- Version control system compatibility
- Cloud storage providers
- Authentication services
- Payment processing
- Webhook endpoints for automation

## 6. Technology Stack

### 6.1 Frontend Technologies

#### Desktop Application (Tauri)
- **Framework**: Tauri for lightweight, secure cross-platform desktop
- **UI Rendering**: Web-based components via embedded WebView
- **Benefits**: Native OS integration, multi-window management, small binary size
- **Language**: Rust backend with TypeScript/React frontend

#### Web Application (Next.js)
- **Framework**: Next.js with App Router for modern React features
- **Styling**: Tailwind CSS + shadcn/ui component library
- **State Management**: Zustand for local state, SWR for server state
- **AI Integration**: Vercel AI SDK for streaming and generative UI
- **Deployment**: Vercel platform for edge functions and global CDN

#### Component Development Strategy
- Build all UI components in Next.js first
- Test in web environment with hot reload
- Compose into Tauri windows for desktop experience
- Shared component library between web and desktop

### 6.2 Backend Architecture Options

#### Dual Persistence Strategy

Liminal Chat requires two distinct persistence layers:
1. **General Application Persistence**: For users, sessions, configuration, agent definitions
2. **Specialized Graph Database**: Exclusively for artifact/edge management and transience tracking

#### Option 1: Traditional Stack (Current Implementation)

##### API Layer (Fastify/NestJS)
- **Framework**: NestJS with Fastify adapter for high performance
- **Benefits**: Dependency injection, modular architecture, TypeScript-first
- **API Design**: OpenAPI 3.0 specification, REST + SSE for streaming
- **Validation**: Zod schemas with automatic OpenAPI generation

##### General Persistence
- **Current**: File system-based storage
- **Migration Options**: 
  - PostgreSQL for relational data
  - Continue with file system for simplicity

##### Artifact Graph Database (Required Addition)

**Purpose**: Dedicated to tracking artifact relationships, versions, and transience states

| Database | Recommendation | Rationale |
|----------|----------------|-----------|
| **ArangoDB** | **Primary Choice** | Multi-model (graph + doc), perfect for artifact metadata + relationships |
| **Dgraph** | Alternative | GraphQL-native, strong graph traversal performance |
| **PostgreSQL + Apache AGE** | Conservative | Can use same Postgres instance with graph extension |
| **Neo4j** | Enterprise | Most mature graph DB, but expensive licensing |

**ArangoDB Implementation Details**:
- **Multi-Model Advantage**: Store artifact content as documents, relationships as edges
- **Team Sharding**: Separate databases per team (e.g., `team_123_artifacts`)
- **Collections Structure**:
  - `artifacts`: Document collection for artifact metadata and content
  - `relationships`: Edge collection for parent-child, synthesis, and reference links
  - `transience_states`: Document collection for decay tracking and policies
- **Query Performance**: AQL (ArangoDB Query Language) optimized for graph traversals
- **Scaling**: Cluster mode for horizontal scaling, single-server for development

**Graph DB Responsibilities**:
- Track all artifact nodes and their metadata (title, type, creator, timestamps)
- Manage edge relationships between artifacts (parent-child, synthesis sources, references)
- Store transience state and decay timers with configurable policies
- Enable fast graph traversals for related artifacts and scope resolution
- Support team-level sharding for performance isolation and security
- Provide audit trails for all artifact operations and state changes

**Performance Considerations**:
- Index on frequently queried fields (team_id, artifact_type, transience_state)
- Batch operations for bulk transience state updates
- Connection pooling for high-concurrency access
- Read replicas for search and analytics workloads

##### Supporting Infrastructure
- **Search**: Typesense for artifact content search
- **Cache**: Redis for team-scoped caching
- **Queue**: BullMQ for agent orchestration and decay jobs
- **PubSub**: Redis Streams for real-time updates

#### Option 2: Convex Backend Platform (All-or-Nothing Decision)

##### What is Convex?
Convex is a complete Backend-as-a-Service platform where you write TypeScript functions that ARE your backend. It's not a database you connect to - it completely replaces your API server. All backend logic runs as Convex functions (queries, mutations, actions) inside their platform.

**Critical Understanding**: There is NO gradual migration path. You either:
- Keep NestJS/Fastify and use traditional databases, OR
- Delete NestJS/Fastify entirely and rewrite all backend logic as Convex functions

##### Architecture with Convex + Graph DB
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Applications                     │
│  (Next.js Web App / Tauri Desktop / CLI)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                    Direct Function Calls
                              │
┌─────────────────────────────────────────────────────────────┐
│                         Convex Backend                       │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │ Query Functions │  │ Mutation         │  │ Action     ││
│  │ (Read Data)     │  │ Functions        │  │ Functions  ││
│  └─────────────────┘  └──────────────────┘  └────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │     General Persistence (Users, Config, Sessions)        ││
│  │          (Automatic indexing, real-time sync)           ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                    Convex Actions
                              │
┌─────────────────────────────────────────────────────────────┐
│              Artifact Graph Database                        │
│         (ArangoDB/Dgraph for artifact management)           │
│  - Artifact nodes with transience states                    │
│  - Edge relationships and versioning                        │
│  - Team-level sharding                                      │
└─────────────────────────────────────────────────────────────┘
```

##### Key Convex Features for Liminal Chat

1. **TypeScript-First Development**
   - End-to-end type safety from database schema to React components
   - Auto-generated types for all functions and data models
   - AI-friendly (TypeScript code generation works seamlessly)

2. **Real-Time by Default**
   - Automatic subscriptions to data changes
   - No WebSocket management needed
   - Perfect for multi-agent collaboration features

3. **Backend Functions**
   - **Queries**: Read data with automatic caching and real-time updates
   - **Mutations**: ACID-compliant writes with optimistic updates
   - **Actions**: Call external APIs, integrate with graph database

4. **General Data Storage**
   - User accounts, sessions, configurations
   - Agent definitions and prompts
   - System settings and preferences
   - **NOT for artifacts** - those live in the graph DB

5. **Integration Challenges**
   - **No Vercel AI SDK Adapter**: Unlike NestJS/Fastify which have adapters that provide the 3 core endpoints for LLM streaming
   - **Manual Implementation**: Must build streaming infrastructure in Convex Actions
   - **Different Patterns**: Convex functions ≠ HTTP endpoints, requires architectural shift
   - Actions can coordinate between Convex and graph DB but with more complexity

##### Deployment Options

**Cloud Hosting (Development)**
- Generous free tier for prototyping
- Zero-config deployment with `npx convex dev`
- Automatic scaling and global distribution

**Self-Hosting (Production)**
- Docker-based deployment with PostgreSQL or SQLite
- Can run on any cloud provider or on-premises
- Volume mounting for data persistence
- Environment-based configuration
- FSL license converts to Apache 2.0 after 2 years

##### Lock-in and Trade-off Considerations

**Vendor Lock-in Reality**:
- Convex + Vercel AI SDK = significant platform commitment
- All backend logic becomes Convex functions
- Migration away requires complete backend rewrite
- Auth integration adds another layer of lock-in

**What You Lose**:
1. **Vercel AI SDK Adapters**: No direct adapter for Convex like the NestJS/Fastify ones
   - Must implement streaming endpoints manually in Convex Actions
   - Lost convenience of pre-built LLM endpoint patterns
2. **Traditional Backend Patterns**: No middleware, interceptors, dependency injection
3. **Infrastructure Control**: Less flexibility in deployment and scaling strategies
4. **Existing Ecosystem**: NestJS plugins, guards, pipes don't transfer
5. **Team Knowledge**: Existing backend expertise becomes less relevant

**What You Gain**:
1. **Dramatic Simplification**: No API layer to maintain
2. **Built-in Real-time**: Zero WebSocket configuration
3. **TypeScript End-to-End**: Perfect type safety
4. **Faster Development**: Less boilerplate code

##### Migration Strategy

**There is only one migration path**:
1. Build new features in Convex while keeping NestJS running
2. Port backend functions one by one to Convex
3. Once all logic is ported, shut down NestJS entirely
4. This is a complete rewrite, not a migration

##### Comparison: Traditional vs Convex

| Aspect | Traditional Stack | Convex + Graph DB |
|--------|------------------|-------------------|
| **Architecture Complexity** | NestJS + File/Postgres + Graph DB | Convex + Graph DB |
| **Real-time Updates** | Manual WebSocket implementation | Automatic via Convex |
| **Type Safety** | API boundaries need careful typing | End-to-end automatic |
| **Development Speed** | More boilerplate code | Rapid development |
| **Artifact Management** | Graph DB integration from NestJS | Graph DB integration from Convex |
| **Team Expertise Required** | Backend + DevOps skills | Primarily TypeScript/React |
| **Lock-in Risk** | None | Mitigated by open-source + FSL |

**Key Insight**: Both architectures require a graph database for artifact management. The choice is whether to use NestJS or Convex as the application backend that interfaces with the graph DB.

##### Recommendation for Liminal Chat

Given Liminal Chat's requirements:
- **Heavy real-time needs** (multi-agent collaboration)
- **Dual persistence needs** (general app data + artifact graph)
- **TypeScript throughout** the stack
- **Rapid iteration** needs
- **Existing Vercel AI SDK investment**

**Critical Decision Factors**:

**Choose Traditional Stack If**:
- Vendor lock-in is a major concern
- You need Vercel AI SDK's pre-built adapters
- Team has strong NestJS expertise
- You want infrastructure flexibility
- You prefer evolutionary architecture

**Choose Convex If**:
- Real-time is absolutely critical
- Rapid development trumps flexibility
- Team is comfortable with platform commitment
- You're willing to implement LLM streaming manually
- Simplicity is more valuable than control

**Hybrid Consideration**:
Given the all-or-nothing nature of Convex and your existing Vercel AI SDK needs, you might consider:
- Keep NestJS for LLM orchestration (using Vercel AI SDK adapters)
- Use Convex for real-time features only (chat, collaboration)
- Add graph database for artifact management
- This adds complexity but preserves flexibility

### 6.3 AI/ML Technologies

#### LLM Integration
- **Primary SDK**: Vercel AI SDK for unified streaming interface
- **Providers**: 
  - OpenRouter for model aggregation
  - Direct Anthropic SDK for Claude
  - Direct OpenAI SDK for GPT models
- **Local Models**: Ollama integration for privacy-sensitive deployments

#### Agent Orchestration
- **Routing**: GPT-4-mini or Claude Haiku for @mention routing
- **Streaming**: Server-Sent Events (SSE) with backpressure handling
- **Context Management**: LangChain for complex prompt chains

### 6.4 Infrastructure Technologies

#### Deployment Stack
- **Container**: Docker with multi-stage builds
- **Orchestration**: Kubernetes for production, Docker Compose for dev
- **CI/CD**: GitHub Actions with semantic release
- **Monitoring**: OpenTelemetry with Grafana/Prometheus

#### Development Tools
- **Monorepo**: pnpm workspaces with Turborepo
- **Testing**: Vitest for unit, Playwright for E2E
- **Linting**: ESLint with custom rules, Prettier
- **Type Safety**: TypeScript strict mode, Zod runtime validation

## 7. Security Architecture

### 7.1 Data Ownership

- All artifacts exportable in open formats (JSON, Markdown)
- No proprietary encryption on user content
- Clear data retention policies
- User-controlled deletion

### 7.2 Access Control

- Team-based isolation
- Role-based permissions (owner, editor, viewer)
- API key management per team
- Audit logs for all operations

### 7.3 Security Layers

1. **Authentication**: Multi-factor support, session management
2. **Authorization**: Fine-grained artifact permissions
3. **Encryption**: At-rest for sensitive data, in-transit for all APIs
4. **Audit**: Comprehensive activity logging

## 8. Performance Architecture

### 8.1 Performance Targets

- Agent response initiation: <500ms
- Parallel generation sync: <100ms drift
- UI operation response: <50ms
- Search query response: <200ms
- Lock acquisition: <100ms

### 8.2 Scaling Strategy

- Horizontal scaling via team sharding
- Read replicas for search operations
- CDN for static artifact content
- Queue-based agent orchestration
- Connection pooling for LLM providers

### 8.3 Caching Architecture

- Team-level Redis instances
- Artifact content caching
- Search result caching
- LLM response caching (where appropriate)
- Lock state caching

## 9. CLI Architecture

Every UI operation has CLI equivalent for automation:

```bash
# Roundtable operations
liminal roundtable --agents architect,critic --prompt "Review this design"

# Parallel generation
liminal parallel --agents writer1,writer2 --output-dir ./drafts

# Pipeline execution  
liminal pipeline run editorial --input draft.md

# Artifact operations
liminal artifact list --state live --team myteam
liminal artifact archive --older-than 30d --state untouched
```

## 10. Deployment Architecture

### 10.1 Web Tier
- Cloud-native deployment
- Auto-scaling based on load
- Global CDN distribution
- Progressive web app capabilities

### 10.2 Desktop Tier
- Native application framework
- Local-first for sensitive data
- Automatic updates
- Deep OS integration

### 10.3 Infrastructure Requirements
- Graph database with ACID guarantees
- Object storage for artifacts
- Full-text search engine
- Message queue for agent coordination
- Real-time pubsub for collaboration

## 11. Migration & Evolution

### 11.1 Data Migration
- Artifact import from common formats
- Bulk operations for large migrations
- Relationship inference from folder structures
- Metadata preservation

### 11.2 API Versioning
- Semantic versioning for all APIs
- Deprecation warnings
- Migration guides
- Backward compatibility windows

### 11.3 Future Architecture Considerations
- Federated team connections
- Cross-team artifact sharing
- Plugin architecture for custom agents
- External tool integration framework

## 12. Architecture Decision Records

### ADR-001: Dual Persistence Architecture
**Decision**: Separate general persistence from artifact graph management
**Status**: Approved
**Rationale**: 
- Artifact management requires specialized graph operations
- General app data benefits from different optimization patterns
- Clean separation of concerns enables best-of-breed solutions

### ADR-002: Backend Architecture Choice
**Decision**: Traditional Stack (NestJS) vs Complete Convex Replacement
**Status**: Approved - Traditional Stack Recommended
**Key Understanding**: Convex is all-or-nothing - no gradual adoption possible

**Final Recommendation**: **Traditional Stack (NestJS + Graph Database)**

**Rationale**:
1. **Vercel AI SDK Integration**: Critical for LLM streaming - Convex lacks pre-built adapters
2. **Evolutionary Architecture**: Allows gradual enhancement without complete rewrites
3. **Team Expertise**: Leverages existing backend development patterns and knowledge
4. **Infrastructure Flexibility**: Maintains control over deployment and scaling strategies
5. **Reduced Risk**: No vendor lock-in concerns for core application logic

**Trade-offs Accepted**:
- Manual WebSocket implementation for real-time features (vs Convex's automatic real-time)
- More boilerplate code (vs Convex's simplified function-based approach)
- API boundary type safety requires careful management (vs Convex's end-to-end types)

**Implementation Path**:
- NestJS with Fastify adapter for high-performance API layer
- Dedicated graph database (ArangoDB) for artifact management
- Redis for real-time features and caching
- Vercel AI SDK for LLM orchestration and streaming

**Future Consideration**: Convex could be reconsidered for specific real-time features as a hybrid approach, but core application logic remains in traditional stack.

### ADR-003: Artifact Graph Database
**Decision**: Dedicated graph database required (ArangoDB recommended)
**Status**: Approved
**Rationale**:
- Complex relationship tracking between artifacts
- Transience state management requires graph traversals
- Team-level sharding for performance isolation
- Specialized graph algorithms for artifact lifecycle

### ADR-004: Transience Model
**Decision**: Five-tier lifecycle with configurable policies
**Rationale**: Prevents system pollution while preserving valuable work

### ADR-005: Lock Coordination
**Decision**: Pessimistic locking with timeout
**Rationale**: Simpler than CRDTs, prevents conflicts, clear ownership

### ADR-006: Team Size Limits
**Decision**: 1-3 humans optimal, 5 maximum
**Rationale**: Coordination overhead grows exponentially with AI augmentation

### ADR-007: Write Optimization
**Decision**: Optimize for writes over reads
**Rationale**: AI generates far more content than is consumed

### ADR-008: ArangoDB for Artifact Graph Management
**Decision**: Use ArangoDB as the primary graph database for artifact management
**Status**: Approved
**Rationale**:
- **Multi-Model Capability**: Combines document and graph features needed for artifacts
- **Team Sharding**: Native support for database-level isolation per team
- **Query Performance**: AQL provides efficient graph traversal with familiar SQL-like syntax
- **Scaling Path**: Clear horizontal scaling options for future growth
- **Development Experience**: Better TypeScript integration than pure graph databases
**Implementation**:
- Separate ArangoDB databases per team (e.g., `team_123_artifacts`)
- Collections: `artifacts` (documents), `relationships` (edges), `transience_states` (documents)
- Connection pooling and read replicas for performance optimization