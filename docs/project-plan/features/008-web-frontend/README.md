# Feature 008: Web Frontend Interface

## Overview
Build a Vite + React + shadcn/ui web interface for the AI roundtable experience, supporting multiple simultaneous SSE streams, agent response displays, and interactive conversation management.

## Goals
- Multi-agent conversation interface with parallel response streams
- Real-time SSE streaming for each agent response
- Intuitive roundtable conversation UX with rounds visualization
- @mention autocomplete and agent management
- Responsive design for desktop and mobile

## Architecture Approach
- **Build System**: Vite (consistent with existing ecosystem)
- **Framework**: React 18 with concurrent features for multi-stream handling
- **UI Components**: shadcn/ui for base components, custom for roundtable-specific UI
- **State Management**: React Query + Zustand for server state and local state
- **Streaming**: Multiple EventSource connections for parallel SSE streams

## Stories

### Story 1: Vite + React Foundation
**Goal**: Set up development environment and basic application structure  
**Scope**:
- Vite project setup with TypeScript
- React 18 with concurrent features enabled
- shadcn/ui integration and basic component library
- Routing setup with React Router
- Build and deployment configuration

**Effort**: 2-3 days

### Story 2: Edge API Integration
**Goal**: Connect React app to existing Edge API endpoints  
**Scope**:
- API client setup with proper typing
- React Query for server state management
- Authentication context and token management
- Error handling and retry logic
- Loading states and error boundaries

**Effort**: 2-3 days

### Story 3: Conversation List & Management
**Goal**: Display and manage user conversations  
**Scope**:
- Conversation list with search and filtering
- Conversation creation and metadata management
- Agent participation display
- Responsive sidebar layout
- Conversation switching and state management

**Effort**: 2-3 days

### Story 4: Multi-Stream SSE Implementation
**Goal**: Handle multiple simultaneous agent response streams  
**Scope**:
- Multiple EventSource connection management
- Stream state coordination and error handling
- Performance optimization for many simultaneous streams
- Connection recovery and reconnection logic
- Backpressure handling for slow clients

**Effort**: 3-4 days

### Story 5: Roundtable Conversation UI
**Goal**: Interactive roundtable conversation interface  
**Scope**:
- Round-based conversation display
- Agent response areas with typing indicators
- @mention autocomplete with agent suggestions
- Message input with rich text support
- Round completion and transition UX

**Effort**: 3-4 days

### Story 6: Agent Management Interface
**Goal**: Configure and manage AI agents  
**Scope**:
- Agent definition forms and validation
- Model selection and parameter tuning
- Persona editing with preview
- Alias configuration and testing
- Agent testing and validation flows

**Effort**: 2-3 days

## Technical Implementation

### Project Structure
```
web-frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── agents/          # Agent management
│   │   ├── conversations/   # Conversation UI
│   │   └── roundtable/      # Roundtable-specific
│   ├── hooks/
│   │   ├── useSSE.ts        # SSE stream management
│   │   ├── useRoundtable.ts # Roundtable state
│   │   └── useAgents.ts     # Agent management
│   ├── services/
│   │   ├── api.ts           # Edge API client
│   │   └── streaming.ts     # SSE utilities
│   ├── store/
│   │   ├── conversations.ts # Conversation state
│   │   └── agents.ts        # Agent definitions
│   └── types/
│       └── api.ts           # Shared types with backend
```

### Multi-Stream SSE Hook
```typescript
interface UseMultiStreamSSEProps {
  roundId: string;
  agentIds: string[];
  onMessage: (agentId: string, token: string) => void;
  onComplete: (agentId: string) => void;
  onError: (agentId: string, error: Error) => void;
}

function useMultiStreamSSE({
  roundId,
  agentIds,
  onMessage,
  onComplete,
  onError
}: UseMultiStreamSSEProps) {
  const [connections, setConnections] = useState<Map<string, EventSource>>();
  const [status, setStatus] = useState<Record<string, StreamStatus>>({});

  useEffect(() => {
    const newConnections = new Map();
    
    agentIds.forEach(agentId => {
      const eventSource = new EventSource(
        `/api/rounds/${roundId}/agents/${agentId}/stream`
      );
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'token') {
          onMessage(agentId, data.token);
        } else if (data.type === 'complete') {
          onComplete(agentId);
        }
      };
      
      eventSource.onerror = (error) => {
        onError(agentId, new Error('Stream error'));
      };
      
      newConnections.set(agentId, eventSource);
    });
    
    setConnections(newConnections);
    
    return () => {
      newConnections.forEach(conn => conn.close());
    };
  }, [roundId, agentIds]);

  return { connections, status };
}
```

