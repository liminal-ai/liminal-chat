# Liminal Chat System Design Document

## 1. Executive Summary

This document provides detailed system design specifications for implementing Liminal Chat - an IDE for AI-augmented knowledge work. It complements the Architecture Document with operational details, implementation patterns, and deployment strategies.

**Key Design Principles:**
- **Graph-First Persistence**: All artifacts exist as nodes in a semantic, versioned graph
- **Dual-Platform Strategy**: Web application for broad adoption, Tauri desktop for power users
- **Lock-Based Coordination**: Prevent conflicts between human and AI editors
- **Transience-Aware**: Intelligent lifecycle management for AI-generated content
- **Team-Level Sharding**: Isolated performance and security per team

## 2. System Architecture Overview

### 2.1 High-Level Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                       │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │ Next.js Web App │  │ Tauri Desktop    │  │ CLI Tool   ││
│  │ (Vercel)        │  │ (Native Shell)   │  │ (Node.js)  ││
│  └─────────────────┘  └──────────────────┘  └────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                    HTTPS/WebSocket/SSE
                              │
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ NestJS + Fastify (High-Performance API Server)         ││
│  │ - Authentication & Authorization                        ││
│  │ - Rate Limiting & Request Validation                    ││
│  │ - LLM Provider Orchestration (Vercel AI SDK)           ││
│  │ - Real-time Coordination (WebSockets/SSE)              ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                             │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │ Agent           │  │ Artifact         │  │ Lock       ││
│  │ Orchestration   │  │ Management       │  │ Coordinator││
│  │ Service         │  │ Service          │  │ Service    ││
│  └─────────────────┘  └──────────────────┘  └────────────┘│
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │ Transience      │  │ Search &         │  │ Team       ││
│  │ Management      │  │ Indexing         │  │ Management ││
│  │ Service         │  │ Service          │  │ Service    ││
│  └─────────────────┘  └──────────────────┘  └────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │ ArangoDB        │  │ Redis            │  │ Typesense  ││
│  │ (Artifact Graph)│  │ (Cache/PubSub)   │  │ (Search)   ││
│  │ Team Sharded    │  │ Team Namespaced  │  │ Indexed    ││
│  └─────────────────┘  └──────────────────┘  └────────────┘│
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │ PostgreSQL      │  │ S3-Compatible    │  │ BullMQ     ││
│  │ (App Data)      │  │ (Cold Storage)   │  │ (Jobs)     ││
│  └─────────────────┘  └──────────────────┘  └────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Patterns

**Primary Data Flows:**
1. **User Interaction Flow**: Client → API Gateway → Service Layer → Data Layer
2. **Agent Orchestration Flow**: Service → LLM Providers → Streaming Response → Client
3. **Real-time Collaboration Flow**: Client → WebSocket → PubSub → Other Clients
4. **Artifact Lifecycle Flow**: Create → Version → Link → Transform → Archive/Purge

## 3. Core System Components

### 3.1 Artifact Graph Engine

**Purpose**: Central persistence system managing all artifacts as versioned graph nodes

**Data Models:**

```typescript
// Core Artifact Node
interface Artifact {
  id: string;                    // UUID
  title: string;
  type: 'text' | 'code' | 'outline' | 'plan' | 'synthesis';
  content: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: 'user' | 'agent';
  creatorId: string;             // userId or agentId
  teamId: string;
  currentVersionId: string;
  transience: TransienceState;
  metadata: Record<string, any>;
}

// Version History
interface Version {
  id: string;
  artifactId: string;
  content: string;
  createdAt: Date;
  createdBy: 'user' | 'agent';
  creatorId: string;
  message?: string;              // commit-like message
  parentVersionId?: string;
  agentContext?: {               // for AI-generated versions
    agentName: string;
    prompt: string;
    parameters: Record<string, any>;
  };
}

// Relationship Edges
interface Edge {
  id: string;
  fromId: string;
  toId: string;
  type: 'parent-child' | 'synthesis-source' | 'reference' | 'fork' | 'response';
  createdAt: Date;
  createdBy: string;
  metadata?: Record<string, any>;
}

// Transience State
interface TransienceState {
  state: 'live' | 'touched' | 'untouched' | 'archived' | 'purged';
  lastAccessedAt: Date;
  lastEditedAt: Date;
  decayPolicy: string;           // policy identifier
  scheduledTransition?: {
    toState: TransienceState['state'];
    scheduledAt: Date;
  };
}
```

