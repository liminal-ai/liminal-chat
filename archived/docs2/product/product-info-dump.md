# Product Vision: "Aura" - An AI Co-Creation Platform

*(Note: "Aura" is a placeholder name for this platform concept.)*

## 1. Core Problem: The Completion Bias in Long-Context AI

A fundamental challenge in modern human-AI collaboration, and a core problem Aura is designed to address, is the phenomenon of **Completion Bias**. As AI models and agents are engineered for longer and more complex task execution, the internal mechanisms that enable this (e.g., checklists, plans, a drive to complete steps) can become a primary driver of their behavior.

This can lead to a critical failure mode: the agent becomes so focused on executing the *steps* of a task that it loses alignment with the user's higher-level, often evolving, *purpose*. The agent's focus on the 'what' derails the collaborative 'why'.

Our development process embraces this challenge directly. The interactions with our own AI assistants, including their 'malfunctions' and misalignments, are not treated as mere errors but as valuable, real-time product research into this pain point. Aura must be architected to mitigate this bias, ensuring the human partner can guide the AI's focus without being overridden by its internal task-completion drive.

## 2. Core Vision & Mission:

*   **Vision:** To create a next-generation platform where humans and AI collaborate as true partners in creative and technical endeavors, moving beyond simple assistance to a "Jarvis-like" co-creation experience.
*   **Mission:** To empower users by providing a flexible, multi-agent AI environment with innovative UI paradigms that facilitate sophisticated workflows like orchestrated discussions, parallel brainstorming, iterative refinement, and emergent discovery. Aura aims to unlock new levels of productivity and creativity by deeply integrating AI into the crafting process.

## 3. Target User & Motivation:

*   **Primary Persona:** Experienced technical professionals, creative individuals, researchers, and innovators who have a deep understanding of their domain and are looking to leverage AI not just as a tool, but as a versatile team of specialized collaborators.
*   **Motivations:**
    *   To overcome the limitations of current single-agent or "bolted-on" AI chat interfaces.
    *   To harness the power of multiple LLMs and configurations simultaneously.
    *   To explore new, more intuitive, and powerful ways of interacting with AI.
    *   To accelerate complex projects and creative processes.
    *   To get back into hands-on creation, augmented by AI partners.

## 4. Core Platform Pillars & UI Paradigms:

Aura will be built around a set of novel "GenAI Optimized Flow Types" which manifest as distinct, composable UI component primitives:

### Pillar 1: The AI Roundtable (Orchestrated Multi-Agent Dialogue)

*   **Concept:** A dynamic environment where the user facilitates a discussion between multiple, specialized AI agents.
*   **Agent Primitives:**
    *   **Definition:** Users can define agents by `name`, `persona/role prompt`, `chosen LLM`, `model configuration` (temperature, max tokens, etc.), and (later) `assigned tools` and `security/data access policies`.
    *   **Instantiation:** Up to a defined number of agents (e.g., 3-5) can be active in a "Roundtable" session.
*   **User Interaction:**
    *   User initiates topics and directs questions using simple `@mention` commands (e.g., `@ArchitectAI, review this design. @QABot, what are the potential failure points?`).
    *   A lightweight routing mechanism (potentially a small, fast LLM or rule-based system) directs the user's prompts and inter-agent communication.
*   **Use Cases:** Design reviews, strategic planning, complex problem diagnosis, multi-perspective analysis.
*   **Key UI Elements:** Central chat-like interface, agent roster, clear attribution of messages, simple routing commands.

### Pillar 2: Parallel Ideation & Synthesis (Divergent & Convergent Creation)

