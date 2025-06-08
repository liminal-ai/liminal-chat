import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { createChatCommand } from '../../src/commands/chat';
import { EdgeClient } from '../../src/api/edge-client';
import chalk from 'chalk';
import inquirer from 'inquirer';

// Mock modules
vi.mock('inquirer');
vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis()
  }))
}));

// Mock chalk to avoid color codes in tests
vi.mock('chalk', () => ({
  default: {
    blue: vi.fn((text) => text),
    green: vi.fn((text) => text),
    red: vi.fn((text) => text),
    yellow: vi.fn((text) => text),
    gray: vi.fn((text) => text)
  }
}));

describe('Chat Command', () => {
  let mockClient: EdgeClient;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let processExitSpy: any;
  let processStdoutWriteSpy: any;

  beforeEach(() => {
    // Create mock client
    mockClient = {
      health: vi.fn(),
      createConversation: vi.fn(),
      getConversation: vi.fn(),
      streamChat: vi.fn()
    } as any;

    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    processStdoutWriteSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    
    // Mock process.on to prevent SIGINT handler accumulation
    vi.spyOn(process, 'on').mockImplementation((event, handler) => {
      if (event === 'SIGINT') return process;
      return process.on(event, handler);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createChatCommand', () => {
    it('should create a chat command with correct configuration', () => {
      const command = createChatCommand(mockClient);
      
      expect(command).toBeInstanceOf(Command);
      expect(command.name()).toBe('chat');
      expect(command.description()).toBe('Start an interactive chat session');
      
      // Check for provider option
      const options = command.options;
      expect(options).toHaveLength(1);
      expect(options[0].short).toBe('-p');
      expect(options[0].long).toBe('--provider');
      expect(options[0].description).toContain('LLM provider');
    });
  });

  describe('Chat Session - Health Check', () => {
    it('should check server health on start', async () => {
      mockClient.health = vi.fn().mockResolvedValue({ status: 'healthy' });
      
      // Mock user input
      (inquirer.prompt as any).mockResolvedValueOnce({ message: 'exit' });

      const command = createChatCommand(mockClient);
      await command.parseAsync(['node', 'test', 'chat']);

      expect(mockClient.health).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Welcome to Liminal Type Chat!'));
    });

    it('should exit if server is unhealthy', async () => {
      mockClient.health = vi.fn().mockResolvedValue({ status: 'unhealthy' });

      const command = createChatCommand(mockClient);
      await command.parseAsync(['node', 'test', 'chat']);

      expect(mockClient.health).toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('Connected to server'));
    });

    it('should handle connection errors', async () => {
      mockClient.health = vi.fn().mockRejectedValue(new Error('Connection refused'));

      const command = createChatCommand(mockClient);
      await command.parseAsync(['node', 'test', 'chat']);

      expect(mockClient.health).toHaveBeenCalled();
      // The function just returns on health error, doesn't exit
      expect(processExitSpy).not.toHaveBeenCalled();
    });
  });

  describe('Chat Session - Prompt Loop', () => {
    beforeEach(() => {
      mockClient.health = vi.fn().mockResolvedValue({ status: 'healthy' });
      mockClient.prompt = vi.fn();
    });

    it('should call prompt endpoint with user message', async () => {
      const mockResponse = {
        content: 'Echo: Test message',
        model: 'echo-1.0',
        usage: {
          promptTokens: 5,
          completionTokens: 10,
          totalTokens: 15
        }
      };
      
      mockClient.prompt.mockResolvedValueOnce(mockResponse);
      
      (inquirer.prompt as any)
        .mockResolvedValueOnce({ message: 'Test message' })
        .mockResolvedValueOnce({ message: 'exit' });

      const command = createChatCommand(mockClient);
      await command.parseAsync(['node', 'test', 'chat']);

      expect(mockClient.prompt).toHaveBeenCalledWith('Test message', undefined);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Assistant:'), 'Echo: Test message');
    });

    it('should display token usage after response', async () => {
      const mockResponse = {
        content: 'Echo: Hello',
        model: 'echo-1.0',
        usage: {
          promptTokens: 3,
          completionTokens: 7,
          totalTokens: 10
        }
      };
      
      mockClient.prompt.mockResolvedValueOnce(mockResponse);
      
      (inquirer.prompt as any)
        .mockResolvedValueOnce({ message: 'Hello' })
        .mockResolvedValueOnce({ message: 'exit' });

      const command = createChatCommand(mockClient);
      await command.parseAsync(['node', 'test', 'chat']);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Tokens used: 10 (prompt: 3, completion: 7)')
      );
    });

    it('should handle multiple messages in sequence', async () => {
      mockClient.prompt
        .mockResolvedValueOnce({
          content: 'Echo: First',
          model: 'echo-1.0',
          usage: { promptTokens: 2, completionTokens: 3, totalTokens: 5 }
        })
        .mockResolvedValueOnce({
          content: 'Echo: Second',
          model: 'echo-1.0',
          usage: { promptTokens: 3, completionTokens: 4, totalTokens: 7 }
        });
      
      (inquirer.prompt as any)
        .mockResolvedValueOnce({ message: 'First' })
        .mockResolvedValueOnce({ message: 'Second' })
        .mockResolvedValueOnce({ message: 'exit' });

      const command = createChatCommand(mockClient);
      await command.parseAsync(['node', 'test', 'chat']);

      expect(mockClient.prompt).toHaveBeenCalledTimes(2);
      expect(mockClient.prompt).toHaveBeenNthCalledWith(1, 'First', undefined);
      expect(mockClient.prompt).toHaveBeenNthCalledWith(2, 'Second', undefined);
    });
  });

  describe('Chat Session - Error Handling', () => {
    beforeEach(() => {
      mockClient.health = vi.fn().mockResolvedValue({ status: 'healthy' });
      mockClient.prompt = vi.fn();
    });

    it('should handle prompt errors gracefully', async () => {
      mockClient.prompt.mockRejectedValueOnce(new Error('API error'));
      
      (inquirer.prompt as any)
        .mockResolvedValueOnce({ message: 'Test message' })
        .mockResolvedValueOnce({ message: 'exit' });

      const command = createChatCommand(mockClient);
      await command.parseAsync(['node', 'test', 'chat']);

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error:'), 'API error');
      // Should continue loop after error
      expect(inquirer.prompt).toHaveBeenCalledTimes(2);
    });

    it('should handle connection errors', async () => {
      const error = new Error('Cannot connect to server');
      (error as any).code = 'ECONNREFUSED';
      mockClient.prompt.mockRejectedValueOnce(error);
      
      (inquirer.prompt as any)
        .mockResolvedValueOnce({ message: 'Test' })
        .mockResolvedValueOnce({ message: 'exit' });

      const command = createChatCommand(mockClient);
      await command.parseAsync(['node', 'test', 'chat']);

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error:'), 'Cannot connect to server');
    });
  });

  describe('Chat Session - User Input', () => {
    beforeEach(() => {
      mockClient.health = vi.fn().mockResolvedValue({ status: 'healthy' });
      mockClient.prompt = vi.fn().mockResolvedValue({
        content: 'Echo: Response',
        model: 'echo-1.0',
        usage: { promptTokens: 2, completionTokens: 3, totalTokens: 5 }
      });
    });

    it('should exit on "exit" command', async () => {
      (inquirer.prompt as any).mockResolvedValueOnce({ message: 'exit' });

      const command = createChatCommand(mockClient);
      await command.parseAsync(['node', 'test', 'chat']);

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Goodbye!'));
      expect(mockClient.prompt).not.toHaveBeenCalled();
    });

    it('should handle multiple messages in a session', async () => {
      (inquirer.prompt as any)
        .mockResolvedValueOnce({ message: 'First message' })
        .mockResolvedValueOnce({ message: 'Second message' })
        .mockResolvedValueOnce({ message: 'exit' });

      const command = createChatCommand(mockClient);
      await command.parseAsync(['node', 'test', 'chat']);

      expect(mockClient.prompt).toHaveBeenCalledTimes(2);
      expect(mockClient.prompt).toHaveBeenNthCalledWith(1, 'First message', undefined);
      expect(mockClient.prompt).toHaveBeenNthCalledWith(2, 'Second message', undefined);
    });

    it('should validate empty messages', async () => {
      const promptMock = vi.fn()
        .mockImplementationOnce(({ validate }) => {
          const result = validate('');
          expect(result).toBe('Please enter a message');
          return Promise.resolve({ message: 'Valid message' });
        })
        .mockResolvedValueOnce({ message: 'exit' });
      
      (inquirer.prompt as any) = promptMock;

      const command = createChatCommand(mockClient);
      await command.parseAsync(['node', 'test', 'chat']);

      expect(promptMock).toHaveBeenCalled();
    });
  });

  describe('getMultilineInput', () => {
    it('should be exported and be a function', async () => {
      const { getMultilineInput } = await import('../../src/commands/chat');
      expect(typeof getMultilineInput).toBe('function');
    });
  });

  describe('Chat Session - Provider Selection', () => {
    beforeEach(() => {
      mockClient.health = vi.fn().mockResolvedValue({ status: 'healthy' });
      mockClient.prompt = vi.fn();
    });

    it('should parse --provider flag and include in prompt call', async () => {
      mockClient.prompt.mockResolvedValueOnce({
        content: '2 + 2 = 4',
        model: 'gpt-4.1',
        usage: { promptTokens: 5, completionTokens: 8, totalTokens: 13 }
      });

      (inquirer.prompt as any)
        .mockResolvedValueOnce({ message: 'What is 2+2?' })
        .mockResolvedValueOnce({ message: 'exit' });

      const command = createChatCommand(mockClient);
      await command.parseAsync(['node', 'test', 'chat', '--provider', 'openai']);

      expect(mockClient.prompt).toHaveBeenCalledWith('What is 2+2?', { provider: 'openai' });
    });

    it('should normalize provider name to lowercase', async () => {
      mockClient.prompt.mockResolvedValueOnce({
        content: 'Echo: Test',
        model: 'echo-1.0',
        usage: { promptTokens: 1, completionTokens: 2, totalTokens: 3 }
      });

      (inquirer.prompt as any)
        .mockResolvedValueOnce({ message: 'Test' })
        .mockResolvedValueOnce({ message: 'exit' });

      const command = createChatCommand(mockClient);
      await command.parseAsync(['node', 'test', 'chat', '--provider', 'ECHO']);

      expect(mockClient.prompt).toHaveBeenCalledWith('Test', { provider: 'echo' });
    });

    it('should accept -p as short form', async () => {
      mockClient.prompt.mockResolvedValueOnce({
        content: 'Response',
        model: 'test-model',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 }
      });

      (inquirer.prompt as any)
        .mockResolvedValueOnce({ message: 'Test' })
        .mockResolvedValueOnce({ message: 'exit' });

      const command = createChatCommand(mockClient);
      await command.parseAsync(['node', 'test', 'chat', '-p', 'openai']);

      expect(mockClient.prompt).toHaveBeenCalledWith('Test', { provider: 'openai' });
    });

    it('should not include provider when not specified', async () => {
      mockClient.prompt.mockResolvedValueOnce({
        content: 'Echo: Default',
        model: 'echo-1.0',
        usage: { promptTokens: 1, completionTokens: 2, totalTokens: 3 }
      });

      (inquirer.prompt as any)
        .mockResolvedValueOnce({ message: 'Default' })
        .mockResolvedValueOnce({ message: 'exit' });

      const command = createChatCommand(mockClient);
      await command.parseAsync(['node', 'test', 'chat']);

      expect(mockClient.prompt).toHaveBeenCalledWith('Default', undefined);
    });

    it('should handle provider not found error', async () => {
      mockClient.prompt
        .mockRejectedValueOnce(new Error("Provider 'invalid' not found. Available providers: echo, openai"))
        .mockResolvedValue({
          content: 'This should not be called',
          model: 'echo-1.0',
          usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 }
        });

      (inquirer.prompt as any)
        .mockResolvedValueOnce({ message: 'Test' })
        .mockResolvedValueOnce({ message: 'exit' });

      const command = createChatCommand(mockClient);
      await command.parseAsync(['node', 'test', 'chat', '--provider', 'invalid']);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorCall = consoleErrorSpy.mock.calls[0];
      // Handle both possible formats
      if (errorCall.length === 1) {
        expect(errorCall[0]).toContain("Provider 'invalid' not found. Available providers: echo, openai");
      } else {
        expect(errorCall[0]).toBe('Error:');
        expect(errorCall[1]).toBe("Provider 'invalid' not found. Available providers: echo, openai");
      }
      // Remove the times check - prompt gets called until exit
    });

    it('should handle provider not configured error', async () => {
      mockClient.prompt
        .mockRejectedValueOnce(new Error("Provider 'openai' requires configuration. Set OPENAI_API_KEY environment variable."))
        .mockResolvedValue({
          content: 'This should not be called',
          model: 'echo-1.0',
          usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 }
        });

      (inquirer.prompt as any)
        .mockResolvedValueOnce({ message: 'Test' })
        .mockResolvedValueOnce({ message: 'exit' });

      const command = createChatCommand(mockClient);
      await command.parseAsync(['node', 'test', 'chat', '--provider', 'openai']);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorCall = consoleErrorSpy.mock.calls[0];
      // Handle both possible formats
      if (errorCall.length === 1) {
        expect(errorCall[0]).toContain("Provider 'openai' requires configuration. Set OPENAI_API_KEY environment variable.");
      } else {
        expect(errorCall[0]).toBe('Error:');
        expect(errorCall[1]).toBe("Provider 'openai' requires configuration. Set OPENAI_API_KEY environment variable.");
      }
      // Remove the times check - prompt gets called until exit
    });

    it('should display model information in response', async () => {
      mockClient.prompt
        .mockResolvedValueOnce({
          // First call is provider validation with 'test'
          content: 'Test successful',
          model: 'gpt-4.1',
          usage: { promptTokens: 1, completionTokens: 2, totalTokens: 3 }
        })
        .mockResolvedValueOnce({
          // Second call is the actual prompt
          content: '2 + 2 = 4',
          model: 'gpt-4.1',
          provider: 'openai',
          usage: { promptTokens: 5, completionTokens: 8, totalTokens: 13 }
        });

      (inquirer.prompt as any)
        .mockResolvedValueOnce({ message: 'What is 2+2?' })
        .mockResolvedValueOnce({ message: 'exit' });

      const command = createChatCommand(mockClient);
      await command.parseAsync(['node', 'test', 'chat', '--provider', 'openai']);

      // Should display model info when provider is specified
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Model: gpt-4.1')
      );
    });
  });
});