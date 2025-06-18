# Engineering Best Practices

This document consolidates general engineering recommendations from multiple AI model code reviews (GPT-4.1, o3, Gemini 2.5 Pro).

## Code Formatting and Style

### Linting & Formatting
- ESLint with TypeScript plugin for code quality
- Prettier for consistent formatting
- Configuration in `.eslintrc.js` and `.prettierrc`

### Line Length
- Maximum 100 characters per line for most code files
- Maximum 120 characters per line for test files
- No maximum line length for app.ts (contains HTML/CSS templates)
- SQL statements should use template literals with backticks and be formatted across multiple lines when they exceed line length limits

### Basic Formatting Rules
- **Indentation**: 2 spaces (not tabs)
- **Quotes**: Single quotes for strings, backticks for template literals
- **Semicolons**: Required at the end of statements
- **Trailing Commas**: Required for multi-line arrays and objects
- **Interface vs Type**: Prefer interfaces for object definitions, types for unions/intersections

### Import Order
1. External libraries
2. Internal modules (absolute paths)
3. Local files (relative paths)
4. Type imports

Each group separated by a blank line.

## Naming Conventions

### Database
- Use `snake_case` for all table and column names
  - Examples: `context_threads`, `user_id`, `last_model`

### JavaScript/TypeScript Variables
- Use `camelCase` for variables and object properties
  - Examples: `userId`, `contextThread`, `lastModel`

### Classes/Types/Interfaces
- Use `PascalCase` for classes, types, and interfaces
  - Examples: `ContextThread`, `UserRepository`, `GenerateResponse`

### Files/Resources
- Use `kebab-case` for file names and URL resources
  - Examples: `context-thread.ts`, `user-repository.ts`, `/api/context-threads`

### Constants
- Use `UPPER_SNAKE_CASE` for constants
  - Examples: `MAX_TOKEN_COUNT`, `DEFAULT_MODEL`

## Security-First Development

### Transport Layer Security
- **Helmet.js**: Add from day one for security headers
- **CORS**: Configure with explicit allow-lists, not wildcards
- **Rate Limiting**: Use express-rate-limit immediately
- **HTTPS**: Mandatory for any cloud deployment

### Input Validation
- **Strong Typing**: Use zod or joi for all API endpoints
- **Payload Validation**: Validate structure, types, and bounds
- **Sanitization**: Clean user inputs before processing
- **Error Messages**: Never expose internal details to clients

### Development vs Production Security

**Critical**: Implement multiple validation layers to prevent development bypasses in production:

```typescript
// ❌ BAD: Single environment check
if (process.env.BYPASS_AUTH === 'true') {
  req.user = mockUser;
  return next();
}

// ✅ GOOD: Multiple validation layers
function isAuthBypassAllowed(): boolean {
  // Hardcoded production checks first
  if (process.env.NODE_ENV === 'production') return false;
  if (process.env.APP_ENV === 'production') return false;
  if (isProductionHostname()) return false;
  
  // Only then check development flag
  return process.env.BYPASS_AUTH === 'true' && process.env.NODE_ENV === 'development';
}
```

### Mock Service Security

Mock services must maintain security validation parity with production:

```typescript
// ❌ BAD: Mock accepts any string
class MockLlmService {
  validateApiKey(key: string): boolean {
    return key.length > 0; // Too permissive
  }
}

// ✅ GOOD: Mock validates like production
class MockLlmService {
  validateApiKey(key: string): boolean {
    // Same validation pattern as production
    return /^sk-[a-zA-Z0-9]{48}$/.test(key);
  }
}
```

### Environment-Specific Keys

Never use the same cryptographic keys across environments:

```typescript
export class SecurityConfig {
  static getJwtSecret(): string {
    const env = process.env.NODE_ENV || 'development';
    
    if (env === 'production' && !process.env.JWT_SECRET_PROD) {
      throw new Error('Production JWT secret not configured');
    }
    
    return env === 'production' 
      ? process.env.JWT_SECRET_PROD!
      : process.env.JWT_SECRET_DEV || 'dev-only-secret';
  }
}
```

### Sensitive Data Patterns

Expand sensitive data detection beyond basic patterns:

