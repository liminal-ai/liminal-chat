# Story 5: CLI E2E Test Implementation

## Objective
Implement comprehensive CLI end-to-end testing using Playwright + Node child_process, covering both batch and interactive modes, configuration flows, and complete user workflows from CLI input to final output.

## Background
CLI tier currently has limited E2E testing, with many tests skipped. This story establishes comprehensive E2E automation to validate complete user workflows, ensuring CLI commands work correctly in real-world scenarios.

## Scope

### In Scope
- CLI batch mode testing (non-interactive commands)
- CLI interactive mode testing (prompts, menus, user input)
- Configuration and authentication workflows
- Error handling and edge cases
- Cross-platform compatibility (basic)
- Performance and timeout validation

### Out of Scope
- Unit test changes (already using Vitest)
- Integration test changes (CLI uses Edge/Domain APIs)
- Installation/packaging testing
- Platform-specific testing (focus on core functionality)

## Technical Requirements

### CLI Commands to Test
```typescript
// All CLI commands requiring E2E coverage
interface CLICommands {
  // Core chat functionality
  chat: 'liminal chat [message]'
  chatInteractive: 'liminal chat (interactive mode)'
  
  // Provider management
  providers: 'liminal providers'
  providersConfigure: 'liminal providers configure'
  
  // Configuration
  config: 'liminal config'
  configSet: 'liminal config set <key> <value>'
  configShow: 'liminal config show'
  
  // Authentication
  auth: 'liminal auth'
  authLogin: 'liminal auth login'
  authStatus: 'liminal auth status'
  
  // Utility
  version: 'liminal --version'
  help: 'liminal --help'
  health: 'liminal health'
}
```

### Test Implementation Patterns

#### Basic CLI Test Pattern
```typescript
// tests/e2e/cli/basic-commands.spec.ts
import { cliTest as test, expect } from '../../fixtures/cli-fixtures'

test.describe('CLI Basic Commands', () => {
  test('should show version', async ({ cli }) => {
    const result = await cli.run(['--version'])
    
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toMatch(/\d+\.\d+\.\d+/)
    expect(result.stderr).toBe('')
  })

  test('should show help', async ({ cli }) => {
    const result = await cli.run(['--help'])
    
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('Usage:')
    expect(result.stdout).toContain('Commands:')
    expect(result.stdout).toContain('chat')
    expect(result.stdout).toContain('providers')
  })

  test('should handle invalid commands', async ({ cli }) => {
    const result = await cli.run(['invalid-command'])
    
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('Unknown command')
    expect(result.stderr).toContain('invalid-command')
  })
})
```

#### Chat Command Testing
```typescript
// tests/e2e/cli/chat-commands.spec.ts
import { cliTest as test, expect } from '../../fixtures/cli-fixtures'

test.describe('CLI Chat Commands', () => {
  test('should handle simple chat message', async ({ cli }) => {
    const result = await cli.run(['chat', 'Hello, AI!'])
    
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('Response:')
    expect(result.stdout.length).toBeGreaterThan(20) // Some meaningful response
    expect(result.stderr).toBe('')
  })

  test('should handle chat with provider selection', async ({ cli }) => {
    const result = await cli.run(['chat', 'Hello!', '--provider', 'echo'])
    
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('Echo: Hello!')
  })

  test('should handle chat with model selection', async ({ cli }) => {
    const result = await cli.run(['chat', 'Hello!', '--model', 'gpt-4'])
    
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('Response:')
    // Should indicate model selection worked
  })

  test('should handle streaming chat', async ({ cli }) => {
    const result = await cli.run(['chat', 'Tell me a short story', '--stream'])
    
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('Response:')
    // In streaming mode, should see progressive output
  })

  test('should handle empty message gracefully', async ({ cli }) => {
    const result = await cli.run(['chat', ''])
    
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('Message cannot be empty')
  })

  test('should handle very long messages', async ({ cli }) => {
    const longMessage = 'A'.repeat(10000) // 10k character message
    const result = await cli.run(['chat', longMessage], { timeout: 30000 })
    
    // Should either succeed or fail gracefully
    if (result.exitCode === 0) {
      expect(result.stdout).toContain('Response:')
    } else {
      expect(result.stderr).toContain('too long')
    }
  })
})
```