### Roundtable UI Components
```typescript
// Main roundtable conversation view
function RoundtableConversation({ conversationId }: Props) {
  const { rounds, activeRound } = useRoundtable(conversationId);
  const { agents } = useAgents();
  
  return (
    <div className="roundtable-container">
      <ConversationHistory rounds={rounds} />
      {activeRound && (
        <ActiveRound 
          round={activeRound}
          agents={agents}
        />
      )}
      <MessageInput 
        onSubmit={handleSubmit}
        agents={agents}
      />
    </div>
  );
}

// Active round with multiple agent responses
function ActiveRound({ round, agents }: Props) {
  const streams = useMultiStreamSSE({
    roundId: round.id,
    agentIds: round.targetAgents,
    onMessage: handleToken,
    onComplete: handleComplete,
    onError: handleError
  });
  
  return (
    <div className="active-round">
      <RoundHeader round={round} />
      <div className="agent-responses">
        {round.targetAgents.map(agentId => (
          <AgentResponse
            key={agentId}
            agent={agents[agentId]}
            stream={streams[agentId]}
          />
        ))}
      </div>
    </div>
  );
}
```

### Agent Response Display
```typescript
function AgentResponse({ agent, stream }: Props) {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'thinking' | 'streaming' | 'complete'>('thinking');
  
  return (
    <div className="agent-response">
      <AgentHeader agent={agent} status={status} />
      <div className="response-content">
        {status === 'thinking' && <TypingIndicator />}
        {content && (
          <MessageContent 
            content={content}
            streaming={status === 'streaming'}
          />
        )}
      </div>
    </div>
  );
}
```

## Design System

### Color Palette
- **Primary**: Roundtable theme colors
- **Agent Colors**: Distinct colors for each agent type
- **Status Colors**: Thinking, streaming, complete, error states
- **Dark/Light**: Theme support for different preferences

### Typography
- **Headers**: Agent names and conversation titles
- **Body**: Message content with streaming typewriter effect
- **Code**: Syntax highlighting for technical discussions
- **Mono**: Correlation IDs and technical metadata

### Layout Principles
- **Responsive**: Desktop-first with mobile adaptations
- **Multi-column**: Agent responses in parallel columns
- **Scrollable**: Independent scrolling for each agent
- **Accessible**: Keyboard navigation and screen reader support

## Performance Considerations

### Stream Performance
- **Connection pooling**: Reuse connections where possible
- **Memory management**: Clean up completed streams
- **Batch updates**: React concurrent features for smooth rendering
- **Debouncing**: Prevent excessive re-renders during streaming

### Bundle Size
- **Code splitting**: Route-based and component-based splitting
- **Tree shaking**: Only include used shadcn/ui components
- **Dynamic imports**: Load agent management only when needed
- **Asset optimization**: Minimize images and fonts

## Testing Strategy

### Unit Tests
- Component rendering and interactions
- SSE hook functionality
- State management logic
- Utility functions and helpers

### Integration Tests
- Multi-stream SSE scenarios
- Agent management workflows
- Conversation list and navigation
- Error handling and recovery

### E2E Tests (Playwright)
- Complete roundtable conversation flows
- Agent configuration and testing
- Mobile responsive behavior
- Performance testing with multiple streams

## Dependencies
- **Requires**: Feature 007 (AI Roundtable Routing) complete
- **Requires**: Working Edge API with SSE endpoints
- **Enables**: Feature 009 (User Authentication) integration
- **External**: Modern browser with EventSource support

## Success Criteria
- [ ] Multiple agent streams display simultaneously without UI blocking
- [ ] @mention autocomplete works smoothly
- [ ] Conversation switching is fast and responsive
- [ ] Mobile experience is usable and performant
- [ ] Agent management interface is intuitive
- [ ] SSE reconnection handles network issues gracefully
- [ ] Performance remains smooth with 3-4 simultaneous streams
- [ ] Accessibility standards met for keyboard and screen reader use