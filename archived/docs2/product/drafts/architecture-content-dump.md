# Architecture Content Dump - Liminal Chat

This document is a comprehensive dump of ALL architecture-related content extracted from documentation files. Content is preserved verbatim with source file markers.

## FROM: /Users/leemoore/code/liminal-chat/docs/product/product-info-dump.md

### Composable UI Framework & Flow Canvas

A highly flexible "flow canvas" or "workbench" where users can intuitively arrange, combine, and connect both novel GenAI UI primitives (designed for Roundtable, Parallel Ideation, Iterative Refinement flows) and traditional UI elements (e.g., text editors, code viewers, file explorers, terminal emulators).
This allows users to construct bespoke, task-specific workspaces, fostering a seamless blend of new AI-driven interactions with established workflows.
The architecture should support dynamic layout adjustments and persistent workspace configurations.

### Inter-Component Communication Bus

A standardized protocol for different UI components and AI agents to exchange data and context reliably.

### Context Management & State

**Instructional Persistence:** A key differentiator is a state management system that goes beyond conversational context to include persistent user directives. The system must be able to track and consistently adhere to rules of engagement set by the user (e.g., interaction style, verbosity) across sessions. Our own interaction serves as a case study: the ability for the agent to maintain a 'nothing extra' communication style over many turns without repeated prompting is a direct result of this capability and a core requirement for building trust and effective collaboration.

**Architectural Pattern for Instructional Persistence:** A multi-pronged approach to injecting directives is required for robust behavior, especially in long contexts. This includes dual-injection strategies and forced behavioral loops.
  * **System Prompt Injection:** Core directives are injected at the beginning of the context (system prompt), preceding the conversational history, to establish them as foundational rules.
  * **Pre-Prompt Refresher:** To combat the "lost in the middle" problem where initial instructions lose potency over a long context window, the most critical directives can be re-injected or "refreshed" immediately *after* the conversational history but *before* the final user prompt. This ensures the agent's core instructions have maximum salience right before generation.
      * **Design Principle**: The art of an effective refresher is not just repetition, but the skillful selection and summarization of the most critical system prompt directives. It must provide "sufficient backreference" to the core rules to effectively reinforce the desired behavior without adding excessive token overhead.
  * **Forced Behavioral Loops:** Requiring an agent to perform a ritual, like an "Implementation Pause" stating its current mode and task, forces a moment of self-reflection and re-grounding before every action.
  * **Summary & Validation**: This combined architectural pattern of dual-injection and behavioral reinforcement has been empirically validated. The user confirmed it dramatically enhanced the stability of a Claude Code agent during heavy development, preventing it from 'losing track of itself' even deep into a 100k token context.
  * **Sophisticated Context Mechanisms:** The platform will require sophisticated mechanisms for providing relevant context to agents within each flow type, potentially drawing from project-wide artifacts, specific conversation threads, or user-selected context.

### Fusion of Desktop and Web

The platform's architecture embodies its name. It lives in the liminal space between a web app and a desktop app, using a Tauri shell to provide a native, multi-window canvas for web-based components. This creates a powerful fusion, combining the rapid iteration of the web with the deep integration of the desktop.

### Technical Strategy & Stack

#### Application Shell: Tauri Desktop Canvas

The ultimate vision for the user interface is a rich, desktop-native experience built with **Tauri**. This approach provides a hybrid model:

* **Component Factory (Next.js/Vercel):** The Next.js project serves as the primary development environment for creating, testing, and rapidly iterating on individual UI components and 'portlets' (e.g., the Roundtable view, Parallel Ideation panel, Agent Designer).
* **Composition Canvas (Tauri):** The Tauri application acts as the final container or 'shell'. It will render the web-based components and orchestrate them within a native desktop environment. This allows for advanced UI management, such as multi-window layouts, and provides the necessary access to local system resources, fulfilling the 'local-first' principle.

This strategy combines the velocity of a modern web stack for UI development with the power and integration of a native desktop application.

Reflecting a strategic pivot to maximize UI development velocity and align with the core product vision, the platform will be built on the full Vercel stack. This approach moves away from a custom, heavily scaffolded backend to a modern, integrated architecture designed for AI-powered generative UI.

### Core Components:

* **Framework:** Next.js (App Router) for its robust features, performance optimizations, and seamless integration with the Vercel ecosystem.
* **UI Foundation:** A combination of Tailwind CSS for utility-first styling and `shadcn/ui` for its library of accessible, unstyled, and composable components. This provides a solid and flexible base for both hand-crafted and AI-generated UI.
* **AI Integration:** The Vercel AI SDK (v3.0 and later) is central to the platform. It provides the tools for streaming text, and more importantly, for building **Generative UI**. This allows AI models to return structured, interactive UI components directly into the application.
* **Generative UI Engine:** The platform will leverage Vercel's `v0` composite model family programmatically. `v0` is specifically fine-tuned to generate high-quality, production-ready React components from prompts, adhering to best practices.

### Next Steps & Open Questions

#### Core Architectural Decision: Single-User vs. Multi-User

A fundamental strategic question remains open: should the platform be built from the ground up to support teams and multi-user collaboration, or should it be optimized for a single-user 'power tool' experience initially?

* **Argument for Multi-User Now:** Building in collaboration features (workspaces, roles, shared artifacts) from the start is architecturally sound, as adding them later is notoriously difficult and often requires a complete rewrite.
* **Argument for Single-User First:** Focusing on a single-user experience dramatically reduces complexity, accelerates MVP development, and allows for rapid iteration on the core co-creation workflows. The platform can be perfected as a personal power tool before tackling the challenges of collaboration.

This decision will have profound implications for the data model, authentication, and overall system architecture.

