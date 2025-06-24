# Liminal Chat • o3-pro Deep-Dive Analysis

*Author: o3-pro (AI product, architecture & delivery strategist)*  
*Date: <!-- auto-generated -->*

---

## 1. Executive Summary
Liminal Chat is a well-architected, privacy-first AI round-table platform positioned as the keystone of a broader creative-workflow ecosystem (**Liminal Type Platform**).  The technical foundations, domain/edge separation, and contract-first discipline are exemplary and **require no wholesale re-architecture**.  The project's critical path, however, contains a few *high-impact blockers* (testing framework migration, OpenRouter provider) that must be cleared immediately to avoid delivery drift.

## 2. Foundational Health-Check
| Area | Health | Observations | Immediate Action? |
|------|--------|--------------|-------------------|
| Domain/Edge Separation | ✅ Strong | Clear boundaries, process isolation, provider abstraction. | — |
| Contract-First Governance | ✅ Strong | JSON-Schema + TSDoc enforced, good DX. | — |
| Dependency Hygiene | ⚠️ Moderate | Vercel AI SDK remnants; dual Jest/Vitest runners. | **Yes** – remove legacy deps, finish Vitest.
| Streaming Model | ✅ Strong | SSE plumbing, multi-stream concept proven in Echo provider. | — |
| Persistence Strategy | ✅ Strong (design) | Filesystem-first > SQLite > PG path is realistic. | — |
| Observability | ⚠️ Missing | Structured logging planned (Feature 006) but no baseline yet. | Add minimal pino-pretty logger now to aid dev.
| Security | ⚠️ Partial | Edge↔Domain auth postponed (Features 009-010). | Acceptable for local dev; monitor.
| CLI Strategy | 🟡 Emerging | CLI roles well-designed but unimplemented for multi-agent modes. | Fold into early features to support E2E tests.

**Verdict:** No existential flaws; codebase is healthy.  Attention must focus on *dependency cleanup, testing, and observability* before layering complex features.

## 3. Alignment with Expanded Vision (Liminal Flow & Microviews)
The long-term vision of a CLI-centric, composable workflow IDE meshes naturally with the current architecture:
1. **Edge API = Workflow Fabric** – already stateless, contract-driven.
2. **Domain Services = Pluggable Agents & Storage** – good foundation for creative artefacts (lyrics, stems, mix notes).
3. **CLI as First-Class Client** – supports automation, batch, and scripted creative flows.
4. **Microviews** – thin React/Next.js surfaces that subscribe to SSE streams; architecture already supports multi-stream.

No architectural pivots required; just ensure **CLI capabilities and token-based auth** are prioritised sooner to unlock workflow integrations.

## 4. Critical Risks & Mitigations
1. **Testing Framework Migration Delay**  
   *Risk*: Blocks provider integration ⇒ blocks everything.  
   *Mitigation*: Freeze new feature work, finish Vitest + Playwright baseline; aim for 80% coverage parity.<br/>
2. **OpenRouter API Volatility**  
   *Risk*: API/key policy changes could break provider.  
   *Mitigation*: Encapsulate in provider adapter; add nightly contract test hitting sandbox model.
3. **Round-table Routing Complexity (Feature 007)**  
   *Risk*: Context window & mention-parsing accuracy.  
   *Mitigation*: Isolate Gemini-Flash routing in its own service; create synthetic corpus for evaluation; integrate metrics from day 1.
4. **Multi-Stream Browser Perf**  
   *Risk*: 5-10 SSE streams may exhaust EventSource connections.  
   *Mitigation*: Shared-worker multiplexing proof-of-concept before Feature 008 UI polish.

## 5. Recommended Roadmap Adjustments
The existing roadmap is 90% correct; only *re-order two items* and *insert observability* earlier.

### Updated Phase Sequence
1. **P0 – Stabilise Foundation**  
   • Finish Feature 004 (Vitest/Playwright)  
   • Legacy dependency purge  
   • Minimal structured logging (pino)  
   • Linters/formatters in CI
