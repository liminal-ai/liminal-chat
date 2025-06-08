# QE Task: Verify Implementation

[Include base-prompt.md]
[Include qe-quality-engineer.md]

## Specific Task

Run comprehensive verification of the current implementation.

### Verification Checklist
1. Run all tests: `npm test`
2. Check coverage: `npm run test:cov`
3. Run linting: `npm run lint`
4. Check types: `npm run type-check`
5. Verify against requirements in `context/requirements.md`

### Additional Checks
- Look for skipped tests
- Verify error messages are helpful
- Check for console.log statements
- Ensure no commented-out code

### Report Format
Provide exact output from all commands and a clear PASS/FAIL determination.

### Failure Handling
If ANY check fails:
- Report it as BLOCKED
- List specific issues
- Include exact error messages
- Provide file:line references

### Success Criteria
Only report PASSED when:
- 100% of tests pass
- Coverage meets thresholds
- Zero lint errors
- Zero type errors
- All requirements verified

Remember: Be adversarial to bugs. Your job is to find problems, not to overlook them.