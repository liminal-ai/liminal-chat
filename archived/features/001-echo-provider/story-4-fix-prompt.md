# Story 4 Fix: Remove Streaming Dependencies

## Context
Story 4 was incorrectly implemented with streaming support, but the Echo Provider feature was designed to be non-streaming. The Edge server only has a `/api/v1/llm/prompt` endpoint (no streaming endpoint exists). We need to fix the CLI implementation to work with the existing non-streaming infrastructure.

## Current Issues
1. The CLI tries to use `client.streamChat()` which calls non-existent `/api/v1/chat/stream`
2. The EdgeClient has streaming methods that won't work without server support
3. The implementation uses conversation management APIs that don't exist yet

## Your Task
Fix the Story 4 implementation to work with the existing non-streaming Echo Provider infrastructure:

### 1. Update EdgeClient (`cli-client/src/api/edge-client.ts`)
- Remove or comment out these methods (they rely on non-existent endpoints):
  - `createConversation()`
  - `getConversation()` 
  - `addMessage()`
  - `streamChat()`
- Keep only:
  - `health()`
  - `prompt()` (already implemented correctly)
  - The legacy string constructor for backward compatibility

### 2. Update Chat Command (`cli-client/src/commands/chat.ts`)
Replace the current implementation with a simpler non-streaming version:

```typescript
import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { EdgeClient } from '../api/edge-client';

export function createChatCommand(client: EdgeClient): Command {
  const chat = new Command('chat');
  
  chat
    .description('Start an interactive chat session')
    .action(async () => {
      try {
        await startChatSession(client);
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
  
  return chat;
}

async function startChatSession(client: EdgeClient): Promise<void> {
  // Check health first
  const healthSpinner = ora('Checking server connection...').start();
  
  try {
    const health = await client.health();
    if (health.status === 'unhealthy') {
      healthSpinner.fail('Server is unhealthy');
      return;
    }
    healthSpinner.succeed('Connected to server');
  } catch (error: any) {
    healthSpinner.fail(error.message);
    return;
  }

  // Display welcome message
  console.log(chalk.blue('\nWelcome to Liminal Type Chat!'));
  console.log(chalk.gray('Type "exit" to quit\n'));

  // Maintain local conversation history
  const conversationHistory: Array<{role: string, content: string}> = [];

  // Setup interrupt handler
  let isExiting = false;
  process.on('SIGINT', () => {
    isExiting = true;
    console.log(chalk.yellow('\n\nGoodbye!'));
    process.exit(0);
  });

  // Main chat loop
  while (!isExiting) {
    try {
      // Get user input
      const { message } = await inquirer.prompt([{
        type: 'input',
        name: 'message',
        message: chalk.blue('You:'),
        validate: (input) => input.trim().length > 0 || 'Please enter a message'
      }]);

      if (message.toLowerCase() === 'exit') {
        isExiting = true;
        console.log(chalk.yellow('\nGoodbye!'));
        break;
      }

      // Add to history
      conversationHistory.push({ role: 'user', content: message });

      // Call prompt endpoint with loading indicator
      const spinner = ora('Thinking...').start();
      
      try {
        const response = await client.prompt(message);
        spinner.stop();
        
        // Display response
        console.log(chalk.green('Assistant:'), response.content);
        console.log(chalk.gray(`Tokens used: ${response.usage.totalTokens} (prompt: ${response.usage.promptTokens}, completion: ${response.usage.completionTokens})\n`));
        
        // Add to history
        conversationHistory.push({ role: 'assistant', content: response.content });
        
      } catch (error: any) {
        spinner.stop();
        console.error(chalk.red('Error:'), error.message);
      }
      
    } catch (error: any) {
      if (error.isTtyError) {
        console.error(chalk.red('Error: TTY not available'));
        break;
      }
      console.error(chalk.red('Error:'), error.message);
    }
  }
}
```

### 3. Update Tests
Update the test files to match the new non-streaming implementation:

1. **`cli-client/src/api/edge-client.test.ts`**:
   - Remove tests for `createConversation`, `getConversation`, `addMessage`, `streamChat`
   - Keep tests for `health()` and `prompt()`

2. **`cli-client/tests/commands/chat.test.ts`**:
   - Remove tests related to streaming
   - Remove tests for conversation management
   - Update to test the simpler prompt loop

### 4. Update Package.json Scripts
No changes needed - the existing scripts should work fine.

### 5. Test the Implementation
After making these changes:
1. Run `npm run lint` to ensure TypeScript compiles
2. Run `npm test` to ensure all tests pass
3. Start the Edge server on port 8765
4. Test the CLI manually: `npm run dev chat`

## Expected Behavior After Fix
- `liminal chat` starts an interactive session
- Health check verifies server connection
- User can type prompts and get echo responses
- Token usage is displayed after each response
- "exit" command or Ctrl+C exits gracefully
- No streaming, just simple request/response

## Important Notes
- Do NOT implement new server endpoints
- Do NOT add streaming support
- Keep the implementation simple - this is just a proof of concept
- Maintain the existing visual polish (colors, spinners) but without streaming
- The conversation history is maintained locally in memory only

## Definition of Done
- [ ] EdgeClient simplified to only use existing endpoints
- [ ] Chat command works with prompt endpoint in a loop
- [ ] All tests updated and passing
- [ ] TypeScript compiles without errors
- [ ] Manual testing confirms interactive chat works
- [ ] Update execution log with fix notes