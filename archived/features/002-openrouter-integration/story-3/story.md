# Story 3: Model Selection & Configuration

## Objective
Enable model selection from CLI through configuration and command flags, allowing users to leverage OpenRouter's 200+ model catalog.

## Scope

### In Scope
- CLI `--model` flag for chat command
- Model configuration in `.liminalrc`
- Model validation at Edge tier
- Model pass-through to OpenRouter API
- List available models command

### Out of Scope
- Model-specific parameter tuning
- Model comparison features
- Cost estimation

## Technical Design

### CLI Layer
```typescript
// Add --model flag
.option('-m, --model <model>', 'Select AI model')

// Config priority:
// 1. CLI flag
// 2. .liminalrc file  
// 3. Environment variable
// 4. Default fallback
```

### Edge Layer
```typescript
// Validate model format (provider/model-name)
// Pass through in request body
```

### Domain Layer
```typescript
// Include model in OpenRouter API request
// Return actual model used in response
```

## Test Specifications

### E2E Test
```typescript
// test/e2e/model-selection.e2e.spec.ts
describe('E2E: Model Selection', () => {
  it('should use model from CLI flag', async () => {
    // liminal chat --model anthropic/claude-3.5-sonnet
    // Verify correct model in request and response
  });
  
  it('should fall back through config hierarchy', async () => {
    // Test: flag -> config -> env -> default
  });
  
  it('should list available models', async () => {
    // liminal list-models --provider openrouter
    // Verify model list returned
  });
});
```

### Integration Tests
```typescript
// apps/cli/test/commands/chat.integration.spec.ts
describe('Chat Command Model Selection', () => {
  it('should parse --model flag correctly');
  it('should load model from config file');
  it('should validate model format');
});

// apps/edge/test/model-validation.spec.ts
describe('Edge Model Validation', () => {
  it('should accept valid model formats');
  it('should reject invalid formats');
  it('should pass model to domain');
});
```

### Unit Tests
```typescript
// apps/cli/src/utils/config.spec.ts
describe('Config with Model Support', () => {
  it('should load model from .liminalrc');
  it('should merge CLI args over config');
  it('should validate model string format');
});

// apps/domain/src/providers/llm/providers/openrouter.provider.spec.ts
describe('OpenRouter Model Handling', () => {
  it('should include model in API request');
  it('should use default if not specified');
  it('should return actual model used');
});
```

## Configuration Schema

### CLI Arguments
```bash
# Specific model
liminal chat --model anthropic/claude-3.5-sonnet

# Short flag
liminal chat -m openai/gpt-4

# With provider flag (for future multi-provider support)
liminal chat --provider openrouter --model mixtral-8x7b
```

### .liminalrc Configuration
```json
{
  "defaultModel": "anthropic/claude-3.5-sonnet",
  "providers": {
    "openrouter": {
      "model": "anthropic/claude-3.5-sonnet",
      "temperature": 0.7
    }
  }
}
```

### Environment Variables
```bash
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
DEFAULT_LLM_MODEL=anthropic/claude-3.5-sonnet
```

## Model Validation Rules

1. **Format**: `provider/model-name` or `model-name`
2. **Valid Examples**:
   - `anthropic/claude-3.5-sonnet`
   - `openai/gpt-4`
   - `mixtral-8x7b` (open models)
3. **Validation**: Regex pattern check, no API validation

## Acceptance Criteria

### Functional
- [ ] --model flag works in CLI
- [ ] Config file model selection works
- [ ] Environment variable fallback works
- [ ] Invalid models show helpful error

### Technical
- [ ] Config loading preserves precedence
- [ ] Model included in API requests
- [ ] Response includes actual model used
- [ ] 90% test coverage

### Cross-Tier Validation
- [ ] CLI sends model selection
- [ ] Edge validates and forwards
- [ ] Domain uses specified model
- [ ] Response confirms model used

## Implementation Plan

1. **Red Phase** (Tests First)
   - Write E2E test for model selection
   - Write config precedence tests
   - Write validation tests
   - All fail initially

2. **Green Phase** (Implementation)
   - Add --model flag to CLI
   - Enhance config loading
   - Update DTOs for model field
   - Connect through all tiers

3. **Refactor Phase**
   - Extract model validation
   - Centralize config schema
   - Add helpful error messages
   - Document model catalog

## Common Models Reference

### High Performance
- `anthropic/claude-3.5-sonnet` - Best overall
- `openai/gpt-4` - Strong reasoning
- `anthropic/claude-3-opus` - Complex tasks

### Fast & Efficient
- `anthropic/claude-3-haiku` - Very fast
- `openai/gpt-3.5-turbo` - Good balance
- `google/gemini-pro` - Efficient

### Open Source
- `meta-llama/llama-3.1-70b-instruct`
- `mistralai/mixtral-8x7b-instruct`
- `deepseek/deepseek-coder-33b`

### Specialized
- `openai/gpt-4-vision-preview` - Images
- `anthropic/claude-3-sonnet-20240229` - Specific version

## Error Handling

### Invalid Model Format
```
Error: Invalid model format 'claude'. 
Expected format: 'provider/model-name' (e.g., 'anthropic/claude-3.5-sonnet')
```

### Unknown Model (Warning Only)
```
Warning: Model 'anthropic/claude-99' not recognized. Proceeding anyway.
Response will indicate actual model used.
```

## Definition of Done

- [ ] Model selection works end-to-end
- [ ] Config precedence verified
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Common models documented