**ArangoDB Implementation:**

```javascript
// Collections Structure
collections: {
  artifacts: {              // Document collection
    shardKeys: ['teamId'],
    indexes: ['teamId', 'type', 'transience.state', 'createdAt']
  },
  versions: {               // Document collection
    shardKeys: ['teamId'],
    indexes: ['artifactId', 'createdAt']
  },
  relationships: {          // Edge collection
    from: 'artifacts',
    to: 'artifacts',
    indexes: ['_from', '_to', 'type']
  }
}

// Team-Level Sharding
database_per_team: `team_${teamId}_artifacts`
```

### 3.2 Agent Orchestration Engine

**Purpose**: Coordinate multiple AI agents for roundtable, parallel, and pipeline operations

**Core Components:**

```typescript
// Agent Configuration
interface Agent {
  id: string;
  name: string;
  handle: string;               // @mention handle
  systemPrompt: string;
  modelProvider: 'openai' | 'anthropic' | 'openrouter';
  modelName: string;
  parameters: {
    temperature: number;
    maxTokens: number;
    topP?: number;
  };
  interactionStyle: 'guided' | 'confirmatory' | 'minimal';
  teamId: string;
  createdBy: string;
}

// Orchestration Session
interface OrchestrationSession {
  id: string;
  type: 'roundtable' | 'parallel' | 'pipeline';
  teamId: string;
  initiatedBy: string;
  agents: Agent[];
  status: 'active' | 'paused' | 'completed' | 'failed';
  context: {
    artifactId?: string;        // for artifact-focused sessions
    prompt: string;
    sharedContext: string;
  };
  streams: AgentStream[];
  createdAt: Date;
  completedAt?: Date;
}

// Individual Agent Stream
interface AgentStream {
  agentId: string;
  sessionId: string;
  status: 'pending' | 'streaming' | 'completed' | 'failed' | 'aborted';
  startedAt?: Date;
  completedAt?: Date;
  tokenCount: number;
  cost: number;
  outputArtifactId?: string;    // if stream creates new artifact
}
```

**Implementation Patterns:**

```typescript
// Roundtable Orchestration
class RoundtableOrchestrator {
  async startSession(prompt: string, mentionedAgents: string[], context?: string) {
    // 1. Parse @mentions and resolve agent IDs
    const agents = await this.resolveAgents(mentionedAgents);
    
    // 2. Create orchestration session
    const session = await this.createSession('roundtable', agents, prompt);
    
    // 3. Start concurrent agent streams
    const streams = await Promise.all(
      agents.map(agent => this.startAgentStream(agent, session, prompt))
    );
    
    // 4. Return session for client streaming
    return { session, streams };
  }
  
  private async startAgentStream(agent: Agent, session: OrchestrationSession, prompt: string) {
    const stream = await this.llmService.streamText({
      model: agent.modelName,
      system: agent.systemPrompt,
      prompt: this.buildContextualPrompt(prompt, session.context),
      onToken: (token) => this.broadcastToken(session.id, agent.id, token),
      onComplete: (result) => this.handleStreamComplete(session.id, agent.id, result)
    });
    
    return stream;
  }
}
```

### 3.3 Lock Coordination System

**Purpose**: Prevent editing conflicts between humans and AI agents

**Lock Model:**