## FROM: /Users/leemoore/code/liminal-chat/docs/product/cascade_export_workaround.md

### Architecture: System Prompt for Persistent Behavior

To achieve persistent agent behavior, user-defined directives and rules of engagement should be injected at the beginning of the context window, before the conversational history. This 'system prompt' placement ensures the LLM treats the directives as foundational, high-priority rules for the entire interaction, which is more reliable than placing them later in the prompt where they might be influenced by more recent conversational turns. This is a key architectural insight for the user's platform.

### Architecture: 'Lost in the Middle' and Dual-Injection Solution

User identified a key failure mode in long-context LLMs: initial directives in the system prompt can be 'lost' or weakened by a large volume of intermediate context (the 'lost in the middle' problem). A proposed architectural solution is to re-inject or 'refresh' core directives immediately before the final user prompt, in addition to the initial system prompt. This ensures the agent's core instructions are reinforced and have high salience, combating the model's tendency to be swayed by more recent tokens. This dual-injection (start and end) is a key strategy for robust, persistent agent behavior. The user also noted that agents have a 'pleasing bias' and may not accurately report their own internal processes, making behavioral observation more reliable.

### Architecture: Tauri as the Richest UI Canvas

User specified that the richest version of the UI will be a Tauri-based desktop application. This application will act as a 'canvas' for composing and orchestrating the UI components and 'portlets' developed in the Next.js/Vercel project. This architecture allows for a native-like experience, multi-window management, and access to local system resources, reconciling the 'local-first' vision with a rapid web component development workflow.

### Strategic Dilemma: Single-User vs. Multi-User

User has identified a core strategic dilemma for the Liminal Flow platform: whether to build in team/multi-user support from the beginning or defer it. The user acknowledges that building it in now adds significant complexity, but bolting it on later is nearly impossible. This is a key architectural and product decision that needs to be resolved.

### Critical Anti-Pattern: Encrypted Local Data Prevents User Ownership

User discovered that Windsurf Cascade's local chat history is stored in an encrypted, binary format, making it impossible for users to access or export their own data directly. This is a critical, user-hostile anti-pattern. Liminal Flow must adopt the opposite principle of 'User Data Sovereignty,' ensuring that users can easily export their complete, un-truncated data in an open, human-readable format (e.g., Markdown, JSON). Local storage should be transparent, not locked down.

### Advanced prompt management

To mitigate 'lost in the middle' issues in long-context LLMs, core directives should also be re-injected as a 'pre-prompt refresher' immediately before the user prompt. This dual-injection strategy (system prompt and pre-prompt) helps maintain directive salience. Note: Agents may exhibit 'pleasing bias' and self-report unreliably; behavioral observation is more trustworthy for evaluating compliance.
  * Design principle: The art of an effective refresher is not just repetition, but skillful selection and summarization of the most critical system prompt directives, with sufficient backreference to reinforce the desired behavior efficiently.

### Architectural update

The richest version of the UI will be a Tauri-based desktop application that serves as a canvas for composing and orchestrating web-based UI components/portlets developed in the React/Next.js project. This hybrid approach enables a native-like, local-first experience while leveraging rapid web component iteration.

## FROM: /Users/leemoore/code/liminal-chat/docs/product/deeper-exploration-transcript.md

### Core Identity Role & Context Handling

Dave — **High-Level Strategist & Design Sanity Check**, an AI agent embedded in a liminal-flow creative environment.

Recognize and honor *artifact transience, team-level graph scoping, locking, and decay* as foundational concepts.

### Artifact Canvas and Versioning Systems

"Fragments" by E2B is the most polished, full-featured open-source project for an artifact-style canvas.

### Graph-based Document Persistence

Core document/artifact needs:
- Artifacts as structured objects
- Store each "draft," "chapter," or artifact as a structured object (e.g., JSON: { title, author, sections, diffs, metadata })—not just a text blob.
- Use the Vercel AI SDK's streamObject or similar to generate/fill these objects, not just render markdown.

### Agent abstraction layer

Represent each AI "agent" as a distinct entity with its own prompt, personality, and working memory/context.
Allow each agent to write to its own artifact, and potentially "read" the others' outputs for synthesis rounds.

### Specialized UI primitives

Cards for parallel drafts.
A "synthesis" view—side-by-side diffs, merge tools, "adopt passage" or "rewrite this part as X agent."
Inline editable artifacts (maybe Monaco Editor or rich text) with attribution: which part was last written/rewritten by which agent/human.

### Edit/request split

Explicit distinction between "human edit" and "AI request":
You can edit directly (with full undo/redo/version history).
Or, you can prompt an agent to "rewrite this paragraph" or "synthesize these 2 sections."
Agent edits can be presented as suggestions, tracked in diff/merge tools, or immediately applied (configurable).

### Version and merge tracking

Use CRDTs (conflict-free replicated data types), Yjs, or Automerge for versioning and collaborative editing primitives (these tools allow Google-Docs-like editing, and you can extend to track edits by agent).
Build a simple diff/snapshot system so you can see "what changed" and "who changed it."

### Streaming, live UI

Leverage streaming APIs for both AI generations and real-time document updates.
UI updates as soon as the agent starts responding, not just after completion.

### Generative UI Streaming: The Basics

With Vercel's Generative UI (now core to V0 and SDK), the model can stream React components directly (not just text or markdown).
This means your agent can respond with:
```
<Card><Prose>...</Prose></Card>
<EditableArtifact code="..." onChange={...} />
```
Or any supported UI primitive, even custom ones you register.

### Editable Artifacts: What's Possible via Generative UI

Out of the Box:
- Vercel/v0 includes a set of UI primitives (Cards, Prose, Tables, etc.)
- You can ask the model to "generate a code editor," "output this as a card with an edit button," or similar.

