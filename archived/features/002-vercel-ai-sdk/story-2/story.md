# Story 2: User Can Select LLM Provider via CLI

## Overview
Enable users to specify which LLM provider to use when chatting through the CLI, completing the vertical slice started in Story 1.

## User Story
As a user, I can specify which LLM provider to use so that I can choose between different AI models.

## Command Examples
```bash
# Use OpenAI provider
liminal chat --provider openai "What is 2+2?"

# Use echo provider (default)
liminal chat "Hello world"

# See available providers
liminal providers
```

## Success Criteria
- [ ] User can use `--provider` flag to select provider
- [ ] User can see list of available providers with `liminal providers`
- [ ] Provider parameter flows from CLI → Edge → Domain
- [ ] Invalid provider shows helpful error message
- [ ] Default remains echo if no provider specified

## Acceptance Criteria

### 1. Provider Selection
```bash
$ liminal chat --provider openai "What is 2+2?"
# Output: 
# 2 + 2 = 4
# Model: gpt-4.1
# Tokens - Prompt: 5, Completion: 8, Total: 13

$ liminal chat --provider invalid "Hello"
# Output:
# Error: Provider 'invalid' not found. Available providers: echo, openai
```

### 2. Provider Discovery
```bash
$ liminal providers
# Output:
# Available LLM Providers:
# * echo (default) - Echo provider for testing
# * openai - OpenAI GPT models (requires OPENAI_API_KEY)
#   Status: ✓ Configured
```

### 3. Default Behavior
```bash
$ liminal chat "Hello"
# Output:
# Echo: Hello
# Tokens - Prompt: 1, Completion: 2, Total: 3
```

## Components to Modify

### CLI Layer
- Add `--provider` flag to chat command
- Add new `providers` command
- Pass provider parameter in API request

### Edge Layer  
- Accept provider parameter in request
- Pass through to Domain layer
- Return provider-specific errors

### Domain Layer
- Already accepts provider parameter (from Story 1)
- Provider discovery endpoint exists

## Test Scenarios

### E2E Tests
1. User selects valid provider and gets appropriate response
2. User selects invalid provider and gets error
3. User lists providers and sees availability
4. Default provider works when none specified

### Edge Cases
- Provider exists but not configured (missing API key)
- Provider parameter with empty string
- Very long provider name
- Case sensitivity (OpenAI vs openai)

## Out of Scope
- Changing default provider via config
- Provider-specific options
- Streaming responses
- Message history