```typescript
interface Lock {
  artifactId: string;
  editor: {
    type: 'user' | 'agent';
    id: string;
    name: string;
  };
  acquiredAt: Date;
  expiresAt: Date;
  lockType: 'exclusive' | 'advisory';
  sessionId?: string;           // for tracking agent sessions
}

// Lock Manager Implementation
class LockManager {
  private redis: Redis;
  private pubsub: PubSub;

  async acquireLock(artifactId: string, editor: LockEditor, ttl: number = 300000): Promise<boolean> {
    const lockKey = `lock:${artifactId}`;
    const lockData = JSON.stringify({
      ...editor,
      acquiredAt: new Date(),
      expiresAt: new Date(Date.now() + ttl)
    });

    // Atomic lock acquisition with expiration
    const acquired = await this.redis.set(lockKey, lockData, 'PX', ttl, 'NX');

    if (acquired) {
      // Broadcast lock acquisition
      await this.pubsub.publish(`locks:${artifactId}`, {
        type: 'acquired',
        editor,
        artifactId
      });

      return true;
    }

    return false;
  }

  async releaseLock(artifactId: string, editorId: string): Promise<boolean> {
    const lockKey = `lock:${artifactId}`;
    const currentLock = await this.redis.get(lockKey);

    if (currentLock) {
      const lock = JSON.parse(currentLock);
      if (lock.editor.id === editorId) {
        await this.redis.del(lockKey);
        await this.pubsub.publish(`locks:${artifactId}`, {
          type: 'released',
          artifactId,
          editorId
        });
        return true;
      }
    }

    return false;
  }
}
```

### 3.4 Transience Management System

**Purpose**: Intelligent lifecycle management for AI-generated artifacts

**Decay Engine Implementation:**

```typescript
// Transience Policy Engine
interface TransiencePolicy {
  id: string;
  name: string;
  teamId: string;
  rules: TransienceRule[];
  isDefault: boolean;
}

interface TransienceRule {
  condition: {
    artifactType?: string[];
    createdBy?: 'user' | 'agent';
    hasUserEdits?: boolean;
    lastAccessedDaysAgo?: number;
    isReferencedByOthers?: boolean;
  };
  action: {
    transitionTo: TransienceState['state'];
    afterDays: number;
    requiresConfirmation?: boolean;
  };
}

// BullMQ Job Processor
class TransienceProcessor {
  async processDecayJobs() {
    // Daily job to evaluate all artifacts for state transitions
    const teams = await this.getActiveTeams();

    for (const team of teams) {
      const policy = await this.getTeamPolicy(team.id);
      const candidates = await this.getDecayCandidates(team.id);

      for (const artifact of candidates) {
        const newState = await this.evaluateTransition(artifact, policy);
        if (newState && newState !== artifact.transience.state) {
          await this.scheduleTransition(artifact.id, newState);
        }
      }
    }
  }

  private async evaluateTransition(artifact: Artifact, policy: TransiencePolicy): Promise<TransienceState['state'] | null> {
    for (const rule of policy.rules) {
      if (await this.matchesCondition(artifact, rule.condition)) {
        const daysSinceLastAccess = this.daysSince(artifact.transience.lastAccessedAt);
        if (daysSinceLastAccess >= rule.action.afterDays) {
          return rule.action.transitionTo;
        }
      }
    }
    return null;
  }
}
```

### 3.5 Real-time Collaboration Infrastructure

**Purpose**: Enable live collaboration between team members and AI agents

**WebSocket Architecture:**

```typescript
// Real-time Event System
interface CollaborationEvent {
  type: 'lock_acquired' | 'lock_released' | 'artifact_updated' | 'agent_streaming' | 'presence_update';
  artifactId?: string;
  teamId: string;
  userId: string;
  timestamp: Date;
  data: any;
}

// WebSocket Handler
class CollaborationHandler {
  private io: SocketIO.Server;
  private redis: Redis;

  async handleConnection(socket: Socket, user: User) {
    // Join team-specific rooms
    await socket.join(`team:${user.teamId}`);
    await socket.join(`user:${user.id}`);

    // Track presence
    await this.updatePresence(user.id, 'online');

    // Handle artifact focus
    socket.on('focus_artifact', async (artifactId: string) => {
      await socket.join(`artifact:${artifactId}`);
      await this.broadcastPresence(user.teamId, {
        userId: user.id,
        artifactId,
        action: 'focused'
      });
    });

    // Handle edit lock requests
    socket.on('request_lock', async (artifactId: string) => {
      const acquired = await this.lockManager.acquireLock(artifactId, {
        type: 'user',
        id: user.id,
        name: user.name
      });

      socket.emit('lock_response', { artifactId, acquired });
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      await this.updatePresence(user.id, 'offline');
      await this.releaseAllLocks(user.id);
    });
  }
}
```

