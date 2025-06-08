# Echo Provider Implementation Plan

## Overview

This plan breaks down the Echo Provider feature into 4 manageable stories that can be implemented incrementally. Stories 1 and 2 can be developed in parallel once contracts are finalized.

## Implementation Strategy

### Contract-First Development
1. Review and finalize all contracts (contracts.md)
2. Create JSON schema files
3. Generate TypeScript types
4. Begin parallel implementation of Domain and Edge
5. Integrate with CLI
6. End-to-end testing

### Parallel Development Opportunities
- **Story 1** (Domain) and **Story 2** (Edge) can proceed simultaneously
- **Story 3** (CLI) depends on at least Edge health endpoint
- **Story 4** (Polish) requires Stories 1-3 complete

## Story Breakdown

### Story 1: Domain Echo Provider
**Priority**: High
**Effort**: 3 points
**Dependencies**: Contracts finalized
**Implementation Materials**: See `story-1/` directory

#### Description
Implement the Domain service with echo provider that accepts prompts and returns echo responses with mock token counts.

#### Acceptance Criteria
- [ ] Domain service starts on port 8766
- [ ] Health endpoint returns `{"status": "healthy"}`
- [ ] LLM prompt endpoint accepts POST requests
- [ ] Echo provider returns "Echo: {prompt}" format
- [ ] Token usage calculated and returned
- [ ] Unit tests achieve 90% coverage
- [ ] Service can run standalone

#### Implementation Notes
```typescript
// domain/src/providers/llm/echo-provider.ts
export class EchoProvider implements LLMProvider {
  name = 'echo';
  
  async prompt(text: string): Promise<LLMProviderResponse> {
    // Mock token calculation: ~4 chars per token
    const promptTokens = Math.ceil(text.length / 4);
    const responseText = `Echo: ${text}`;
    const completionTokens = Math.ceil(responseText.length / 4);
    
    return {
      content: responseText,
      model: 'echo-1.0',
      usage: {
        promptTokens,
        completionTokens
      }
    };
  }
}
```

#### Testing Requirements
- Unit tests for EchoProvider
- Unit tests for LLMService
- Integration test for health endpoint
- Integration test for prompt endpoint
- Contract validation tests

---

### Story 2: Edge API Endpoint
**Priority**: High
**Effort**: 3 points
**Dependencies**: Contracts finalized
**Implementation Materials**: See `story-2/` directory

#### Description
Implement Edge service that exposes client-facing API and calls Domain service for LLM operations.

#### Acceptance Criteria
- [ ] Edge service starts on port 8765
- [ ] Health endpoint returns status with timestamp
- [ ] Health endpoint checks Domain connectivity
- [ ] LLM prompt endpoint validates requests
- [ ] Bypass auth logs appropriately
- [ ] Transforms between Edge/Domain formats
- [ ] Returns proper error responses
- [ ] Unit tests achieve 75% coverage

#### Implementation Notes
```typescript
// edge/src/routes/llm.ts
router.post('/api/v1/llm/prompt', async (req, res) => {
  // Log auth bypass
  console.log('Auth bypassed for development');
  
  try {
    // Validate request against schema
    const valid = validateLLMPromptRequest(req.body);
    if (!valid) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Validation failed',
          details: validateLLMPromptRequest.errors
        }
      });
    }
    
    // Call Domain service
    const response = await domainClient.post('/domain/llm/prompt', {
      prompt: req.body.prompt,
      provider: 'echo'
    });
    
    // Transform response (camelCase to snake_case)
    res.json({
      content: response.data.content,
      model: response.data.model,
      usage: {
        prompt_tokens: response.data.usage.promptTokens,
        completion_tokens: response.data.usage.completionTokens
      }
    });
  } catch (error) {
    // Handle Domain unavailable
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: {
          code: 'EXTERNAL_SERVICE_UNAVAILABLE',
          message: 'External service is unavailable'
        }
      });
    }
    throw error;
  }
});
```

#### Testing Requirements
- Unit tests for request validation
- Unit tests for response transformation
- Integration test for health endpoint
- Integration test for prompt endpoint
- Mock Domain service for testing
- Error scenario tests

---

