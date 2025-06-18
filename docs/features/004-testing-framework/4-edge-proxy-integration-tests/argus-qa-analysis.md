# Argus QA Analysis – Feature 004 Story 4: Edge Proxy Integration Tests  
**Analysis Date**: June 2025  
**Analysis Type**: Implementation Review  
**Focus**: Edge → Domain Proxy Layer & Playwright Integration Suite  

---

## R.I.V.E.T. Analysis Summary

### Requirements Deconstruction ✓
The story defines comprehensive acceptance criteria across:
• Endpoint coverage (health, prompt, streaming, providers, 404)  
• Proxy behaviour (request/response fidelity, header preservation, status mapping, error translation)  
• Cross-tier communication, security headers & CORS, performance (<50 ms overhead), reliability.

### Implementation Scrutiny ❌
Playwright integration suite executed with Domain (port 8766) and Edge (wrangler dev, port 8787) servers running. 75 total tests executed.  
**Result**: 44 PASSED / 31 FAILED (see evidence below).  
Failures span critical functional areas ⇒ implementation does **not** meet Definition of Done.

### Vulnerability & Edge-Case Analysis 🔴
Missing error handling exposes internal Domain messages, returns `200 OK` on failure conditions, and omits required security/error fields. Streaming pathway not functional – breaks client contracts and risks resource leaks.

### Evidence-Based Verdict 🔴
Implementation is **BLOCKED** – acceptance criteria not met. See ticket-ready findings.

### Ticket-Ready Report ✓
Actionable, prioritised defects listed below.

---

## Detailed Findings (ordered by impact)

| # | Area | Failing Spec Clause / Test | Observed Behaviour | Expected |
|---|------|---------------------------|--------------------|----------|
| 1 | Error Handling (Critical) | tests/integration/edge/error-handling.spec.ts (17 failures) | Edge returns **200** with JSON body wrapping Domain error text; response lacks `message` field & correct `code`; status mapping (503/401/429/500/400) incorrect | Edge must surface identical status code, preserve or translate `error`, `code`, & include `message` per contract |
| 2 | Streaming Proxy (Critical) | streaming-proxy.spec.ts (10 failures) | All streaming requests return non-SSE JSON or 404. `content-type` not `text/event-stream`; no `[DONE]` terminator; event IDs absent. | Maintain pass-through SSE stream exactly as received from Domain |
| 3 | Response Contract | error-handling.spec.ts 'consistent error response structure' | Missing top-level `message`, mismatched `code` values | Match schema in shared-types, include `error`, `message`, `code`, optional `details` |
| 4 | Provider-Specific Errors | error-handling.spec.ts 'auth/rate-limit' | Edge returns **200** when Domain indicates auth/rate-limit failures | Must propagate 401/429 respectively |
| 5 | Proxy Overhead Metrics | performance.spec.ts 'add <50 ms overhead' | Assertion failed because `domainResponse.ok()` false (Domain call 300 ms+, Edge call 12 ms) – indicates direct Domain endpoint health but test aborts on error | Investigate Domain direct failure & ensure overhead calc path passes |
| 6 | Recovery & Resilience | error-handling.spec.ts transient / repeated failures | Edge never surfaces 5xx status; cannot validate recovery | After configurable retries, respond 503 with informative payload |
| 7 | Performance Baseline Drift | performance.spec.ts baselines | Current run exceeded 20 % drift (4.31 ms vs 3.54 ms baseline) | Tune baseline collection or investigate regression |
| 8 | Proxy Behaviour Mixed Endpoint | proxy-behavior.spec.ts 'regular & streaming prompt' | Streaming sub-call returns unexpected status (400/500) array check failed | Ensure `/prompt?stream=true` handled consistently |

### Additional Observations
• `apps/edge/src/index.ts` directly serialises Domain JSON error as string ⇒ leaks internal messages (security concern).  
• `ERROR_CODES` mapping exists but Edge never populates for many branches.  
• CORS & security header tests pass ✅ (good).  
• Health/performance happy-path tests pass with excellent latency (3-11 ms).  
• Domain server responds slowly to first hit (~300 ms) – cold-start penalty affects overhead tests.

---

## Acceptance-Criteria Compliance Matrix

| Acceptance Criterion | Status |
|----------------------|--------|
| Health endpoint with Domain connectivity | ✅ Pass |
| Prompt proxy – happy path | ✅ Pass |
| Prompt proxy – error, validation | ❌ Fail |
| Streaming proxy | ❌ Fail |
| Providers proxy | ✅ Pass |
| 404 handling | ✅ Pass |
| Header preservation | ✅ Pass (regular), ❌ Fail (streaming) |
| Status code mapping | ❌ Fail |
| Error translation & structure | ❌ Fail |
| Timeout & resilience | ❌ Fail |
| Performance (<50 ms overhead) | ⚠️ Inconclusive (test failed due to upstream error) |
| Security headers & CORS | ✅ Pass |

---

## Recommended Remediation Steps (prioritised)
1. **Implement robust error mapping layer** between Domain → Edge responses:  
   – Preserve HTTP status code  
   – Parse Domain JSON `{ error, code, message }`, re-emit same structure  
   – For network failures/timeouts, generate `EDGE_DOMAIN_UNAVAILABLE` with 503.  
2. **Finish SSE streaming passthrough**: adopt `Response` with `ReadableStream` forwarding; maintain all headers; test with mock streaming endpoint.  
3. **Augment request validation** at Edge (Content-Type, schema, required fields) to return 400 with `EDGE_INVALID_REQUEST`.  
4. **Propagate provider-specific error statuses (401, 429, 503)** untouched.  
5. **Stabilise performance metrics**: warm Domain service before baseline measurement or cache provider data.  
6. **Add integration tests to Edge repo's own Vitest suite for error scenarios** to catch regressions earlier.

---

## Risk Assessment
• **High** – Clients may interpret failed calls as success (HTTP 200) leading to silent data issues.  
• **High** – Streaming contract break blocks CLI real-time output.  
• **Medium** – Internal error leakage could expose stack traces in production.

---

## Suggested Next Actions
1. Assign bug-fix sub-tasks for each failing test group.  
2. Re-run full Playwright suite locally & in CI after fixes.  
3. Update story status to **RETURN → Dev** – do not close until 0 failures.  
4. Consider feature flag gating streaming until complete.

---

**QA Analysis Complete** – Ready for review. 