#### Interactive Mode Testing
```typescript
// tests/e2e/cli/interactive-mode.spec.ts
import { cliTest as test, expect } from '../../fixtures/cli-fixtures'

test.describe('CLI Interactive Mode', () => {
  test('should handle interactive chat session', async ({ cli }) => {
    const session = await cli.startInteractive(['chat'])
    
    // Send first message
    await session.send('Hello!')
    const response1 = await session.waitForResponse()
    expect(response1).toContain('Response:')
    
    // Send follow-up message
    await session.send('What is 2+2?')
    const response2 = await session.waitForResponse()
    expect(response2).toContain('4')
    
    // Exit interactive mode
    await session.send('exit')
    const exitCode = await session.close()
    expect(exitCode).toBe(0)
  })

  test('should handle provider selection in interactive mode', async ({ cli }) => {
    const session = await cli.startInteractive(['chat'])
    
    // Select provider
    await session.send('/provider echo')
    await session.waitForResponse('Provider set to: echo')
    
    // Send message
    await session.send('Hello!')
    const response = await session.waitForResponse()
    expect(response).toContain('Echo: Hello!')
    
    await session.close()
  })

  test('should handle help in interactive mode', async ({ cli }) => {
    const session = await cli.startInteractive(['chat'])
    
    await session.send('/help')
    const help = await session.waitForResponse()
    expect(help).toContain('Available commands:')
    expect(help).toContain('/provider')
    expect(help).toContain('/exit')
    
    await session.close()
  })

  test('should handle history navigation', async ({ cli }) => {
    const session = await cli.startInteractive(['chat'])
    
    // Send multiple messages
    await session.send('First message')
    await session.waitForResponse()
    
    await session.send('Second message')
    await session.waitForResponse()
    
    // Test history navigation (if implemented)
    await session.sendKey('ArrowUp') // Up arrow
    await session.sendKey('Enter')
    const response = await session.waitForResponse()
    expect(response).toContain('Response:')
    
    await session.close()
  })
})
```

#### Configuration Testing
```typescript
// tests/e2e/cli/config-commands.spec.ts
import { cliTest as test, expect } from '../../fixtures/cli-fixtures'

test.describe('CLI Configuration Commands', () => {
  test('should show current configuration', async ({ cli }) => {
    const result = await cli.run(['config', 'show'])
    
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('baseUrl:')
    expect(result.stdout).toContain('timeout:')
  })

  test('should set configuration values', async ({ cli }) => {
    // Set a config value
    const setResult = await cli.run(['config', 'set', 'timeout', '45000'])
    expect(setResult.exitCode).toBe(0)
    expect(setResult.stdout).toContain('timeout set to 45000')
    
    // Verify it was set
    const showResult = await cli.run(['config', 'show'])
    expect(showResult.stdout).toContain('timeout: 45000')
  })

  test('should handle invalid config keys', async ({ cli }) => {
    const result = await cli.run(['config', 'set', 'invalid-key', 'value'])
    
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('Unknown configuration key')
  })

  test('should handle config file creation', async ({ cli }) => {
    // Run config command that should create config file
    const result = await cli.run(['config', 'set', 'baseUrl', 'http://custom.url'])
    
    expect(result.exitCode).toBe(0)
    
    // Verify config persists
    const showResult = await cli.run(['config', 'show'])
    expect(showResult.stdout).toContain('http://custom.url')
  })

  test('should prioritize environment variables', async ({ cli }) => {
    // Set environment variable
    const result = await cli.run(['config', 'show'], {
      env: { LIMINAL_API_URL: 'http://env.url' }
    })
    
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('http://env.url')
  })
})
```