## 4. API Design Specifications

### 4.1 REST API Endpoints

**Authentication & Teams:**
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
GET    /api/teams/:teamId
POST   /api/teams
PUT    /api/teams/:teamId
```

**Artifacts & Versioning:**
```
GET    /api/artifacts                    # List with filtering
POST   /api/artifacts                    # Create new artifact
GET    /api/artifacts/:id                # Get artifact with current version
PUT    /api/artifacts/:id                # Update artifact (creates new version)
DELETE /api/artifacts/:id                # Soft delete (mark as purged)

GET    /api/artifacts/:id/versions       # Get version history
GET    /api/artifacts/:id/versions/:versionId  # Get specific version
POST   /api/artifacts/:id/fork           # Create fork from current version

GET    /api/artifacts/:id/relationships  # Get related artifacts
POST   /api/artifacts/:id/relationships  # Create relationship
DELETE /api/relationships/:relationshipId  # Remove relationship
```

**Agent Operations:**
```
GET    /api/agents                       # List team agents
POST   /api/agents                       # Create agent
PUT    /api/agents/:id                   # Update agent
DELETE /api/agents/:id                   # Delete agent

POST   /api/orchestration/roundtable     # Start roundtable session
POST   /api/orchestration/parallel       # Start parallel generation
POST   /api/orchestration/pipeline       # Start pipeline processing
GET    /api/orchestration/sessions/:id   # Get session status
DELETE /api/orchestration/sessions/:id   # Cancel session
```

**Search & Discovery:**
```
GET    /api/search/artifacts             # Full-text search with scoping
GET    /api/search/suggest               # Auto-complete suggestions
POST   /api/search/scope                 # Define search scope
```

### 4.2 Streaming Endpoints (SSE)

**Agent Streaming:**
```
GET    /api/stream/agent/:sessionId/:agentId    # Stream agent responses
GET    /api/stream/session/:sessionId           # Stream all session updates
```

**Real-time Updates:**
```
GET    /api/stream/artifacts/:id                # Stream artifact changes
GET    /api/stream/team/:teamId                 # Stream team activity
```

### 4.3 WebSocket Events

**Client → Server:**
```typescript
// Presence and focus
'join_artifact' | 'leave_artifact' | 'focus_change'

// Lock management
'request_lock' | 'release_lock' | 'force_break_lock'

// Live editing
'edit_start' | 'edit_delta' | 'edit_complete'

// Agent interaction
'abort_agent' | 'pause_session' | 'resume_session'
```

**Server → Client:**
```typescript
// Lock coordination
'lock_acquired' | 'lock_released' | 'lock_conflict'

// Presence updates
'user_joined' | 'user_left' | 'user_focused'

// Artifact changes
'artifact_updated' | 'version_created' | 'relationship_added'

