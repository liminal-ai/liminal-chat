# Echo Provider Feature - Implementation Guide

## Overview
The Echo Provider feature establishes the foundation for the Liminal Type Chat project with a complete implementation across Domain, Edge, and CLI tiers.

## Feature Structure
```
001-echo-provider/
├── README.md           # This file
├── contracts.md        # API contracts and schemas
├── feature.md          # Feature overview and goals
├── plan.md            # 4-story breakdown with estimates
├── design.md          # Detailed technical design
├── story-1/           # Domain Echo Provider
├── story-2/           # Edge API Endpoint
├── story-3/           # Basic CLI
└── story-4/           # CLI Loop & Polish
```

## Implementation Status

| Story | Description | Status | Dependencies |
|-------|-------------|--------|--------------|
| 1 | Domain Echo Provider | In Progress | None (can start immediately) |
| 2 | Edge API Endpoint | In Progress | None (can run parallel to Story 1) |
| 3 | Basic CLI | Ready | Requires Story 2 (Edge health) |
| 4 | CLI Loop & Polish | Ready | Requires Story 3 |

## Implementation Order

### Phase 1: Parallel Development (Stories 1 & 2)
- **Story 1**: Domain service on port 8766
- **Story 2**: Edge service on port 8765
- Both can be developed simultaneously by different developers/sessions

### Phase 2: CLI Development (Stories 3 & 4)
- **Story 3**: Basic CLI with single prompt
- **Story 4**: Interactive loop and polish
- Must be done sequentially after Edge is available

## Quick Start

### For Developers
1. Choose an available story (1 or 2 if starting fresh)
2. Navigate to the story directory (e.g., `story-1/`)
3. Copy the entire `prompt.md` content
4. Start a new Claude Code session
5. Paste the prompt as your first message
6. Follow the implementation
7. Document progress in `execution-log.md`

### For Integration Testing
Once Stories 1 & 2 are complete:
```bash
# Terminal 1 - Domain
cd domain-server && npm start

# Terminal 2 - Edge  
cd edge-server && npm start

# Terminal 3 - Test
curl http://localhost:8765/api/v1/health
curl -X POST http://localhost:8765/api/v1/llm/prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello world"}'
```

## Key Architecture Principles
1. **Contract-First**: All APIs defined before implementation
2. **Separation of Concerns**: Domain handles business logic, Edge handles client concerns
3. **Progressive Enhancement**: Start simple (echo), add complexity later
4. **Test Coverage**: 90% for Domain, 75% for Edge
5. **CLI as Test Platform**: CLI serves dual purpose as UI and E2E test tool

## Success Criteria
- [ ] All 4 stories implemented
- [ ] Tests passing with required coverage
- [ ] Services communicate successfully
- [ ] CLI provides good user experience
- [ ] Architecture patterns established for future features

## Next Features
After Echo Provider is complete, the architecture supports:
- Real LLM providers (Anthropic, OpenAI)
- Streaming responses
- Authentication implementation
- Conversation persistence
- Multi-provider support

## Notes
- Each story has its own README with specific instructions
- Implementation materials include everything needed
- No prior context required - each prompt is self-contained
- Focus on establishing patterns, not just functionality