# Comprehensive Design Summary - Liminal Chat

## Vision

Liminal Chat is an AI-native IDE for knowledge work where **Jarvis** (an AI assistant) helps users navigate complex **Builders** (persistent workspaces) to create artifacts 10-50x faster through intelligent complexity management.

## Core Concepts

### 1. Products
Applications built on the Liminal Chat framework (e.g., Creative Writing, Business Analysis)

### 2. Builders  
Persistent workspaces for constructing specific artifacts:
- **Character Builder**: Create and manage characters
- **World Builder**: Design settings and systems
- **Chapter Builder**: Draft and refine prose
- **Outline Builder**: Structure plots and narratives

### 3. Flows
Workflows available within builders:
- **Edit Flow**: Direct manipulation with Jarvis help
- **Roundtable Flow**: Multi-agent discussion/review
- **Parallel Flow**: Generate multiple variations
- **Pipeline Flow**: Sequential processing stages

### 4. Views
Read-only sidebars showing other builders' content, enabling "tell Jarvis to update X while I work on Y"

### 5. Jarvis
The meta-agent that makes everything accessible through:
- Natural language interaction
- Builder navigation
- Tool orchestration
- Context management

## Revolutionary Architecture Patterns

### The Self-Documenting AI Pattern

Every component provides its own AI documentation:

```typescript
// Workflows document themselves
export const jarvisDocs = {
  name: "Character Roundtable",
  when_to_use: ["User wants to review a character"],
  example_invocations: ["Let's review the villain"],
  expected_outcomes: ["Character improvements"]
};

// Builders aggregate documentation
export const getJarvisContext = query({
  handler: async (ctx) => {
    return {
      available_workflows: { roundtable: roundtableDocs },
      available_tools: { createCharacter: toolDocs },
      guidelines: ["Maintain character consistency"]
    };
  }
});
```

### The Copy-Paste Workflow Pattern (shadcn-style)

Instead of abstract configurable workflows:
- Generate bespoke workflows from templates
- Each builder owns its customized workflows
- Natural evolution through direct modification
- No coupling between builders

### Builder Organization

```
convex/builders/character/
├── index.ts       // Exports
├── mutations.ts   // CRUD operations
├── queries.ts     // Data fetching
├── actions.ts     // LLM operations
├── jarvis.ts      // AI configuration
└── workflows/     // Bespoke workflows
    ├── roundtable.ts
    └── parallel.ts
```

## Implementation Strategy

### Technology Stack
- **Convex**: Real-time backend, data persistence
- **Convex AI Agent**: Jarvis implementation, thread management
- **Convex Workflow**: Durable execution for flows
- **Next.js**: Web application
- **Tauri**: Desktop application (future)

### Hybrid Architecture
- Use Convex Components as infrastructure
- Implement our Builder/Flow patterns on top
- Leverage production-ready features (threading, embeddings, durability)
- Maintain conceptual clarity

## Progressive User Experience

### Layer 1: Zero Learning Curve
- User: "Create a detective character"
- Jarvis handles everything
- User never sees builders directly

### Layer 2: Guided Exploration
- User sees Jarvis operating builders
- Starts clicking around
- Jarvis explains as they explore

### Layer 3: Power Usage
- Direct builder manipulation
- Configure parallel agents
- Run complex workflows
- Jarvis handles tedium

## The Paradigm Shift

**Traditional**: Humans write docs → Humans read → Humans use

**Liminal Chat**: Code self-documents → AI reads → AI orchestrates

This creates an **AI-navigable system** where:
- More features = more self-documentation
- Complexity becomes navigable, not hidden
- Documentation IS the interface
- AI isn't a feature - it's the runtime

## Key Design Decisions

1. **Jarvis-first**: Every interaction can go through Jarvis
2. **Builder-centric**: Not chat-centric; builders are primary
3. **Local context**: Each component knows itself
4. **Workflow ownership**: Builders own their workflows
5. **Progressive disclosure**: Complexity revealed gradually

## Next Implementation Steps

1. **Jarvis Core**: Implement with Convex AI Agent
2. **First Builder**: Chapter Builder with full structure
3. **First Flow**: Parallel Generation workflow
4. **View System**: Cross-builder visibility
5. **Self-Documentation**: Throughout all components

## The Ultimate Insight

We're not building software with AI features. We're building software where AI navigation IS the primary interface, making arbitrarily complex systems usable through intelligent context aggregation and self-documentation.