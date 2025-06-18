# Implementation Prompt: Story 3 - Basic CLI

## Context

You are implementing Story 3 of the Echo Provider feature for Liminal Type Chat. This story creates a basic CLI that connects to the Edge API, validates connectivity, accepts a single prompt, displays the echo response with token usage, and exits.

## Current State

- Story 1 (Domain Echo Provider) and Story 2 (Edge API Endpoint) are assumed to be complete
- Edge service is running on port 8765 with:
  - Health endpoint: `GET /api/v1/health`
  - Prompt endpoint: `POST /api/v1/llm/prompt`
- Domain service is running on port 8766

## Implementation Requirements

<thinking>
Let me think through the implementation requirements for this Basic CLI story:

1. Project Setup:
   - Create a new cli-client directory at the root level
   - Initialize npm project with TypeScript
   - Install required dependencies: commander, chalk, node-fetch
   - Configure TypeScript for Node.js CLI development

2. Core Components to Implement:
   a. Edge Client (src/api/edge-client.ts):
      - Class to handle HTTP communication with Edge API
      - Methods for health check and prompt submission
      - Proper error handling and type safety
      
   b. Display Utilities (src/utils/display.ts):
      - Functions to format and colorize output
      - Success/error message formatting
      - Response and token usage display
      
   c. Input Utilities (src/utils/input.ts):
      - Function to prompt user for input
      - Using readline or similar for terminal input
      
   d. Main Entry Point (src/index.ts):
      - Shebang for Node.js execution
      - Commander setup (though minimal for this story)
      - Main flow: health check → prompt → display → exit

3. Key Technical Decisions:
   - Use fetch API (via node-fetch) for HTTP calls
   - Chalk v5 for ESM compatibility
   - Simple readline for input (no need for inquirer yet)
   - Exit codes: 0 for success, 1 for any error
   - No configuration files yet - hardcode localhost:8765

4. Error Handling Strategy:
   - Connection errors should be clear and user-friendly
   - Validate prompt is not empty before sending
   - Handle API error responses gracefully
   - Always clean up resources before exit

5. Testing Approach:
   - Mock fetch for unit tests
   - Test each component in isolation
   - Integration tests with mock server
   - Manual testing checklist for real server

6. Build and Distribution:
   - TypeScript compilation to dist/
   - Executable script in bin/liminal
   - npm link for local development
   - Package.json scripts for dev workflow

Let me structure the implementation instructions to be clear and actionable.
</thinking>

### Step 1: Project Setup

Create the CLI client directory structure and initialize the project:

```bash
# From project root
mkdir -p cli-client/src/{api,commands,utils}
mkdir -p cli-client/bin
cd cli-client

# Initialize package.json
npm init -y

# Install dependencies
npm install commander@12.0.0 chalk@5.3.0 node-fetch@3.3.2
npm install -D typescript@5.3.3 @types/node@20.11.0 tsx@4.7.0 vitest@1.2.0

# Create tsconfig.json
```

### Step 2: TypeScript Configuration

Create `cli-client/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Step 3: Package.json Scripts

Update `cli-client/package.json`:
```json
{
  "name": "@liminal/cli",
  "version": "0.1.0",
  "description": "CLI for Liminal Type Chat",
  "main": "dist/index.js",
  "bin": {
    "liminal": "./bin/liminal"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "test": "vitest",
    "test:run": "vitest run",
    "lint": "tsc --noEmit"
  },
  "type": "commonjs"
}
```

### Step 4: Create Executable Script

Create `cli-client/bin/liminal`:
```bash
#!/usr/bin/env node
require('../dist/index.js');
```

Make it executable:
```bash
chmod +x cli-client/bin/liminal
```

### Step 5: Implement Edge Client

Create `cli-client/src/api/edge-client.ts`:
```typescript
import fetch from 'node-fetch';

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  domain_status?: 'connected' | 'disconnected';
}

export interface LLMPromptRequest {
  prompt: string;
}

export interface LLMPromptResponse {
  content: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export class EdgeClient {
  constructor(private baseUrl: string = 'http://localhost:8765') {}

  async health(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }

      return await response.json() as HealthResponse;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to server at ${this.baseUrl}`);
      }
      throw error;
    }
  }

  async prompt(text: string): Promise<LLMPromptResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/llm/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ prompt: text }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error.message || `Request failed: ${response.status}`);
      }

      return await response.json() as LLMPromptResponse;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to server at ${this.baseUrl}`);
      }
      throw error;
    }
  }
}
```

### Step 6: Implement Display Utilities

Create `cli-client/src/utils/display.ts`:
```typescript
import chalk from 'chalk';
import { LLMPromptResponse } from '../api/edge-client';

export function displaySuccess(message: string): void {
  console.log(chalk.green(`✓ ${message}`));
}

export function displayError(message: string): void {
  console.error(chalk.red(`✗ ${message}`));
}

export function displayResponse(response: LLMPromptResponse): void {
  console.log('\n' + chalk.blue(response.content));
}

export function displayTokenUsage(usage: { prompt_tokens: number; completion_tokens: number }): void {
  console.log(chalk.gray(`\nTokens: ${usage.prompt_tokens} in, ${usage.completion_tokens} out`));
}
```

### Step 7: Implement Input Utilities

Create `cli-client/src/utils/input.ts`:
```typescript
import * as readline from 'readline';
import chalk from 'chalk';