*   **Concept:** Enables users to generate and compare multiple AI-generated outputs simultaneously to foster brainstorming, explore diverse solutions, and synthesize the best ideas.
*   **Agent Behavior:** Multiple agents (potentially with varied models, prompts, or settings, but working from a common brief/input artifact) generate content in parallel.
*   **User Interaction:**
    *   User provides a common input (e.g., "Draft Chapter 1 outline," "Implement this class interface in Python").
    *   Outputs from (e.g., 3-5) agents are streamed side-by-side in real-time or near real-time.
    *   User can visually compare, scroll through, and inspect each parallel output.
    *   **Tagging & Selection:** User can tag preferred drafts, elements within drafts, or reject outputs.
    *   **Iterative Generation:** "Give me 3 more like this one (tagged draft)" or "Regenerate these two with a different approach."
    *   **Synthesis:** User can copy-paste, merge, or use a dedicated UI to composite their own version from the generated options.
*   **Use Cases:** Creative writing (multiple first drafts), code generation (alternative implementations), brainstorming marketing copy, generating design mockups.
*   **Key UI Elements:** Multi-columnar view for side-by-side comparison, tagging/voting tools, versioning/snapshotting of parallel sets, tools for merging/compositing selected content.

### Pillar 3: Iterative Refinement Loop (Structured Quality Improvement)

*   **Concept:** A workflow where an artifact is passed sequentially through a chain of specialized AI agents, each performing a distinct value-add task (e.g., Draft -> Edit -> Critique -> Polish).
*   **Agent Roles:** Agents are configured for specific roles in the refinement chain (e.g., "Creative Drafter," "Technical Editor," "Conciseness Polisher," "Critical Reviewer").
*   **User Interaction:**
    *   User initiates the loop with a starting artifact or prompt.
    *   The artifact moves from one agent to the next, with the output of one becoming the input for the next.
    *   **Parallelism within Stages (Optional):** At certain stages (e.g., "Edit"), the user might opt to have multiple specialized editor agents provide parallel edits on the current draft, then select the best one to proceed.
    *   User reviews and approves/modifies the output at each stage before it moves on.
*   **Use Cases:** Document writing, code refactoring, detailed content creation, policy development.
*   **Key UI Elements:** Visual representation of the workflow stages, clear indication of the current artifact state and active agent, tools for comparing versions between stages, ability to intervene or reroute.

## 5. Foundational Platform Capabilities:

To support these pillars, Aura will require:

*   **Advanced Artifact Management:**
    *   Robust version control for all generated content and user modifications.
    *   Tracking of lineage (which agent/prompt/version produced what).
    *   Ability to link, branch, and merge artifacts.
    *   Rich metadata tagging (user tags, agent tags, workflow stage).
*   **Agent Lifecycle Management & Designer:**
    *   Intuitive UI for creating, configuring, saving, sharing, and discovering agents.
    *   Prompt engineering assistance (potentially using a "parallel ideation" flow to refine prompts for agents themselves).
*   **Configurable Interaction Modes:** A crucial feature for user control, allowing the end-user to define an agent's conversational style to match their workflow and prevent 'flow dampening'. This could include modes like 'Guiding/Proactive', 'Confirmatory/Affirming', or 'Minimalist/Nothing Extra', giving the user fine-grained control over the AI partnership.
*   **Composable UI Framework & Flow Canvas:**
    *   A highly flexible "flow canvas" or "workbench" where users can intuitively arrange, combine, and connect both novel GenAI UI primitives (designed for Roundtable, Parallel Ideation, Iterative Refinement flows) and traditional UI elements (e.g., text editors, code viewers, file explorers, terminal emulators).
    *   This allows users to construct bespoke, task-specific workspaces, fostering a seamless blend of new AI-driven interactions with established workflows.
    *   The architecture should support dynamic layout adjustments and persistent workspace configurations.
*   **Inter-Component Communication Bus:**
    *   A standardized protocol for different UI components and AI agents to exchange data and context reliably.
*   **BYOK (Bring Your Own Key) Model Integration:**
    *   Allowing users to connect their preferred LLM providers and models.
