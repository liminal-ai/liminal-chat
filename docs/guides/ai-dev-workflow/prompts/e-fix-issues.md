# Engineer Task: Fix Issues Found by QE

[Include base-prompt.md]
[Include e-engineer.md]

## Specific Task

Fix the specific issues identified by QE in their verification report.

### Steps
1. Read QE's issue report from `context/qe-work.md`
2. For each issue:
   - Understand the failure
   - Locate the problematic code
   - Fix the specific issue
   - Verify the fix locally
3. Run full test suite to ensure no regressions

### Issue Priority
1. Failing tests (fix these first)
2. Coverage gaps (add missing tests or code)
3. Lint errors (fix formatting/style)
4. Type errors (fix type issues)

### Verification Pattern
For each fix:
```bash
# First, reproduce the failure
npm test -- --testNamePattern="failing test name"

# After fix, verify it passes
npm test -- --testNamePattern="failing test name"

# Ensure no regressions
npm test
```

### Deliverables
Update `context/engineer-work.md` with:
- Issues addressed (reference QE's list)
- Fixes applied for each issue
- Local verification results
- Any issues you couldn't fix and why

Remember: Address the specific issues QE found. Don't change unrelated code.