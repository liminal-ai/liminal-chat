# System Design & Implementation Content Dump

This file contains ALL system design and implementation-related content extracted from documentation files.

---

## FROM: product-info-dump.md

### Technical Strategy & Stack

#### Application Shell: Tauri Desktop Canvas

The ultimate vision for the user interface is a rich, desktop-native experience built with **Tauri**. This approach provides a hybrid model:

*   **Component Factory (Next.js/Vercel):** The Next.js project serves as the primary development environment for creating, testing, and rapidly iterating on individual UI components and 'portlets' (e.g., the Roundtable view, Parallel Ideation panel, Agent Designer).
*   **Composition Canvas (Tauri):** The Tauri application acts as the final container or 'shell'. It will render the web-based components and orchestrate them within a native desktop environment. This allows for advanced UI management, such as multi-window layouts, and provides the necessary access to local system resources, fulfilling the 'local-first' principle.

This strategy combines the velocity of a modern web stack for UI development with the power and integration of a native desktop application.

Reflecting a strategic pivot to maximize UI development velocity and align with the core product vision, the platform will be built on the full Vercel stack. This approach moves away from a custom, heavily scaffolded backend to a modern, integrated architecture designed for AI-powered generative UI.

### Core Components:

*   **Framework:** Next.js (App Router) for its robust features, performance optimizations, and seamless integration with the Vercel ecosystem.
*   **UI Foundation:** A combination of Tailwind CSS for utility-first styling and `shadcn/ui` for its library of accessible, unstyled, and composable components. This provides a solid and flexible base for both hand-crafted and AI-generated UI.
*   **AI Integration:** The Vercel AI SDK (v3.0 and later) is central to the platform. It provides the tools for streaming text, and more importantly, for building **Generative UI**. This allows AI models to return structured, interactive UI components directly into the application.
*   **Generative UI Engine:** The platform will leverage Vercel's `v0` composite model family programmatically. `v0` is specifically fine-tuned to generate high-quality, production-ready React components from prompts, adhering to best practices.

### The Development Loop: Building Liminal Flow with Liminal Flow

The development process is a core differentiator and a direct embodiment of the product's philosophy: we are **using the process of Liminal Flow to build Liminal Flow.** This creates a powerful, recursive, and self-accelerating development cycle.

The Vercel-based architecture provides the foundation for this extreme agility. It enables the identification of a need and the subsequent implementation of a new capability—often as a simple `pnpm` script leveraging the platform's own API endpoints—with a turnaround time measured in minutes, not days. This immediate lift enhances the development ecosystem instantly.

The workflow is a practical application of this philosophy:

1.  **AI-Powered Generation:** An agent prompts the `v0` model to generate a required UI component.
2.  **Live Integration:** The component is streamed into the Next.js application for immediate review.
3.  **Automated Inspection & Critique:** A Playwright-based agent interacts with the new component, capturing visual and structural data.
4.  **Iterative Refinement:** This data is fed back into the AI, which critiques its own work and generates an improved version.

This virtuous cycle means the platform's intelligence and capabilities are compounded with each feature built, directly accelerating the creation of the next.

A core research and development technique within this loop is the **interrogation of agents.** By actively questioning and observing the behavior of different AI agents—both those that perform well and those that perform poorly—we can reverse-engineer the underlying mechanics of effective prompting, context management, and architectural patterns. This empirical approach provides a continuous stream of insights that directly inform the platform's design. It's critical to note that agents can exhibit a "pleasing bias," leading them to provide answers they think the user wants to hear, which may not accurately reflect their internal processes. Therefore, behavioral observation is often more reliable than direct self-reporting from the agent.

This strategy places the core innovation focus on designing novel UI primitives and orchestration flows, while leveraging a state-of-the-art generative engine for the component-level implementation. It is the technical foundation for the platform's goal of rapid, high-quality UI development.

### Architecture: System Prompt for Persistent Behavior

To achieve persistent agent behavior, user-defined directives and rules of engagement should be injected at the beginning of the context window, before the conversational history. This 'system prompt' placement ensures the LLM treats the directives as foundational, high-priority rules for the entire interaction, which is more reliable than placing them later in the prompt where they might be influenced by more recent conversational turns. This is a key architectural insight for the user's platform.