```typescript
const SENSITIVE_PATTERNS = [
  /sk[-_](?:test|live)[-_][0-9a-zA-Z]{24,}/gi,  // Stripe
  /AIza[0-9A-Za-z\\-_]{35}/gi,                   // Google API
  /ghp_[0-9a-zA-Z]{36}/gi,                       // GitHub tokens
  /sq0[a-z]{3}-[0-9A-Za-z\\-_]{22,43}/gi,       // Square
  /AC[a-z0-9]{32}/gi,                            // Twilio
];
```

## Error Handling Standards

### Client-Facing Errors
- Return sanitized, user-friendly messages
- Use consistent error code structure
- Log full details server-side only
- Never expose stack traces

### Standardized Error Response Format

All API errors follow a standard JSON format:

```json
{
  "error": {
    "code": 1001,
    "message": "Internal server error"
  }
}
```

In non-production environments, additional details may be included:

```json
{
  "error": {
    "code": 1001,
    "message": "Internal server error",
    "details": "Detailed error information for debugging",
    "errorCode": "INTERNAL_SERVER_ERROR"
  }
}
```

For validation errors, the response may include an array of field-specific errors:

```json
{
  "error": {
    "code": 3000,
    "message": "Validation failed",
    "items": [
      {
        "field": "email",
        "code": 3030,
        "message": "Field format is invalid"
      },
      {
        "field": "password",
        "code": 3040,
        "message": "Value is too short"
      }
    ]
  }
}
```

### Error Code Categories

Error codes are grouped into categories, each with a range of 1000:

| Category | Code Range | Description |
|----------|------------|-------------|
| System | 1000-1999 | General system and unexpected errors |
| Authentication | 2000-2999 | Authentication and authorization errors |
| Validation | 3000-3999 | Input validation errors |
| Resource | 4000-4999 | Resource-related errors (not found, conflicts) |
| Data | 5000-5999 | Database and data access errors |
| External Service | 6000-6999 | Errors from external services and APIs |
| Business | 7000-7999 | Business rule violations |

### Complete Error Code Reference

#### System Errors (1000-1999)

| Code | Error Code | HTTP Status | Message |
|------|------------|-------------|---------|
| 1000 | UNKNOWN_ERROR | 500 | An unknown error occurred |
| 1001 | INTERNAL_SERVER_ERROR | 500 | Internal server error |
| 1010 | SERVICE_UNAVAILABLE | 503 | Service temporarily unavailable |
| 1020 | INVALID_CONFIGURATION | 500 | Invalid system configuration |

#### Authentication Errors (2000-2999)

| Code | Error Code | HTTP Status | Message |
|------|------------|-------------|---------|
| 2000 | UNAUTHORIZED | 401 | Authentication required |
| 2010 | INVALID_CREDENTIALS | 401 | Invalid credentials provided |
| 2020 | EXPIRED_TOKEN | 401 | Authentication token has expired |
| 2030 | INSUFFICIENT_PERMISSIONS | 403 | Insufficient permissions for this operation |
| 2040 | FORBIDDEN | 403 | Access forbidden |

#### Validation Errors (3000-3999)

| Code | Error Code | HTTP Status | Message |
|------|------------|-------------|---------|
| 3000 | VALIDATION_FAILED | 400 | Validation failed |
| 3010 | INVALID_PARAMETER | 400 | Invalid parameter value |
| 3020 | MISSING_REQUIRED_FIELD | 400 | Required field is missing |
| 3030 | INVALID_FORMAT | 400 | Field format is invalid |
| 3040 | VALUE_TOO_SHORT | 400 | Value is too short |
| 3050 | VALUE_TOO_LONG | 400 | Value is too long |
| 3060 | VALUE_OUT_OF_RANGE | 400 | Value is outside acceptable range |

#### Resource Errors (4000-4999)

| Code | Error Code | HTTP Status | Message |
|------|------------|-------------|---------|
| 4000 | RESOURCE_NOT_FOUND | 404 | Resource not found |
| 4010 | RESOURCE_ALREADY_EXISTS | 409 | Resource already exists |
| 4020 | RESOURCE_STATE_CONFLICT | 409 | Resource is in an invalid state for this operation |

#### Data Access Errors (5000-5999)

| Code | Error Code | HTTP Status | Message |
|------|------------|-------------|---------|
| 5000 | DATABASE_ERROR | 500 | Database error occurred |
| 5010 | QUERY_FAILED | 500 | Database query failed |
| 5020 | TRANSACTION_FAILED | 500 | Database transaction failed |
| 5030 | DATA_INTEGRITY_ERROR | 400 | Data integrity constraint violation |

