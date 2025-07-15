# Liminal Chat

An IDE for AI-augmented knowledge work. Build complex artifacts using specialized workspaces (Builders) with an AI assistant (Jarvis) that manages complexity through natural language interaction.

## Architecture

```
User → Jarvis (AI Assistant) → Builders (Workspaces) → Flows (Workflows) → AI Agents
         ↓                         ↓                       ↓
    Natural Language        Persistent State         Multi-Agent Patterns
```

### Core Concepts

**Jarvis**: AI assistant that navigates the system, operating builders and orchestrating workflows based on natural language requests.

**Builders**: Persistent workspaces for constructing specific artifacts (e.g., Character Builder, Chapter Builder). Each builder self-documents for AI navigation.

**Flows**: Advanced workflows within builders:
- **Roundtable**: User-directed multi-agent discussion (e.g., "@alice @bob review this")
- **Parallel**: Simultaneous generation of variations
- **Pipeline**: Sequential multi-stage processing

## Self-Documenting Architecture

Every component teaches Jarvis how to use it:

```typescript
// builders/character/workflows/roundtable.ts
export const jarvisDocs = {
  name: "Character Roundtable Review",
  when_to_use: ["User asks to 'review' a character"],
  example_invocations: ["Let's review Sarah's character"],
  expected_outcomes: ["List of improvements"]
};
```

## Progressive Complexity

**New Users**: "Create a detective character for my story"
- Jarvis handles everything through natural language

**Growing Users**: See builders in action, start direct manipulation
- Jarvis provides guidance and context

**Power Users**: Configure multi-agent workflows directly  
- Jarvis manages routine tasks and complexity

## Key Innovation

Traditional software hides complexity. Liminal Chat makes complexity navigable through AI.

As the system grows more powerful, it becomes more usable - not less - because every new feature self-documents for Jarvis to orchestrate.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start Convex backend
pnpm --filter liminal-api dev

# Run tests
pnpm test:integration

# Lint
pnpm lint
```

## Implementation Stack

- **Backend**: Convex (real-time sync, serverless functions)
- **AI Integration**: Convex AI Agent component + Vercel AI SDK
- **Frontend**: Next.js (web), Tauri (desktop - planned)
- **Authentication**: WorkOS

## Project Structure

```
liminal-chat/
├── apps/
│   ├── convex/                  # Backend
│   │   ├── builders/           # Builder implementations
│   │   │   ├── character/      # Character Builder
│   │   │   │   ├── index.ts
│   │   │   │   ├── mutations.ts
│   │   │   │   ├── queries.ts
│   │   │   │   ├── actions.ts
│   │   │   │   ├── jarvis.ts   # AI configuration
│   │   │   │   └── workflows/
│   │   │   └── chapter/        # Chapter Builder
│   │   └── jarvis/             # Jarvis implementation
│   └── web/                    # Next.js frontend
├── docs/                       # Documentation
│   ├── liminal-chat-prd.md    # Product requirements
│   └── llm-agent-exploration/ # Design docs
└── scripts/                    # Development tools
```

## Builder Pattern

Each builder follows a consistent pattern:

```typescript
// convex/builders/character/jarvis.ts
export const jarvisConfig = {
  loadContext: query({
    handler: async (ctx) => ({
      summary: "Current builder state",
      guidelines: "Builder-specific rules"
    })
  }),
  
  tools: {
    createCharacter: createTool({...}),
    reviewCharacter: createTool({...})
  }
};
```

## Environment Setup

```bash
# Install dependencies
pnpm install

# Configure Convex environment
npx convex env set OPENAI_API_KEY "your-key"
npx convex env set ANTHROPIC_API_KEY "your-key"
npx convex env set WORKOS_CLIENT_ID "your-id"
npx convex env set WORKOS_API_KEY "your-key"

# Start development
pnpm dev
```