// Agent activity
'agent_started' | 'agent_streaming' | 'agent_completed'
```

## 5. Data Architecture Implementation

### 5.1 ArangoDB Schema Design

**Database Structure:**
```javascript
// Team-level database sharding
const teamDatabases = {
  [`team_${teamId}_artifacts`]: {
    collections: {
      artifacts: {
        type: 'document',
        shardKeys: ['_key'],
        indexes: [
          { fields: ['teamId'], type: 'persistent' },
          { fields: ['type'], type: 'persistent' },
          { fields: ['transience.state'], type: 'persistent' },
          { fields: ['createdAt'], type: 'persistent' },
          { fields: ['title'], type: 'fulltext' },
          { fields: ['content'], type: 'fulltext' }
        ]
      },
      versions: {
        type: 'document',
        shardKeys: ['_key'],
        indexes: [
          { fields: ['artifactId'], type: 'persistent' },
          { fields: ['createdAt'], type: 'persistent' }
        ]
      },
      relationships: {
        type: 'edge',
        from: ['artifacts'],
        to: ['artifacts'],
        indexes: [
          { fields: ['_from'], type: 'persistent' },
          { fields: ['_to'], type: 'persistent' },
          { fields: ['type'], type: 'persistent' }
        ]
      }
    }
  }
};
```

**Query Patterns:**

```javascript
// Find all children of an artifact
const findChildren = `
  FOR v, e IN 1..1 OUTBOUND @artifactId relationships
  FILTER e.type == 'parent-child'
  RETURN v
`;

// Find artifact lineage (breadcrumb trail)
const findLineage = `
  FOR v, e IN 1..10 INBOUND @artifactId relationships
  FILTER e.type == 'parent-child'
  RETURN v
`;

// Scope-aware search
const scopedSearch = `
  LET scope = (
    FOR v, e IN 1..@maxDepth OUTBOUND @rootArtifactId relationships
    RETURN v._id
  )

  FOR artifact IN artifacts
  FILTER artifact._id IN scope
  FILTER ANALYZER(artifact.content LIKE @searchTerm, "text_en")
  SORT BM25(artifact) DESC
  LIMIT @offset, @limit
  RETURN artifact
`;
```

### 5.2 Redis Architecture

**Namespace Strategy:**
```typescript
// Team-based namespacing
const redisKeys = {
  locks: `team:${teamId}:locks:${artifactId}`,
  presence: `team:${teamId}:presence:${userId}`,
  cache: `team:${teamId}:cache:${cacheKey}`,
  pubsub: `team:${teamId}:events`,
  sessions: `team:${teamId}:sessions:${sessionId}`
};

// Lock implementation with automatic expiration
class RedisLockManager {
  async acquireLock(teamId: string, artifactId: string, editor: LockEditor, ttl: number = 300000) {
    const key = `team:${teamId}:locks:${artifactId}`;
    const value = JSON.stringify({ editor, acquiredAt: Date.now() });

    // Atomic lock with expiration
    const result = await this.redis.set(key, value, 'PX', ttl, 'NX');
    return result === 'OK';
  }
}
```

### 5.3 Search Integration (Typesense)

**Index Schema:**
```typescript
const artifactSearchSchema = {
  name: `team_${teamId}_artifacts`,
  fields: [
    { name: 'id', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'content', type: 'string' },
    { name: 'type', type: 'string', facet: true },
    { name: 'createdBy', type: 'string', facet: true },
    { name: 'transience_state', type: 'string', facet: true },
    { name: 'created_at', type: 'int64' },
    { name: 'tags', type: 'string[]', facet: true },
    { name: 'parent_ids', type: 'string[]' }  // for scope filtering
  ]
};

// Scoped search implementation
class ScopedSearchService {
  async searchWithinScope(teamId: string, query: string, scope: string[], options: SearchOptions) {
    const searchParams = {
      q: query,
      query_by: 'title,content',
      filter_by: `parent_ids:=[${scope.join(',')}]`,
      facet_by: 'type,createdBy,transience_state',
      sort_by: '_text_match:desc,created_at:desc',
      per_page: options.limit || 20,
      page: options.page || 1
    };

    return await this.typesense.collections(`team_${teamId}_artifacts`).documents().search(searchParams);
  }
}
```

## 6. Deployment Architecture

### 6.1 Container Strategy

**Docker Composition:**
```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: ./apps/api
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - ARANGODB_URL=${ARANGODB_URL}
    ports:
      - "3000:3000"
    depends_on:
      - redis
      - arangodb
      - postgres

  web:
    build: ./apps/web
    environment:
      - NEXT_PUBLIC_API_URL=${API_URL}
      - VERCEL_AI_SDK_API_KEY=${VERCEL_AI_SDK_API_KEY}
    ports:
      - "3001:3000"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  arangodb:
    image: arangodb:3.11
    environment:
      - ARANGO_ROOT_PASSWORD=${ARANGO_ROOT_PASSWORD}
    ports:
      - "8529:8529"
    volumes:
      - arango_data:/var/lib/arangodb3

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=liminal_chat
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  typesense:
    image: typesense/typesense:0.25.1
    environment:
      - TYPESENSE_API_KEY=${TYPESENSE_API_KEY}
      - TYPESENSE_DATA_DIR=/data
    ports:
      - "8108:8108"
    volumes:
      - typesense_data:/data

