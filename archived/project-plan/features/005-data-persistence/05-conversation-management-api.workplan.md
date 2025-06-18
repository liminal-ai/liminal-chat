# Story 05 • Work-Plan

## High-Level Tasks
1. Implement REST handlers for list, metadata, messages endpoints.  
2. Integrate pagination & security middleware.  
3. Generate OpenAPI spec & JSON-schema validators.  
4. Add LRU list cache keyed by userId.  
5. Unit tests for each handler incl. security path.  
6. Playwright API E2E covering pagination & security.  
7. Performance benchmark with 1000 conversations dataset.  
8. Prometheus metrics instrumentation.  
9. Update frontend mock server (Feature 008 dependency).

## Sub-Agent Allocation
| Agent | Focus | Tokens |
|-------|-------|--------|
| handler-agent | REST handlers implementation | 6k |
| schema-agent | OpenAPI + JSON-schema gen | 3k |
| cache-agent | LRU cache & benchmarks | 3k |
| security-agent | Auth middleware tests | 3k |
| test-agent | Unit + E2E tests | 4k |
| perf-agent | Perf benchmark | 3k |
| docs-agent | API spec & README | 2k |

---

## Claude-code Implementation Prompt
```
ultrathink 32k
You are Claude-code tech-lead for Story 05 (Conversation API).
Use up to 7 sub-agents concurrently.
Ensure acceptance criteria pass, coverage ≥ 85 %, perf target ≤ 30 ms for 1k conversations.
After each agent, run full API test suite and lint.
Return DONE when satisfied.
```

---

## Argus QA Prompt
```
Run API contract + E2E + perf tests.
Validate criteria in 05-conversation-management-api.story.md.
Fail build on any unmet condition.
``` 