# Story 1 Implementation Prompt: Domain Vercel AI SDK Integration

## Agent Configuration
**Recommended Agents**: 2-3 agents for TDD implementation
**Thinking Tokens**: 10,000 per agent
**Instruction**: Think hard about the implementation approach, test design, and NestJS patterns

### Agent Breakdown
1. **Agent 1 (TDD Red Phase)**: Write all tests from `tdd-tests.md` - ensure comprehensive coverage
2. **Agent 2 (TDD Green Phase)**: Implement code to make tests pass - focus on correctness
3. **Agent 3 (Optional - Refactor)**: Optimize and refactor implementation - improve design

## Context
You are implementing Story 1 of Feature 002: Vercel AI SDK Integration. This story focuses on integrating the Vercel AI SDK into the NestJS domain server (`domain-server-nest`) to support multiple LLM providers while maintaining backward compatibility.

## Related Documentation
- **Story Details**: See `story.md` for full requirements and success criteria
- **Test Specifications**: See `tdd-tests.md` for all tests to implement FIRST
- **Feature Overview**: See `../feature.md` for Feature 002 context
- **Contracts**: See `../contracts.md` for API contract changes

## Implementation Requirements

### 1. Model Names
Use **May 2025 production models**:
- **OpenAI**: `o4-mini` (cheapest) or `gpt-4.1` or `o3` or `o4-mini-high`
- **Anthropic**: `claude-sonnet-4-20250514` or `claude-opus-4-20250514`
- **Google**: `gemini-2.5-flash-preview-05-20` (cheapest) or `gemini-2.5-pro-preview-05-06`

If these fail, implement model discovery and log available models.

### 2. Provider Interface Design
Use a **single method with union type** for flexibility:

```typescript
interface ILLMProvider {
  generate(input: string | Message[]): Promise<LlmResponse>;
  getName(): string;
  isAvailable(): boolean;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LlmResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

### 3. Request Validation Strategy
- **Controller Level**: Use class-validator with custom decorator for oneOf validation
- **Create separate DTOs** for clarity:

```typescript
class PromptModeDto {
  @IsString()
  @MinLength(1)
  prompt: string;
}

class MessagesModeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];
}

class LlmPromptRequestDto {
  @ValidateIf(o => !o.messages)
  @ValidateNested()
  @Type(() => PromptModeDto)
  prompt?: string;

  @ValidateIf(o => !o.prompt)
  @ValidateNested()
  @Type(() => MessagesModeDto)
  messages?: Message[];

  @IsOptional()
  @IsEnum(['echo', 'openai', 'anthropic', 'google'])
  provider?: string;
}
```

### 4. Provider Configuration
- **Validate on startup** with graceful degradation
- **Log available providers** during bootstrap
- **Runtime handling**: Return specific error if unconfigured provider requested
- **Default strategy**: Fall back to echo if no providers configured

```typescript
@Injectable()
export class LlmConfigService {
  async onModuleInit() {
    // Validate API keys and log results
    // Don't throw - just mark providers as unavailable
    // Default models: o4-mini, claude-sonnet-4-20250514, gemini-2.5-flash-preview-05-20
  }
}
```

### 5. Error Mapping
Create a dedicated error mapper:

```typescript
@Injectable()
export class VercelErrorMapper {
  mapError(error: unknown, provider: string): HttpException {
    // Map Vercel AI SDK errors to our codes:
    // - Invalid API key → INVALID_API_KEY
    // - Model not found → MODEL_NOT_FOUND
    // - Rate limit → PROVIDER_RATE_LIMITED
    // - Network errors → PROVIDER_API_ERROR
  }
}
```

### 6. Testing Strategy for Story 1
- **Unit Tests**: Mock at Vercel AI SDK level using jest.mock('ai')
- **Integration Tests**: Skip by default, use echo provider
- **E2E Test**: One real test with OpenAI (skippable via environment variable)
- **Test Environment**: 
  ```bash
  # .env.test
  OPENAI_API_KEY=test-key
  SKIP_PROVIDER_TESTS=true
  ```

### 7. Token Calculation
For messages mode, **sum all message content**:
```typescript
private calculateTokens(messages: Message[]): number {
  const text = messages.map(m => m.content).join(' ');
  return Math.ceil(text.length / 4); // Same as echo provider
}
```

### 8. Implementation Order
1. Create `ILLMProvider` interface and types
2. Implement `EchoProvider` with messages support
3. Create DTOs with validation decorators
4. Implement `VercelOpenAIProvider`
5. Create `LlmProviderFactory` with DI
6. Update `LlmService` to use factory
7. Add configuration module
8. Implement error mapping
9. Write tests following TDD

### 9. NestJS Patterns
- **Providers as @Injectable()** for DI consistency
- **Use ConfigModule** for configuration:
  ```typescript
  @Module({
    imports: [
      ConfigModule.forRoot({
        load: [llmConfig],
      }),
    ],
  })
  ```
- **Handle async initialization** in onModuleInit lifecycle hook

### 10. Additional Requirements

#### Vercel AI SDK Usage
```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

@Injectable()
export class VercelOpenAIProvider implements ILLMProvider {
  async generate(input: string | Message[]): Promise<LlmResponse> {
    const messages = typeof input === 'string' 
      ? [{ role: 'user', content: input }]
      : input;

    const result = await generateText({
      model: openai(this.modelName), // e.g. 'o4-mini' or 'gpt-4.1'
      messages,
    });

    return {
      content: result.text,
      model: this.modelName,
      usage: {
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
      },
    };
  }
}
```

#### Provider Auto-Detection
Do NOT implement auto-detection in Story 1. Providers must be explicitly configured.

## TDD Approach

**IMPORTANT**: Start by implementing all tests specified in `tdd-tests.md` BEFORE writing any production code.

### Red Phase
1. Implement ALL tests from `tdd-tests.md` first
2. Write E2E test expecting OpenAI to work
3. Write unit tests for all conditions in the story
4. All tests should fail initially

### Green Phase
1. Implement minimum code to pass each test
2. Focus on making tests pass, not optimization
3. Follow the implementation order specified above

### Refactor Phase
After all tests pass:
1. Extract common provider logic to base class
2. Improve error messages
3. Add debug logging
4. Review with teammate for NestJS best practices

## Definition of Done
- [ ] All unit tests passing (90% coverage)
- [ ] E2E test works with real OpenAI (when API key provided)
- [ ] Echo provider still works with both prompt and messages
- [ ] Provider configuration logged on startup
- [ ] Error responses follow existing format
- [ ] No breaking changes to existing API
- [ ] Code follows NestJS conventions

## Out of Scope for Story 1
- Anthropic and Google providers (Story 2)
- CLI changes (Story 3)
- Edge API changes (Story 2)
- Streaming support
- Conversation persistence
- Rate limiting
- Response caching

Focus on getting OpenAI working end-to-end with solid patterns that other providers can follow.

## Important: Think Hard
Take time to think deeply about:
- Test design and coverage
- NestJS architectural patterns
- Error handling edge cases
- Type safety and validation
- Integration points between components