### Architecture: 'Lost in the Middle' and Dual-Injection Solution

User identified a key failure mode in long-context LLMs: initial directives in the system prompt can be 'lost' or weakened by a large volume of intermediate context (the 'lost in the middle' problem). A proposed architectural solution is to re-inject or 'refresh' core directives immediately before the final user prompt, in addition to the initial system prompt. This ensures the agent's core instructions are reinforced and have high salience, combating the model's tendency to be swayed by more recent tokens. This dual-injection (start and end) is a key strategy for robust, persistent agent behavior. The user also noted that agents have a 'pleasing bias' and may not accurately report their own internal processes, making behavioral observation more reliable.

### Architecture: Tauri as the Richest UI Canvas

User specified that the richest version of the UI will be a Tauri-based desktop application. This application will act as a 'canvas' for composing and orchestrating the UI components and 'portlets' developed in the Next.js/Vercel project. This architecture allows for a native-like experience, multi-window management, and access to local system resources, reconciling the 'local-first' vision with a rapid web component development workflow.

---

## FROM: cascade_export_workaround.md

### Current planning approach

Minimize rigid, detailed step-by-step planning in favor of capturing evolving insights, PRD-level details, and implementation strategy in living documentation. Emphasize flexibility, instinct-driven pivots, and documentation-first strategy.

### Recent pivot

Shift from highly scaffolded, micromanaged multi-agent backend to Vercel full stack (Next.js, Tailwind, shadcn, Vercel AI SDK, AI UI SDK, generative UI, v0 model support, Playwright MCP). This enables maximal rapid UI iteration and leverages cutting-edge GenAI/AI UI capabilities. New approach prioritizes fast integration and reuse of AI-generated UI/web components and automated UI testing/fixing workflows.

### Persistent state management for agent instruction-following

The platform must include a robust memory system capable of tracking and consistently adhering to user directives (such as interaction style) across sessions. This is critical for trust and effective human-AI partnership, as demonstrated in the current planning process.

### Architectural pattern

For persistent agent behavior, user directives and rules of engagement should be injected at the beginning of the context window (system prompt), before the conversational history. This ensures the LLM treats them as foundational rules for the session, maximizing reliability of behavioral adherence.

### Advanced prompt management

To mitigate 'lost in the middle' issues in long-context LLMs, core directives should also be re-injected as a 'pre-prompt refresher' immediately before the user prompt. This dual-injection strategy (system prompt and pre-prompt) helps maintain directive salience. Note: Agents may exhibit 'pleasing bias' and self-report unreliably; behavioral observation is more trustworthy for evaluating compliance.

### Design principle

The art of an effective refresher is not just repetition, but skillful selection and summarization of the most critical system prompt directives, with sufficient backreference to reinforce the desired behavior efficiently.

### Empirical methodology

The user actively interrogates both well-functioning and poorly-functioning agents to reverse-engineer effective prompting, prompt management, and context management techniques. This black-box, empirical approach is a core part of the Liminal Flow platform's development process.

### Validation

The dual-system approach (positional reminders and behavioral rituals like 'implementation pause') was empirically shown to maintain agent stability and focus even deep into a 100k token context during heavy development with Claude Code. This provides strong evidence for these architectural patterns as a solution to the 'lost in the middle' problem.

### Architectural update

The richest version of the UI will be a Tauri-based desktop application that serves as a canvas for composing and orchestrating web-based UI components/portlets developed in the React/Next.js project. This hybrid approach enables a native-like, local-first experience while leveraging rapid web component iteration.

### Product identity update

Liminal Flow is defined as a fusion of desktop (Tauri) and web (Next.js/React), existing in the liminal space between the two and leveraging the strengths of both. This is a core differentiator and part of the platform's philosophy, not just a technical choice.

---

## FROM: deeper-exploration-transcript.md

### Vercel AI SDK and Canvas-like Objects

Use AI SDK Core functions like generateObject or streamObject with a Zod schema to produce structured data (e.g., title, headers, code blocks, formatted text).

