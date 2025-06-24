# Liminal Chat Coding Standards

## 1. Overview

This document defines coding standards and conventions for the Liminal Chat project, adapted from proven practices and optimized for our NestJS + ArangoDB + React architecture with AI-augmented development.

## 2. Code Formatting & Style

### 2.1 Linting & Formatting Tools

**Required Tools:**
- ESLint with TypeScript plugin for code quality
- Prettier for consistent formatting
- Husky for pre-commit hooks

**Configuration Files:**
```json
// .eslintrc.js
module.exports = {
  extends: [
    '@nestjs/eslint-config',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn'
  }
};

// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100,
  "endOfLine": "lf"
}
```

### 2.2 Basic Formatting Rules

**Indentation & Spacing:**
- 2 spaces for indentation (no tabs)
- Maximum 100 characters per line for code
- Maximum 120 characters for test files
- Blank line between logical code blocks

**Quotes & Punctuation:**
- Single quotes for strings: `'hello world'`
- Backticks for template literals: `` `Hello ${name}` ``
- Semicolons required at end of statements
- Trailing commas required for multi-line arrays/objects

**Example:**
```typescript
const agents = [
  'architect',
  'critic',
  'qa', // trailing comma required
];

const message = `Starting roundtable with ${agents.length} agents`;
```

## 3. TypeScript Standards

### 3.1 Type Definitions

**Interfaces vs Types:**
- Use `interface` for object definitions
- Use `type` for unions, intersections, and computed types

```typescript
// Good: Interface for object structure
interface Agent {
  id: string;
  name: string;
  systemPrompt: string;
}

// Good: Type for unions
type AgentStatus = 'active' | 'idle' | 'error';

// Good: Type for computed types
type AgentWithStatus = Agent & { status: AgentStatus };
```

**Generic Constraints:**
```typescript
// Use meaningful constraint names
interface Repository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
}
```

### 3.2 Function Signatures

**Return Types:**
- Always specify return types for public functions
- Use `Promise<T>` for async functions
- Use `void` for functions with no return value

```typescript
// Good: Explicit return types
async function startRoundtable(request: RoundtableRequest): Promise<OrchestrationSession> {
  // implementation
}

function validateAgentIds(agentIds: string[]): boolean {
  // implementation
}
```

**Parameter Types:**
```typescript
// Good: Destructured parameters with types
function createAgent({
  name,
  systemPrompt,
  modelProvider,
}: {
  name: string;
  systemPrompt: string;
  modelProvider: ModelProvider;
}): Agent {
  // implementation
}
```

### 3.3 Error Handling Types

```typescript
// Use discriminated unions for error handling
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Use specific error types
class AgentNotFoundError extends Error {
  constructor(public agentId: string) {
    super(`Agent not found: ${agentId}`);
  }
}
```

## 4. Naming Conventions

### 4.1 Variables & Functions

**Variables:**
- `camelCase` for variables and functions
- `PascalCase` for classes and interfaces
- `SCREAMING_SNAKE_CASE` for constants

```typescript
// Variables and functions
const agentCount = 3;
const activeAgents = [];
function startOrchestration() {}

// Classes and interfaces
class AgentOrchestrator {}
interface RoundtableRequest {}

// Constants
const MAX_CONCURRENT_AGENTS = 5;
const DEFAULT_TIMEOUT_MS = 30000;
```

**Boolean Variables:**
```typescript
// Use descriptive boolean names
const isAgentAvailable = true;
const hasActiveSession = false;
const canStartRoundtable = true;

// Avoid negatives when possible
const isEnabled = true; // Better than isNotDisabled
```

### 4.2 Files & Directories

**File Naming:**
- `kebab-case` for file names
- `.service.ts`, `.controller.ts`, `.module.ts` suffixes for NestJS
- `.spec.ts` for test files
- `.dto.ts` for data transfer objects

```
src/
├── modules/
│   └── orchestration/
│       ├── orchestration.module.ts
│       ├── orchestration.service.ts
│       ├── orchestration.controller.ts
│       ├── dto/
│       │   ├── roundtable-request.dto.ts
│       │   └── orchestration-session.dto.ts
│       └── __tests__/
│           ├── orchestration.service.spec.ts
│           └── orchestration.controller.spec.ts
```

### 4.3 Database Naming

**ArangoDB Collections & Fields:**
- `camelCase` for document fields (ArangoDB is document-based)
- `PascalCase` for collection names
- Descriptive collection names

