# Liminal Chat Project Status

## Current Implementation Status

### ✓ Complete
- **Domain Server** (NestJS/Fastify)
  - Echo provider fully implemented
  - Provider factory pattern established
  - Health check endpoints
  - 90%+ test coverage
  
- **CLI Client**
  - Interactive chat mode
  - Provider selection (`--provider` flag)
  - Health check command
  - Integration with domain server

- **Shared Packages**
  - shared-types: Common TypeScript interfaces
  - shared-utils: Error codes, transformers

- **Documentation Structure**
  - Architecture decisions documented
  - Testing practices defined
  - AI development workflow established

### 🚧 In Progress
- **Edge Server** (Cloudflare Workers) ✓
  - Basic implementation complete with Hono
  - Health endpoint working
  - SSE proxy support ready
  - Needs auth implementation
  
- **OpenRouter Integration** 
  - Feature 002 redesigned with 4 stories
  - TDD approach with cross-tier testing
  - Ready to begin Story 1

### 📋 Next Steps
1. Story 1: Basic OpenRouter provider (TDD)
2. Story 2: SSE streaming implementation
3. Story 3: Model selection from CLI
4. Story 4: Resilience & error handling
5. Implement Edge ↔ Domain authentication

## Development Environment

### Running Services
```bash
# Start all services
pnpm dev                      # Runs all in parallel

# Or individually:
cd apps/domain && pnpm dev    # Port 8766
cd apps/edge && pnpm dev      # Port 8787
cd apps/cli && pnpm dev       # Interactive mode

# Check health
pnpm check:all               # Verify both servers running
```

## Feature Progress

### Feature 001: Echo Provider ✓
- All 5 stories complete
- Full test coverage
- CLI integration working

### Feature 002: OpenRouter Integration 📋
- Redesigned to replace Vercel AI SDK
- 4 stories with cross-tier TDD approach
- Story 1: Basic provider (not started)
- Story 2: Streaming support (not started)
- Story 3: Model selection (not started)
- Story 4: Error resilience (not started)

### Feature 003: Auth Foundation 📋
- Designed but not started
- Will add after core functionality

## Known Issues
- Some transient test failures in CI
- Vercel AI SDK still present (to be removed)
- Missing Edge ↔ Domain authentication

## Recent Changes
- Edge server implemented and functional
- CLI → Edge → Domain flow validated
- Health check endpoint fixed in CLI
- Feature 002 redesigned for OpenRouter with TDD approach
- Created comprehensive test-first stories
- Established cross-tier testing patterns