On the UI side, use the framework‑agnostic useObject hook from AI SDK UI to render the object, and customize the presentation however you want—e.g. using a <pre><code> block, or even a richer canvas UI.

### Build a "canvas"-style interface using generative UI tools

- RTF / MD Rendering: If you output markdown or rich text via streamText, you can render it using a Markdown renderer with syntax highlighting—common in SDK examples.
- Generative UI Pattern: The SDK promotes using React Server Components and streaming UI techniques to incrementally build UIs as data arrive: you can stream UI elements (like code editors, canvas previews) by combining streamObject with server-side components.
- Plugin patterns or canvas libs: You can layer in your own canvas renderer—maybe drawing element blocks, displaying diagrams, versions—while driving updates via the SDK's streaming data.

### Fragments by E2B

Open‑source template that uses:
- Vercel AI SDK + Tailwind UI
- A code execution UI powered by E2B, displaying generated code, executing it, and streaming outputs live
- It essentially gives you a polished, interactive "artifact canvas" for code

### Editable Components Implementation

"That's a very sound—and actually quite elegant—approach for keeping boundaries clean and state transitions explicit. Here's why your idea works well, some gotchas to look out for, and how you can lean into this pattern for even more robust UI:

**Why This Pattern Works Well**
- Clear Separation of Concerns: By swapping the entire component tree (read-only vs. edit-only), you get a hard reset of local state and React hooks. This prevents issues like stale state or "leaked" edits when toggling between modes.
- Lifecycle Hooks: Unmounting one and mounting the other guarantees you can use useEffect's cleanup logic, and ensures all child component state is reset, including refs, editors, or local stores.
- Easy to Trigger Sync/Cleanup: You have a single, clear "event" (mount/unmount or a mode flag) to persist, discard, or reset state when switching modes.

**Implementation Sketch**
```jsx
function Artifact({ value, onSave }) {
  const [editMode, setEditMode] = useState(false);
  const [version, setVersion] = useState(0); // bump to force unmount
  return editMode ? (
    <DocumentEdit 
      key={version} // force unmount/remount on every entry
      value={value}
      onSave={val => {
        onSave(val);
        setEditMode(false);
        setVersion(v => v + 1); // force remount on next edit
      }}
      onCancel={() => {
        setEditMode(false);
        setVersion(v => v + 1); // force remount on next edit
      }}
    />
  ) : (
    <DocumentReadOnly value={value} onEdit={() => setEditMode(true)} />
  );
}
```

### Unified Edit Lock Model

"At any time, an artifact (or section) can be "actively edited" by one editor: either a user or a model/agent.
Whoever holds the lock—user or AI—gets to finish their editing turn before anyone else (human or agent) can take over.
No one else (besides possibly the owner/admin) can "break" the lock; they must request or wait.

**Artifact State Example**
```js
artifact = {
  content: "...",
  activeEditor: {
    type: 'user' | 'model',
    id: 'userId' | 'agentId',
    name: '...'
  },
  lastEditTimestamp: ...,
  // ...
}
```

### Core Challenges in AI/Human Co-editing

- Model and user can both "edit" an artifact at the same time (but not usually in practice).
- If artifact is in edit mode:
  - User's local edits are "source of truth."
  - Model should pause streaming updates or, at most, only "watch" (not overwrite).
- When model is updating (artifact not in edit mode):
  - Streaming model output can go straight to the artifact.
- Sync before streaming:
  - Local client must always sync with its home base (local store) before doing anything that might conflict with an in-flight edit.

### Recommended High-Level Approach

1. **Local Store as "Ground Truth"**
   - Every artifact in your app has a single source of truth: local store (Zustand, Redux, or even just React context/localStorage if simple).
   - React state is just a "view" on this store. Always write edits and streamed model updates into this store before showing in UI.

2. **Edit Mode = User Lock**
   - As soon as a user enters edit mode, set a locked or editing flag on the artifact in local store.
   - When this flag is true:
     - Model updates are ignored, buffered, or paused.
     - Optionally, show "AI suggestions available" but don't apply them.

3. **Conflict Detection**
   - If you try to stream model output into an artifact while it's being edited, your sync hook should:
     - Compare last-known server/model version vs. local in-progress version.
     - If they differ and the edit flag is set, pause or kill the model stream, and optionally surface a conflict warning.

### Core Frontend Architecture Recommendations

You're describing a serious, professional-grade creative/AI coding tool—the kind of "developer-first, power-user" product that can stand shoulder-to-shoulder with the best of what's out there (like VS Code, Obsidian, Notion, and next-gen AI IDEs). Your instincts around architecture, deployment, and monetization are extremely sharp.

**Pros of a Thick Client (Electron/Tauri/Native)**
- File System Access: Native code editors, asset management, scripting, sandboxing, plugin support—all easier and more powerful locally.
- Performance: Less latency for heavy UI, code navigation, large files, and "power user" features.
- Rich Integration: Can integrate with local dev tools, system clipboard, file watchers, compilers, etc.
- Token/compute cost control: Easier to manage quotas, throttle AI requests, batch operations locally before hitting the server.
- Advanced Editors: You can embed Monaco, CodeMirror, or even fork pieces of VS Code for best-in-class editing UX.

**Tauri (or Electron) with React for UI Primitives**
- Great stack for power users:
  - Tauri is lightweight, secure, and cross-platform.
  - React for component system, testing, and storybook-style development.
  - Monaco/CodeMirror for pro editing (VS Code is open source—you can bring over lots of its editing primitives).
- Canvas-like composition:
  - Build and test all primitives in pure React (Storybook, Vitest, etc.).
  - Compose them into flows/canvases inside the Tauri/Electron app shell.
  - You can even ship a "headless" version for backend/batch/CLI use.

### Server/Backend Architecture

- Keep it lean and focused:
  - Fastify/Nest for high-speed endpoints.
  - Vercel endpoints for UI/LLM flows if needed.
  - Minimal database and sync logic for user/auth, artifact store, and edit state.
  - All heavy lifting (generation, editing, multi-agent flows) happens on demand, triggered by the client.

### Multi-Agent Implementation Patterns

The first few power users who get it and really use it will immediately, if my product is successful. If it's not successful, then I don't want people to spend a bunch of money on something that sucks. But if it's what I want it to be, if it's successful, I am not worried about monetization or uptake. Because all I need are a few power users creating with it. And then at that point, their output will be so compelling that usage of it, it will begin to force its way into a number of different spaces. Because people who don't have something like this won't be able to keep up in terms of creative output, high quality output, and so forth.

### Core Primitives for AI Collaboration

I have three core primitives I need to build, one of which is the parallel agent output. That will be one of the key ones, but another one is going to be like a serial agent pipeline that you can go straight through or iterate through.

**Parallel Generator**
```ts
// In store
drafts: Record<draftId, { content, agentId, status: 'streaming'|'done' }>
activeEditor: null | { type:'model'|'user', id:string }
```

**Serial Pipeline**
```ts
pipeline: Stage[] // [{id:'editorA', kind:'agent', ...}, ...]
cursor: number // index of current live stage
```

**Round-table**
Very light router prompt:
"Given the user message and @mentions, return the list of agent IDs that should respond in order."
Router returns ['agent2','agent4'] → fire those two agent calls concurrently; append streamed replies.

### Graph-Based Persistence Architecture

#### Core Insight: You Need a Server-Based Artifact Graph

You're moving toward an architecture where:
- Every document/artifact is a node in a global store
- Relationships between artifacts are edges (e.g. "child of", "synthesized from", "linked in view", etc.)
- Users and agents can build dynamic "views" on top of that graph—some strict (like folder structures), some flexible (like filtered outlines or workboards)

This isn't a file system. It's a semantic, versioned, multi-agent-aware artifact graph, and it forms the creative spine of your product.

#### Document/Versioning System

**Artifacts Must Have a Persistent Identity**
```ts
Artifact = {
  id: string, // UUID or similar
  title: string,
  type: 'text' | 'code' | 'outline' | 'plan' | ...,
  createdAt: Date,
  updatedAt: Date,
  createdBy: 'user' | 'agent',
  parentId?: string, // lineage
  currentVersion: string, // points to version entry
}
```

**Versioning System: Light Git for Artifacts**
```ts
Version = {
  id: string,
  artifactId: string,
  content: string,
  createdAt: Date,
  createdBy: 'user' | 'agent',
  message?: string, // like a commit message
  parentVersionId?: string, // for traceability
  meta?: { agentName?, prompt?, params? }
}
```

**Indexing: Folders/Flows/Groups**
```ts
Workspace = {
  id: string,
  title: string,
  artifactIds: string[],
  createdAt: Date,
  tags: string[],
}
```

**Locking: Tie to Editing Rules**
```ts
Lock = {
  artifactId: string,
  editor: { type: 'user' | 'agent', id: string },
  startedAt: Date,
  expiresAt?: Date,
}
```

### Scoped, Fast Full-Text Search Over Graph

**Core Capabilities You Need**

1. **Full-text indexing** (across versions, content, and metadata)
   - Search should include:
     - Current content of each artifact
     - Tags, titles, summaries
     - Possibly historical versions or last N versions
   - Fast full-text search is a solved problem if you use:
     - Postgres with pg_trgm
     - SQLite FTS5 (great for embedded/CLI)
     - Typesense or Meilisearch (easy-to-host vector/text search engines)
     - ElasticSearch / OpenSearch (more power, more setup)

2. **Graph-aware scoping**
   - You want to limit search to just the current graph view or subgraph:
     - "Everything in this workspace"
     - "All children of this artifact"
     - "This artifact and its siblings"
     - "These 5 parallel versions + their source artifact"

3. **Search relevance control**
   - Search within "title > tags > content > author > meta"
   - Boost results from:
     - activeEditor
     - recently modified
     - in current viewport
     - user favorites

### Graph Database Recommendations

Based on your needs—developer-friendly, agent-aware, performance-optimized, and suitable for team-level sharding with intelligent caching:

**Neo4j**
- Maturity & Ease-of-Use: The most widely-used native graph DB, with intuitive Cypher query language, solid tooling, extensive docs, and large community.
- Strengths: Excellent for complex relationship traversal, ACID consistency, and rich ecosystem (visualizations, plugins).
- Trade-offs: Licensing cost scales quickly; community edition may lack advanced enterprise features; performance hinges on node/edge sizing and hardware.

**ArangoDB**
- Multi-Model Flexibility: Supports graph, document, and key/value natively. Uses AQL (SQL-like), which reduces learning curve.
- Strengths: Great for hybrid workloads, full-text search, and graph + document use cases. Good clustering and performance tuning options.
- Trade-offs: Licensing changes (community edition now under Business Source License, 100GB limit). Some enterprise features require paid tiers.

**Dgraph**
- GraphQL-Native Friendliness: Users report more intuitive query language than Cypher; very strong on full-text search and indexing.
- Strengths: Fast, scalable, distributed, ACID-compliant, managed cloud available, and open-source.
- Trade-offs: Slightly less mature ecosystem than Neo4j—though growing—but easier for beginners who prefer GraphQL.

### Strategic Constraints for Graph Optimization

**Team size + session scope**
- Limit active users per flow (e.g. 1–3 writers + N agents)
- Limit concurrent active editors per document
- Session-bound agent runs (e.g. "This synthesis job only touches 5 parallel nodes")

**Traversal scoping before write**
- All agents or users must resolve a local write scope before adding links/edges:
  - e.g. resolveWritableScope('artifact-42') → [id1, id2, id3]
  - Then proposeEdge(id2 → newNode)

**Write batching and edge bucketing**
- When writing 10 new edges (e.g. synth from 5 docs), bucket them under a single write operation ID or batch timestamp.

**Local "edit zone" cap per flow**
- An agent can only create new nodes that are:
  - Direct children of the focus node
  - Versions of a known draft
  - Tagged by the current flow

### Document Transience Model

**Document transience as a first-class property**

A tiered model:

| Tier | Type | Description |
|------|------|-------------|
| Live | Primary artifacts | Active, signed-off, owned, or in-edit |
| Touched Transients | Semi-stable | Drafts with user edits or included in synth |
| Untouched Transients | Raw generations | Not viewed, used, or edited after generation |
| Archived | Cold storage | Auto-migrated or user-archived |
| Ephemeral | Temp/scratch | Auto-purged after TTL (e.g. within-session generations) |