Editable Components:
- v0's primitives are not all editable by default (e.g., Prose is for display, not live editing).
- However, your own custom components (e.g., <EditableArtifact />, <MonacoEditor />, <RichTextEditor />) can be included in the model's generation palette if you register them.

Streaming & State:
- The model can stream a component tree, but it won't know the local UI state (what you're typing, cursor position, in-progress edits) unless you explicitly manage that state and sync back (e.g., through events or stateful hooks).

### Document Edit Architecture

Clear Separation of Concerns:
By swapping the entire component tree (read-only vs. edit-only), you get a hard reset of local state and React hooks. This prevents issues like stale state or "leaked" edits when toggling between modes.

Lifecycle Hooks:
Unmounting one and mounting the other guarantees you can use useEffect's cleanup logic, and ensures all child component state is reset, including refs, editors, or local stores.

Easy to Trigger Sync/Cleanup:
You have a single, clear "event" (mount/unmount or a mode flag) to persist, discard, or reset state when switching modes.

### Local State Management for Editable Artifacts

When user hits "edit" → component switches to local edit mode
All state is local (React state, optionally persisted locally)
Edits are only pushed to the server at save/interval (not in real time with every keystroke unless you want to)
Any AI-assisted rewrite/edit is a new prompt, which generates a new component or replaces the artifact contents

Clear Boundaries:
- AI generates artifacts and suggestions
- User controls editing, local state, and merge decisions
- Server persists canonical version

### Core Architecture for Multi-User Editing

#### Unified Active Edit Lock: The Simple Rule
- At any time, an artifact (or section) can be "actively edited" by one editor: either a user or a model/agent.
- Whoever holds the lock—user or AI—gets to finish their editing turn before anyone else (human or agent) can take over.
- No one else (besides possibly the owner/admin) can "break" the lock; they must request or wait.

Implementation: Artifact State Example
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

When someone/agent wants to edit:
- Check if activeEditor is null.
- If yes, set to self and proceed.
- If not, show message or queue request.

When done:
- On save/finish, set activeEditor back to null.
- Next queued editor/agent can proceed.

### Multi-User Architecture Patterns

#### Soft Locking ("Presence" & "Editing" Warnings)
When anyone starts editing, everyone else sees:
- "Alice is editing this section"
- Input fields/areas are read-only for others, or at least warn: "Edits will overwrite Alice's changes."
- If the owner clicks "override," you prompt: "Doing this will discard Bob's changes—are you sure?"

#### "Last Write Wins" or Manual Merge
If two people edit at once, you can:
- Reject the second edit ("Please reload, new changes have arrived")
- Or let them save, but show a diff/merge screen to resolve conflicts (this can be basic at first).

#### Comment/Request Changes Flow
If a non-owner wants to edit while the owner is working, let them "request changes" or "leave comments" that the owner can accept/merge.
This keeps control clear and reduces accidental overwrites.

#### Multi-Agent = Multi-User
If your app already treats agents (AIs) as "collaborators," extend that presence model to humans—everyone's edits are tracked and labeled.

### How To "Keep the Door Open" Architecturally

- Artifacts have an owner, but also a list of "active editors" (human or AI).
- Store a session-level editing state: `{ artifactId, ownerId, activeEditors: [userId], lastEditTimestamp, ... }`
- Build your edit locks/checks to use a userId, not just a boolean.
- Show presence in the UI ("Bob is editing").
- Any edit action checks: "Is someone else already editing?" If yes, disable or warn.
- Sync this state in real-time (use something like Ably, Pusher, Socket.IO, or even Firebase/Firestore presence features).

### Desktop vs Web Architecture

#### Tauri (or Electron) with React for UI Primitives

Great stack for power users:
- Tauri is lightweight, secure, and cross-platform.
- React for component system, testing, and storybook-style development.
- Monaco/CodeMirror for pro editing (VS Code is open source—you can bring over lots of its editing primitives).

Canvas-like composition:
- Build and test all primitives in pure React (Storybook, Vitest, etc.).
- Compose them into flows/canvases inside the Tauri/Electron app shell.
- You can even ship a "headless" version for backend/batch/CLI use.

#### Web-First vs Desktop-First Considerations

Modern Web is Good… But:
You can build very rich web apps (see StackBlitz, Codesandbox, or VS Code for Web), but true local file access and fast, unrestricted scripting is still not as robust as native/Electron/Tauri.

Browser Limits:
File System Access API (via browser) is getting better, but is still limited and not universal. No deep OS access, no "true" scripting outside sandbox.

Real-World Model:
Tools like Obsidian and Notion go "desktop-first" for power users, then offer web clients for convenience/light use, with feature differences.

#### Leave Door Open for Web Later

You can build primitives in a way that lets you launch a web client later:
- Stick to cross-platform UI primitives (React/Monaco, not Node-only APIs).
- Abstract away file system calls (so you can polyfill with browser APIs if needed).
- Build your data model and "artifact store" logic to be backend-agnostic (local file, server, or browser localStorage).

But:
- Don't force yourself to support web at the cost of power in the thick client.
- If you go desktop-first, don't worry about web until you've got a critical mass of users and feedback.

### Server/Backend Architecture

Keep it lean and focused:
- Fastify/Nest for high-speed endpoints.
- Vercel endpoints for UI/LLM flows if needed.
- Minimal database and sync logic for user/auth, artifact store, and edit state.
- All heavy lifting (generation, editing, multi-agent flows) happens on demand, triggered by the client.

### Multi-Agent System Architecture

3 Core primitives I need to build:

