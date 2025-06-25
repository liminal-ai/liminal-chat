# Feature Overviews - Phase 0 Migration

## Feature 001: Convex Project Setup ✅ COMPLETE

**Summary**: Established foundational Convex backend infrastructure, replacing NestJS/ArangoDB architecture.

**Key Deliverables**:
- Convex project initialized with TypeScript and strict mode
- Clerk authentication integration with OAuth providers
- Development environment with hot reloading and cloud deployment
- Core database foundation with user schema and real-time subscriptions
- Node.js runtime verification for Vercel AI SDK integration readiness

**Time**: 58 minutes actual vs 110 estimated (47% under estimate)

---

## Feature 002: Vercel AI SDK & Single Provider Setup ✅ READY

**Scope**: Replace complex NestJS OpenRouter provider with Vercel AI SDK + official OpenRouter provider.

**Stories**:
1. **Single Provider Setup & Test** - Install Vercel AI SDK, configure OpenRouter provider, test basic functionality  
2. **Core Chat Endpoint** - Create streaming `/chat` HTTP action, integrate with CLI

**Target**: `liminal chat --provider=convex` works with streaming OpenRouter responses.

**Simplification**: 200+ lines of custom code → <20 lines using official patterns.

---

## Feature 003: Testing Infrastructure Setup

**Scope**: Establish comprehensive unit and integration testing framework.

**Focus**: 
- Unit testing setup for Convex functions
- Integration testing with real LLM providers
- Test infrastructure that supports the AI-augmented development workflow

**Target**: Robust testing foundation for all subsequent features.

---

## Feature 004: Multi-Provider & Core Endpoints

**Scope**: Expand to all providers and implement remaining Vercel AI SDK core endpoints.

**Deliverables**:
- All LLM providers configured (OpenAI, Anthropic, Google, OpenRouter, Perplexity, etc.)
- Complete Vercel core endpoint set (`/completion`, `/generate-text`, `/use-object`, etc.)
- Multi-provider abstraction and switching

**Target**: Full LLM provider ecosystem with all core Vercel AI SDK endpoints.

---

## Feature 005: Model & Provider DTOs with Persistence

**Scope**: Implement data models and persistence for providers and models.

**Deliverables**:
- Provider DTO definitions and schemas
- Model DTO definitions and schemas  
- Convex persistence layer for provider/model configurations
- CRUD operations for model and provider management

**Target**: Structured data management for LLM providers and models.

---

## Feature 006: Model Tools Registry

**Scope**: Implement registry system for model-specific tools and capabilities.

**Deliverables**:
- Model tools registry architecture
- Tool registration and discovery system
- Tool-to-model compatibility mapping
- Tool execution framework

**Target**: Extensible system for managing model-specific tools and capabilities.

---

## Feature 007: Agent System with Vercel Orchestration

**Scope**: Build agent system on top of model/provider DTOs with Vercel AI SDK agent orchestration.

**Deliverables**:
- Agent definitions built on model/provider DTOs
- Agent access to subsets of model-tools from registry
- Integration with Vercel AI SDK agent orchestration
- Agent execution and management system

**Target**: Full agent system leveraging Vercel's orchestration capabilities.

---

## Feature 008: CLI Alignment & Local Integration

**Scope**: Align CLI to use Vercel core APIs while maintaining local autonomy.

**Deliverables**:
- CLI integration with Vercel core APIs (`/liminal-api/chat`, etc.)
- Local model-tools registry for CLI
- CLI-specific agent definitions and management
- Local Vercel AI SDK integration for agent orchestration
- CLI maintains independence while leveraging core infrastructure

**Target**: Unified CLI experience that uses core APIs but maintains local flexibility.

---

## Phase 0 Migration Goals

**Overall Objective**: Complete migration from NestJS/ArangoDB to Convex + Vercel AI SDK architecture while building toward AI agent orchestration capabilities.

**Success Criteria**:
- ✅ Feature 1: Foundation established
- 📋 Features 2-4: Core LLM integration complete
- 📋 Features 5-6: Data models and tools infrastructure
- 📋 Features 7-8: Agent system and CLI integration

**Timeline Target**: 2-week aggressive development cycles with AI-augmented workflow.
