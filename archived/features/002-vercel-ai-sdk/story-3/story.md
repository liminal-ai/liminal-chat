# Story 3: CLI Messages Mode

## Objective
Add messages mode support to the CLI, enabling system prompts and conversation history while keeping the simple prompt mode as default.

## Success Criteria
- [ ] CLI supports `--system` flag for system prompts
- [ ] CLI supports `--messages` flag for conversation mode
- [ ] Provider selection via `--provider` flag
- [ ] Interactive mode maintains conversation history
- [ ] Clear command feedback and error messages

## E2E Test Scenario
```typescript
// Test: CLI with system prompt through full stack
// CLI → Edge → Domain → OpenAI → Domain → Edge → CLI

describe('E2E: CLI Messages Mode', () => {
  it('should apply system prompt to responses', async () => {
    // Given: CLI started with --system "You are a pirate"
    // When: User asks "What is your name?"
    // Then: Response uses pirate speech patterns
    // And: Token count includes system prompt
  });
});
```

## TDD Unit Test Conditions

### CLI Command Tests
1. **Argument Parsing**
   - WHEN --system provided THEN stores system prompt
   - WHEN --provider provided THEN uses specified provider
   - WHEN --messages provided THEN enables conversation mode
   - WHEN conflicting flags THEN shows error and usage

2. **Simple Mode (default)**
   - WHEN no flags THEN uses prompt mode
   - WHEN prompt provided THEN sends as prompt field
   - WHEN --provider set THEN includes in request

3. **Messages Mode**
   - WHEN --system set THEN adds system message first
   - WHEN user inputs text THEN adds as user message
   - WHEN response received THEN stores as assistant message
   - WHEN next input THEN includes conversation history

### API Client Tests
1. **Request Building**
   - WHEN prompt mode THEN sends {prompt, provider?}
   - WHEN messages mode THEN sends {messages, provider?}
   - WHEN system prompt exists THEN prepends to messages

2. **Response Handling**
   - WHEN response has usage THEN displays token counts
   - WHEN response has error THEN shows user-friendly message
   - WHEN provider not configured THEN suggests setup steps

## TDD Integration Test Conditions

### CLI Integration Tests
1. **Interactive Mode**
   - WHEN user enters multiple prompts THEN maintains context
   - WHEN user types "exit" THEN gracefully shuts down
   - WHEN API unavailable THEN shows connection error

2. **Provider Switching**
   - WHEN --provider openai THEN uses OpenAI
   - WHEN --provider anthropic THEN uses Anthropic
   - WHEN provider not configured THEN shows helpful error

3. **System Prompts**
   - WHEN --system used THEN all responses reflect persona
   - WHEN very long system prompt THEN handles gracefully

## Implementation Guide

### Phase 1: Setup (Red)
1. Write tests for new CLI arguments
2. Write tests for messages mode behavior
3. Tests fail as features don't exist

### Phase 2: Implementation (Green)
1. Update CLI argument parser with new flags
2. Add conversation history tracking
3. Update API client to support messages
4. Implement interactive loop with history

### Phase 3: Refactor
1. Extract conversation management to class
2. Improve prompt display and formatting
3. Add color coding for different roles

## CLI Usage Examples
```bash
# Simple mode (unchanged)
liminal "What is 2+2?"

# With provider selection
liminal "Explain quantum computing" --provider anthropic

# With system prompt
liminal --system "You are a helpful math tutor"

# Full conversation mode
liminal --messages --system "You are a senior developer" --provider openai

# Interactive session
$ liminal --messages --system "You are a pirate"
System: You are a pirate
You: What's your name?
Assistant: Ahoy there, matey! The name be Captain Claude...
You: Tell me about the sea
Assistant: Arr, the sea be a harsh mistress...
You: exit
Goodbye!
```

## File Structure
```
cli-client/src/
├── commands/
│   ├── chat.ts              # Main chat command
│   └── interactive.ts       # Interactive mode handler
├── models/
│   └── conversation.ts      # Conversation history manager
├── api/
│   └── edge-client.ts       # Update for messages support
└── utils/
    └── display.ts           # Format responses nicely
```

## Notes
- Keep simple prompt mode as default for ease of use
- Store conversation history in memory only (for now)
- Consider adding --save flag to persist conversations later
- Use color to distinguish system/user/assistant messages
- Show token usage after each response