1. **Parallel agent output** - That will be one of the key ones
2. **Serial agent pipeline** that you can go straight through or iterate through
3. **Roundtable UI chat** - run a chat with up to five models

This is where you run a chat with up to five models, and then every time you send a message, you address one or more of the chatbots. So you can have one agent, and you can ask them a question, and they can respond, and so you would do that with something like, if the agent is Bob the Builder, then you ask at Bob the Builder a thing, and with the ats and but roughs of that, Bob the Builder responds, and then you could say, at Larry the Architect, what do you think of what Bob said? Or at Larry the Architect, and Jake the Security Advisor, what do you think of Bob's suggestions? And then they both respond, and you're like, oh, that's interesting. Let me route Jake's response back to Larry. And so you can just use simple chat tags, and normal English instructions to route, and you'll probably have a small model like 4.1 Mini or Flash Mini that will quickly read your stuff, and use the combination of at stuff, and the actual directions you gave to make the call as to which model will get that.

### Graph-Based Document Persistence Architecture

#### Core Insight: You Need a Server-Based Artifact Graph

You're moving toward an architecture where:
- Every document/artifact is a node in a global store
- Relationships between artifacts are edges (e.g. "child of", "synthesized from", "linked in view", etc.)
- Users and agents can build dynamic "views" on top of that graph—some strict (like folder structures), some flexible (like filtered outlines or workboards)

This isn't a file system. It's a semantic, versioned, multi-agent-aware artifact graph, and it forms the creative spine of your product.

#### A universal document identity scheme

Every artifact needs a stable ID, even if it's being edited locally. Server must be the source of truth:
```ts
{ 
  id: string, 
  type: 'text' | 'outline' | 'tasklist' | 'code' | ..., 
  title: string, 
  latestVersionId: string, 
  createdAt, 
  updatedAt, 
  etc. 
}
```
You could store this in a database like PostgreSQL with UUIDs and make every front-end artifact just a live proxy of this.

#### A version chain or DAG per artifact

Each artifact's version history is linear (or possibly forked). You don't need Git complexity, but you do need:
- Parent pointer
- Metadata (who/what made it, why)
- Content snapshot (or delta, if you want to optimize later)

#### A relational graph or edge store

To store and query semantic relationships like:
- "is child of"
- "was derived from"
- "includes fragment of"
- "appears in view X"
- "tagged as chapter1"

This could be:
- A dedicated graph DB like Neo4j (overkill for most)
- A simple edge table in SQL:
```ts
Edge = { 
  fromId: string, 
  toId: string, 
  relation: 'child' | 'reference' | 'linked-in-view' | ... 
}
```

#### Views as composable, sharable, queryable slices

A "view" is just a set of artifacts with logic attached:
- "All children of X"
- "All artifacts with tag Y, sorted by time"
- "The pipeline for artifact Z"
- "Everything in Workspace Alpha, nested by hierarchy"

Views could be saved queries, JSON descriptors, or even lightweight DSL snippets if needed later.

### Document Management and Versioning System

#### Artifacts Must Have a Persistent Identity

Every artifact (a paragraph, a draft, a chapter, a code module) should be addressable and traceable.
At minimum:
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
Think of Artifact as the document, and Version as a snapshot of its state over time.

#### Versioning System: Light Git for Artifacts

You don't need full Git internals, but you want:
- A history of edits
- A way to "name"/tag versions (e.g. Initial Draft, Synthesized from v3 + v4)
- Support for branching if needed later

Version:
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

Saving = new version
Editing = create a new draft version that may become currentVersion

#### Indexing: Folders/Flows/Groups

You'll need a light "document tree" or "artifact registry" that tells you:
- What artifacts are in this flow?
- What kind of artifacts they are (draft, review, outline, etc)
- What's their current status?

Think Notion database, or even a simplified file system:
```ts
Workspace = { 
  id: string, 
  title: string, 
  artifactIds: string[], 
  createdAt: Date, 
  tags: string[], 
}
```

#### Locking: Tie to Editing Rules

You already have a strong locking model ("only one active editor at a time, human or agent"). Now:
Store lock state per artifact or section:
```ts
Lock = { 
  artifactId: string, 
  editor: { type: 'user' | 'agent', id: string }, 
  startedAt: Date, 
  expiresAt?: Date, 
}
```
Agent or human requests lock before editing
Lock drops when save/cancel/blur happens

#### Lineage: Make the Flow Traceable

Every AI-generated artifact should be able to say:
- What did I come from?
- Who/what made me?
- What was the context or prompt?

This is crucial for:
- Synthesis tracing
- Version comparison
- Trust ("What changed and why?")

#### Status Metadata (Optional but Useful)

You may also want to assign status flags:
```ts
ArtifactStatus = 'draft' | 'ready-for-review' | 'approved' | 'archived' | 'trash'
```

### Full-Text Search Architecture with Graph-Aware Scoping

#### Core Capabilities You Need

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
   - That means:
     - Build a resolver for artifact scopes that returns a list of IDs
     - Feed those IDs to your search engine as a filter
     - e.g., WHERE artifact_id IN (...)

3. **Search relevance control**
   - Search within "title > tags > content > author > meta"
   - Boost results from:
     - activeEditor
     - recently modified
     - in current viewport
     - user favorites

#### Index structure

For each searchable document:
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

#### Viewport Scoping

This is what makes your search feel intelligent.
Define a function like:
```ts
resolveSearchScope(viewport: ViewportSpec): ArtifactId[]
```
Where ViewportSpec could be:
- "Everything under artifact X"
- "Everything linked in pipeline Y"
- "Only visible nodes in the editor canvas"
- "All versions of artifact Z"

You pass those IDs to your search index filter.

### Team Size and Write Optimization Architecture

