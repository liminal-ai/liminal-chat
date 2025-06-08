# Story 4: CLI Chat Command Implementation - AI Prompt

## Context
You are implementing an interactive chat command for the Liminal Type Chat CLI. This command will use the EdgeClient created in Story 3 to communicate with the server. The Edge service must be running for testing.

## Prerequisites
- Story 3 is complete: EdgeClient is implemented and tested
- The Edge service from Story 2 is running on `http://localhost:8765`
- The cli-client package structure exists from Story 3

## Your Task

Implement an interactive chat command that provides a high-quality terminal chat experience using the EdgeClient from Story 3.

### 1. Dependencies Installation

Add CLI-specific dependencies to the existing cli-client package:
```bash
cd cli-client
npm install commander chalk inquirer ora dotenv
npm install --save-dev @types/inquirer
```

### 2. Implementation Requirements

#### Main CLI Entry Point (`src/cli.ts`)
```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { EdgeClient } from './api/edge-client';
import { createChatCommand } from './commands/chat';
import { loadConfig } from './utils/config';

const program = new Command();
const config = loadConfig();
const client = new EdgeClient(config);

program
  .name('liminal')
  .description('CLI for Liminal Type Chat')
  .version('1.0.0');

program.addCommand(createChatCommand(client));

program.parse();
```

#### Chat Command (`src/commands/chat.ts`)

Implement a command that:
1. Creates or continues a conversation
2. Handles user input in a loop
3. Displays streaming responses in real-time
4. Gracefully handles interrupts

Key features to implement:
- Real-time streaming display
- Colored output (user in blue, assistant in green)
- Loading spinner during API calls
- Multi-line input support
- Conversation history display
- Graceful Ctrl+C handling

#### Configuration (`src/utils/config.ts`)

Load configuration from multiple sources:
```typescript
export function loadConfig(): EdgeClientConfig {
  // Priority: CLI args > env vars > config file > defaults
  return {
    baseUrl: process.env.LIMINAL_API_URL || 'http://localhost:8765',
    apiKey: process.env.LIMINAL_API_KEY,
    timeout: 30000
  };
}
```

### 3. Streaming Display Implementation

Handle SSE streaming with proper display:
```typescript
async function displayStreamingResponse(
  client: EdgeClient,
  conversationId: string,
  message: string
): Promise<void> {
  const spinner = ora('Thinking...').start();
  let firstChunk = true;
  
  try {
    for await (const event of client.streamChat({ conversationId, message })) {
      if (firstChunk) {
        spinner.stop();
        console.log(chalk.green('Assistant: '), '');
        firstChunk = false;
      }
      
      if (event.type === 'content') {
        process.stdout.write(event.data);
      } else if (event.type === 'end') {
        console.log('\n');
      }
    }
  } catch (error) {
    spinner.stop();
    console.error(chalk.red('Error:'), error.message);
  }
}
```

### 4. Input Handling

Support both single-line and multi-line input:
```typescript
async function getUserInput(): Promise<string> {
  const answers = await inquirer.prompt([{
    type: 'editor',
    name: 'message',
    message: 'Enter your message (save and close editor to send):'
  }]);
  return answers.message;
}
```

### 5. Testing Requirements

#### Unit Tests (`tests/commands/chat.test.ts`)
- Mock EdgeClient methods
- Test command options parsing
- Test error handling scenarios
- Test interrupt handling

#### Integration Tests (`tests/integration/chat.e2e.test.ts`)
- Use real EdgeClient against test server
- Test full conversation flow
- Verify streaming works correctly
- Test configuration loading

### 6. Error Handling

Handle these scenarios:
1. **Connection Errors**: Clear message when server is unavailable
2. **Stream Interruptions**: Clean up resources, show partial response
3. **Invalid Input**: Validate before sending to API
4. **Rate Limits**: Show helpful message with retry info

### 7. Binary Setup (`bin/liminal.js`)
```javascript
#!/usr/bin/env node
require('../dist/cli.js');
```

Update package.json:
```json
{
  "bin": {
    "liminal": "./bin/liminal.js"
  },
  "scripts": {
    "build": "tsc",
    "prepare": "npm run build"
  }
}
```

### Important Implementation Notes

1. **Dependency on Story 3**: This implementation assumes the EdgeClient from Story 3 is fully functional. Import and use it directly.

2. **Async/Await Best Practices**:
   - Always use try/catch for async operations
   - Ensure proper cleanup in finally blocks
   - Handle promise rejections globally

3. **Terminal UX**:
   - Keep the interface responsive
   - Show progress for long operations
   - Use colors consistently
   - Clear error messages

4. **Resource Management**:
   - Close readline interfaces
   - Cancel pending requests on exit
   - Save conversation state before exit

## Deliverables

1. Complete chat command implementation
2. Configuration system with multiple sources
3. Streaming display with proper formatting
4. Comprehensive test coverage
5. README with installation and usage examples
6. npm package ready for local installation

## Success Criteria

- [ ] `liminal chat` starts interactive session
- [ ] Streaming responses display character by character
- [ ] Ctrl+C exits gracefully
- [ ] Configuration works from env vars and files
- [ ] Clear distinction between user and assistant messages
- [ ] Error messages are helpful and actionable
- [ ] Tests cover all major scenarios
- [ ] Can be installed globally with `npm install -g`

## Definition of Done

Before considering this story complete, review the Definition of Done checklist in `/documentation/new-plan/features/001-echo-provider/story-4/story.md` and ensure all items are checked off.

Remember to update the execution log with your implementation notes, decisions, and any issues encountered. This documentation helps future developers understand the implementation context and choices made.