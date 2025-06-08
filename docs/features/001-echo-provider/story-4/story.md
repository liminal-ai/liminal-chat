# Story 4: CLI Chat Command Implementation

> **Note**: This story was originally specified to include streaming support. However, streaming is planned for a later milestone. This story has been updated to use the existing non-streaming `/api/v1/llm/prompt` endpoint in a conversation loop.

## Story ID
001-echo-provider-story-4

## Title
Implement Interactive Chat Command for CLI (Non-Streaming)

## Description
As a user, I want to interact with the Liminal Type Chat system through a command-line interface so that I can have conversations without using a web browser. This version uses the existing prompt endpoint in a loop to simulate a conversation experience.

## Dependencies
- **REQUIRES**: Story 3 (Basic CLI) must be complete
- **REQUIRES**: Story 2 (Edge Service) must be running with `/api/v1/llm/prompt` endpoint
- **BUILDS ON**: Enhances the basic CLI from Story 3 with interactive loop

## Acceptance Criteria
1. `liminal chat` starts an interactive chat session
2. Maintains conversation context locally (prompt/response history)
3. Shows loading indicator while waiting for responses
4. Graceful handling of interrupts (Ctrl+C)
5. Clear error messages for connection issues
6. Chat history displayed in the terminal
7. Support for single-line input with potential for multi-line
8. Configuration via environment variables or config file

## Technical Requirements

### CLI Package Structure
```
cli-client/
├── src/
│   ├── commands/
│   │   ├── chat.ts           # Chat command implementation
│   │   └── index.ts          # Command registry
│   ├── utils/
│   │   ├── display.ts        # Terminal display utilities
│   │   ├── input.ts          # Input handling
│   │   └── config.ts         # Configuration management
│   ├── cli.ts               # Main CLI entry point
│   └── index.ts             # Package exports
├── tests/
│   ├── commands/
│   │   └── chat.test.ts
│   └── integration/
│       └── chat.e2e.test.ts
└── bin/
    └── liminal.js           # Executable entry point
```

### Key Implementation Details

1. **Command Structure using Commander.js**
   ```typescript
   import { Command } from 'commander';
   import { EdgeClient } from './api/edge-client';
   
   export function createChatCommand(client: EdgeClient): Command {
     return new Command('chat')
       .description('Start an interactive chat session')
       .option('-n, --new', 'Start a new conversation')
       .action(async (options) => {
         await runChatSession(client, options);
       });
   }
   ```

2. **Interactive Loop with Prompt Endpoint**
   ```typescript
   async function runChatSession(client: EdgeClient, options: ChatOptions) {
     // Maintain local conversation history
     const conversationHistory: Array<{role: string, content: string}> = [];
     
     const rl = readline.createInterface({
       input: process.stdin,
       output: process.stdout
     });
     
     while (true) {
       const input = await promptUser(rl, '> ');
       if (input === 'exit') break;
       
       // Add user message to history
       conversationHistory.push({ role: 'user', content: input });
       
       // Show loading indicator
       const spinner = ora('Thinking...').start();
       
       try {
         // Use existing prompt endpoint
         const response = await client.prompt(input);
         spinner.stop();
         
         // Display response
         console.log(chalk.green('Assistant:'), response.content);
         console.log(chalk.gray(`Tokens: ${response.usage.totalTokens}`));
         
         // Add to history
         conversationHistory.push({ role: 'assistant', content: response.content });
       } catch (error) {
         spinner.stop();
         console.error(chalk.red('Error:'), error.message);
       }
     }
   }
   ```

3. **Display Utilities**
   ```typescript
   function displayConversationHistory(history: Array<{role: string, content: string}>) {
     console.log(chalk.gray('--- Conversation History ---'));
     history.slice(-5).forEach(msg => {
       if (msg.role === 'user') {
         console.log(chalk.blue('You:'), msg.content);
       } else {
         console.log(chalk.green('Assistant:'), msg.content);
       }
     });
     console.log(chalk.gray('--- End of History ---\n'));
   }
   ```

4. **Testing Approach**
   - Unit tests: Mock EdgeClient, test command logic
   - Integration tests: Real EdgeClient against test server
   - E2E tests: Full CLI execution with subprocess
   - Test interrupt handling (SIGINT)
   - Test conversation history management
   - Test error scenarios

### Configuration Management

Support multiple configuration sources:
1. Environment variables: `LIMINAL_API_URL`, `LIMINAL_API_KEY`
2. Config file: `~/.liminal/config.json`
3. Command-line flags override all

### Error Handling

Handle these scenarios gracefully:
- Server unavailable
- Network interruptions during API calls
- Invalid API responses
- User interrupts (Ctrl+C)
- Rate limiting

## Implementation Notes

1. **Terminal UI Considerations**
   - Use chalk for colored output
   - Use ora for loading indicators
   - Clear display of user vs assistant messages
   - Handle terminal resize events

2. **Input Handling**
   - Support multi-line input (Shift+Enter or triple backticks)
   - Command history with arrow keys
   - Auto-save conversation on exit

3. **Performance**
   - Minimal startup time
   - Efficient response display
   - Proper resource cleanup on exit

## Definition of Done
- [ ] Chat command implemented with full functionality
- [ ] Loading indicators show during API calls
- [ ] Graceful error handling for all scenarios
- [ ] Configuration system working (env vars, config file)
- [ ] Unit tests passing with good coverage
- [ ] Integration tests verify end-to-end flow
- [ ] README with installation and usage instructions
- [ ] Published to npm registry (optional)