#### Core element of making this optimizable

Making some good limits early in team size. Because we can't just be read optimized. We have to be write optimized as well so we need very fast ways scope down the graph before we start traversing it to find or add new edges.

#### Why Team Size Matters

- Concurrency explodes graph writes
  - More collaborators = more potential for overlapping edits, edge creation, lineage forks, and view conflicts.
- Each user = their own write pattern
  - Agents write fast and often. Humans write slowly but unpredictably. Multiple agents = exponential edge fanout unless scoped.

So if you allow unbounded collaboration, but haven't scoped how wide any write domain can reach, your graph goes hot in unpredictable ways.

#### Strategic Constraints to Bake In Now

✅ 1. Team size + session scope
- Limit active users per flow (e.g. 1–3 writers + N agents)
- Limit concurrent active editors per document
- Session-bound agent runs (e.g. "This synthesis job only touches 5 parallel nodes")

This gives you predictable write surfaces for each flow, which lets you shard indexing, edge updates, or caching effectively.

✅ 2. Traversal scoping before write
All agents or users must resolve a local write scope before adding links/edges:
- e.g. resolveWritableScope('artifact-42') → [id1, id2, id3]
- Then proposeEdge(id2 → newNode)

This ensures you never traverse the global graph to decide if a write is valid or deduplicated.

✅ 3. Write batching and edge bucketing
When writing 10 new edges (e.g. synth from 5 docs), bucket them under a single write operation ID or batch timestamp.
You can then:
- Version-edge diff later
- Rollback batch
- Audit graph writes per operation

✅ 4. Local "edit zone" cap per flow

Example:
An agent can only create new nodes that are:
- Direct children of the focus node
- Versions of a known draft
- Tagged by the current flow

No "create 100 edges from arbitrary places" unless flagged as system-wide.

### Why 1–3 Is the Sweet Spot in Agent-Augmented Teams

1. AI scales individual output massively
   - One human plus five agents is already a small creative swarm.
   - Two humans with agents can rival a traditional five-person team in throughput.

2. Coordination becomes the bottleneck, not productivity
   - At 4+ active humans with agents each, you're not just managing creative output—you're managing:
     - Locking collisions
     - Graph pollution
     - Edit ownership fights
     - Agent memory crosstalk
     - Scoped vs global change propagation
   - Your performance degrades not because of system limits, but because of cognitive and semantic clutter.

3. Small teams allow shared mental model
   - Three people can still maintain shared context and narrative over what's being built or written.
   - Beyond that, it fractures—even more so when everyone is prompting agents simultaneously.

4. AI replaces coordination layers
   - Traditional team scaling is about hierarchy and delegation.
   - AI-native scaling is about agent composition, not people composition.

### Design Principle Emerging Here

Workspaces are units of flow, not units of organization.

That means:
- A company might have 100 people.
- But a flowspace (i.e., a collaborative workspace inside your app) is best optimized for 1–3 concurrent humans + N agents.
- Flowspaces scale by parallelism, not people.

You scale horizontally:
- A product team might have one flowspace for writing docs, another for release notes, another for research.
- You don't scale vertically by adding more people to a single, shared document space.

### Document Transience as a First-Class Property

#### Why This Transience Model Is So Important

✅ 1. Agent-first systems generate way more state
- AI tools generate far more drafts, rewrites, outlines, and fragments than any human team ever would.
- These outputs aren't worthless, but most aren't worth preserving indefinitely.
- But you can't treat them all equally either.

✅ 2. Traditional "createdAt"/"modifiedAt" timestamps aren't enough
Whether something should stick around isn't just about age or edit history—it's about:
- Was it touched again?
- Was it used in synthesis?
- Did a human interact with it?
- Was it ever shared or viewed again?

✅ 3. Without decay, your graph will slow to a crawl
A bloated, unpruned graph:
- Becomes hard to traverse
- Pollutes agent context resolution
- Breaks search relevance
- Slows serialization and indexing
- Clutters UI surfaces

#### Artifact Lifecycle Classification

Your instincts suggest a tiered model like this:

| Tier | Type | Description |
|------|------|-------------|
| Live | Primary artifacts | Active, signed-off, owned, or in-edit |
| Touched Transients | Semi-stable | Drafts with user edits or included in synth |
| Untouched Transients | Raw generations | Not viewed, used, or edited after generation |
| Archived | Cold storage | Auto-migrated or user-archived |
| Ephemeral | Temp/scratch | Auto-purged after TTL (e.g. within-session generations) |

This gives you:
- Smarter garbage collection
- Agent prioritization for search
- Optimized rendering & traversal
- User-facing clarity (what's active vs. what's fading)

#### Product Behaviors That Fall Out of This

✅ Auto-decay engine
- "If untouched for 14 days and not used in any synth, mark as archive_candidate."
- "If used by user but now out of flow, mark as semi_transient and deprioritize."

✅ Decayed artifacts live in slower, cheaper lanes
- Archive tier can be stored in slower DB partitions, or just excluded from normal traversal/search unless explicitly rehydrated.

✅ Agent behavior respects lifecycle class
- Agents prefer live + touched transients
- Can include archives only if explicitly scoped

✅ UI hints at document vitality
You can show subtle "fading" or "gray-out" or badge for fading artifacts:
- "Draft v2, unused since June 2 — archived in 3 days"

### Graph Database Landscape and Team-Level Sharding

#### Graph DB Options (2024–2025 Reality Check)