#### External Service Errors (6000-6999)

| Code | Error Code | HTTP Status | Message |
|------|------------|-------------|---------|
| 6000 | EXTERNAL_SERVICE_ERROR | 500 | External service error |
| 6010 | EXTERNAL_SERVICE_TIMEOUT | 503 | External service request timed out |
| 6020 | EXTERNAL_SERVICE_UNAVAILABLE | 503 | External service is unavailable |
| 6100 | LLM_SERVICE_ERROR | 500 | LLM service error |
| 6110 | INVALID_API_KEY | 401 | Invalid API key |

#### Business Logic Errors (7000-7999)

| Code | Error Code | HTTP Status | Message |
|------|------------|-------------|---------|
| 7000 | BUSINESS_RULE_VIOLATION | 422 | Business rule violation |
| 7010 | OPERATION_NOT_ALLOWED | 422 | Operation not allowed in current context |
| 7020 | PRECONDITION_FAILED | 422 | Precondition for operation failed |

### Error Implementation Pattern

```typescript
// Base error class implementation
export class AppError extends Error {
  constructor(
    public message: string,
    public details?: string,
    public code: number = 1000,
    public errorCode: string = 'UNKNOWN_ERROR',
    public statusCode: number = 500,
    public items?: ErrorItem[]
  ) {
    super(message);
    this.name = this.constructor.name;
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  toJSON() {
    const error: any = {
      code: this.code,
      message: this.message
    };
    
    if (process.env.NODE_ENV !== 'production') {
      if (this.details) error.details = this.details;
      if (this.errorCode) error.errorCode = this.errorCode;
    }
    
    if (this.items) error.items = this.items;
    
    return { error };
  }
}

// Specialized error classes
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: string, items?: ErrorItem[]) {
    super(message, details, 3000, 'VALIDATION_FAILED', 400, items);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: string) {
    super(message, details, 4000, 'RESOURCE_NOT_FOUND', 404);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', details?: string) {
    super(message, details, 2000, 'UNAUTHORIZED', 401);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database error occurred', details?: string) {
    super(message, details, 5000, 'DATABASE_ERROR', 500);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = 'External service error', details?: string) {
    super(message, details, 6000, 'EXTERNAL_SERVICE_ERROR', 500);
  }
}
```

### Using Error Codes in API Handlers

```typescript
// Example API endpoint using error codes
router.post('/api/conversations', async (req, res, next) => {
  try {
    const { title, modelId } = req.body;
    
    // Validate required fields
    if (!title) {
      throw new ValidationError('Validation failed', undefined, [
        { field: 'title', code: 3020, message: 'Required field is missing' }
      ]);
    }
    
    // Check if model exists and is valid
    if (modelId) {
      const model = await modelService.getModelById(modelId);
      if (!model) {
        throw new ValidationError('Validation failed', undefined, [
          { field: 'modelId', code: 3010, message: 'Invalid parameter value' }
        ]);
      }
    }
    
    // Create the conversation
    const conversation = await conversationService.createConversation({
      title,
      modelId: modelId || DEFAULT_MODEL_ID,
      userId: req.user.userId
    });
    
    res.status(201).json(conversation);
  } catch (error) {
    next(error); // Pass to error handling middleware
  }
});

// Error handling middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json(error.toJSON());
  } else {
    // Log unexpected errors
    logger.error('Unexpected error:', error);
    
    // Return generic error
    const genericError = new AppError(
      'An unexpected error occurred',
      process.env.NODE_ENV !== 'production' ? error.message : undefined
    );
    res.status(500).json(genericError.toJSON());
  }
});
```

### Error Handling Best Practices

- Always use the defined error codes when returning error responses
- Use specialized error classes instead of generic errors
- Include detailed error information only in non-production environments
- For validation errors, include field-specific errors when possible
- Log all errors with appropriate severity based on error category
- Keep error messages user-friendly and actionable
- Maintain the error code reference when adding new error codes

### Internal Error Handling
- Implement structured logging
- Use error boundaries in React
- Graceful degradation strategies
- Comprehensive error recovery

## Testing Philosophy

### Coverage Requirements
- Domain tier: 90% minimum
- Edge/API tier: 80% minimum
- UI components: 75% minimum
- Focus on critical paths first

