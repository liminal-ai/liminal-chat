# Story 1: Domain Echo Provider

This directory contains all materials for implementing Story 1 of the Echo Provider feature.

## Directory Structure

- **story.md** - Complete story specification with acceptance criteria
- **prompt.md** - Implementation prompt for Claude Code
- **execution-log.md** - Implementation notes and progress (populated during execution)

## How to Use

1. **Start a new Claude Code session** with no prior context
2. **Copy the entire contents of prompt.md** and paste as your first message
3. **Save execution notes** to execution-log.md as you progress
4. **Verify acceptance criteria** from story.md are met

## Implementation Checklist

- [ ] Review all referenced documents
- [ ] Create domain-server directory
- [ ] Implement all components
- [ ] Write tests (90% coverage)
- [ ] Document execution in execution-log.md
- [ ] Verify all acceptance criteria

## Key Points

- This is a standalone Domain service (port 8766)
- No authentication required (bypass mode)
- Echo provider is the simplest LLM provider
- Establishes patterns for future providers
- Must achieve 90% test coverage

## Success Verification

```bash
# From domain-server directory:
npm start          # Should start on port 8766
npm test           # Should pass with 90%+ coverage
npm run test:coverage  # View detailed coverage report

# Test endpoints:
curl http://localhost:8766/domain/health
curl -X POST http://localhost:8766/domain/llm/prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello world"}'
```