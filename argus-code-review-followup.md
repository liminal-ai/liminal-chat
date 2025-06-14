# Argus Code-Review Follow-Up – Feature 004 Story 3

**Work-tree**: `story3-domain-api-integration`
**Analysis Date**: 2025-06-13

## Code-Quality Findings
| ID | Severity | Area | Description | Suggested Action |
|----|----------|------|-------------|------------------|
| CQ3-1 | 🔴 BLOCKER (potential) | Security / Config | `main.ts` enables CORS for a single hard-coded origin (`http://localhost:8765`). | Use env-driven whitelist or config array before prod deploy. |
| CQ3-2 | 🟠 HIGH | Build Hygiene | Duplicate `test:integration*` npm script keys in root `package.json` trigger warnings. | De-duplicate scripts. |
| CQ3-3 | 🟠 HIGH | Performance | `health.spec.ts` sets threshold 400 ms (spec 100 ms). Clarification: ~300 ms is Playwright init overhead, so target allows 100 ms true API time. | Consider adding a separate raw-HTTP latency check or document the rationale; keep current 400 ms threshold. |
| CQ3-4 | 🟠 HIGH | Observability | Provider code uses `console.log` & `Logger.debug` gated only by `NODE_ENV`. | Standardise via Nest `Logger` with configurable level; remove `console.log`. |
| CQ3-5 | 🟡 MEDIUM | Security | Potential leakage of `OPENROUTER_API_KEY` through logged error messages. | Scrub provider error logs. |
| CQ3-6 | 🟡 MEDIUM | Code Smell | Helper `generateId()` comment says "base36" but implementation returns hex. | Fix comment or switch to `nanoid`. |
| CQ3-7 | 🟡 MEDIUM | DRY | Each integration spec re-declares `apiContext`. | Create shared fixture or extend `base-fixtures`. |
| CQ3-8 | 🟢 LOW | Accuracy | SSE `done` event emits empty `data:`; spec shows `[DONE]`. | Align implementation or update spec. |
| CQ3-9 | 🟢 LOW | Typings | DTO uses `_validator?: any` workaround. | Prefer `unknown` or generic constraint if possible. |
| CQ3-10 | 🟠 HIGH | Streaming Logic | SSE stream returns `[DONE]` without preceding `content`; causes test failure in `streaming.spec.ts` (assemble content). | Investigate Echo provider & Controller logic; ensure at least one `content` event emitted before `done`. |
| CQ3-11 | 🟡 MEDIUM | Timeout Handling | 50 ms client-timeout test aborts; service never returns graceful 408/504. | Decide contract: relax test or implement early-return on Echo provider for tiny timeouts. |

## Positive Highlights
• Robust global `AllExceptionsFilter` with granular error codes.
• Comprehensive DTO validation with mutual-exclusion constraint.
• Provider layer includes timeout, latency & memory telemetry.
• Reusable test-data factory and fixtures foundation.

---
**Prepared by Argus – the hundred-eyed QA sentinel.** 