### Testing Patterns
- **Negative Path Testing**: Test failures, bad inputs, edge cases
- **Integration Tests**: Test tier boundaries
- **Performance Tests**: Monitor response times
- **Security Tests**: Include in CI/CD pipeline

### Test Data Factories
```typescript
// Use factories for consistent test data
export class ThreadFactory {
  static create(overrides?: Partial<ContextThread>): ContextThread {
    return {
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      ...overrides
    };
  }
  
  static createMany(count: number, overrides?: Partial<ContextThread>): ContextThread[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
  
  static createWithMessages(messageCount: number): ContextThread {
    const thread = this.create();
    thread.messages = MessageFactory.createMany(messageCount);
    return thread;
  }
}

export class MessageFactory {
  static create(overrides?: Partial<Message>): Message {
    return {
      id: faker.string.uuid(),
      role: faker.helpers.arrayElement(['user', 'assistant']),
      content: faker.lorem.paragraph(),
      createdAt: Date.now(),
      ...overrides
    };
  }
}
```

## Database Best Practices

### Connection Management
- Configurable DB paths via environment variables
- Connection pooling for production
- Graceful shutdown handling
- Transaction management patterns

**Future Enhancement - Connection Pool Implementation**:
```typescript
export class ConnectionPool {
  private pool: Map<string, Database> = new Map();
  private maxConnections: number = 10;
  private idleTimeout: number = 60000; // 1 minute
  
  async getConnection(dbPath: string): Promise<Database> {
    // Check existing connections
    if (this.pool.has(dbPath)) {
      return this.pool.get(dbPath)!;
    }
    
    // Clean up idle connections if pool is full
    if (this.pool.size >= this.maxConnections) {
      await this.cleanupIdleConnections();
    }
    
    // Create new connection
    const db = new Database(dbPath);
    this.pool.set(dbPath, db);
    return db;
  }
}
```

### Migration Strategy
- Implement migration tooling early (drizzle-kit, knex)
- Version control all schema changes
- Automated migration in CI/CD
- Rollback procedures documented

**Schema Evolution Pattern**:
```typescript
export interface Migration {
  version: number;
  description: string;
  up: (db: Database) => void;
  down: (db: Database) => void;
}

export class MigrationManager {
  async migrateToLatest(): Promise<void> {
    const currentVersion = this.getCurrentVersion();
    const pendingMigrations = this.migrations.filter(m => m.version > currentVersion);
    
    for (const migration of pendingMigrations) {
      await this.applyMigration(migration);
    }
  }
}
```

### Data Modeling Recommendations
- **Current**: JSON storage in SQLite is acceptable for MVP
- **Future**: Normalize messages into separate table for better query performance
- **Indexing**: Add indexes on foreign keys and frequently queried fields
- **Constraints**: Use foreign key constraints to maintain referential integrity

### Performance Considerations
- Async drivers for high concurrency
- Index strategy documented
- Query optimization practices
- Monitor slow queries

## React Frontend Standards

### Component Structure
- **Component Organization**: Place components in appropriate directories (`/components`, `/pages`)
- **Component Types**:
  - **Container Components**: Handle data fetching, state management, and business logic
  - **Presentation Components**: Focus on UI rendering with minimal state
  - **Layout Components**: Manage arrangement of elements on the page
- **Naming**: Use PascalCase for component names, suffix test files with `.test.tsx`

### State Management
- **Local State**: Use React's useState for component-specific state
- **Prop Drilling**: Avoid excessive prop drilling; consider context or hooks for shared state
- **Context API**: Use for state shared across multiple components
- **Custom Hooks**: Create reusable hooks for common stateful logic

### TypeScript Usage
- **Prop Types**: Define explicit interfaces for component props
  ```typescript
  interface HealthCheckCardProps {
    title: string;
    onCheck: () => Promise<void>;
    status?: 'healthy' | 'unhealthy' | null;
    loading?: boolean;
    error?: string | null;
  }
  ```
- **Type Assertions**: Minimize use of type assertions (`as`)
- **Generic Components**: Leverage TypeScript generics for reusable components
- **API Types**: Share type definitions between frontend and API calls

### Styling Standards
- **Chakra UI**: Primary styling system for components
- **Theme**: Use consistent theme tokens for colors, spacing, etc.
- **Responsive Design**: All components must be responsive
- **Accessibility**: Follow WCAG 2.1 AA standards for accessibility

