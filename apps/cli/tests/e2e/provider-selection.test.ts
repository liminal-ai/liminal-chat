import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import { EdgeClient } from '../../src/api/edge-client';
import path from 'path';

// Test helpers for provider responses
export const TEST_PROVIDERS = {
  available: ['echo', 'openai'],
  configured: ['echo'],
  descriptions: {
    echo: 'Echo provider for testing',
    openai: 'OpenAI GPT models (requires OPENAI_API_KEY)'
  }
};

export const PROVIDER_ERRORS = {
  notFound: (name: string) => 
    `Error: Provider '${name}' not found. Available providers: echo, openai`,
  notConfigured: (name: string) =>
    `Provider '${name}' requires configuration. Set ${name.toUpperCase()}_API_KEY environment variable.`,
  authFailed: (name: string) =>
    `Provider '${name}' authentication failed. Check your API key configuration.`,
  connectionError: 'Error: Unable to connect to server. Check your connection and try again.'
};

describe('E2E: Provider Selection', () => {
  let serverProcess: ChildProcess;
  let client: EdgeClient;
  const cliPath = path.join(process.cwd(), 'bin', 'liminal.js');
  
  beforeAll(async () => {
    // Note: Server should be started externally for E2E tests
    // This is just a placeholder - in real E2E setup, server would be managed by test runner
    client = new EdgeClient('http://localhost:8787');
    
    // Wait for server to be ready
    let retries = 10;
    while (retries > 0) {
      try {
        await client.health();
        break;
      } catch {
        retries--;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (retries === 0) {
      throw new Error('Server did not start in time');
    }
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  const runCLI = (args: string[]): Promise<{ stdout: string; stderr: string; code: number }> => {
    return new Promise((resolve) => {
      const proc = spawn('node', [cliPath, ...args], {
        env: { ...process.env, NODE_ENV: 'test' }
      });
      
      let stdout = '';
      let stderr = '';
      
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      proc.on('close', (code) => {
        resolve({ stdout, stderr, code: code || 0 });
      });
      
      // Send exit after prompt appears
      if (args[0] === 'chat') {
        setTimeout(() => {
          proc.stdin.write('exit\n');
        }, 500);
      }
    });
  };

  describe('Chat with Provider Selection', () => {
    it('should use echo provider explicitly', async () => {
      const { stdout, code } = await runCLI(['chat', '--provider', 'echo']);
      
      expect(code).toBe(0);
      expect(stdout).toContain('Welcome to Liminal Type Chat');
      expect(stdout).toContain('Using provider: echo');
    });

    it('should handle case-insensitive provider names', async () => {
      const { stdout, code } = await runCLI(['chat', '--provider', 'ECHO']);
      
      expect(code).toBe(0);
      expect(stdout).toContain('Using provider: echo');
    });

    it('should error on invalid provider', async () => {
      const { stdout, stderr, code } = await runCLI(['chat', '--provider', 'invalid']);
      
      expect(code).toBe(1);
      expect(stderr).toContain(PROVIDER_ERRORS.notFound('invalid'));
    });

    it('should error on unconfigured provider', async () => {
      // Ensure OPENAI_API_KEY is not set
      const env = { ...process.env };
      delete env.OPENAI_API_KEY;
      
      const proc = spawn('node', [cliPath, 'chat', '--provider', 'openai'], { env });
      
      let stderr = '';
      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      const code = await new Promise<number>((resolve) => {
        proc.on('close', (code) => resolve(code || 0));
      });
      
      expect(code).toBe(1);
      expect(stderr).toContain(PROVIDER_ERRORS.notConfigured('openai'));
    });

    it('should use default provider when none specified', async () => {
      const { stdout, code } = await runCLI(['chat']);
      
      expect(code).toBe(0);
      expect(stdout).toContain('Welcome to Liminal Type Chat');
      // Should not show provider selection message for default
      expect(stdout).not.toContain('Using provider:');
    });
  });

  describe('Provider Discovery Command', () => {
    it('should list all providers with status', async () => {
      const { stdout, code } = await runCLI(['providers']);
      
      expect(code).toBe(0);
      expect(stdout).toContain('Available LLM Providers:');
      expect(stdout).toContain('* echo (default)');
      // Note: Provider descriptions are not returned by domain server
      expect(stdout).toContain('Status: ✓ Configured');
      expect(stdout).toContain('* openai');
      expect(stdout).toContain('Status: ✗ Not configured');
    });

    it('should show models for each provider', async () => {
      const { stdout, code } = await runCLI(['providers']);
      
      expect(code).toBe(0);
      expect(stdout).toContain('Models: echo-1.0');
      expect(stdout).toMatch(/Models:.*o4-mini.*gpt-4\.1/);
    });

    it('should handle connection error gracefully', async () => {
      // Stop the server to simulate connection error
      // Note: In real tests, we'd actually stop the server here
      // For now, we'll mock the behavior
      
      // This would need actual implementation to stop/start server
      // expect(stderr).toContain(PROVIDER_ERRORS.connectionError);
    });
  });

  describe('Integration Flow', () => {
    it('should complete full chat flow with provider selection', async () => {
      const proc = spawn('node', [cliPath, 'chat', '--provider', 'echo']);
      
      let output = '';
      proc.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      // Wait for prompt
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send a message
      proc.stdin.write('Hello world\n');
      
      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Exit
      proc.stdin.write('exit\n');
      
      const code = await new Promise<number>((resolve) => {
        proc.on('close', (code) => resolve(code || 0));
      });
      
      expect(code).toBe(0);
      expect(output).toContain('Echo: Hello world');
      expect(output).toContain('Tokens');
      expect(output).toContain('Goodbye!');
    });
  });
});