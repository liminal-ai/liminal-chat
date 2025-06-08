# QE Task: Write Tests from Requirements

[Include base-prompt.md]
[Include qe-quality-engineer.md]

## Specific Task

Write comprehensive tests for the requirements specified in `ai-dev-workflow/context/requirements.md`.

### Steps
1. Read the requirements carefully
2. Identify all test scenarios needed
3. Write tests following TDD approach (tests should fail initially)
4. Organize tests logically by feature area
5. Include both positive and negative test cases

### Focus Areas
- Behavior, not implementation
- Edge cases and error conditions
- Integration points between components
- Performance requirements if specified

### Deliverables
1. Test files in appropriate directories
2. Updated `context/qe-work.md` with:
   - List of test files created
   - Test scenarios covered
   - Any ambiguities in requirements

### Remember
- Tests should be failing (RED phase of TDD)
- Don't implement the code, just test specifications
- Be thorough - missed scenarios cause bugs later