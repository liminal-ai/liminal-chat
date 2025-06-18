# Liminal Chat - Project Plan

## Overview

This directory contains the comprehensive feature roadmap and project planning for Liminal Chat. Features are organized into phases with clear dependencies and implementation sequences.

## Feature Status at a Glance

| Feature | Status | Notes |
|---------|--------|-------|
| [001 - Echo Provider](#feature-001-echo-provider) | ✅ Complete | Foundation for provider pattern |
| [002 - OpenRouter Integration](#feature-002-openrouter-integration) | 🔄 Partial | Story 1 started, needs completion |
| [003 - Auth Foundation](#feature-003-auth-foundation) | 📋 Planned | Designed but not started |
| [004 - Testing Framework](#feature-004-testing-framework) | 🚧 Active | Currently implementing |
| [005 - Data Persistence](#feature-005-data-persistence) | 📋 Next | Chunk-based filesystem storage |
| [006 - Structured Logging](#feature-006-structured-logging) | 📋 Next | Cross-tier logging system |
| [007 - AI Roundtable Routing](#feature-007-ai-roundtable-routing) | 📋 Next | Gemini Flash @mention system |
| [008 - Web Frontend](#feature-008-web-frontend) | 📋 Next | Vite + React roundtable UI |
| [009 - User Authentication](#feature-009-user-authentication) | 📋 Next | Clerk integration |
| [010 - Service Authentication](#feature-010-service-authentication) | 📋 Next | Edge→Domain JWT tokens |

## Current Priorities

### 🔥 Immediate (Next 2 weeks)
1. **Complete Feature 004** - Testing Framework (Stories 4-6)
2. **Finish Feature 002** - OpenRouter Integration (Stories 1-4)
3. **Cleanup Legacy** - Remove Vercel AI SDK remnants

### 📈 Short Term (Next month)
4. **Feature 005** - Data Persistence Foundation
5. **Feature 006** - Structured Logging System

### 🎯 Medium Term (Next quarter)
6. **Feature 007** - AI Roundtable Routing
7. **Feature 008** - Web Frontend Interface
8. **Feature 009** - User Authentication

## Implementation Phases

### Phase 1: Foundation Complete ✅
Core CLI → Domain architecture with working provider pattern.

### Phase 2: Testing & Integration 🚧
Robust testing framework and OpenRouter integration.

### Phase 3: Data & Logging 📋
Persistent conversations and observability.

### Phase 4: AI Roundtable 📋  
Multi-agent routing and web interface.

### Phase 5: Authentication 📋
User management and security layers.

## Feature Definitions

### Feature 001: Echo Provider
**Status**: ✅ Complete  
**Location**: `docs/features/001-echo-provider/`  
**Description**: Foundation provider pattern with 5 complete stories and full test coverage.

### Feature 002: OpenRouter Integration  
**Status**: 🔄 Partial (Story 1 started)  
**Location**: `docs/features/002-openrouter-integration/`  
**Description**: Replace Vercel AI SDK with direct OpenRouter API integration.
**Remaining**: Stories 1-4 (Basic Provider, Streaming, Model Selection, Resilience)

### Feature 003: Auth Foundation
**Status**: 📋 Planned  
**Location**: `docs/features/003-auth-foundation/`  
**Description**: Authentication architecture design (not implemented).

### Feature 004: Testing Framework
**Status**: 🚧 Active (Story 4 in progress)  
**Location**: `docs/features/004-testing-framework/`  
**Description**: Jest→Vitest migration, Playwright setup, integration testing.
**Remaining**: Stories 4-6 (Edge Integration, CLI E2E, Documentation)

### Feature 005: Data Persistence
**Status**: 📋 Next  
**Description**: Chunk-based filesystem storage with Edge reconstruction.
**Scope**: User/conversation/message file structure, bundling optimization.

### Feature 006: Structured Logging  
**Status**: 📋 Next  
**Description**: Cross-tier logging with correlation IDs and environment awareness.
**Scope**: Domain/Edge/CLI logging standards, request tracing.

### Feature 007: AI Roundtable Routing
**Status**: 📋 Next  
**Description**: Gemini Flash @mention parsing and agent context selection.
**Scope**: Agent definitions, alias expansion, conversation rounds.

### Feature 008: Web Frontend
**Status**: 📋 Next  
**Description**: Vite + React + shadcn/ui roundtable interface.
**Scope**: Multi-stream SSE, agent displays, conversation UI.

### Feature 009: User Authentication
**Status**: 📋 Next  
**Description**: Clerk integration for user management.
**Scope**: Registration, login, profiles, workspace management.

### Feature 010: Service Authentication
**Status**: 📋 Next  
**Description**: Edge→Domain JWT service tokens.
**Scope**: API key management, request authorization, security headers.

## Known Technical Debt

### Legacy Components to Remove
- **Vercel AI SDK remnants** in `docs/features/002-vercel-ai-sdk/`
- **Provider files**: `vercel-openai.provider.ts` and related tests
- **Dependencies**: Vercel AI SDK packages in package.json

### Architecture Improvements Needed
- **Edge↔Domain authentication** (missing service-to-service auth)
- **Error handling standardization** across tiers
- **Performance monitoring** and health checks

## Development Guidelines

### Feature Implementation Process
1. **Read existing design docs** (if available)
2. **Define contracts** and API boundaries
3. **Write tests first** (TDD approach)
4. **Implement incrementally** with story-based development
5. **Argus QA validation** before feature completion

### Testing Requirements
- **Domain**: 75% test coverage minimum
- **Edge/CLI**: 70% test coverage minimum  
- **Integration tests** for tier boundaries
- **E2E tests** for complete user flows

### Documentation Standards
- **Feature README** with overview and status
- **Story breakdown** with clear scope and effort estimates
- **Architecture decisions** documented in `/docs/architecture/decisions.md`
- **Implementation logs** for complex development work

## Next Actions

1. **Complete testing framework** (Feature 004 Stories 4-6)
2. **Finish OpenRouter integration** (Feature 002 Stories 1-4)  
3. **Clean up Vercel AI SDK** legacy code and documentation
4. **Plan Feature 005** data persistence implementation
5. **Update project status** tracking as features complete

---

*Last updated: June 13, 2025*