#### Provider Management Testing
```typescript
// tests/e2e/cli/provider-commands.spec.ts
import { cliTest as test, expect } from '../../fixtures/cli-fixtures'

test.describe('CLI Provider Commands', () => {
  test('should list available providers', async ({ cli }) => {
    const result = await cli.run(['providers'])
    
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('Available providers:')
    expect(result.stdout).toContain('echo')
    expect(result.stdout).toContain('✓') // Configured indicator
  })

  test('should show provider details', async ({ cli }) => {
    const result = await cli.run(['providers', 'show', 'echo'])
    
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('Provider: echo')
    expect(result.stdout).toContain('Status: configured')
    expect(result.stdout).toContain('Description:')
  })

  test('should handle provider configuration', async ({ cli }) => {
    const session = await cli.startInteractive(['providers', 'configure', 'openrouter'])
    
    // Should prompt for API key
    await session.waitForOutput('Enter OpenRouter API key:')
    await session.send('test-api-key')
    
    const response = await session.waitForResponse()
    expect(response).toContain('Provider configured successfully')
    
    await session.close()
  })

  test('should validate provider names', async ({ cli }) => {
    const result = await cli.run(['providers', 'show', 'invalid-provider'])
    
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('Provider not found')
  })
})
```

#### Error Handling and Edge Cases
```typescript
// tests/e2e/cli/error-handling.spec.ts
import { cliTest as test, expect } from '../../fixtures/cli-fixtures'

test.describe('CLI Error Handling', () => {
  test('should handle server connectivity issues', async ({ cli }) => {
    // Use invalid server URL
    const result = await cli.run(['chat', 'Hello'], {
      env: { LIMINAL_API_URL: 'http://nonexistent:9999' }
    })
    
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('Cannot connect to server')
  })

  test('should handle authentication errors', async ({ cli }) => {
    // Use invalid API key
    const result = await cli.run(['chat', 'Hello'], {
      env: { LIMINAL_API_KEY: 'invalid-key' }
    })
    
    if (result.exitCode !== 0) {
      expect(result.stderr).toContain('authentication')
    }
  })

  test('should handle timeout scenarios', async ({ cli }) => {
    const result = await cli.run(['chat', 'Hello'], {
      timeout: 1000, // Very short timeout
      env: { LIMINAL_TIMEOUT: '500' }
    })
    
    // Should either succeed quickly or timeout gracefully
    if (result.exitCode !== 0) {
      expect(result.stderr).toContain('timeout')
    }
  })

  test('should handle malformed responses', async ({ cli }) => {
    // This would require mocking server responses
    // Implementation depends on test infrastructure
    const result = await cli.run(['health'])
    
    // Health check should always work with proper servers
    expect(result.exitCode).toBe(0)
  })

  test('should handle insufficient permissions', async ({ cli }) => {
    // Test config file permissions (platform dependent)
    const result = await cli.run(['config', 'show'])
    
    // Should handle permission issues gracefully
    expect(result.exitCode).toBeOneOf([0, 1])
    if (result.exitCode === 1) {
      expect(result.stderr).toContain('permission')
    }
  })
})
```

### Enhanced CLI Test Helper
```typescript
// Enhanced CLI helper for interactive testing
class CLITestHelper {
  private processes: ChildProcess[] = []

  async run(args: string[], options: CLIOptions = {}) {
    // Implementation from Story 2, enhanced
  }

  async startInteractive(args: string[]) {
    const process = spawn('node', ['apps/cli/dist/index.js', ...args], {
      stdio: ['pipe', 'pipe', 'pipe']
    })
    
    return new InteractiveCLISession(process)
  }
}

class InteractiveCLISession {
  constructor(private process: ChildProcess) {}

  async send(input: string) {
    this.process.stdin?.write(input + '\n')
  }

  async sendKey(key: string) {
    // Send special keys like arrows, ctrl+c, etc.
    const keyCode = this.getKeyCode(key)
    this.process.stdin?.write(keyCode)
  }

  async waitForOutput(expectedText: string, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout')), timeout)
      
      const handler = (data: Buffer) => {
        if (data.toString().includes(expectedText)) {
          clearTimeout(timer)
          this.process.stdout?.off('data', handler)
          resolve(data.toString())
        }
      }
      
      this.process.stdout?.on('data', handler)
    })
  }

  async close() {
    this.process.stdin?.end()
    return new Promise<number>((resolve) => {
      this.process.on('close', resolve)
    })
  }
}
```

