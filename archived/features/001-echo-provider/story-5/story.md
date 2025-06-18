# Story 5: Domain Server NestJS Migration

## Story ID
001-echo-provider-story-5

## Title
Migrate Domain Server to NestJS with Fastify

## Description
Migrate the Domain server (port 8766) from Express to NestJS with Fastify adapter while maintaining the exact same HTTP contract. This is a pure technical improvement with no functional changes.

## Dependencies
- **REQUIRES**: Domain server from Story 1 working
- **DOES NOT AFFECT**: Edge server or CLI (they remain unchanged)

## Definition of Done
- [ ] Domain server runs on port 8766 with NestJS
- [ ] GET `/domain/health` returns same response format
- [ ] POST `/domain/llm/prompt` returns same echo response
- [ ] All existing tests pass
- [ ] Edge server can communicate with new Domain server
- [ ] CLI works end-to-end without any modifications
- [ ] Swagger documentation available at `/api-docs`
- [ ] Execution log updated with migration notes