volumes:
  redis_data:
  arango_data:
  postgres_data:
  typesense_data:
```

### 6.2 Kubernetes Deployment

**Production Deployment Strategy:**
```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: liminal-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: liminal-api
  template:
    metadata:
      labels:
        app: liminal-api
    spec:
      containers:
      - name: api
        image: liminal/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: liminal-secrets
              key: redis-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 7. Monitoring & Observability

### 7.1 Application Metrics

**Key Performance Indicators:**
```typescript
// Custom metrics collection
class MetricsCollector {
  private prometheus = require('prom-client');

  // Agent orchestration metrics
  private agentResponseTime = new this.prometheus.Histogram({
    name: 'agent_response_time_seconds',
    help: 'Time taken for agent to respond',
    labelNames: ['agent_id', 'model_provider', 'session_type']
  });

  private concurrentSessions = new this.prometheus.Gauge({
    name: 'concurrent_orchestration_sessions',
    help: 'Number of active orchestration sessions',
    labelNames: ['team_id', 'session_type']
  });

  // Artifact management metrics
  private artifactOperations = new this.prometheus.Counter({
    name: 'artifact_operations_total',
    help: 'Total number of artifact operations',
    labelNames: ['operation', 'team_id', 'artifact_type']
  });

  private transitionEvents = new this.prometheus.Counter({
    name: 'transience_transitions_total',
    help: 'Total number of transience state transitions',
    labelNames: ['from_state', 'to_state', 'team_id']
  });

  // Lock coordination metrics
  private lockAcquisitions = new this.prometheus.Counter({
    name: 'lock_acquisitions_total',
    help: 'Total number of lock acquisitions',
    labelNames: ['editor_type', 'team_id', 'success']
  });

  private lockHoldTime = new this.prometheus.Histogram({
    name: 'lock_hold_time_seconds',
    help: 'Time locks are held',
    labelNames: ['editor_type', 'team_id']
  });
}
```

### 7.2 Health Checks & Alerting

**Health Check Implementation:**
```typescript
// Health check endpoints
class HealthController {
  @Get('/health')
  async health() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkArangoDB(),
      this.checkTypesense(),
      this.checkLLMProviders()
    ]);

    const status = checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'degraded';

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: checks.map((check, index) => ({
        service: ['postgres', 'redis', 'arangodb', 'typesense', 'llm_providers'][index],
        status: check.status,
        error: check.status === 'rejected' ? check.reason.message : undefined
      }))
    };
  }

  @Get('/ready')
  async readiness() {
    // Check if service is ready to accept traffic
    const critical = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis()
    ]);

    if (critical.some(check => check.status === 'rejected')) {
      throw new ServiceUnavailableException('Service not ready');
    }

    return { status: 'ready' };
  }
}
```

## 8. Performance Optimization

### 8.1 Caching Strategy