### Example Component
```typescript
import React, { useState, useEffect } from 'react';
import { Box, Button, Text, Spinner, useToast } from '@chakra-ui/react';

import { HealthService } from '../../services/healthService';
import { ServerStatus } from '../../types/health';

interface HealthCheckCardProps {
  title: string;
  checkFunction: () => Promise<ServerStatus>;
  frequency?: number; // in milliseconds
}

export const HealthCheckCard: React.FC<HealthCheckCardProps> = ({
  title,
  checkFunction,
  frequency = 30000, // default to 30 seconds
}) => {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const checkHealth = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await checkFunction();
      setStatus(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast({
        title: 'Health check failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const intervalId = setInterval(checkHealth, frequency);
    return () => clearInterval(intervalId);
  }, [frequency]);

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      padding={4}
      boxShadow="sm"
      backgroundColor={
        status?.healthy
          ? 'green.50'
          : status?.healthy === false
          ? 'red.50'
          : 'gray.50'
      }
    >
      <Text fontSize="xl" fontWeight="bold" mb={2}>
        {title}
      </Text>
      
      {loading && <Spinner size="sm" mr={2} />}
      
      {status && (
        <Text color={status.healthy ? 'green.500' : 'red.500'}>
          {status.healthy ? 'Healthy' : 'Unhealthy'}
        </Text>
      )}
      
      {error && <Text color="red.500">{error}</Text>}
      
      <Button
        size="sm"
        onClick={checkHealth}
        isLoading={loading}
        mt={2}
      >
        Refresh
      </Button>
    </Box>
  );
};
```

## Server Management

### Utility Scripts
- Placed in the `server/scripts` directory
- Follow consistent style and error handling approach
- Examples include:
  - `server-control.sh`: Start, stop, status, and restart functionality
  - `db-backup.sh`: Database backup operations
  - `db-health-check.sh`: Database integrity checks

### Port Management
- Use consistent port (8765) for development
- Services should check for port availability before starting
- Proper error handling for port conflicts

### Database Operations
- Regular backups via utility scripts
- Integrity checks via health endpoints
- Schema initialization at startup

## Dependency Management

### Security Scanning
- Enable GitHub Dependabot
- Regular npm audit (fail CI on high/critical)
- Quarterly manual reviews
- License compliance checks

### Update Strategy
- Automated PRs for patches
- Manual review for minor/major
- Test suite must pass
- Staging environment validation

## Architectural Guidelines

The Liminal Type Chat application follows a tiered architecture:

1. **Domain Tier**:
   - Contains core business logic and canonical data models
   - Agnostic to HTTP, UI concerns, or specific database implementations
   - Has the highest test coverage requirements (90%)

2. **Edge/XPI Tier**:
   - Handles HTTP requests/responses
   - Transforms data between UI-friendly formats and domain models
   - Routes to appropriate domain services
   - Implementation of the API layer

3. **UI Tier**:
   - React-based frontend with TypeScript
   - Uses Chakra UI for consistent, accessible components
   - Communicates with backend via type-safe API calls
   - Handles presentation, user interaction, and state management
   - Follows component-based architecture with clear separation of concerns

4. **Domain Client Adapter Pattern**:
   - Enables Edge routes to communicate with domain services
   - Can operate in-process or via HTTP calls (cross-process)
   - Provides flexibility in deployment options
   - Implementation follows interface segregation principle
   - Example interfaces:
     ```typescript
     // Domain service interface
     interface HealthService {
       checkHealth(): Promise<HealthStatus>;
       checkDatabaseHealth(): Promise<DatabaseHealthStatus>;
     }
     
     // Client adapter interface for edge tier
     interface HealthServiceClient {
       checkHealth(): Promise<HealthStatus>;
       checkDatabaseHealth(): Promise<DatabaseHealthStatus>;
     }
     ```
   - Example implementations:
     - `DirectHealthServiceClient`: In-process communication
     - `HttpHealthServiceClient`: HTTP-based communication
   - **Adapter Mode Toggle Mechanism**:
     - Base configuration via environment variables: `DOMAIN_CLIENT_MODE=direct|http`
     - Testing override via HTTP header: `X-Domain-Client-Mode: direct|http`
     - Header override only processed in non-production environments
     - Example implementation:
       ```typescript
       // Middleware to detect header override
       app.use((req, res, next) => {
         if (process.env.NODE_ENV !== 'production') {
           const headerMode = req.headers['x-domain-client-mode'] as string;
           if (headerMode && ['direct', 'http'].includes(headerMode)) {
             req.domainClientMode = headerMode as 'direct' | 'http';
           }
         }
         next();
       });

       // Factory function for getting appropriate client
       function getDomainClient(req) {
         const mode = req.domainClientMode || process.env.DOMAIN_CLIENT_MODE || 'direct';
         return mode === 'direct' 
           ? new DirectDomainClient() 
           : new HttpDomainClient({ baseUrl: process.env.DOMAIN_API_URL });
       }
       ```
     - This approach enables testing both adapter modes without server restarts

