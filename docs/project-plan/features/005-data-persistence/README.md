# Feature 005: Data Persistence Foundation

## Overview
Implement chunk-based filesystem storage for conversations with Edge message reconstruction. Replaces in-memory conversation storage with persistent, recoverable conversation history.

## Goals
- Persistent conversation storage across application restarts
- Chunk-based streaming optimization (3:1 bundle ratio)
- File system structure supporting multi-user roundtable conversations
- Edge tier message reconstruction from chunks
- Migration path to SQLite when querying becomes necessary

## Architecture Decisions
Based on [Architecture Decisions](../../../architecture/decisions.md) sections 15-17:
- **Data Primitive**: Message chunks, not complete messages
- **Storage**: Filesystem with hierarchical IDs (`us01-co12-ms02-001`)
- **Reconstruction**: Edge combines chunks into full messages for API responses
- **Bundling**: 20 token stream bundles, 60 token file chunks (3:1 ratio)

## Stories

### Story 1: File System Structure & User Management
**Goal**: Establish directory structure and user data isolation  
**Scope**: 
- Create `users/data/conversations/messages/` structure
- Implement user ID generation and management
- File naming convention: `{userId}-{conversationId}-{messageId}-{chunkId}`
- Basic file operations (create, read, list)

**Effort**: 2-3 days

### Story 2: Message Chunk Storage
**Goal**: Implement chunk-based message persistence during streaming  
**Scope**:
- Chunk data structure and JSON schema
- Write chunks to filesystem during streaming
- Sequence number management
- File locking prevention (append-only writes)

**Effort**: 2-3 days

### Story 3: Edge Message Reconstruction
**Goal**: Reconstruct complete messages from chunks at Edge tier  
**Scope**:
- Read and combine chunks by message ID
- Sort by sequence number
- Handle incomplete messages (streaming in progress)
- Cache reconstructed messages for performance

**Effort**: 2-3 days

### Story 4: Streaming Bundle Optimization
**Goal**: Implement dual bundling strategy (stream vs storage)  
**Scope**:
- Stream bundles: 20 tokens to Edge/Client
- File chunks: 60 tokens to filesystem (every 3rd stream bundle)
- Buffer management and flush timing
- Performance monitoring and tuning

**Effort**: 2-3 days

### Story 5: Conversation Management API
**Goal**: Edge API endpoints for conversation access  
**Scope**:
- List conversations for user
- Get conversation metadata
- Retrieve complete conversation with reconstructed messages
- Pagination for large conversations

**Effort**: 2-3 days

## Technical Implementation

### File Structure
```
users/
├── us01/
│   └── data/
│       └── conversations/
│           └── messages/
│               ├── us01-co12-ms01.json      # User message
│               ├── us01-co12-ms02-001.json  # Agent chunk 1
│               ├── us01-co12-ms02-002.json  # Agent chunk 2
│               └── us01-co12-ms02-003.json  # Agent chunk 3
```

### Chunk Schema
```typescript
interface MessageChunk {
  messageId: string;        // us01-co12-ms02
  seq: number;             // 1, 2, 3...
  tokens: string;          // "OAuth is the best"
  timestamp: string;       // ISO date
  agentId?: string;        // For agent responses
  status?: 'streaming' | 'complete';
}
```

### API Endpoints
```
GET /api/conversations                    # List user's conversations
GET /api/conversations/{id}               # Get conversation with messages
GET /api/conversations/{id}/messages      # Get paginated messages
POST /api/conversations                   # Create new conversation
```

## Testing Strategy

### Unit Tests
- File system operations (create, read, write chunks)
- Message reconstruction logic
- Bundle timing and sequencing
- Error handling for corrupt/missing chunks

### Integration Tests
- End-to-end streaming with chunk persistence
- Edge reconstruction from stored chunks
- Performance testing with multiple simultaneous streams
- Recovery testing (restart during streaming)

### Performance Requirements
- Chunk writes don't block streaming (<5ms overhead)
- Message reconstruction <50ms for typical conversations
- File system scales to 1000+ conversations per user
- Memory usage remains constant during long conversations

## Migration Strategy

### Phase 1: Filesystem Implementation
Start with JSON file storage for development velocity and debugging.

### Phase 2: SQLite Migration (Future)
When querying, search, or scale requires database:
- Chunk table: (messageId, seq, tokens, timestamp)
- Message table: (id, conversationId, agentId, status)
- Conversation table: (id, userId, title, participants)

### Compatibility
- Chunk structure translates directly to database tables
- File naming maps to composite primary keys
- No breaking changes to Edge API

## Dependencies
- **Requires**: Feature 004 (Testing Framework) complete
- **Requires**: Feature 002 (OpenRouter Integration) complete
- **Enables**: Feature 006 (Structured Logging)
- **Enables**: Feature 007 (AI Roundtable Routing)

## Success Criteria
- [ ] Conversations persist through application restarts
- [ ] Streaming performance unaffected by persistence
- [ ] Edge API provides complete message reconstruction
- [ ] File system handles concurrent access safely
- [ ] Test coverage meets 75% requirement
- [ ] Clear migration path to SQLite documented