### Story 3: Basic CLI
**Priority**: Medium
**Effort**: 2 points
**Dependencies**: Story 2 (Edge health endpoint)
**Implementation Materials**: See `story-3/` directory

#### Description
Create basic CLI that connects to Edge service, validates connectivity, accepts a single prompt, and displays the response.

#### Acceptance Criteria
- [ ] CLI executable via `liminal` command
- [ ] Checks Edge health on startup
- [ ] Exits with code 1 if no connection
- [ ] Accepts prompt input
- [ ] Displays echo response
- [ ] Shows token usage
- [ ] Exits cleanly after one prompt

#### Implementation Notes
```typescript
// cli/src/index.ts
#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import { EdgeClient } from './edge-client';

async function main() {
  const client = new EdgeClient('http://localhost:8765');
  
  // Check health
  try {
    await client.health();
    console.log(chalk.green('✓ Connected to Liminal Type Chat'));
  } catch (error) {
    console.error(chalk.red('✗ Cannot connect to server'));
    console.error(chalk.red(`  ${error.message}`));
    process.exit(1);
  }
  
  // Get prompt
  const prompt = await input('Enter prompt: ');
  
  // Send to API
  const response = await client.prompt(prompt);
  console.log(chalk.blue(response.content));
  console.log(chalk.gray(`Tokens: ${response.usage.prompt_tokens} in, ${response.usage.completion_tokens} out`));
}
```

#### Testing Requirements
- Unit tests for EdgeClient
- Unit tests for CLI commands
- Mock server responses
- Test error scenarios
- Test exit codes

---

### Story 4: CLI Loop & Polish
**Priority**: Low
**Effort**: 2 points
**Dependencies**: Story 3 complete
**Implementation Materials**: See `story-4/` directory

#### Description
Enhance CLI with interactive prompt loop, /exit command, and improved formatting.

#### Acceptance Criteria
- [ ] CLI continues prompting after responses
- [ ] `/exit` command terminates session
- [ ] Clear visual separation between prompts/responses
- [ ] Colored output for better readability
- [ ] Usage instructions on startup
- [ ] Graceful Ctrl+C handling

#### Implementation Notes
```typescript
// Add to CLI
async function interactiveMode() {
  console.log(chalk.gray('Liminal Type Chat - Echo Mode'));
  console.log(chalk.gray('Type /exit to quit\n'));
  
  while (true) {
    const prompt = await input(chalk.yellow('You: '));
    
    if (prompt.toLowerCase() === '/exit') {
      console.log(chalk.gray('Goodbye!'));
      break;
    }
    
    try {
      const response = await client.prompt(prompt);
      console.log(chalk.cyan('Echo: ') + response.content);
      console.log(chalk.gray(`[${response.usage.prompt_tokens}→${response.usage.completion_tokens} tokens]\n`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}\n`));
    }
  }
}
```

#### Testing Requirements
- Test prompt loop continues
- Test /exit command
- Test Ctrl+C handling
- Test error recovery
- Visual regression tests for formatting

## Testing Strategy

### Unit Testing
- Domain: 90% coverage target
- Edge: 75% coverage target
- CLI: Focus on command logic

### Integration Testing
- Health check flow
- Full prompt/response flow
- Error scenarios

### Manual E2E Testing
```bash
# 1. Start services
npm run domain:dev  # Terminal 1
npm run edge:dev    # Terminal 2

# 2. Test CLI
npm run cli         # Terminal 3

# 3. Verify:
- Health check passes
- Can enter prompt
- Receives echo response
- Token count displayed
- /exit works
- Ctrl+C works
```

## Definition of Done

### Per Story
- [ ] Code implemented and reviewed
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] No linting errors

### Feature Complete
- [ ] All stories implemented
- [ ] E2E manual test checklist passed
- [ ] Performance < 100ms response time
- [ ] Clean architecture verified
- [ ] Ready for auth layer (Story 2)

## Time Estimates

- Story 1: 4-6 hours
- Story 2: 4-6 hours
- Story 3: 3-4 hours
- Story 4: 2-3 hours
- **Total**: 13-19 hours

Can be completed faster with parallel development of Stories 1 & 2.