## Code Organization

### Shared Types
- Create shared package for DTOs
- Single source of truth for types
- Prevents drift between tiers
- Versioned and published

### Module Boundaries
- Clear separation of concerns
- Dependency injection patterns
- Interface-driven design
- Minimal coupling between modules

### LLM Provider Pattern
```typescript
// Interface for all LLM providers
export interface ILlmService {
  generateResponse(prompt: string, options?: LlmOptions): Promise<string>;
  streamResponse(prompt: string, options?: LlmOptions): AsyncIterable<string>;
}

// Factory with configuration-based model selection
export class LlmServiceFactory {
  private static modelConfigs = {
    'anthropic': {
      'claude-3-haiku': { id: 'claude-3-haiku-20240307', maxTokens: 4096 },
      'claude-3-sonnet': { id: 'claude-3-sonnet-20240229', maxTokens: 4096 },
      'claude-3-opus': { id: 'claude-3-opus-20240229', maxTokens: 4096 }
    },
    'openai': {
      'gpt-4-turbo': { id: 'gpt-4-turbo-2024-04-09', maxTokens: 4096 },
      'gpt-4o': { id: 'gpt-4o', maxTokens: 4096 }
    }
  };
  
  static create(provider: string, apiKey: string, model?: string): ILlmService {
    const config = this.modelConfigs[provider]?.[model || 'default'];
    
    switch (provider) {
      case 'anthropic':
        return new AnthropicService(apiKey, config);
      case 'openai':
        return new OpenAIService(apiKey, config);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
```

## Performance Optimization

### Asynchronous Operations
- Avoid synchronous file I/O in request paths
- Use streams for large data
- Implement request queuing
- Monitor event loop lag
- **Prefer async/await** over direct Promise chains for readability
- **Promise Management**:
  - Use `Promise.all()` for parallel operations
  - Use `Promise.allSettled()` when partial failures are acceptable
- **Timeouts**: Add timeouts to external service calls using Promise race or AbortController
- **Error Propagation**: Always catch async errors at boundary layers, include original error as `cause` when re-throwing
- **Testing**: Use Jest's `done()` or `async/await` consistently, test both success and failure paths
- **Avoid**:
  - Mixing callback and Promise patterns
  - Deeply nested async operations
  - Unhandled Promise rejections

### Streaming Architecture Best Practices
- **State Synchronization**: Server maintains authoritative accumulated content
- **Sequence Tracking**: Include sequence numbers for proper ordering
- **Error Recovery**: Implement retry with exponential backoff
- **Backpressure Handling**: Monitor client consumption rate

```typescript
// Enhanced streaming with state synchronization
async *streamChatCompletion(
  threadId: string,
  callback: (chunk: ChatChunk) => void
): AsyncIterable<void> {
  const streamingSession = {
    threadId,
    messageId: generateId(),
    sequenceNumber: 0,
    accumulatedContent: '',
    status: 'streaming' as const
  };
  
  try {
    for await (const chunk of llmProvider.stream(prompt)) {
      streamingSession.sequenceNumber++;
      streamingSession.accumulatedContent += chunk.content;
      
      // Update server state
      await this.updateMessage(streamingSession.messageId, {
        content: streamingSession.accumulatedContent,
        sequence: streamingSession.sequenceNumber
      });
      
      // Send to client with sequence
      callback({
        ...chunk,
        sequence: streamingSession.sequenceNumber
      });
    }
  } catch (error) {
    // Retry logic with exponential backoff
    if (this.isRetryable(error) && retries < MAX_RETRIES) {
      await this.delay(Math.pow(2, retries) * 1000);
      yield* this.streamChatCompletion(threadId, callback);
    }
  }
}
```

