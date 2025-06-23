# Augy Scratchpad - Current State

## 🎯 **Project Status: Documentation Complete, Ready for Roadmap Planning**

### **✅ Foundations Complete:**
- **Product Vision**: Comprehensive PRD defining IDE for AI-augmented knowledge work
- **Architecture**: Complete system design with graph-based artifact management + transience
- **Development Process**: AI-augmented workflow (User → Augy → Claude Code)
- **Quality Standards**: TDD, error handling, coding standards, quality gates
- **AI Agent Prompts**: Augy (architect/sentinel) + Claude Code (implementer) + workplan templates
- **Documentation Structure**: Well-organized in `/docs/` with clear relationships

### **🎯 Target Users (MVP):**
- **Primary**: You (lyric/Suno prompt development)
- **Secondary**: Partner + friend (creative writing flows)
- **Goal**: Simple working solution for feedback over complexity

### **🚀 Core Feature Decision:**
- **AI Roundtable Chat** - parallel agent orchestration as first AI/UI primitive
- **Why**: Simpler than creative flows, demonstrates core platform capability
- **Foundation for**: All future multi-agent features

## 📋 **Architecture Status Review**

### **✅ Well-Defined Systems:**
- **Graph-based artifact management** with ArangoDB
- **Transience lifecycle** (Live → Touched → Untouched → Archived → Purged)
- **Multi-agent orchestration** (Roundtable, Parallel Gen, Pipeline)
- **Lock coordination** for conflict prevention
- **Team-level sharding** for performance isolation
- **Contract-first development** with OpenAPI

### **⚠️ Architecture Pivot Needed:**
**Current**: NestJS + ArangoDB + Redis + Fastify
**Target**: Convex + Next.js + Clerk (per memories)

**Migration Requirements:**
- Move from NestJS/ArangoDB to Convex backend
- Maintain Vercel AI SDK integration
- Preserve agent management schemas
- Keep real LLM provider testing (no mocking)

## 🏗️ **Phase 0: Technical Foundation (2 weeks)**

### **Critical Migration Path:**
1. **Convex setup** + Clerk auth integration
2. **Agent schemas migration** (AgentType + AgentInstance → Convex)
3. **Vercel AI SDK endpoints** (`/api/chat`, `/api/completion`, `/api/generate-text`)
4. **Integration testing** with real LLM providers
5. **Basic artifact management** in Convex (simplified from ArangoDB design)

### **🔍 LLM Integration Complexity Analysis:**

**GOOD NEWS**: Convex HTTP Actions + Streaming = **EASIER** than NestJS/Fastify!

**Current NestJS Implementation** (from codebase analysis):
- Complex custom streaming setup with response transformers
- Manual provider abstraction layer
- Custom error handling and timeout management
- Fastify-specific streaming configuration

**Convex HTTP Actions Implementation** (from template analysis):
- **Built-in streaming support** with TransformStream API
- **Native OpenAI SDK integration** - no custom adapters needed
- **Automatic CORS handling** with simple configuration
- **Integrated database updates** during streaming (periodic saves)
- **Error handling** built into the action pattern

**Migration Effort Assessment**: **SIGNIFICANTLY EASIER** than current setup
- Convex HTTP Actions provide streaming out-of-the-box
- No need to write custom streaming code
- Vercel AI SDK works directly with OpenAI SDK in actions
- Template shows exact pattern for our use case

### **Key Challenge RESOLVED:**
- ✅ **Convex + Vercel AI SDK**: Template proves it works seamlessly
- ⚠️ **Graph relationships** - need to adapt ArangoDB graph design to Convex
- ⚠️ **Transience management** - implement decay policies in Convex

## 🎯 **Phase 1: AI Roundtable (after Phase 0)**
- Agent configuration and management UI
- 3-5 agent parallel orchestration
- Real-time streaming interface
- @mention agent selection
- Session management

## 📝 **Next Actions:**
1. **Create detailed roadmap** with Phase/Milestone/Feature structure
2. **Plan Phase 0 migration** from NestJS/ArangoDB to Convex
3. **Use workplan-to-story prompt** for implementation planning
4. **Leverage AI-augmented development** (2 weeks not 2 months)

## 🔧 **Development Approach:**
- **You**: Strategic direction + decisions + architecture pivots
- **Augy**: Planning + architecture + quality gates + completion bias hunting
- **Claude Code**: TechLead mode + agent spawning + implementation
- **Timeline**: Aggressive 2-week cycles with unlimited tokens