```typescript
// Collection names
const COLLECTIONS = {
  Artifacts: 'Artifacts',
  Relationships: 'Relationships',
  OrchestrationSessions: 'OrchestrationSessions',
};

// Document structure
interface ArtifactDocument {
  _key: string;
  _id: string;
  title: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  teamId: string;
  transience: {
    state: TransienceState;
    lastAccessedAt: Date;
  };
}
```

## 5. Import Organization

### 5.1 Import Order

```typescript
// 1. External libraries
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Database } from 'arangojs';

// 2. Internal modules (absolute paths)
import { AgentService } from '@/modules/agents/agent.service';
import { LockService } from '@/modules/locks/lock.service';

// 3. Local files (relative paths)
import { RoundtableRequest } from './dto/roundtable-request.dto';
import { OrchestrationSession } from './dto/orchestration-session.dto';

// 4. Type-only imports
import type { Agent } from '@/types/agent.types';
import type { StreamEvent } from '@/types/stream.types';
```

### 5.2 Export Patterns

```typescript
// Named exports preferred
export class AgentOrchestrator {}
export interface RoundtableRequest {}
export type AgentStatus = 'active' | 'idle';

// Default exports for modules
export default class OrchestrationModule {}

// Re-exports for public APIs
export { AgentOrchestrator } from './orchestration.service';
export type { RoundtableRequest } from './dto/roundtable-request.dto';
```

## 6. NestJS Specific Standards

### 6.1 Module Organization

```typescript
@Module({
  imports: [
    ConfigModule,
    AgentsModule,
    LocksModule,
  ],
  controllers: [OrchestrationController],
  providers: [
    OrchestrationService,
    AgentOrchestrator,
    StreamManager,
  ],
  exports: [OrchestrationService], // Only export what's needed
})
export class OrchestrationModule {}
```

### 6.2 Service Patterns

```typescript
@Injectable()
export class OrchestrationService {
  private readonly logger = new Logger(OrchestrationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly agentService: AgentService,
    private readonly lockService: LockService,
  ) {}

  async startRoundtable(request: RoundtableRequest): Promise<OrchestrationSession> {
    this.logger.log(`Starting roundtable with ${request.agentIds.length} agents`);
    
    try {
      // Implementation
    } catch (error) {
      this.logger.error('Failed to start roundtable', error.stack);
      throw error;
    }
  }
}
```

### 6.3 Controller Patterns

```typescript
@Controller('orchestration')
@ApiTags('orchestration')
export class OrchestrationController {
  constructor(private readonly orchestrationService: OrchestrationService) {}

  @Post('roundtable')
  @ApiOperation({ summary: 'Start a roundtable discussion' })
  @ApiResponse({ status: 201, type: OrchestrationSession })
  async startRoundtable(
    @Body() request: RoundtableRequest,
  ): Promise<OrchestrationSession> {
    return this.orchestrationService.startRoundtable(request);
  }
}
```

## 7. React/Next.js Standards

### 7.1 Component Structure

```typescript
// Component props interface
interface RoundtableViewProps {
  sessionId: string;
  agents: Agent[];
  onAgentMessage?: (agentId: string, message: string) => void;
}

// Component implementation
export function RoundtableView({ 
  sessionId, 
  agents, 
  onAgentMessage 
}: RoundtableViewProps): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Hooks at top
  useEffect(() => {
    // Setup WebSocket connection
  }, [sessionId]);

  // Event handlers
  const handleAgentMessage = useCallback((agentId: string, message: string) => {
    setMessages(prev => [...prev, { agentId, message, timestamp: new Date() }]);
    onAgentMessage?.(agentId, message);
  }, [onAgentMessage]);

  // Render
  return (
    <div className="roundtable-view">
      {/* Component JSX */}
    </div>
  );
}
```

### 7.2 Custom Hooks

```typescript
// Custom hook for agent orchestration
export function useRoundtable(sessionId: string) {
  const [session, setSession] = useState<OrchestrationSession | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Implementation
  }, [sessionId]);

  return {
    session,
    messages,
    isLoading,
    error,
    sendMessage: useCallback((message: string) => {
      // Implementation
    }, [sessionId]),
  };
}
```

## 8. Testing Standards

### 8.1 Test File Organization