## Acceptance Criteria

### Command Coverage
- [ ] **Chat commands**: Both simple and interactive chat modes
- [ ] **Provider commands**: List, show, and configure providers
- [ ] **Config commands**: Show, set, and manage configuration
- [ ] **Auth commands**: Login, status, and authentication flows
- [ ] **Utility commands**: Version, help, health checks

### Interactive Mode
- [ ] **Session management**: Start, maintain, and exit interactive sessions
- [ ] **Command handling**: Interactive commands and responses
- [ ] **History navigation**: Command history and recall (if implemented)
- [ ] **Multi-turn conversations**: Context preservation across turns
- [ ] **Graceful exit**: Clean session termination

### Configuration and State
- [ ] **Config persistence**: Configuration changes persist correctly
- [ ] **Environment variables**: Environment variable precedence
- [ ] **File handling**: Config file creation and management
- [ ] **Cross-platform paths**: Config file locations work cross-platform
- [ ] **Permission handling**: Graceful handling of permission issues

### Error Handling
- [ ] **Network errors**: Server connectivity issues handled gracefully
- [ ] **Authentication errors**: Auth failures provide clear messages
- [ ] **Timeout scenarios**: Long-running requests timeout appropriately
- [ ] **Invalid input**: Malformed commands and arguments handled
- [ ] **Resource constraints**: Memory/CPU limitations handled

### Performance and Reliability
- [ ] **Startup time**: CLI starts within 1 second
- [ ] **Response time**: Interactive commands respond within 2 seconds
- [ ] **Memory usage**: No memory leaks in long-running sessions
- [ ] **Concurrent usage**: Multiple CLI instances don't interfere
- [ ] **Signal handling**: Ctrl+C and other signals handled properly

## Implementation Notes

### Test Organization
```bash
tests/e2e/cli/
├── basic-commands.spec.ts        # Version, help, health
├── chat-commands.spec.ts         # Chat functionality
├── interactive-mode.spec.ts      # Interactive sessions
├── config-commands.spec.ts       # Configuration management
├── provider-commands.spec.ts     # Provider management
├── auth-commands.spec.ts         # Authentication flows
├── error-handling.spec.ts        # Error scenarios
└── performance.spec.ts           # Performance validation
```

### Interactive Testing Patterns
- **Session management**: Proper setup and teardown of interactive sessions
- **Input simulation**: Realistic user input patterns
- **Output validation**: Comprehensive output parsing and validation
- **Timing considerations**: Appropriate waits for responses
- **Error recovery**: Handling of unexpected states

### Platform Considerations
- **Path handling**: Cross-platform file system paths
- **Process management**: Proper process cleanup
- **Signal handling**: Platform-specific signal behavior
- **Environment variables**: Platform-specific env var handling
- **Terminal simulation**: TTY vs non-TTY behavior

### CI/CD Considerations
- **Headless execution**: All tests run in headless CI environment
- **Service dependencies**: Ensure Edge/Domain servers available
- **Timeout management**: Appropriate timeouts for CI environment
- **Artifact collection**: Capture CLI output for debugging
- **Parallel safety**: Tests don't interfere with each other

## Dependencies
- **Upstream**: Story 2 (Playwright Framework Setup)
- **Downstream**: Can run in parallel with Stories 3, 4
- **Blocking**: None after Story 2 completion

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All main CLI workflows automated
- [ ] Interactive mode fully tested
- [ ] Error scenarios comprehensively covered
- [ ] Performance benchmarks established
- [ ] CI/CD integration validated
- [ ] Cross-platform compatibility verified
- [ ] Documentation completed
- [ ] Code review completed 