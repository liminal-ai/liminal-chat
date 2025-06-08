# Manual Testing: Story 1 - Basic OpenRouter Provider

## Overview
Manual test procedures for validating the basic OpenRouter provider implementation without streaming support.

## Prerequisites

### Services Required
- Domain server running on port 8766
- Edge server running on port 8787
- Terminal access for CLI commands

### Start Services
```bash
# Terminal 1: Start Domain server
cd apps/domain && pnpm dev

# Terminal 2: Start Edge server  
cd apps/edge && pnpm dev
```

## Test Cases

### Test 1: Provider Discovery

#### Steps
1. List available providers via API:
   ```bash
   pnpm local-curl GET 8766/domain/llm/providers
   ```

#### Pre-Implementation Expected Result ❌
```json
{
  "providers": ["echo", "openai"]
}
```
OpenRouter should NOT appear in the list.

#### Post-Implementation Expected Result ✅
```json
{
  "providers": ["echo", "openai", "openrouter"]
}
```
OpenRouter should appear in the list.

---

### Test 2: CLI Provider Selection

#### Steps
1. Attempt to start chat with OpenRouter provider:
   ```bash
   cd apps/cli && pnpm dev chat -p openrouter
   ```

#### Pre-Implementation Expected Result ❌
```
Error: Failed to connect to provider: Request failed with status 400
```

#### Post-Implementation Expected Result ✅
- With API key: `OPENROUTER_API_KEY=your-key pnpm dev chat -p openrouter`
  - Should start interactive chat session
- Without API key: Should fail with configuration error

---

### Test 3: Direct API Prompt Request

#### Steps
1. Send prompt request via API:
   ```bash
   pnpm local-curl POST 8787/api/v1/llm/prompt '{"provider":"openrouter","prompt":"Hello"}'
   ```

#### Pre-Implementation Expected Result ❌
Status: 400 Bad Request
```json
{
  "error": {
    "code": "PROVIDER_NOT_FOUND",
    "message": "Provider 'openrouter' not found. Available providers: echo, openai",
    "details": {
      "provider": "openrouter",
      "available": ["echo", "openai"]
    }
  }
}
```

#### Post-Implementation Expected Result ✅
- Without API key: Status 502 with configuration error
- With API key set in environment:
  ```json
  {
    "content": "AI response here...",
    "model": "openai/gpt-3.5-turbo",
    "usage": {
      "promptTokens": 10,
      "completionTokens": 20,
      "totalTokens": 30
    }
  }
  ```

---

### Test 4: Messages Format Support

#### Steps
1. Send messages array request:
   ```bash
   pnpm local-curl POST 8787/api/v1/llm/prompt '{
     "provider": "openrouter",
     "messages": [
       {"role": "system", "content": "You are helpful"},
       {"role": "user", "content": "Hi"}
     ]
   }'
   ```

#### Pre-Implementation Expected Result ❌
Status: 400 Bad Request (provider not found)

#### Post-Implementation Expected Result ✅
Valid response with content reflecting the system prompt influence

---

### Test 5: Error Handling - Missing API Key

#### Steps
1. Ensure OPENROUTER_API_KEY is not set
2. Send request:
   ```bash
   pnpm local-curl POST 8787/api/v1/llm/prompt '{"provider":"openrouter","prompt":"Test"}'
   ```

#### Pre-Implementation Expected Result ❌
Status: 400 (provider not found)

#### Post-Implementation Expected Result ✅
Status: 502 Bad Gateway
```json
{
  "error": {
    "code": "PROVIDER_NOT_CONFIGURED",
    "message": "Provider 'openrouter' requires configuration. Set OPENROUTER_API_KEY environment variable.",
    "details": {
      "provider": "openrouter"
    }
  }
}
```

---

## Health Checks

### Steps
```bash
# Should always pass regardless of provider implementation
pnpm check:domain
pnpm check:edge
pnpm check:all
```

### Expected Result
All health checks should return OK status

---

## Test Summary Checklist

### Pre-Implementation (All should fail ❌)
- [ ] Provider not in discovery list
- [ ] CLI cannot select openrouter
- [ ] API rejects openrouter requests
- [ ] Proper "provider not found" errors

### Post-Implementation (All should pass ✅)
- [ ] Provider appears in discovery list
- [ ] CLI can select openrouter (with API key)
- [ ] API accepts openrouter requests
- [ ] Proper configuration error without API key
- [ ] Successful responses with valid API key
- [ ] Both prompt and messages formats work

---

## Sign-off

### Pre-Implementation Testing
**Date/Time**: _________________  
**Tester**: _________________  
**All tests failed as expected**: [ ] Yes [ ] No  
**Notes**: 

### Post-Implementation Testing
**Date/Time**: _________________  
**Tester**: _________________  
**All tests passed as expected**: [ ] Yes [ ] No  
**Notes**: