# QA Task Template

[TECH LEAD WILL INSERT: personas/qa-base.md]

## Context
[TECH LEAD WILL INSERT: context/requirements.md]
[TECH LEAD WILL INSERT: context/qa-work.md if exists]

## Your Task
[TECH LEAD WILL INSERT: One of the following]

### Option A: Write Tests
Write comprehensive tests for the requirements.

Include:
- Happy path tests
- Edge cases
- Error scenarios
- Integration tests if needed

Tests should fail initially (TDD red phase).

### Option B: Verify Implementation
Run all verification checks on the implementation.

Execute:
1. `npm test`
2. `npm run test:cov`
3. `npm run lint`
4. `npm run type-check`

Report exact output and clear PASS/FAIL verdict.

### Deliverables
Update `context/qa-work.md` with:
- For Option A: List of test files created and scenarios covered
- For Option B: Exact test results and verdict

Remember: Be thorough, be objective, find problems