**Product Behaviors That Fall Out of This**

- Auto-decay engine: "If untouched for 14 days and not used in any synth, mark as archive_candidate."
- Decayed artifacts live in slower, cheaper lanes
- Agent behavior respects lifecycle class
- UI hints at document vitality

### Team Size Optimization

**Why 1–3 Is the Sweet Spot in Agent-Augmented Teams**

1. AI scales individual output massively
   - One human plus five agents is already a small creative swarm.
   - Two humans with agents can rival a traditional five-person team in throughput.

2. Coordination becomes the bottleneck, not productivity
   - At 4+ active humans with agents each, you're managing:
     - Locking collisions
     - Graph pollution
     - Edit ownership fights
     - Agent memory crosstalk
     - Scoped vs global change propagation

3. Small teams allow shared mental model
   - Three people can still maintain shared context and narrative over what's being built or written.
   - Beyond that, it fractures—even more so when everyone is prompting agents simultaneously.

4. AI replaces coordination layers
   - Traditional team scaling is about hierarchy and delegation.
   - AI-native scaling is about agent composition, not people composition.

**Design Principle Emerging Here**
Workspaces are units of flow, not units of organization.

### MCP and Function Calling Integration

**MCP (Multi-Agent Control Plane) and function calling must speak the graph natively**

Your agents will eventually call:
- get_context('current_workflow')
- find_related_versions(artifactId)
- get_tagged('#research')

This means your function-calling layer and MCP need to plug directly into a graph-resolving layer:
- Efficient
- Role-aware
- Scope-constrained

Think: GraphQL, but optimized for AI workflows, with privilege and prompt constraints baked in.

### Implementation Tips

**On "Run", create N draft entries → fire N streamObject calls → stream chunks straight into drafts[draftId].content.**
Clicking inside a draft sets activeEditor → pauses/aborts every stream still marked "streaming".

**Lock / Presence**
In each React editor component:
```ts
onFocus={() => lock(artifactId, {type:'user', id:userId})}
onBlur ={() => unlock(artifactId)}
```

Any agent call checks if (store.activeEditor?.id !== selfId) pauseOrReject().

### CLI & Test Harness

- Expose every "primitive" command (run-parallel, advance-stage, start-roundtable) in a local CLI that just POSTS to the same Fastify endpoint the UI uses.
- Write Playwright tests that:
  - Spawn the thick client.
  - Trigger CLI to run an agent.
  - Assert the UI shows streamed text, locks behave, etc.

### External Integration Strategy

**External Integration Layer**
This is where the canvas becomes connective tissue between the user's creative work and their deployment channels:
- Docs → CMS (Notion, Webflow, Medium)
- Copy → Ads platform (Facebook, Google, Twitter)
- Assets → Publishing/distribution tools (Substack, Mailchimp, Shopify, etc.)
- Plans → Calendar/tasking tools (Linear, ClickUp, Trello)

You're enabling a path where AI doesn't just help you generate, it helps you deploy, schedule, publish, test, and refine.

### Performance Optimization Strategies

**Redis caching mechanisms** for scope lookups:
- Storing recently traversed scopes
- Precomputed ancestor/descendant sets
- Artifact "heat" (i.e. live vs. cold)

**Graph DB Options**
| Graph DB | Strengths | Weaknesses | Suitability |
|----------|-----------|------------|-------------|
| Neo4j | Mature, Cypher query language, strong ecosystem | Heavy infra, less flexible with custom logic, $$$ at scale | Viable for production, but might feel rigid |
| Dgraph | GraphQL-native, distributed, Go-based, open source | Community slowed a bit, doc quality mixed | Good if you want strongly typed, scalable queries |
| ArangoDB | Multi-model (graph + doc), good for mixed workloads | Less opinionated, so more to configure yourself | Could be ideal for hybrid doc/graph systems |
| PostgreSQL + edge tables + recursive CTEs | Familiar, stable, simple to shard | Complex traversals get expensive fast | Good if scope is tightly constrained |

