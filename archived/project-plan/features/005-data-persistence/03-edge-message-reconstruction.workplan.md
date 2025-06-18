# Story 03 • Work-Plan

## High-Level Tasks
1. Implement `Reconstructor` service that scans user conversation path and stitches messages.  
2. Add LRU cache wrapper with TTL 5 min.  
3. Integrate pagination helper with opaque cursor encoding.  
4. Error-handling enumerations + mapping to HTTP codes.  
5. Unit + branch coverage tests for all paths.  
6. Playwright API E2E test hitting reconstructed conversation.  
7. Bench test targeting 10 k-token message.

## Sub-Agent Allocation
| Agent | Focus | Tokens |
|-------|-------|--------|
| reconstructor-agent | Core alg + cache | 6k |
| pagination-agent | Cursor util & API glue | 3k |
| error-agent | Error map + tests | 2k |
| perf-agent | Benchmark & optimise | 3k |
| test-agent | Unit + E2E harness | 4k |
| docs-agent | OpenAPI updates & JSDoc | 2k |

---

## Claude-code Implementation Prompt
```
think hard 10k
You are Claude-code leading Story 03 (Edge Reconstruction).
Goals:
• Meet acceptance criteria in 03-edge-message-reconstruction.story.md.
• ≥ 90 % branch coverage.
Plan:
• Spawn up to 6 agents as per table.
• After each agent, run `pnpm test --filter :persistence` and `pnpm exec playwright test api-reconstruct`.
• Iterate until green then OUTPUT "DONE".
```

---

## Argus QA Prompt
```
Run unit + API E2E suites.
Verify all acceptance criteria for Story 03.
Reject build on any uncovered branch, perf miss (>40 ms), or lint error.
``` 