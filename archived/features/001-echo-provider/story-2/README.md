# Story 2: Edge API Endpoint

This directory contains all materials for implementing Story 2 of the Echo Provider feature.

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
- [ ] Create edge-server directory
- [ ] Implement all components
- [ ] Write tests (75% coverage)
- [ ] Document execution in execution-log.md
- [ ] Verify all acceptance criteria

## Key Points

- This is a standalone Edge service (port 8765)
- Communicates with Domain service (port 8766)
- Validates requests using AJV
- Transforms responses (camelCase → snake_case)
- Auth bypass mode with logging
- Must achieve 75% test coverage

## Parallel Development Note

This story can be developed in parallel with Story 1 since:
- Both services are independent
- Contracts are already defined
- Domain client can be mocked for testing

## Success Verification

```bash
# From edge-server directory:
npm start          # Should start on port 8765
npm test           # Should pass with 75%+ coverage
npm run test:coverage  # View detailed coverage report

# Test endpoints (requires Domain running on 8766):
curl http://localhost:8765/api/v1/health

curl -X POST http://localhost:8765/api/v1/llm/prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello world"}'
```

## Integration Testing

Once both Story 1 and Story 2 are complete:

```bash
# Terminal 1 - Start Domain
cd domain-server && npm start

# Terminal 2 - Start Edge
cd edge-server && npm start

# Terminal 3 - Test integration
curl http://localhost:8765/api/v1/health
# Should show healthy with Domain connectivity

curl -X POST http://localhost:8765/api/v1/llm/prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test integration"}'
# Should return: {"content":"Echo: Test integration",...}
```