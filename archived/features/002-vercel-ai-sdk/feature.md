# Feature 002: Vercel AI SDK Integration

## Overview
This feature integrates the Vercel AI SDK to provide multi-provider LLM support while maintaining backward compatibility and preparing for future AI Roundtable capabilities through messages format support.

## Key Changes from Original Plan
1. **Extended Contract**: Support both simple `prompt` and rich `messages` formats (for future roundtables)
2. **TDD Approach**: Each story follows Red-Green-Refactor with explicit test conditions
3. **E2E Testing**: Full stack tests for each story ensuring contract alignment
4. **Future-Ready**: Messages format enables organic growth to roundtable features

## Goals

1. **Real LLM Integration**: Move beyond echo responses to actual AI models
2. **Provider Flexibility**: Support multiple providers with easy switching
3. **Messages Support**: Enable system prompts and conversation history
4. **Maintain Compatibility**: Keep simple prompt mode working
5. **TDD Development**: Test-first approach for quality and refactoring

## Architecture Evolution

### Current State
```
CLI → Edge → Domain → Echo Provider
     (prompt)  (prompt)
```

### After Feature 002
```
CLI → Edge → Domain → Provider Registry → [Echo|OpenAI|Anthropic|Google]
     (prompt or    (prompt or
      messages)     messages)
```

### Future State (Roundtable Ready)
```
CLI → Edge → Domain → Provider Registry → Multiple Providers
     (participants  (conversation     (concurrent providers
      & messages)    with context)     for roundtable)
```

## Updated API Contract

### Request (Now Supporting Both Modes)
```json
// Simple mode (backward compatible)
POST /domain/llm/prompt
{
  "prompt": "Hello, AI!",
  "provider": "openai"  // Optional
}

// Messages mode (new, future-ready)
POST /domain/llm/prompt
{
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant"
    },
    {
      "role": "user", 
      "content": "Hello, AI!"
    }
  ],
  "provider": "anthropic"
}
```

### Response (Unchanged)
```json
{
  "content": "Hello! How can I assist you today?",
  "model": "gpt-4.1",
  "usage": {
    "promptTokens": 25,
    "completionTokens": 15,
    "totalTokens": 40
  }
}
```

## TDD Implementation Stories

### Story 1: Domain Vercel AI SDK Integration
**Objective**: Integrate Vercel AI SDK at Domain layer with messages support

**TDD Approach**:
- Write E2E test: CLI → Edge → Domain → OpenAI → Domain → Edge → CLI
- Write unit tests for provider factory, request handling, SDK integration
- Implement providers to pass tests
- Refactor for common patterns

**Deliverables**:
- VercelOpenAIProvider implementation
- Support for both prompt and messages
- Provider factory with configuration

### Story 2: Edge API Messages Support
**Objective**: Extend Edge API validation and routing for messages format

**TDD Approach**:
- Write E2E test: Messages with system prompt through full stack
- Write validation tests for oneOf constraint
- Implement request handling
- Refactor validation logic

**Deliverables**:
- Updated request validation
- OpenAPI spec changes
- Error mapping for new codes

### Story 3: CLI Messages Mode
**Objective**: Add CLI support for system prompts and conversations

**TDD Approach**:
- Write E2E test: Interactive CLI session with context
- Write tests for new CLI arguments
- Implement conversation tracking
- Refactor into conversation manager

**Deliverables**:
- --system and --messages flags
- Interactive mode with history
- Provider selection support

### Story 4: Provider Configuration & Selection
**Objective**: Implement robust configuration and provider management

**TDD Approach**:
- Write E2E test: Multi-provider switching
- Write tests for configuration loading
- Implement validation and setup
- Refactor into provider registry

**Deliverables**:
- Environment-based configuration
- API key validation
- Setup helper command
- Graceful degradation

## Success Criteria

### Functional Requirements
- [x] Contract supports both prompt and messages
- [ ] OpenAI provider works with real API
- [ ] Provider selection via config or request
- [ ] System prompts influence responses
- [ ] Echo provider remains for testing
- [ ] Clear setup instructions

### Technical Requirements  
- [ ] Vercel AI SDK properly integrated
- [ ] TDD with >90% coverage
- [ ] E2E tests for each story
- [ ] No breaking changes
- [ ] Refactoring after each story

### Future-Ready Requirements
- [ ] Messages format works end-to-end
- [ ] Role system extensible to participants
- [ ] Provider abstraction supports multiple
- [ ] Architecture supports roundtables

## Configuration

### Environment Variables
```bash
# Required for providers
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-api03-...
GOOGLE_AI_API_KEY=...

# Optional configuration
DEFAULT_LLM_PROVIDER=openai
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### Provider Models (May 2025)
- **OpenAI**: gpt-4.1, o3, o4-mini, o4-mini-high
- **Anthropic**: claude-sonnet-4-20250514, claude-opus-4-20250514
- **Google**: gemini-2.5-pro-preview-05-06, gemini-2.5-flash-preview-05-20

## Non-Goals
- **Streaming**: Not in this feature (implementation ready in SDK)
- **Multi-provider conversations**: Single provider per request
- **Advanced features**: No function calling or tools yet
- **Persistence**: No conversation storage

## Testing Strategy

### TDD Cycle for Each Story
1. **Red**: Write failing tests from conditions
2. **Green**: Implement minimum code to pass
3. **Refactor**: Improve design and extract patterns

### Test Types
- **Unit Tests**: Mock SDK and HTTP calls
- **Integration Tests**: Component boundaries
- **E2E Tests**: Full stack validation

### CI/CD Considerations
- Use Echo provider for automated tests
- Skip real provider tests by default
- Manual verification with real APIs

## Future Extensions

This feature enables:
- **Roundtable Participants**: Extend roles to named participants
- **Multi-Provider Roundtables**: Different providers per participant
- **Conversation Context**: Full message history
- **Streaming**: Already supported by SDK
- **Tool Calling**: For MCP integration

## Implementation Order
1. Story 1: Domain foundation
2. Story 2: API contract extension  
3. Story 3: User interface
4. Story 4: Operational excellence

Each story is independently valuable and maintains backward compatibility throughout.