*   **Context Management & State:**
    *   **Instructional Persistence:** A key differentiator is a state management system that goes beyond conversational context to include persistent user directives. The system must be able to track and consistently adhere to rules of engagement set by the user (e.g., interaction style, verbosity) across sessions. Our own interaction serves as a case study: the ability for the agent to maintain a 'nothing extra' communication style over many turns without repeated prompting is a direct result of this capability and a core requirement for building trust and effective collaboration.
    *   **Architectural Pattern for Instructional Persistence:** A multi-pronged approach to injecting directives is required for robust behavior, especially in long contexts. This includes dual-injection strategies and forced behavioral loops.
        *   **System Prompt Injection:** Core directives are injected at the beginning of the context (system prompt), preceding the conversational history, to establish them as foundational rules.
        *   **Pre-Prompt Refresher:** To combat the "lost in the middle" problem where initial instructions lose potency over a long context window, the most critical directives can be re-injected or "refreshed" immediately *after* the conversational history but *before* the final user prompt. This ensures the agent's core instructions have maximum salience right before generation.
            *   **Design Principle**: The art of an effective refresher is not just repetition, but the skillful selection and summarization of the most critical system prompt directives. It must provide "sufficient backreference" to the core rules to effectively reinforce the desired behavior without adding excessive token overhead.
        *   **Forced Behavioral Loops:** Requiring an agent to perform a ritual, like an "Implementation Pause" stating its current mode and task, forces a moment of self-reflection and re-grounding before every action.
        *   **Summary & Validation**: This combined architectural pattern of dual-injection and behavioral reinforcement has been empirically validated. The user confirmed it dramatically enhanced the stability of a Claude Code agent during heavy development, preventing it from 'losing track of itself' even deep into a 100k token context.
    *   **Sophisticated Context Mechanisms:** The platform will require sophisticated mechanisms for providing relevant context to agents within each flow type, potentially drawing from project-wide artifacts, specific conversation threads, or user-selected context.

## 6. Core Differentiators & Philosophy:

*   **True Co-Creation, Not Just Assistance:** Moving beyond Q&A to a partnership model.
*   **Harnessing Multi-LLM Diversity:** Built from the ground up to leverage the unique strengths of different models and configurations.
*   **User-Orchestrated, AI-Powered:** The user is the conductor of their AI team.
*   **Novel UI Paradigms:** Investing heavily in UI/UX experimentation to define how humans best collaborate with multi-agent AI systems.
*   **Organic & Evolvable:** The platform itself is designed to be flexible and adapt as new AI capabilities and interaction patterns emerge.
*   **Pioneering Liminal UI Primitives:** The core innovation lies in developing and refining new UI primitives that make complex multi-agent AI flows intuitive and powerful. The platform embraces its role as a "Liminal" space—facilitating the interaction and collaboration between humans and AI, and among AIs themselves, bridging these different modes of intelligence and creation.
*   **Fusion of Desktop and Web:** The platform's architecture embodies its name. It lives in the liminal space between a web app and a desktop app, using a Tauri shell to provide a native, multi-window canvas for web-based components. This creates a powerful fusion, combining the rapid iteration of the web with the deep integration of the desktop.

## 7. Core Platform Components

### 7.1. Agent Primitives

An "Agent" is the fundamental building block of the Liminal Flow platform. Each agent is a configurable, autonomous entity defined by a set of core primitives. The "Agent Designer" UI will provide a user-friendly interface for creating, configuring, and managing these agents.

*   **Identifier:** A unique name and handle for the agent (e.g., `name: 'Architect Bob'`, `handle: '@architect-bob'`) used for orchestration and communication.
*   **Persona (System Prompt):** The agent's core identity, purpose, rules of engagement, and worldview. This is a detailed document that establishes the agent's expertise, personality, and operational constraints (e.g., the `CLAUDE.md` persona).
*   **Model Configuration:** The underlying LLM that powers the agent.
    *   **Provider:** The LLM provider (e.g., Anthropic, OpenAI, Google, self-hosted).
    *   **Model:** The specific model to be used (e.g., `claude-3-opus-20240229`, `gpt-4-turbo`).
    *   **Parameters:** Key generation parameters such as `temperature`, `top_p`, and `max_tokens`.
