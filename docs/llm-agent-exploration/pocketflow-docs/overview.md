# Pocket Flow

A [100-line](https://github.com/the-pocket/PocketFlow/blob/main/pocketflow/__init__.py) minimalist LLM framework for _Agents, Task Decomposition, RAG, etc_.

- **Lightweight**: Just the core graph abstraction in 100 lines. ZERO dependencies, and vendor lock-in.
- **Expressive**: Everything you love from larger frameworks—( [Multi-](https://the-pocket.github.io/PocketFlow/design_pattern/multi_agent.html)) [Agents](https://the-pocket.github.io/PocketFlow/design_pattern/agent.html), [Workflow](https://the-pocket.github.io/PocketFlow/design_pattern/workflow.html), [RAG](https://the-pocket.github.io/PocketFlow/design_pattern/rag.html), and more.
- **Agentic-Coding**: Intuitive enough for AI agents to help humans build complex LLM applications.

![Pocket Flow – 100-line minimalist LLM framework](https://github.com/the-pocket/.github/raw/main/assets/meme.jpg?raw=true)

## Core Abstraction

We model the LLM workflow as a **Graph + Shared Store**:

- [Node](https://the-pocket.github.io/PocketFlow/core_abstraction/node.html) handles simple (LLM) tasks.
- [Flow](https://the-pocket.github.io/PocketFlow/core_abstraction/flow.html) connects nodes through **Actions** (labeled edges).
- [Shared Store](https://the-pocket.github.io/PocketFlow/core_abstraction/communication.html) enables communication between nodes within flows.
- [Batch](https://the-pocket.github.io/PocketFlow/core_abstraction/batch.html) nodes/flows allow for data-intensive tasks.
- [Async](https://the-pocket.github.io/PocketFlow/core_abstraction/async.html) nodes/flows allow waiting for asynchronous tasks.
- [(Advanced) Parallel](https://the-pocket.github.io/PocketFlow/core_abstraction/parallel.html) nodes/flows handle I/O-bound tasks.

![Pocket Flow – Core Abstraction](https://github.com/the-pocket/.github/raw/main/assets/abstraction.png)

## Design Pattern

From there, it's easy to implement popular design patterns:

- [Agent](https://the-pocket.github.io/PocketFlow/design_pattern/agent.html) autonomously makes decisions.
- [Workflow](https://the-pocket.github.io/PocketFlow/design_pattern/workflow.html) chains multiple tasks into pipelines.
- [RAG](https://the-pocket.github.io/PocketFlow/design_pattern/rag.html) integrates data retrieval with generation.
- [Map Reduce](https://the-pocket.github.io/PocketFlow/design_pattern/mapreduce.html) splits data tasks into Map and Reduce steps.
- [Structured Output](https://the-pocket.github.io/PocketFlow/design_pattern/structure.html) formats outputs consistently.
- [(Advanced) Multi-Agents](https://the-pocket.github.io/PocketFlow/design_pattern/multi_agent.html) coordinate multiple agents.

![Pocket Flow – Design Pattern](https://github.com/the-pocket/.github/raw/main/assets/design.png)

## Utility Function

We **do not** provide built-in utilities. Instead, we offer _examples_—please _implement your own_:

- [LLM Wrapper](https://the-pocket.github.io/PocketFlow/utility_function/llm.html)
- [Viz and Debug](https://the-pocket.github.io/PocketFlow/utility_function/viz.html)
- [Web Search](https://the-pocket.github.io/PocketFlow/utility_function/websearch.html)
- [Chunking](https://the-pocket.github.io/PocketFlow/utility_function/chunking.html)
- [Embedding](https://the-pocket.github.io/PocketFlow/utility_function/embedding.html)
- [Vector Databases](https://the-pocket.github.io/PocketFlow/utility_function/vector.html)
- [Text-to-Speech](https://the-pocket.github.io/PocketFlow/utility_function/text_to_speech.html)

**Why not built-in?**: I believe it's a _bad practice_ for vendor-specific APIs in a general framework:

- _API Volatility_: Frequent changes lead to heavy maintenance for hardcoded APIs.
- _Flexibility_: You may want to switch vendors, use fine-tuned models, or run them locally.
- _Optimizations_: Prompt caching, batching, and streaming are easier without vendor lock-in.

## Ready to build your Apps?

Check out [Agentic Coding Guidance](https://the-pocket.github.io/PocketFlow/guide.html), the fastest way to develop LLM projects with Pocket Flow!