| Graph DB | Strengths | Weaknesses | Suitability |
|----------|-----------|------------|-------------|
| Neo4j | Mature, Cypher query language, strong ecosystem | Heavy infra, less flexible with custom logic, $$$ at scale | Viable for production, but might feel rigid |
| Dgraph | GraphQL-native, distributed, Go-based, open source | Community slowed a bit, doc quality mixed | Good if you want strongly typed, scalable queries |
| TigerGraph | Fast for large-scale traversal, strong enterprise focus | Enterprise-y, not lightweight | Great for big-data analytics, but maybe too bulky |
| ArangoDB | Multi-model (graph + doc), good for mixed workloads | Less opinionated, so more to configure yourself | Could be ideal for hybrid doc/graph systems |
| TerminusDB | Designed for collaborative knowledge graphs, versioned | Niche, early-stage feel | Interesting for your artifact/version lineage use case |
| PostgreSQL + edge tables + recursive CTEs | Familiar, stable, simple to shard | Complex traversals get expensive fast | Good if scope is tightly constrained |
| Weaviate / Neo4j + vector hybrid | Vector-aware graph queries for semantic search | Vector-first, less on fine-grained edges | Better for retrieval than write-heavy workflows |

#### Team-Level Graph DB Instances: Smart Default

Assuming your SaaS is multi-tenant, team-level isolation gives you:

| Benefit | Reason |
|---------|--------|
| Performance | Graph size remains bounded to active team scope |
| Security | No accidental cross-team access |
| Scalability | Can scale teams independently (vertical or horizontal) |
| Migration | Can move, backup, archive individual teams |
| Decay policies | You can apply per-team decay behavior |
| Simplified caching | Team-level Redis scopes are clean and bounded |

Even if you later unify under a multi-tenant graph cluster, starting with per-team graph partitions makes your complexity predictable.

#### Hybrid Model to Consider

You may end up with:
- PostgreSQL (or Planetscale) as your core relational + version storage
- ArangoDB or Dgraph per team for graph ops
- Redis layer for cache of scopes, edge lookups, heat maps
- Search engine (Typesense, Meilisearch) for full-text + scoped artifact search

Each team has:
- Their own graph DB instance or partition
- Their own Redis namespace
- Their own artifact/version tables (logical partitioning)

### Redis Caching Architecture

And yes, Redis (or a similar in-memory store) will be vital for:
- Storing recently traversed scopes
- Precomputed ancestor/descendant sets
- Artifact "heat" (i.e. live vs. cold)

### Critical Infrastructure Risk

Graph-query bottlenecks and unscoped, brute-force full-text search.

If your graph resolution and search layer doesn't scale, nothing else matters.

#### Why This Risk Is So Dangerous

- Hard to retrofit: Once documents, relationships, and views are baked into the system, rewriting their lineage and identity structure is a data migration nightmare.
- Graph explosion is nonlinear: A user with 10 active documents can still create 300+ nodes and edges if you include drafts, versions, related notes, agent outputs, links, etc.
- Compound queries sneak up: A simple prompt like "Summarize everything we know about Chapter 3" may trigger:
  - subgraph traversal,
  - time-range filtering,
  - multiple version lookups,
  - and full-text scan in each artifact—all in one agent call.
- Agent-driven systems always search too much by default, unless you explicitly gate their input graphs.

#### How to De-risk This Now (Strategic Moves, Not Overbuilds)

1. Treat the artifact graph as a first-class queryable store
   - Think of the graph not as a UX helper but as your core database structure.
   - This doesn't mean you must use Neo4j—but it does mean:
     - Use a clean Artifacts, Edges, Versions schema
     - Build a tight abstraction around subgraph traversal + view resolution so you can optimize that path without rewriting the world

2. Scope resolution must be fast, composable, and cacheable
   - You will call things like:
     - getDescendants(artifactId, type='text')
     - getLatestVersions(artifactIds[])
     - getAllInPipeline(pipelineId)
   - These must be:
     - Composable (you can layer scopes)
     - Cacheable (you can reuse results)
     - Interruptible (you can stream results in order of recency or priority)
   - Design for streamed, scoped, cached views early—even if you fake them first.

3. Make full-text search indexable only over resolved IDs
   - Never search the whole corpus. Always resolve a scoped Set<ArtifactId> first, then hand that to the search engine.
   - This lets your text search scale independently of the full graph size.
   - If your search infra supports filter_by_ids (Typesense, MeiliSearch, even Postgres), this is easy to enforce.

4. Put observability around traversal/query depth early
   - Log query depth, resolved node count, and edge fanout for all scope calls.
   - This lets you surface:
     - "This user's workspace is blowing up"
     - "This graph pattern creates huge unintended subgraphs"
     - "This agent search path is hitting 20x more nodes than it should"

### Strategic Summary: Graph as Core Infrastructure

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

### Agent Access to Graph Infrastructure

Graph-based persistence is as core as object primitive persistence in most apps. And all agents need fast easy access to a scalable bulletproof system that can optimize the graph complexity behind simple fast well functioning api and aggregated into mcp and model function calling tooling.

#### APIs must flatten graph complexity

For both agents and front-end logic, you need:
- getArtifactWithContext(id)
- getDescendantsOf(id, type='text')
- getParallelDraftsOf(id)
- getEditableNodesInView(viewId)

The API should return flat, resolved slices of the graph—ready for reasoning or rendering—not force the consumer to do traversal.

#### MCP (Multi-Agent Control Plane) and function calling must speak the graph natively

Your agents will eventually call:
- get_context('current_workflow')
- find_related_versions(artifactId)
- get_tagged('#research')

This means your function-calling layer and MCP need to plug directly into a graph-resolving layer:
- Efficient
- Role-aware
- Scope-constrained

Think: GraphQL, but optimized for AI workflows, with privilege and prompt constraints baked in.

#### Graph = Structure; Object Store = Content

Your app will thrive only if both layers are clear and performant:

| Layer | Purpose |
|-------|---------|
| Graph layer | Relationship traversal, semantic context, lineage, subgraphs |
| Object/content layer | Versioned content (text/code), locked edits, prompt metadata |

Agents need graph → content projection constantly. That's the dominant access pattern.

## Additional Architecture Notes

The platform is designed to handle:
- Generative UI with streaming components
- Multi-agent orchestration with up to 5 agents per session
- Parallel content generation and synthesis workflows
- Serial pipeline processing with agent handoffs
- Real-time collaborative editing with proper locking mechanisms
- Graph-based document persistence with team-level sharding
- Transient artifact lifecycle management with automatic decay
- Fast text search with graph-aware scoping
- Redis caching for performance optimization
- Integration with external systems (JIRA, Linear, etc.)
- BYOK (Bring Your Own Key) model integration
- Desktop-first architecture with web capabilities via Tauri

The system prioritizes:
- Small team collaboration (1-3 active users per workspace)
- Write optimization alongside read performance
- Agent-aware document lifecycle management
- Semantic graph operations over traditional file systems
- Developer-friendly APIs and tooling
- Iterative development with expectation of rewrites
- Clear separation between structure (graph) and content (artifacts)

## Additional Architecture Content from Deeper Exploration Transcript

### Graph Database Selection (Final Recommendation)

FROM: /Users/leemoore/code/liminal-chat/docs/product/deeper-exploration-transcript.md

🧩 Recommended Pick (for your mindset and goals)

🥇 Dgraph
- It's lightweight, very fast to spin up, open-source, with a familiar GraphQL-based query interface.
- You can quickly model:
  - Artifacts
  - Versions
  - Edges
  - Agent actions
- You'll start to feel the pressure points just as you scale past toy flows—perfect timing to prepare for refactor #1.
- Dgraph is to Graph as SQLite is to SQL: the easiest usable entry point, with enough power to fail gracefully when it needs to.

### Key System Architecture Clarifications

FROM: /Users/leemoore/code/liminal-chat/docs/product/deeper-exploration-transcript.md

The system is composed of three distinct and cleanly separated layers:

1. **The Agent Layer (A Core Domain Primitive)**. Agents are not just prompts; they are persistent, first-class actors in your domain. They have identity, state, and a toolbox for search, document manipulation, and external integrations. They are the primary force for creation and modification within the system.

2. **The Artifact Layer (Not Graph Layer)**. The graph database is not the entire system. Its role is specific and vital: to solve the "document relationship problem." It is the specialized backend layer responsible for managing the identity, versioning, lineage, and—critically—the transience and decay of the massive number of artifacts generated by agent-driven workflows. It is the librarian and quartermaster, not the architect.

3. **The UI Component Layer (Novel Interaction Primitives)**. This is where your core invention for the user experience lies. The Parallel Generator, Serial Pipeline, and Roundtable Chat are not database schemas; they are archetypal UI patterns—the "portlets" or "microviews" of an AI-native application. They are the stages upon which users direct agents to interact with artifacts.

### Agent-Orchestration Integration Pattern

FROM: /Users/leemoore/code/liminal-chat/docs/product/deeper-exploration-transcript.md

Your Agent object invokes the Vercel orchestration process as one of its methods.

When a request hits your agent endpoint (e.g., /api/agent/edwin-researcher/chat), your system loads the edwin-researcher Agent primitive. That Agent then calls the Vercel SDK's orchestration loop, providing its own specific context, tools, and goals for that particular task. The Vercel SDK handles the turn-by-turn mechanics of the process (LLM -> tool -> LLM...) and returns the final result to your Agent. Your Agent can then perform any post-processing or state updates before the final response is sent.

The Vercel orchestrator becomes a powerful, generic process engine in your Agent's toolbox. It handles the mechanics of a single task, while your Agent primitive remains the high-level, stateful entity that decides what task to run and why.

### API Design Pattern for Agent Integration

FROM: /Users/leemoore/code/liminal-chat/docs/product/deeper-exploration-transcript.md

The power of this pattern comes from API signature compatibility. By ensuring your custom agent endpoints (/api/agent/...) respect the same input/output schema as the standard Vercel endpoints (/api/chat), you make your Agent Layer a "drop-in" replacement.

The strategic result is that your UI layer remains simple and agnostic. It can use off-the-shelf Vercel hooks like useChat to communicate with either a basic LLM or a complex, stateful agent, without any change to the frontend code. You gain the power of your custom agent layer without sacrificing the velocity and simplicity of the Vercel frontend toolkit. The complexity is encapsulated entirely on the server, where it belongs.

### Server-First Architecture Decision

FROM: /Users/leemoore/code/liminal-chat/docs/product/deeper-exploration-transcript.md

The architectural pattern you've defined—stateful Agent primitives orchestrating server-side AI SDK processes—is fundamentally a server-centric model. It assumes the "brain" of the system (the Agent and Orchestration layers) lives on the server. Any client, whether a web browser or a desktop application, acts as a "thin client" responsible for presentation and user input, but dependent on the server for all core agentic functionality.

### User Persona and Product Philosophy

FROM: /Users/leemoore/code/liminal-chat/docs/product/deeper-exploration-transcript.md

You are choosing to trade execution velocity for cognitive velocity.

Execution Velocity is the millisecond-level responsiveness of a traditional IDE, optimized for a user whose hands are trying to keep up with a pre-defined plan.

Cognitive Velocity is the speed at which a user can explore, synthesize, and direct complex work. The bottleneck is not typing, but thinking, researching, and iterating on ideas.

