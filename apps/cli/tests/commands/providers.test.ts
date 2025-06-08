import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { createProvidersCommand } from '../../src/commands/providers';
import { EdgeClient } from '../../src/api/edge-client';

// Mock chalk
vi.mock('chalk', () => ({
  default: {
    blue: vi.fn((text) => text),
    green: vi.fn((text) => text),
    red: vi.fn((text) => text),
    yellow: vi.fn((text) => text),
    gray: vi.fn((text) => text),
    bold: vi.fn((text) => text),
    dim: vi.fn((text) => text)
  }
}));

describe('Providers Command', () => {
  let mockClient: EdgeClient;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let processExitSpy: any;

  beforeEach(() => {
    // Create mock client
    mockClient = {
      getProviders: vi.fn()
    } as any;

    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createProvidersCommand', () => {
    it('should create a providers command with correct configuration', () => {
      const command = createProvidersCommand(mockClient);
      
      expect(command).toBeInstanceOf(Command);
      expect(command.name()).toBe('providers');
      expect(command.description()).toBe('List available LLM providers');
      
      // Should have no options
      const options = command.options;
      expect(options).toHaveLength(0);
    });
  });

  describe('Provider Discovery', () => {
    it('should call getProviders endpoint', async () => {
      const mockProviders = {
        defaultProvider: 'echo',
        availableProviders: ['echo', 'openai'],
        providers: {
          echo: {
            available: true,
            status: 'healthy',
            models: ['echo-1.0'],
            description: 'Echo provider for testing'
          },
          openai: {
            available: false,
            status: 'unhealthy',
            models: ['o4-mini', 'gpt-4.1', 'o3'],
            description: 'OpenAI GPT models (requires OPENAI_API_KEY)'
          }
        }
      };

      mockClient.getProviders.mockResolvedValue(mockProviders);

      const command = createProvidersCommand(mockClient);
      await command.parseAsync(['node', 'test', 'providers']);

      expect(mockClient.getProviders).toHaveBeenCalledTimes(1);
    });

    it('should format and display provider list', async () => {
      const mockProviders = {
        defaultProvider: 'echo',
        availableProviders: ['echo', 'openai'],
        providers: {
          echo: {
            available: true,
            status: 'healthy',
            models: ['echo-1.0'],
            description: 'Echo provider for testing'
          },
          openai: {
            available: false,
            status: 'unhealthy',
            models: ['o4-mini', 'gpt-4.1'],
            description: 'OpenAI GPT models (requires OPENAI_API_KEY)'
          }
        }
      };

      mockClient.getProviders.mockResolvedValue(mockProviders);

      const command = createProvidersCommand(mockClient);
      await command.parseAsync(['node', 'test', 'providers']);

      // Check header
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Available LLM Providers:'));
      
      // Check echo provider (default + configured)
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('* echo (default)'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Echo provider for testing'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Status: ✓ Configured'));
      
      // Check openai provider (not configured)
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('* openai'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('OpenAI GPT models (requires OPENAI_API_KEY)'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Status: ✗ Not configured'));
    });

    it('should show models for each provider', async () => {
      const mockProviders = {
        defaultProvider: 'echo',
        availableProviders: ['echo'],
        providers: {
          echo: {
            available: true,
            status: 'healthy',
            models: ['echo-1.0'],
            description: 'Echo provider for testing'
          }
        }
      };

      mockClient.getProviders.mockResolvedValue(mockProviders);

      const command = createProvidersCommand(mockClient);
      await command.parseAsync(['node', 'test', 'providers']);

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Models: echo-1.0'));
    });

    it('should handle multiple models display', async () => {
      const mockProviders = {
        defaultProvider: 'echo',
        availableProviders: ['openai'],
        providers: {
          openai: {
            available: true,
            status: 'healthy',
            models: ['o4-mini', 'gpt-4.1', 'o3'],
            description: 'OpenAI GPT models'
          }
        }
      };

      mockClient.getProviders.mockResolvedValue(mockProviders);

      const command = createProvidersCommand(mockClient);
      await command.parseAsync(['node', 'test', 'providers']);

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Models: o4-mini, gpt-4.1, o3'));
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      mockClient.getProviders.mockRejectedValue(
        new Error('Error: Unable to connect to server. Check your connection and try again.')
      );

      const command = createProvidersCommand(mockClient);
      await command.parseAsync(['node', 'test', 'providers']);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error:'),
        'Error: Unable to connect to server. Check your connection and try again.'
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle network errors', async () => {
      const error = new Error('ECONNREFUSED');
      (error as any).code = 'ECONNREFUSED';
      mockClient.getProviders.mockRejectedValue(error);

      const command = createProvidersCommand(mockClient);
      await command.parseAsync(['node', 'test', 'providers']);

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error:'), 'ECONNREFUSED');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle unexpected response format', async () => {
      // Missing providers object
      mockClient.getProviders.mockResolvedValue({
        defaultProvider: 'echo'
      });

      const command = createProvidersCommand(mockClient);
      await command.parseAsync(['node', 'test', 'providers']);

      // Should handle gracefully without crashing
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Available LLM Providers:'));
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty provider list', async () => {
      mockClient.getProviders.mockResolvedValue({
        defaultProvider: 'echo',
        availableProviders: [],
        providers: {}
      });

      const command = createProvidersCommand(mockClient);
      await command.parseAsync(['node', 'test', 'providers']);

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Available LLM Providers:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('No providers available'));
    });

    it('should handle provider with no description', async () => {
      mockClient.getProviders.mockResolvedValue({
        defaultProvider: 'test',
        availableProviders: ['test'],
        providers: {
          test: {
            available: true,
            status: 'healthy',
            models: ['test-1.0']
            // No description field
          }
        }
      });

      const command = createProvidersCommand(mockClient);
      await command.parseAsync(['node', 'test', 'providers']);

      // Should display provider without crashing
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('* test'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Status: ✓ Configured'));
    });

    it('should not accept any arguments', async () => {
      mockClient.getProviders.mockResolvedValue({
        defaultProvider: 'echo',
        availableProviders: ['echo'],
        providers: {
          echo: {
            available: true,
            status: 'healthy',
            models: ['echo-1.0'],
            description: 'Echo provider'
          }
        }
      });

      const command = createProvidersCommand(mockClient);
      
      // Extra arguments should be ignored
      await command.parseAsync(['node', 'test', 'providers', 'extra', 'args']);

      // Should still work normally
      expect(mockClient.getProviders).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Available LLM Providers:'));
    });
  });
});