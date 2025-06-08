# Engineer Task: Implement to Pass Tests

[Include base-prompt.md]
[Include e-engineer.md]

## Specific Task

Implement code to make the tests written by QE pass.

### Steps
1. Read test specifications from `context/qe-work.md`
2. Understand what each test expects
3. Implement minimal code to pass tests
4. Run tests locally to verify
5. Refactor if needed while keeping tests green

### Implementation Priority
1. Get all tests passing first (GREEN phase)
2. Then refactor for quality (REFACTOR phase)
3. Don't add features not required by tests

### Local Verification
Before reporting complete:
```bash
# Run the specific test files you're working on
npm test -- path/to/test.spec.ts

# Check that your changes didn't break other tests
npm test
```

### Deliverables
1. Implementation code in appropriate files
2. Updated `context/engineer-work.md` with:
   - Files modified
   - Approach taken
   - Local test results
   - Any technical decisions made

Remember: Focus on making tests pass. Don't over-engineer. QE will verify your work.