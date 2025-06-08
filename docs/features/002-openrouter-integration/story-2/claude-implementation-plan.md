# Claude Implementation Plan - Story 2: SSE Streaming

**Story**: Implement End-to-End SSE Streaming with Graceful Interruption Handling  
**Estimated Total Time**: 3 hours (Claude time)  
**Implementation Date**: TBD

## Task Breakdown

### Task 1: Create Shared Type Definitions
**Time**: 6 minutes  
**Description**: Define streaming interfaces and error taxonomy in shared-types package

**Steps**:
1. Create `packages/shared-types/src/llm/streaming.ts` with ProviderStreamEvent types
2. Create `packages/shared-types/src/llm/streaming-errors.ts` with error codes
3. Update package exports in index files
4. Run all verification commands

**Definition of Done**:
- [ ] All interfaces from story spec are defined
- [ ] Error codes and messages match specification
- [ ] Exports are accessible from other packages
- [ ] `pnpm lint` passes (no new violations)
- [ ] `pnpm typecheck` passes (no new errors)
- [ ] `pnpm test` passes (no broken tests)
- [ ] `pnpm verify:no-tests` passes (quick quality check)
- [ ] Git status clean (all changes committed)

---

### Task 2: Create E2E Test Skeleton
**Time**: 9 minutes  
**Description**: Set up comprehensive E2E tests for streaming scenarios

**Steps**:
1. Create `test/e2e/openrouter-streaming.e2e.spec.ts`
2. Write test cases for successful streaming, interruption, and reconnection
3. Create SSE response fixtures matching OpenRouter format
4. Add performance assertion helpers
5. Run all verification commands

**Definition of Done**:
- [ ] All Gherkin scenarios from spec have corresponding tests
- [ ] Test fixtures cover all SSE format variations
- [ ] Tests are marked as pending/skipped
- [ ] Test file runs without syntax errors
- [ ] `pnpm lint` passes (no new violations)
- [ ] `pnpm typecheck` passes (no new errors)
- [ ] `pnpm test` passes (no broken tests)
- [ ] `pnpm test:e2e` runs (new tests skip properly)
- [ ] Git status clean (all changes committed)

---

### Task 3: Write Domain Unit Tests
**Time**: 9 minutes  
**Description**: Create comprehensive unit tests for OpenRouterProvider streaming

**Steps**:
1. Add streaming tests to `openrouter.provider.spec.ts`
2. Test SSE chunk parsing with various formats
3. Test error mapping to StreamError types
4. Test UTF-8 boundary scenarios
5. Run all verification commands

**Definition of Done**:
- [ ] Tests cover all edge cases from specification
- [ ] Mock SSE streams are realistic
- [ ] Tests run but fail (red phase)
- [ ] Coverage targets are clear
- [ ] `pnpm lint` passes (no new violations)
- [ ] `pnpm typecheck` passes (no new errors)
- [ ] `pnpm test` runs (new tests fail as expected)
- [ ] `pnpm domain:test` shows new failing tests
- [ ] No existing tests broken
- [ ] Git status clean (all changes committed)

---

### Task 4: Implement generateStream Method
**Time**: 12 minutes  
**Description**: Implement the core streaming functionality in OpenRouterProvider

**Steps**:
1. Add `generateStream` method to OpenRouterProvider
2. Implement SSE parsing logic with proper error handling
3. Add event ID generation with nanoid
4. Implement UTF-8 boundary handling
5. Add memory management constraints
6. Run all verification commands

**Definition of Done**:
- [ ] All domain unit tests pass
- [ ] Method signature matches ILLMProvider extension
- [ ] Memory buffers respect defined limits
- [ ] Error events use proper StreamErrorCode values
- [ ] Logging includes debug information
- [ ] `pnpm lint` passes (no new violations)
- [ ] `pnpm typecheck` passes (no new errors)
- [ ] `pnpm test` passes (domain tests now green)
- [ ] `pnpm domain:test:cov` shows ≥75% coverage
- [ ] `pnpm verify` passes completely
- [ ] Git status clean (all changes committed)

---

### Task 5: Implement CLI Reconnection Manager
**Time**: 9 minutes  
**Description**: Build reconnection logic with exponential backoff

**Steps**:
1. Create `apps/cli/src/api/streaming-reconnection.ts`
2. Implement StreamReconnectionManager class
3. Add exponential backoff with jitter
4. Integrate with EdgeClient.streamChat
5. Add content clearing on reconnection
6. Run all verification commands

**Definition of Done**:
- [ ] Reconnection follows exponential backoff pattern
- [ ] Jitter prevents thundering herd
- [ ] Last-Event-ID is preserved and sent
- [ ] Previous content is cleared on new stream
- [ ] Unit tests verify backoff calculations
- [ ] `pnpm lint` passes (no new violations)
- [ ] `pnpm typecheck` passes (no new errors)
- [ ] `pnpm test` passes (CLI tests pass)
- [ ] `pnpm cli:test:cov` shows ≥70% coverage
- [ ] `pnpm verify` passes completely
- [ ] Git status clean (all changes committed)

