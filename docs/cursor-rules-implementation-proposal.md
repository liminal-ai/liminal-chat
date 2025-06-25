# Cursor Rules for Cursor Agent - Liminal Chat

## Purpose
Configure Cursor Agent to handle feature/story review, TDD test creation, code review, and story completion validation according to project standards.

## Tool Ecosystem
- **Augment Agent (Augy)**: Own configuration system - creates specs, architecture review
- **Claude Code**: Own management system - implements features following specs
- **Cursor Agent**: Uses .cursorrules - reviews stories, creates tests, validates completion

## Cursor Agent Responsibilities
1. **Feature/Story Review**: Decide when stories are ready for implementation
2. **TDD Test Creation**: Generate comprehensive test suites before implementation
3. **Code Review**: Review completed stories for standards compliance
4. **Story Validation**: Verify story completion and acceptance criteria

## Rule Structure for Cursor Agent

```
.cursorrules                    # Main configuration
.cursor/rules/
├── story-review.md            # Feature/story readiness criteria
├── test-creation.md           # TDD test generation patterns
├── code-review.md             # Code review standards
├── completion-validation.md   # Story completion verification
├── typescript-standards.md    # Project TypeScript rules
├── convex-patterns.md         # Convex-specific requirements
└── nextjs-patterns.md         # Next.js best practices
```

## Cursor Agent Rule Functions

### 1. Story Review Rules (.cursor/rules/story-review.md)
**When to approve stories for implementation:**
- Acceptance criteria are verifiable (not vague like "functional" or "working")
- Dependencies clearly identified and available
- Architecture compliance verified
- Scope appropriately sized (~20 min professional developer time)

### 2. TDD Test Creation (.cursor/rules/test-creation.md)
**Generate comprehensive test suites:**
- Unit tests for all business logic
- Integration tests for service interactions
- E2E tests for critical user workflows
- 75% coverage for domain tier, 70% for CLI/Edge
- Tests must pass before story approval

### 3. Code Review Rules (.cursor/rules/code-review.md)
**Review completed implementations:**
- TypeScript strict mode compliance
- ESLint/Prettier standards met
- Architecture patterns followed
- Performance benchmarks achieved
- No hardcoded secrets or credentials

### 4. Completion Validation (.cursor/rules/completion-validation.md)
**Verify story completion:**
- All acceptance criteria functionally verified (not just file existence)
- Tests passing and coverage maintained
- Deployment successful for cloud services
- No regressions in existing functionality

## Implementation Timeline

### Week 1: Core Cursor Agent Rules
- **Story Review**: Acceptance criteria validation, scope verification
- **Test Creation**: TDD patterns, coverage requirements
- **Basic Standards**: TypeScript strict, no hardcoded secrets

### Week 2: Framework-Specific Rules
- **Convex**: Schema patterns, auth integration, deployment verification
- **Next.js**: Component patterns, performance requirements
- **Vercel AI SDK**: Provider patterns, streaming, error handling

### Week 3: Quality Gates
- **Code Review**: Architecture compliance, performance benchmarks
- **Completion Validation**: Functional verification, regression testing
- **Integration**: End-to-end workflow testing

## Example Rule: Story Completion Validation
```markdown
# Cursor Agent: Story Completion Checklist

## Functional Verification Required
- ❌ File exists ≠ Story complete
- ✅ Function returns expected output
- ✅ API endpoint responds correctly
- ✅ Database operations work as specified
- ✅ UI renders and functions properly

## Cloud Service Verification
- ✅ Convex deployment successful and functional
- ✅ Clerk authentication working with real auth calls
- ✅ Vercel AI SDK streaming responses correctly

## Quality Gates
- ✅ All tests passing
- ✅ Coverage thresholds met (75% domain, 70% CLI/Edge)
- ✅ TypeScript compilation clean
- ✅ ESLint/Prettier compliance
- ✅ No regressions in existing features
```

## Success Metrics for Cursor Agent

### Story Quality
- Acceptance criteria are verifiable before implementation starts
- Stories approved only when properly scoped and architected
- Test suites comprehensive before code implementation begins

### Code Review Effectiveness
- Consistent application of TypeScript/ESLint standards
- Architecture compliance verified automatically
- Performance benchmarks enforced

### Completion Validation
- Functional verification over file existence
- Cloud service deployment success verified
- No false positives on story completion

## Next Steps

1. **Review**: Confirm Cursor Agent responsibilities and rule scope
2. **Prototype**: Create core story review and test creation rules
3. **Test**: Use Cursor Agent for next feature story workflow
4. **Refine**: Adjust rules based on actual Cursor Agent performance
5. **Expand**: Add framework-specific validation rules

**Focus**: Configure Cursor Agent to enforce project standards and quality gates effectively.