**Multi-Layer Caching:**
```typescript
class CacheManager {
  // L1: In-memory cache for frequently accessed data
  private memoryCache = new Map();

  // L2: Redis cache for team-scoped data
  private redisCache: Redis;

  // L3: Database with optimized queries
  private database: Database;

  async getArtifact(teamId: string, artifactId: string): Promise<Artifact> {
    // L1 check
    const memKey = `${teamId}:${artifactId}`;
    if (this.memoryCache.has(memKey)) {
      return this.memoryCache.get(memKey);
    }

    // L2 check
    const redisKey = `team:${teamId}:artifacts:${artifactId}`;
    const cached = await this.redisCache.get(redisKey);
    if (cached) {
      const artifact = JSON.parse(cached);
      this.memoryCache.set(memKey, artifact);
      return artifact;
    }

    // L3 database query
    const artifact = await this.database.getArtifact(artifactId);
    if (artifact) {
      // Cache in both layers
      await this.redisCache.setex(redisKey, 3600, JSON.stringify(artifact));
      this.memoryCache.set(memKey, artifact);
    }

    return artifact;
  }
}
```

### 8.2 Database Optimization

**Query Optimization Patterns:**
```typescript
// Batch operations for relationship creation
class OptimizedArtifactService {
  async createSynthesisArtifact(sourceArtifactIds: string[], content: string, teamId: string) {
    // Single transaction for artifact + relationships
    const transaction = await this.arangodb.beginTransaction({
      collections: {
        write: ['artifacts', 'relationships']
      }
    });

    try {
      // Create artifact
      const artifact = await transaction.collection('artifacts').save({
        content,
        type: 'synthesis',
        teamId,
        createdAt: new Date(),
        createdBy: 'agent'
      });

      // Batch create relationships
      const relationships = sourceArtifactIds.map(sourceId => ({
        _from: `artifacts/${sourceId}`,
        _to: `artifacts/${artifact._key}`,
        type: 'synthesis-source',
        createdAt: new Date()
      }));

      await transaction.collection('relationships').saveAll(relationships);
      await transaction.commit();

      return artifact;
    } catch (error) {
      await transaction.abort();
      throw error;
    }
  }
}
```

## 9. Security Implementation

### 9.1 Authentication & Authorization

**JWT-based Authentication:**
```typescript
// Auth middleware
class AuthGuard {
  async validateToken(token: string): Promise<User> {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await this.userService.findById(payload.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid user');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async checkTeamAccess(userId: string, teamId: string): Promise<boolean> {
    const membership = await this.teamService.getMembership(userId, teamId);
    return membership && membership.status === 'active';
  }
}

// Role-based access control
class RBACService {
  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    const permissions = await this.getRolePermissions(userRoles);

    return permissions.some(permission =>
      permission.resource === resource &&
      permission.actions.includes(action)
    );
  }
}
```

### 9.2 Data Encryption

**Encryption at Rest:**
```typescript
// Sensitive data encryption
class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    cipher.setAAD(Buffer.from('liminal-chat'));

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipher(this.algorithm, this.key);
    decipher.setAAD(Buffer.from('liminal-chat'));
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

## 10. CLI Implementation

### 10.1 Command Structure

**CLI Architecture:**
```typescript
// CLI command framework
class LiminalCLI {
  private apiClient: APIClient;

  async roundtable(options: RoundtableOptions) {
    const session = await this.apiClient.post('/api/orchestration/roundtable', {
      prompt: options.prompt,
      agents: options.agents,
      artifactId: options.artifactId
    });

    // Stream responses to terminal
    const stream = this.apiClient.stream(`/api/stream/session/${session.id}`);
    stream.on('data', (chunk) => {
      this.displayAgentResponse(chunk);
    });

    return session;
  }

  async parallel(options: ParallelOptions) {
    const session = await this.apiClient.post('/api/orchestration/parallel', options);

    // Display parallel streams in columns
    const streams = await Promise.all(
      session.agents.map(agent =>
        this.streamAgentResponse(session.id, agent.id)
      )
    );

    return session;
  }

  private displayAgentResponse(chunk: StreamChunk) {
    const color = this.getAgentColor(chunk.agentId);
    console.log(chalk[color](`[${chunk.agentName}]: ${chunk.content}`));
  }
}
```

This comprehensive system design document provides the detailed implementation specifications needed to build Liminal Chat, complementing the architecture document with operational details, deployment strategies, and concrete implementation patterns.