export function promptForInput(message: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(chalk.yellow(`\n${message} `), (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
```

### Step 8: Implement Main Entry Point

Create `cli-client/src/index.ts`:
```typescript
#!/usr/bin/env node

import { program } from 'commander';
import { EdgeClient } from './api/edge-client';
import { displaySuccess, displayError, displayResponse, displayTokenUsage } from './utils/display';
import { promptForInput } from './utils/input';

async function main() {
  // Set up basic program info
  program
    .name('liminal')
    .description('CLI for Liminal Type Chat')
    .version('0.1.0');

  // For now, we're just running directly without subcommands
  const client = new EdgeClient();

  try {
    // Step 1: Check health
    const health = await client.health();
    
    if (health.status !== 'healthy') {
      displayError('Server is not healthy');
      process.exit(1);
    }

    displaySuccess('Connected to Liminal Type Chat');

    // Step 2: Get prompt from user
    const userPrompt = await promptForInput('Enter prompt:');

    if (!userPrompt) {
      displayError('Prompt cannot be empty');
      process.exit(1);
    }

    // Step 3: Send prompt to API
    const response = await client.prompt(userPrompt);

    // Step 4: Display response
    displayResponse(response);
    displayTokenUsage(response.usage);

    // Step 5: Exit successfully
    process.exit(0);

  } catch (error: any) {
    displayError(error.message);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error: any) => {
  displayError(`Unexpected error: ${error.message}`);
  process.exit(1);
});

// Run main function
main().catch((error) => {
  displayError(`Fatal error: ${error.message}`);
  process.exit(1);
});
```

### Step 9: Create Tests

Create `cli-client/src/api/edge-client.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EdgeClient } from './edge-client';

// Mock fetch
global.fetch = vi.fn();

describe('EdgeClient', () => {
  let client: EdgeClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new EdgeClient('http://localhost:8765');
  });

  describe('health', () => {
    it('should return health status on success', async () => {
      const mockResponse = {
        status: 'healthy',
        timestamp: '2025-01-20T10:00:00Z',
        domain_status: 'connected'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.health();
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8765/api/v1/health',
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should throw error on connection refused', async () => {
      const error = new Error('fetch failed');
      (error as any).code = 'ECONNREFUSED';
      (global.fetch as any).mockRejectedValueOnce(error);

      await expect(client.health()).rejects.toThrow('Cannot connect to server at http://localhost:8765');
    });
  });

  describe('prompt', () => {
    it('should send prompt and return response', async () => {
      const mockResponse = {
        content: 'Echo: Hello',
        model: 'echo-1.0',
        usage: {
          prompt_tokens: 2,
          completion_tokens: 3
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.prompt('Hello');
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8765/api/v1/llm/prompt',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ prompt: 'Hello' })
        })
      );
    });

    it('should throw error on API error response', async () => {
      const errorResponse = {
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Prompt is required'
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => errorResponse
      });

      await expect(client.prompt('')).rejects.toThrow('Prompt is required');
    });
  });
});
```

Create `cli-client/src/utils/display.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { displaySuccess, displayError, displayResponse, displayTokenUsage } from './display';

describe('Display Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should display success message', () => {
    displaySuccess('Connected');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✓ Connected'));
  });

  it('should display error message', () => {
    displayError('Connection failed');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('✗ Connection failed'));
  });

  it('should display response', () => {
    const response = {
      content: 'Echo: Test',
      model: 'echo-1.0',
      usage: { prompt_tokens: 1, completion_tokens: 3 }
    };
    displayResponse(response);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Echo: Test'));
  });

  it('should display token usage', () => {
    displayTokenUsage({ prompt_tokens: 5, completion_tokens: 10 });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Tokens: 5 in, 10 out'));
  });
});
```

### Step 10: Build and Test

```bash
cd cli-client

# Build the TypeScript
npm run build

# Run tests
npm test

# Test locally
npm run dev

# Or after building
node dist/index.js

# Install globally for testing
npm link

# Now you can run from anywhere
liminal
```

## Testing Checklist

Before marking this story as complete, ensure:

1. **Without Server Running**:
   ```bash
   liminal
   # Should show: ✗ Cannot connect to server at http://localhost:8765
   # Exit code: 1
   ```

2. **With Server Running**:
   ```bash
   # Start servers first
   cd server && npm run dev  # Assuming Edge is running

   # Run CLI
   liminal
   # Should show: ✓ Connected to Liminal Type Chat
   # Should prompt: Enter prompt: 
   ```

3. **Empty Prompt**:
   ```
   Enter prompt: [press enter]
   # Should show: ✗ Prompt cannot be empty
   # Exit code: 1
   ```

4. **Valid Prompt**:
   ```
   Enter prompt: Hello, world!
   # Should show:
   # Echo: Hello, world!
   # 
   # Tokens: 3 in, 5 out
   # Exit code: 0
   ```

## Common Issues and Solutions

1. **Module Resolution Issues**: Ensure tsconfig.json has correct module settings
2. **Chalk Import Issues**: Use dynamic import if needed for ESM
3. **Fetch Not Found**: Make sure node-fetch is installed
4. **Permission Denied**: Ensure bin/liminal is executable
5. **Port Already in Use**: Check Edge service is on 8765

## Next Steps

After this story is complete, Story 4 will add:
- Interactive prompt loop
- `/exit` command support
- Better formatting and user experience
- Command history (optional)

## Definition of Done

Before considering this story complete, review the Definition of Done checklist in `/documentation/new-plan/features/001-echo-provider/story-3/story.md` and ensure all items are checked off, including:
- Code implementation and testing
- Documentation updates  
- Execution log updates
- Manual verification

The execution log should document your implementation journey, key decisions, and any issues encountered. This helps future developers understand the implementation context.