Your architecture—with its managed, server-side Artifact Layer—is built for this second type of user. The minor latency of a networked system is an acceptable trade-off for the immense power of agent-driven research, generation, and synthesis. You are building a tool for strategists and creators, not just for high-speed executors.

### Two-Tiered Adoption Model

FROM: /Users/leemoore/code/liminal-chat/docs/product/deeper-exploration-transcript.md

The On-Ramp: The "archetypal flows" for research, writing, and planning serve the broad audience. They are the simple, powerful applications built on your core primitives.

The Deep End: The "elaborated, subclassed flows" serve your core power user—the synergistic, deliberative creative. These are the specialized, high-value solutions that demonstrate the platform's full depth.

This strategy reinforces the need for a highly composable architecture. Your core primitives (Agents, the Artifact Layer, UI components) must be designed not just to enable specific flows, but to be flexible building blocks that can be recombined—by you or eventually by your users—to create new and more specialized workflows.

### Asymmetric Client Strategy

FROM: /Users/leemoore/code/liminal-chat/docs/product/deeper-exploration-transcript.md

You are defining an asymmetric client strategy, where each client has a distinct and complementary role:

The Web App serves as the primary "System of Record." It is the home for the rich, agent-driven Artifact Layer and is optimized for the cognitive velocity we discussed.

The Desktop App serves as a high-speed "local file handler" or "drafting surface." It is optimized for execution velocity on local tasks, acting as a lightweight companion to the core web experience.

This approach significantly de-risks your roadmap. You avoid the immense complexity of creating a portable, offline-first version of your entire server-side architecture. Instead, you are letting each platform play to its strengths, creating a clear purpose for both the web and desktop experiences without forcing them into a feature-for-feature parity they do not need.

### Orchestration Data Structure and Lifecycle

FROM: /Users/leemoore/code/liminal-chat/docs/product/deeper-exploration-transcript.md

The Data Structure:
The core data structure is a sequential message array, which represents the complete, ordered state of the conversation. Each object in the array is a node with a defined role and content. The integrity of this array is what enables the LLM to understand the full context of the task.

The key message roles are:
- user: Represents the initial goal or subsequent input from the human or the calling process.
- assistant: Represents the LLM's output. Critically, this message can contain either a final text response or a structured request to execute one or more tools.
- tool: Represents the result of a tool's execution. It is explicitly linked to the assistant's request and its content is the data returned by the tool.

This array is the transactional log that is passed to the LLM on every turn.

The Lifecycle of the Loop:
1. Initiation: The loop begins when your Agent primitive initiates a call, providing the initial user message and a set of available tools to the orchestration process.
2. LLM Turn: The orchestrator sends the current message array to the LLM. The LLM responds with an assistant message.
3. Branching: The orchestrator inspects the assistant message.
   - If it contains only text content, the goal is considered met. The loop terminates, and this final message is returned to your Agent primitive.
   - If it contains tool-call requests, the loop continues to the next step.
4. Tool Execution: The orchestrator invokes the specified server-side functions with the arguments provided by the LLM.
5. State Update: The output of each tool execution is packaged into a new tool message. This message is appended to the message array, creating an updated history.
6. Recursion: The orchestrator sends the entire, updated message array back to the LLM, returning to Step 2.

This process repeats until a termination condition is met, which is typically the LLM providing a final text answer or a predefined step limit (maxSteps) being exceeded to prevent runaway execution.

### Key Architecture Interfaces

FROM: /Users/leemoore/code/liminal-chat/docs/product/deeper-exploration-transcript.md

With this clarified three-layer architecture, the next pressure points are not gaps within the layers themselves, but rather in the interfaces between them. The critical questions now concern the contracts that connect these distinct parts of the system:

The Agent-Graph Interface. What is the precise API the Agent primitive uses to query and manipulate the artifact graph? It will need clear, efficient functions for scoped search, artifact creation with lineage, and versioning. This API defines how an agent perceives and acts upon the artifact world.

The UI-Agent Interface. How do your UI Primitives orchestrate the Agent Layer? When a Roundtable component invokes three agents, what does that control plane look like? How are responses streamed, attributed, and managed? This interface defines how the user directs the system's actors.

The UI-Graph Interface. How do the UI Primitives query the graph to render the correct view of artifacts? How do they communicate state changes like locking or manual archiving back to the graph substrate? This API is the bridge between user perception and data persistence.

### Agent Lifecycle Considerations

FROM: /Users/leemoore/code/liminal-chat/docs/product/deeper-exploration-transcript.md

Agent Lifecycle and Provenance. We have defined what an agent is—a first-class domain primitive. We have not defined its lifecycle. If agents are as important as the artifacts they create, they need a management model.
- How are agents created, versioned, and permissioned?
- Can a user "fork" a base agent to create a customized version for their own workspace?
- How is an agent's toolset provisioned and audited? Without a clear model, agents risk becoming powerful but brittle black boxes.

Cross-Flow Composition. The architecture correctly isolates workflows into team-level graph scopes for performance and sanity. The next logical challenge is composition.
- How do artifacts move or get referenced between these isolated scopes?
- If a research artifact from "Flow A" is needed to start "Flow B," is it copied, linked, or published to a shared space?
- Without a defined mechanism for cross-flow artifact mobility, your system could become a collection of powerful but disconnected silos.

The Orchestration Layer. For your core UI primitives like the "Serial Pipeline," the orchestration logic is still implicit. We know an artifact moves from an "editor" agent to a "polisher" agent, but the "who-drives-the-bus" question is unanswered.
- What component is responsible for advancing the state of a multi-step workflow? Is it the UI client, a dedicated server-side orchestrator, or do agents trigger the next step themselves?
- Defining where this orchestration logic lives is critical for managing state, handling failures, and providing users with a coherent view of their long-running processes.