---

### Task 6: E2E Integration and Verification
**Time**: 9 minutes  
**Description**: Connect all components and verify end-to-end flow

**Steps**:
1. Update EdgeClient to use reconnection manager
2. Verify Edge service SSE proxying
3. Test with real OpenRouter API
4. Validate performance metrics
5. Test interruption scenarios
6. Run all verification commands

**Definition of Done**:
- [ ] All E2E tests pass
- [ ] First token latency ≤ 500ms
- [ ] Inter-chunk latency ≤ 100ms
- [ ] Streaming works with real OpenRouter
- [ ] Interruption recovery works as specified
- [ ] `pnpm lint` passes (no new violations)
- [ ] `pnpm typecheck` passes (no new errors)
- [ ] `pnpm test` passes (all tests green)
- [ ] `pnpm test:e2e` passes (streaming tests work)
- [ ] `pnpm verify:all` passes (full validation)
- [ ] Manual test with `pnpm cli:chat:openrouter` streams
- [ ] Git status clean (all changes committed)

---

### Task 7: Final Polish and Story Completion
**Time**: 6 minutes  
**Description**: Address remaining items and complete story

**Steps**:
1. Run Cloudflare SSE capability verification
2. Add performance monitoring hooks
3. Update documentation with streaming examples
4. Run full test suite with coverage
5. Execute complete verification protocol

**Pre-Completion Checklist**:
- [ ] `pnpm lint` passes (zero violations)
- [ ] `pnpm typecheck` passes (zero errors)
- [ ] `pnpm test` passes (all tests green)
- [ ] `pnpm test:cov` shows required coverage met
- [ ] `pnpm verify:all` passes
- [ ] `pnpm check:error-codes` shows no conflicts

**Definition of Done**:
- [ ] Cloudflare Workers SSE verified
- [ ] ILLMProvider interface extended with generateStream
- [ ] Documentation includes streaming usage examples
- [ ] All tests pass with required coverage
- [ ] No memory leaks in extended streaming
- [ ] App Verification Protocol executed (see below)
- [ ] Git log shows clean commit history
- [ ] Ready for PR with all evidence

---

## App Verification Protocol (Task 7)

Execute this complete verification sequence before marking story complete:

### 1. Code Quality Gates
```bash
pnpm verify              # Must pass completely
pnpm test:cov            # Domain ≥75%, CLI ≥70%
```

### 2. Manual Integration Test
```bash
# Terminal 1: Start services
pnpm start:all

# Terminal 2: Health checks
pnpm check:all

# Terminal 3: Test streaming
pnpm cli:chat:openrouter
# Send: "Write a 200 word story"
# Verify: Tokens stream incrementally
# Test: Ctrl+C mid-stream and reconnect
```

### 3. Performance Validation
- [ ] First token appears < 500ms
- [ ] Smooth token flow (no stuttering)
- [ ] Memory stable during long streams

---

## Complete Story Definition of Done

### Code Quality Gates ✅
- [ ] `pnpm verify` passes (lint + typecheck + test)
- [ ] Domain coverage ≥ 75%
- [ ] CLI coverage ≥ 70%
- [ ] No new lint warnings

### Functional Requirements ✅
- [ ] Streaming responses display incrementally
- [ ] Usage data shows after stream completes
- [ ] Network interruptions trigger reconnection
- [ ] CLI clears old content on reconnection
- [ ] Error messages use defined taxonomy
- [ ] UTF-8 characters handle correctly across chunks

### Performance Requirements ✅
- [ ] First token latency ≤ 500ms
- [ ] Inter-chunk latency ≤ 100ms
- [ ] Memory usage ≤ 10MB for 10k token stream
- [ ] Reconnection attempts follow backoff pattern

### Integration Verification ✅
- [ ] Manual test with real OpenRouter API
- [ ] Test with multiple models (GPT-4, Claude, etc.)
- [ ] Verify with slow/fast connections
- [ ] Test interruption at various points
- [ ] Confirm no regressions in non-streaming mode

### Documentation ✅
- [ ] README updated with streaming example
- [ ] API documentation includes generateStream
- [ ] Error codes documented
- [ ] Performance characteristics noted

### Final Checklist ✅
- [ ] All acceptance criteria from story met
- [ ] No TODO comments in implementation
- [ ] Git history clean with meaningful commits
- [ ] Ready for PR with evidence of all tests passing

## Notes
- Times are Claude estimates (human time ÷ 5)
- Each task should be committed separately for easy review
- Run verification protocol after Task 7
- If blocked on any task, engage systematic debug protocol