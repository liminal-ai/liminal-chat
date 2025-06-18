# Story 3: Basic CLI Application

> **Note**: This story was originally specified as "CLI Edge Client Implementation" for a comprehensive TypeScript client library. During implementation, it was pragmatically pivoted to create a basic CLI application instead. This provides immediate user value and creates a foundation for future client library development.

## Story ID
001-echo-provider-story-3

## Title
Implement Basic CLI with Edge API Integration

## Description
As a user, I need a basic command-line interface that connects to the Edge API, validates connectivity, accepts a prompt, and displays the echo response with token usage information.

## Dependencies
- **REQUIRES**: Edge service must be running and accessible (from Story 2)
- **REQUIRES**: Edge API contracts defined in `contracts.md`
- **BLOCKS**: Story 4 (CLI Loop & Polish) which enhances this basic implementation

## Acceptance Criteria
1. Create a basic CLI application that performs health check on startup
2. Accept a single user prompt via readline interface
3. Send prompt to Edge API `/api/v1/llm/prompt` endpoint
4. Display formatted response with chalk coloring
5. Show token usage (prompt, completion, total)
6. Exit cleanly with appropriate exit codes
7. Handle errors gracefully with user-friendly messages

## Technical Requirements

### Package Structure
```
cli-client/
├── src/
│   ├── api/
│   │   └── edge-client.ts      # Basic Edge API client with health & prompt methods
│   ├── types/
│   │   └── api.ts             # TypeScript interfaces for API communication
│   └── index.ts               # Main CLI entry point
├── tests/
│   └── cli.test.ts            # Basic CLI tests
├── package.json
├── tsconfig.json
└── README.md
```

### Key Implementation Details

1. **CLI Flow**
   - Start with welcome message and service information
   - Perform health check against Edge API
   - If healthy, prompt user for input using readline
   - Send prompt to Edge API
   - Display formatted response with token counts
   - Exit cleanly

2. **Edge Client Implementation**
   ```typescript
   class EdgeClient {
     async checkHealth(): Promise<HealthResponse> {
       // GET /api/v1/health
     }
     
     async sendPrompt(prompt: string): Promise<LLMResponse> {
       // POST /api/v1/llm/prompt
     }
   }
   ```

3. **Error Handling**
   - Network errors display connection failure message
   - API errors show status code and message
   - Always exit with appropriate code (0 for success, 1 for error)

4. **User Experience**
   - Use chalk for colored output (green for success, red for errors)
   - Clear instructions and prompts
   - Display token usage in formatted table

## Implementation Notes
- Use node-fetch for HTTP requests
- Use readline for user input
- Use chalk for colored terminal output
- Keep it simple - this is a basic CLI for testing the echo provider

## Definition of Done
- [ ] Basic CLI application created with proper structure
- [ ] Health check validates Edge API connectivity
- [ ] User prompt interface works smoothly
- [ ] API communication with Edge server functional
- [ ] Response displays with proper formatting and colors
- [ ] Token usage shown correctly (prompt, completion, total)
- [ ] Error handling covers network and API failures
- [ ] Clean exit with appropriate codes
- [ ] TypeScript compiles without errors
- [ ] Basic tests pass
- [ ] README documentation for CLI usage
- [ ] Execution log updated with implementation notes