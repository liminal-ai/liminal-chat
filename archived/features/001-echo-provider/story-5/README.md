# Story 5: Domain Server NestJS Migration

This story migrates the Domain server from Express to NestJS with Fastify while maintaining 100% compatibility with the existing Edge server and CLI.

## Key Points
- Only the Domain server changes (port 8766)
- Edge server remains on Express (no changes)
- CLI continues to work without modifications
- Same HTTP endpoints and response formats
- Pure technical improvement - no functional changes

## Files
- `story.md` - Story definition
- `prompt.md` - Detailed migration instructions for AI implementation
- `execution-log.md` - Will track implementation progress