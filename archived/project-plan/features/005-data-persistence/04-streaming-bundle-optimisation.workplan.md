# Story 04 • Work-Plan

## High-Level Tasks
1. Refactor streaming engine to introduce dual-buffer abstraction.  
2. Implement env-config observable for hot-reload of bundle/chunk sizes.  
3. Wire aggregation buffer to `ChunkWriter`.  
4. Integrate Prometheus metrics counters & histograms.  
5. Vitest unit tests for timing, ratio, flush on end.  
6. Playwright E2E test measuring perceived latency.  
7. Memory-leak soak test (30-minute stream).  
8. Config docs update.

## Sub-Agent Allocation
| Agent | Focus | Tokens |
|---|---|---|
| buffer-agent | Dual-buffer implementation | 5k |
| config-agent | Hot-reload observable | 3k |
| metrics-agent | Prometheus integration | 3k |
| test-agent | Unit + latency tests | 4k |
| soak-agent | Memory soak benchmark | 3k |
| docs-agent | README & env docs | 2k |

---

## Claude-code Implementation Prompt
```
think hard 10k
Act as tech-lead for Story 04 (Bundle Optimisation).
Spawn up to 6 agents per table.
After each agent, run:
  pnpm test --filter :persistence && pnpm exec playwright test latency
Ensure p95 latency ≤ 250 ms and memory leak < 50 MB.
Output DONE when all green.
```

---

## Argus QA Prompt
```
Run unit + latency + soak tests.
Check Prometheus metrics exported.
Validate acceptance criteria in 04-streaming-bundle-optimisation.story.md.
Fail build on any unmet criterion.
``` 