### Concurrent Message Handling
```typescript
// Optimistic locking for message updates
export class MessageService {
  async updateMessage(
    messageId: string, 
    updates: MessageUpdate,
    expectedVersion: number
  ): Promise<Message> {
    const current = await this.repository.findById(messageId);
    
    if (current.version !== expectedVersion) {
      throw new ConcurrencyError(
        'Message was modified by another operation'
      );
    }
    
    const updated = {
      ...current,
      ...updates,
      version: current.version + 1
    };
    
    await this.repository.update(messageId, updated);
    return updated;
  }
}
```

### Caching Strategy
- Define cache layers clearly
- Implement invalidation logic
- Monitor hit/miss rates
- Document cache dependencies

### Repository-Level Caching
```typescript
export class CachedRepository<T> {
  private cache: Map<string, { entity: T; timestamp: number }> = new Map();
  private ttl: number = 60000; // 1 minute default
  
  constructor(
    private repository: Repository<T>,
    options?: { ttl?: number }
  ) {
    if (options?.ttl) this.ttl = options.ttl;
  }
  
  async findById(id: string): Promise<T | null> {
    const cached = this.cache.get(id);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.entity;
    }
    
    const entity = await this.repository.findById(id);
    if (entity) {
      this.cache.set(id, { entity, timestamp: Date.now() });
    }
    return entity;
  }
  
  invalidate(id: string): void {
    this.cache.delete(id);
  }
  
  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}
```

## CI/CD Best Practices

### Build Pipeline
```yaml
# Recommended order
- npm ci (not npm install)
- npm run lint
- npm run test:coverage
- npm audit --audit-level=high
- security scanning
- build artifacts
- deploy to staging
```

### Pre-commit Hooks
- Linting with auto-fix
- Formatting checks
- Secret scanning
- Commit message validation

## Monitoring and Observability

### Logging Standards
- Structured JSON logging
- Correlation IDs for requests
- Log levels properly used
- Centralized log aggregation

### Metrics Collection
- Response time tracking
- Error rate monitoring
- Resource utilization
- Business metrics

## Documentation Requirements

### Code Documentation
- JSDoc for public APIs
- Inline comments for complex logic
- README in each major directory
- Architecture decision records

### API Documentation
- OpenAPI specifications maintained
- Example requests/responses
- Error code documentation
- Rate limit information

### JSDoc Standards
- Required for all public functions, classes, and interfaces
- Include @param, @returns, and @throws tags as appropriate
- Example:
  ```typescript
  /**
   * Retrieves a context thread by its ID
   * @param threadId - The UUID of the thread to retrieve
   * @returns The context thread if found
   * @throws NotFoundException if thread doesn't exist
   */
  async getThreadById(threadId: string): Promise<ContextThread>
  ```

## Development Environment

### Local Setup
- Automated setup scripts
- Environment variable templates
- Docker options available
- Consistent Node versions

### Developer Experience
- Hot reloading configured
- Debugging configurations
- IDE settings shared
- Linting on save

## Production Readiness

### Health Checks
- Liveness endpoints
- Readiness endpoints
- Dependency checks
- Graceful degradation

### Configuration Management
- Environment-specific configs
- Feature flags system
- Secret management
- Configuration validation

## Dependency Injection

### Constructor Injection
- Pass dependencies through constructor parameters
- Example: `constructor(private dbProvider: DatabaseProvider, private configService: ConfigService) {}`

### Dependencies as Interfaces
- Define interfaces for all dependencies
- Example: 
  ```typescript
  interface DatabaseProvider {
    query(sql: string, params?: any[]): Promise<any>;
    exec(sql: string, params?: any[]): void;
    healthCheck(): Promise<boolean>;
    close(): void;
  }
  ```
- Implementations can vary (SQLite, PostgreSQL, etc.) while maintaining the same API

### Factories
- Use factory functions to create instances with dependencies
- Example: `const createHealthService = (dbProvider) => new HealthService(dbProvider);`

### Testing
- Pass mock implementations to constructors in tests
- Example: `const healthService = new HealthService(mockDbProvider);`

### Avoid
- Singletons (except in specific justified cases)
- Direct imports of concrete implementations inside classes
- Service locator patterns

## Code Review Standards

### Review Checklist
- Security implications considered
- Tests included and passing
- Documentation updated
- Performance impact assessed

### Merge Requirements
- All CI checks passing
- Code coverage maintained
- At least one approval
- No unresolved comments