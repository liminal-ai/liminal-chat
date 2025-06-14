# Story 02 • Work-Plan

## High-Level Tasks
1. Implement `ChunkWriter` utility with async queue + back-pressure.  
2. Integrate schema validation (ajv).  
3. Add pino logging hook.  
4. Unit tests: happy path, slow IO mock, invalid schema.  
5. Crash-recovery bootstrap that cleans orphaned partial files.  
6. CI matrix for Windows/macOS/Linux.

## Sub-Agent Allocation
| Agent | Focus | Tokens |
|-------|-------|--------|
| writer-agent | `ChunkWriter` implementation | 4k |
| validator-agent | JSON schema + ajv integration | 3k |
| test-agent | Unit & stress tests | 4k |
| recovery-agent | Crash recovery util | 3k |
| docs-agent | Update schema docs | 2k |

---

## Claude-code Implementation Prompt
```
think 10k
You are Claude-code leading Story 02 (Chunk Storage).
Follow work-plan, spawn up to 5 agents concurrently.
Ensure coverage ≥ 85% and lint passes.
After each agent finishes, run `pnpm test :persistence`.
Output DONE when all acceptance criteria pass.
```

---

## Argus QA Prompt
```
Run full unit suite then Playwright E2E streaming test.
Assert acceptance criteria in 02-message-chunk-storage.story.md.
Fail build on any unmet criteria or lint error.
``` 