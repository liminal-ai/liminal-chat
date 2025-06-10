import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { EdgeClient } from '../api/edge-client';
import { StreamReconnectionManager } from '../api/streaming-reconnection';
import { StreamingDisplayHandler } from '../utils/streaming-display';

export function createChatCommand(client: EdgeClient): Command {
  const chat = new Command('chat');
  
  chat
    .description('Start an interactive chat session')
    .option('-p, --provider <provider>', 'LLM provider to use (default: echo)')
    .option('-s, --stream', 'Use streaming responses (default: false)')
    .action(async (options) => {
      try {
        await startChatSession(client, options);
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
  
  return chat;
}

async function startChatSession(client: EdgeClient, options: any): Promise<void> {
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

  // Get options
  const provider = options.provider?.toLowerCase();
  const useStreaming = options.stream || false;
  
  // Validate provider if specified
  if (provider) {
    try {
      // Validate by attempting a test prompt with the provider
      const testSpinner = ora(`Validating provider: ${provider}...`).start();
      await client.prompt('test', { provider });
      testSpinner.succeed(`Provider ${provider} is available`);
    } catch (error: any) {
      // Extract provider-specific error messages
      if (error.message.includes('not found')) {
        console.error(chalk.red(`Error: Provider '${provider}' not found. Available providers: echo, openai`));
      } else if (error.message.includes('requires configuration')) {
        console.error(chalk.red(error.message));
      } else {
        console.error(chalk.red('Error:'), error.message);
      }
      process.exit(1);
    }
  }
  
  // Display welcome message
  console.log(chalk.blue('\nWelcome to Liminal Type Chat!'));
  if (provider) {
    console.log(chalk.gray(`Using provider: ${provider}`));
  }
  if (useStreaming) {
    console.log(chalk.gray('Streaming mode: enabled'));
  }
  console.log(chalk.gray('Type "exit" to quit\n'));

  // Maintain local conversation history
  const conversationHistory: Array<{role: string, content: string}> = [];

  // Setup streaming components if needed
  let streamingDisplayHandler: StreamingDisplayHandler | undefined;
  let reconnectionManager: StreamReconnectionManager | undefined;
  
  if (useStreaming) {
    streamingDisplayHandler = new StreamingDisplayHandler({
      showUsage: true,
      clearOnReconnect: true
    });
    
    reconnectionManager = new StreamReconnectionManager(
      {
        maxRetries: 3,
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        jitterFactor: 0.1
      },
      () => streamingDisplayHandler?.clear()
    );
  }

  // Setup interrupt handler
  let isExiting = false;
  process.on('SIGINT', () => {
    if (!isExiting) {
      isExiting = true;
      console.log(chalk.yellow('\n\nGoodbye!'));
      process.exit(0);
    }
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

      if (useStreaming && reconnectionManager && streamingDisplayHandler) {
        // Use streaming with reconnection
        console.log(chalk.green('Assistant: '));
        
        try {
          for await (const event of reconnectionManager.streamWithReconnection(
            client, 
            message, 
            provider ? { provider } : undefined
          )) {
            streamingDisplayHandler.processEvent(event);
          }
          
          // Add response to history
          const responseContent = streamingDisplayHandler?.getContent();
          if (responseContent) {
            conversationHistory.push({ role: 'assistant', content: responseContent });
          }
          
        } catch (error: any) {
          console.error(chalk.red('\nError:'), error.message);
          console.log(); // Add blank line for spacing
        }
        
      } else {
        // Use non-streaming with loading indicator
        const spinner = ora('Thinking...').start();
        
        try {
          const response = await client.prompt(message, provider ? { provider } : undefined);
          spinner.stop();
          
          // Display response
          console.log(chalk.green('Assistant:'), response.content);
          
          // Display model info if provider was specified
          if (provider && response.model) {
            console.log(chalk.gray(`Model: ${response.model}`));
          }
          
          // Display token usage
          const usage = response.usage;
          const totalTokens = usage.totalTokens || (usage.promptTokens + usage.completionTokens);
          console.log(chalk.gray(`Tokens used: ${totalTokens} (prompt: ${usage.promptTokens}, completion: ${usage.completionTokens})\n`));
          
          // Add to history
          conversationHistory.push({ role: 'assistant', content: response.content });
          
        } catch (error: any) {
          spinner.stop();
          console.error(chalk.red('Error:'), error.message);
          console.log(); // Add blank line for spacing
        }
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

// Export for testing and potential future use
export async function getMultilineInput(): Promise<string> {
  console.log(chalk.gray('(Press Ctrl+D or type "." on a new line to send)'));
  
  const lines: string[] = [];
  const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
  });

  return new Promise((resolve) => {
    rl.on('line', (line: string) => {
      if (line === '.') {
        rl.close();
      } else {
        lines.push(line);
      }
    });

    rl.on('close', () => {
      resolve(lines.join('\n'));
    });
  });
}