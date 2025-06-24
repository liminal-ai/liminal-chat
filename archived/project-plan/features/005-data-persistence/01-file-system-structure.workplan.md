# Story 01 • Work-Plan

_This file outlines the concrete plan for Claude-code (main orchestrator) and sub-agents._

## High-Level Tasks
1. Design utilities for user-scoped path resolution.  
2. Implement directory bootstrap logic.  
3. Create index.json atomic updater.  
4. Write Vitest unit tests for helpers.  
5. Add Playwright E2E test for directory creation via CLI smoke run.  
6. Concurrency stress test (vitest workers).  
7. Update README with ENV var docs.

## Suggested Sub-Agent Allocation
| Agent | Focus | Est. Tokens |
|-------|-------|-------------|
| path-helper-agent | Implement `resolveUserPath()` utilities | 4k |
| bootstrap-agent | Directory creation & index updater | 4k |
| test-agent | Unit + stress tests | 4k |
| docs-agent | README + JSDoc updates | 2k |

---

## Claude-code Implementation Prompt (paste into Claude)
```
think 10k
You are Claude-code acting as tech-lead for *Liminal Chat – Story 01 (File-system)*.

Objectives:
1. Deliver functionality & tests satisfying acceptance criteria in `01-file-system-structure.story.md`.
2. Maintain ≥ 90% coverage.
3. Keep eslint clean.

Plan:
• Spawn up to 4 sub-agents concurrently as per work-plan table.  
• After each agent finishes, review diff, run `pnpm test --filter :persistence` and `pnpm lint`, deploy follow-up agent if failures.

Output "DONE" when story passes all tests.
```

---

## Argus QA Prompt
```
When invoked, run `pnpm test` with coverage, then `pnpm exec playwright test`.  
Verify acceptance criteria in `01-file-system-structure.story.md`.  
If any criterion fails, output detailed failure reason and exit non-zero.
``` 