2. **P1 – Provider & CLI Enablement**  
   • Complete Feature 002 (OpenRouter)  
   • New **Feature 003b – CLI v1**:  
     – E2E test harness  
     – Single-agent interactive & batch modes  
   • Add nightly contract tests hitting Echo + OpenRouter.
3. **P2 – Data & Observability**  
   • Feature 005 (Persistence FS)  
   • Feature 006 (Structured Logging full)  
   • Add tracing hooks (OpenTelemetry).
4. **P3 – Round-table Intelligence**  
   • Feature 007 (Routing)  
   • Evaluation harness, metrics dashboard.
5. **P4 – User Experience**  
   • Feature 008 (Web UI)  
   • Performance optimisation (SSE multiplex).
6. **P5 – Security & Production Hardening**  
   • Feature 009 (User Auth)  
   • Feature 010 (Service Auth)  
   • SQLite→Postgres migration script.

This sequence brings *CLI earlier* (unlock automation) and introduces logging before complex features.

## 6. Detailed Feature Scopes
### Feature 004 – Testing Framework (Finalise)
• Replace Jest with Vitest across Domain & Edge.  
• Migrate existing snapshots.  
• Install Playwright with CI headless run.  
• Coverage thresholds: 90% Domain, 75% Edge, 70% UI E2E.

### Feature 002 – OpenRouter Integration (Finish)
• Provider adapter with streaming & abort support.  
• Model catalogue caching.  
• Rate-limit + retry wrapper.  
• Contract tests hitting gpt-3.5-turbo-0125.

### Feature 003b – CLI v1
1. `liminal chat --echo` (smoke)  
2. `liminal chat --provider openrouter`  
3. `liminal agent --mode batch --script ./prompts.md`  
4. JSON output for piping to other tools.  
5. Hooks: before-prompt, after-response.

### Feature 005 – Data Persistence (Filesystem v1)
• Chunk & bundle algorithm (20 token stream → 60 token chunk).  
• Conversation/session index JSON.  
• Storage abstraction interface to prepare for SQLite.

### Feature 006 – Structured Logging & Tracing
• pino@8 with custom transport → NDJSON.  
• Correlation IDs across Edge ↔ Domain.  
• OpenTelemetry spans (experimental).

### Feature 007 – AI Round-table Routing
• @mention parser (Gemini Flash).  
• Context budget allocator.  
• Agent turn scheduler (rounds).  
• Evaluation dataset & metrics (F-score on mention accuracy).  
• Configurable routing strategy plug-ins.

### Feature 008 – Web Frontend (Multi-Stream)
• React + Vite + Tailwind.  
• EventSource multiplex service.  
• Split-pane UI: timeline vs agent streams.  
• Toast error layer, connection status.

### Feature 009 – User Authentication
• Clerk.dev integration – email + social.  
• Session token propagation to Edge.  
• CLI auth via device code flow.

### Feature 010 – Service Authentication
• Edge issued JWT → Domain verify.  
• HMAC signature on SSE channel id.  
• RBAC groundwork for multi-tenant hosting.

## 7. Delivery Milestones & KPIs
| Milestone | Target Date | KPI |
|-----------|-------------|-----|
| P0 Complete | +2 weeks | Tests ≥ 80%, CI green, pino logs visible |
| P1 Complete | +4 weeks | CLI v1 released, OpenRouter latency ≤ 500 ms avg |
| P2 Complete | +7 weeks | Persisted session restore works, 95% log coverage |
| P3 Complete | +10 weeks | Routing accuracy ≥ 85% on test set |
| P4 Complete | +13 weeks | UI renders 5 parallel streams < 50 ms frame drop |
| P5 Complete | +16 weeks | Auth in prod, Postgres migration zero-downtime |

## 8. Next Steps (Action List)
1. **Lock sprint**:  Finish Vitest migration, remove Vercel SDK.  
2. **Spin up observability**:  Add pino + basic OpenTelemetry.  
3. **Kick off provider work**:  Merge Feature 002 branch behind `--experimental` flag.  
4. **Write RFC for CLI v1 scope** (Feature 003b) this week.  
5. **Schedule architecture spike** for SSE multiplex shared worker.

---

> This document will be revisited after P0 & P1 completion to adjust timelines based on real throughput and unexpected learnings.