```typescript
// orchestration.service.spec.ts
describe('OrchestrationService', () => {
  let service: OrchestrationService;
  let mockAgentService: jest.Mocked<AgentService>;
  let mockLockService: jest.Mocked<LockService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrchestrationService,
        {
          provide: AgentService,
          useValue: createMockAgentService(),
        },
        {
          provide: LockService,
          useValue: createMockLockService(),
        },
      ],
    }).compile();

    service = module.get<OrchestrationService>(OrchestrationService);
    mockAgentService = module.get(AgentService);
    mockLockService = module.get(LockService);
  });

  describe('startRoundtable', () => {
    it('should create session with specified agents', async () => {
      // Arrange
      const request: RoundtableRequest = {
        prompt: 'Test prompt',
        agentIds: ['agent1', 'agent2'],
      };
      
      mockAgentService.findByIds.mockResolvedValue([
        createMockAgent('agent1'),
        createMockAgent('agent2'),
      ]);

      // Act
      const result = await service.startRoundtable(request);

      // Assert
      expect(result.agents).toHaveLength(2);
      expect(result.status).toBe('active');
      expect(mockAgentService.findByIds).toHaveBeenCalledWith(['agent1', 'agent2']);
    });
  });
});
```

### 8.2 Mock Factories

```typescript
// test/factories/agent.factory.ts
export function createMockAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: 'test-agent-id',
    name: 'Test Agent',
    handle: 'test',
    systemPrompt: 'You are a test agent',
    modelProvider: 'openai',
    modelName: 'gpt-4',
    parameters: {
      temperature: 0.7,
      maxTokens: 1000,
    },
    teamId: 'test-team',
    ...overrides,
  };
}
```

## 9. Documentation Standards

### 9.1 JSDoc Requirements

```typescript
/**
 * Starts a roundtable discussion with multiple AI agents
 * 
 * @param request - Configuration for the roundtable session
 * @param request.prompt - The initial prompt for all agents
 * @param request.agentIds - Array of agent IDs to participate
 * @param request.artifactId - Optional artifact to focus discussion on
 * @returns Promise resolving to the created orchestration session
 * @throws {AgentNotFoundError} When one or more agents don't exist
 * @throws {LockConflictError} When artifact is locked by another session
 * 
 * @example
 * ```typescript
 * const session = await orchestrationService.startRoundtable({
 *   prompt: 'Review this design document',
 *   agentIds: ['architect', 'critic', 'qa'],
 *   artifactId: 'doc-123'
 * });
 * ```
 */
async startRoundtable(request: RoundtableRequest): Promise<OrchestrationSession>
```

### 9.2 README Standards

**Module README Structure:**
```markdown
# Module Name

Brief description of the module's purpose.

## Features

- Feature 1
- Feature 2

## Usage

```typescript
// Code example
```

## API Reference

### Classes

#### ClassName

Description of the class.

##### Methods

###### methodName(param: Type): ReturnType

Description of the method.

## Testing

```bash
npm test
```
```

## 10. Performance Standards

### 10.1 Code Performance

**Async/Await Patterns:**
```typescript
// Good: Parallel execution when possible
const [agents, locks] = await Promise.all([
  this.agentService.findByIds(agentIds),
  this.lockService.checkAvailability(artifactId),
]);

// Good: Sequential when dependencies exist
const session = await this.createSession(agents);
const streams = await this.startAgentStreams(session);
```

**Memory Management:**
```typescript
// Good: Clean up resources
class StreamManager {
  private streams = new Map<string, AgentStream>();

  async cleanup(sessionId: string): Promise<void> {
    const sessionStreams = this.getSessionStreams(sessionId);
    await Promise.all(sessionStreams.map(stream => stream.close()));
    this.streams.delete(sessionId);
  }
}
```

### 10.2 Database Optimization

**ArangoDB Query Patterns:**
```typescript
// Good: Use indexes effectively
const query = aql`
  FOR artifact IN Artifacts
  FILTER artifact.teamId == ${teamId}
  FILTER artifact.transience.state == 'live'
  SORT artifact.updatedAt DESC
  LIMIT ${offset}, ${limit}
  RETURN artifact
`;

// Good: Batch operations
const artifacts = await db.query(aql`
  FOR id IN ${artifactIds}
  FOR artifact IN Artifacts
  FILTER artifact._key == id
  RETURN artifact
`);
```

This coding standards document ensures consistency, maintainability, and performance across the Liminal Chat codebase while supporting our AI-augmented development workflow.