### Hybrid Model Architecture

You may end up with:
- PostgreSQL (or Planetscale) as your core relational + version storage
- ArangoDB or Dgraph per team for graph ops
- Redis layer for cache of scopes, edge lookups, heat maps
- Search engine (Typesense, Meilisearch) for full-text + scoped artifact search

Each team has:
- Their own graph DB instance or partition
- Their own Redis namespace
- Their own artifact/version tables (logical partitioning)

---

## Additional Technical Implementation Details

### Generative UI with Vercel

With Vercel's Generative UI (now core to V0 and SDK), the model can stream React components directly (not just text or markdown).

This means your agent can respond with:
- `<Card><Prose>...</Prose></Card>`
- `<EditableArtifact code="..." onChange={...} />`
- Or any supported UI primitive, even custom ones you register.

### Component Registry Example

```js
// A registry of safe, editable primitives
const components = {
  EditableArtifact: ({ value, onChange }) => <YourEditor value={value} onChange={onChange} />,
  // ... other primitives
};

// Pass registry to your Vercel Generative UI streaming hook
const { componentTree } = useGenerativeUI({ model, components, ... });
```

### Local State Architecture

Your flow (AI generates, user edits locally, sync to server, AI can revise later) is fully compatible with Vercel Generative UI/v0 patterns.

There's nothing "special" in Generative UI you must do beyond registering your custom editable components and controlling edit state in React.

You're free to treat AI generations as "one-off renderings" and manage all state and edit logic client-side.

### Sync Hook Pseudo-logic

```js
// Pseudocode/hook logic for artifact lock
function useArtifactLock({ artifactId }) {
  const [lock, setLock] = useState(false);
  
  function handleFocus() {
    setLock(true); // Enter user lock
    abortModelStream(artifactId); // Stop any AI streaming
    syncLocalFromStore(artifactId); // Discard partial AI updates
  }
  
  function handleBlurOrSave() {
    setLock(false); // Release user lock
    syncStoreFromLocal(artifactId); // Save user changes
    // Model is now free to stream updates again
  }
  
  // Hook these up to onFocus/onBlur/onSave of your editor
}
```

### Edge Resolution API

```ts
Edges = {
  fromId: string,
  toId: string,
  type: 'child' | 'version' | 'linked-in' | ...
  createdAt: Date
}
```

Use recursive CTEs or a small graph library for traversal. But make sure:
- Edges are indexed by both fromId and toId
- You cap depth or edge fanout in traversal code
- You store artifact metadata separately and only join it in after scoping
- You can upgrade later to a full graph DB only if your patterns really require it

### Search Document Structure

```ts
SearchDoc = {
  artifactId,
  versionId,
  content,
  title,
  tags: [string],
  agentOrUser: string,
  timestamp: Date,
  workspaceId,
  parentId,
  lineage: [ancestorIds],
}
```

### Viewport Scoping Function

```ts
resolveSearchScope(viewport: ViewportSpec): ArtifactId[]
```

Where ViewportSpec could be:
- "Everything under artifact X"
- "Everything linked in pipeline Y"
- "Only visible nodes in the editor canvas"
- "All versions of artifact Z"

### Platform Hierarchy

| Layer | Purpose | User Focus |
|-------|---------|------------|
| AI Canvas (Web) | Writing + Research + Composition | Writers, planners, thinkers |
| Orchestration Engine | Agents + pipelines + prompts | All roles, shared primitives |
| Thick Client | Advanced editing, scripting, local agent tools | Coders, artists, advanced users |
| CLI / Dev tooling | Integration, testing, prototyping | Yourself, power users |

### Architecture Summary

You're not building "a tool that manages documents."
You're building a semantic operating graph for agent-augmented human creativity.
Everything else—editing, streaming, AI calls, UI—is view logic on top of that core.

Treat your document graph like:
- A database
- A query engine
- A version control system
- A permission model
- A semantic layer

You're building a knowledge substrate that supports human and machine co-creation—and once it's stable, it can scale to infinite workflows.
That's your platform moat. Everything else is just a surface on top of it.