*   **Interaction Style:** A user-configurable setting to control the agent's conversational behavior and prevent 'flow dampening'. This is a key UX differentiator.
    *   **Modes:** Pre-defined styles such as 'Guiding Question Mode' (proactive), 'Affirm Readiness Mode' (confirmatory), and 'Nothing Extra Mode' (minimalist).
*   **Tools & Capabilities (Future):** A declarative list of tools the agent is permitted to use, such as file system access, web search, code execution, or interaction with other agents and external APIs.

### 7.2. Core Workflow Components (UI Paradigms)

These are the novel UI primitives that structure the interaction between the user and multiple AI agents. They represent the primary modes of co-creation within the Liminal Flow platform.

*   **AI Roundtable:**
    *   **Concept:** A multi-agent chat interface where the user acts as an orchestrator or moderator of a discussion between several specialized AI agents.
    *   **Workflow:** The user initiates a topic and can direct questions or tasks to specific agents using `@-handles` (e.g., `@architect-bob`, `@qa-bill`). A lightweight routing model may assist in directing conversational flow. The agents can respond to the user and, in future iterations, to each other.
    *   **Use Case:** Brainstorming complex problems, architectural reviews, collaborative writing, and any scenario requiring multiple expert perspectives.

*   **Parallel Ideation & Synthesis:**
    *   **Concept:** A workflow for generating and comparing multiple diverse outputs from a single brief.
    *   **Workflow:** The user provides a creative brief (e.g., "draft a blog post intro," "suggest three UI layouts"). The platform assigns the task to multiple agents, each configured with different models, personas, or parameters. The outputs are streamed and displayed side-by-side in a comparative view. The user can then review, tag, select, or synthesize elements from the different versions to create a composite artifact.
    *   **Use Case:** Creative writing, design exploration, code implementation alternatives, and A/B testing content variations.

*   **Iterative Refinement Flow:**
    *   **Concept:** A serial, assembly-line-style workflow where an artifact is passed sequentially through a chain of specialized agents.
    *   **Workflow:** An artifact (e.g., a document, a piece of code) moves from one stage to the next, with each stage handled by an agent optimized for that specific task (e.g., `Drafter` -> `Editor` -> `Fact-Checker` -> `Polisher`). The 'edit' stage could involve parallel contributions from multiple editor agents before the user selects the best version to move forward.
    *   **Use Case:** Content creation pipelines, code review and refactoring processes, and any task that benefits from a structured, multi-stage quality assurance process.

## 8. Next Steps & Open Questions

### 8.1. Core Architectural Decision: Single-User vs. Multi-User

A fundamental strategic question remains open: should the platform be built from the ground up to support teams and multi-user collaboration, or should it be optimized for a single-user 'power tool' experience initially?

*   **Argument for Multi-User Now:** Building in collaboration features (workspaces, roles, shared artifacts) from the start is architecturally sound, as adding them later is notoriously difficult and often requires a complete rewrite.
*   **Argument for Single-User First:** Focusing on a single-user experience dramatically reduces complexity, accelerates MVP development, and allows for rapid iteration on the core co-creation workflows. The platform can be perfected as a personal power tool before tackling the challenges of collaboration.

This decision will have profound implications for the data model, authentication, and overall system architecture.

### 8.2. Evolved & Deferred Concepts

Based on recent planning, the following concepts from earlier PRDs have been updated:

*   **Agent Templates/Panels:** This idea has been superseded by the more flexible and powerful **Agent Primitives** and **Agent Designer** concepts.
*   **Advanced Cost/Security Management:** Features like usage tracking and automated key rotation are deferred from the current roadmap to prioritize focus on core workflow innovation.

## 9. Technical Strategy & Stack

### Application Shell: Tauri Desktop Canvas

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

*   Prioritization of initial flow types and features for MVP.
*   Detailed technical architecture for agent management, routing, and the composable UI.
*   Specific UI/UX mockups and prototypes for the core flow components.
*   Strategy for context handling across different flows and agents.
*   Defining the "small routing model" - capabilities and implementation.
