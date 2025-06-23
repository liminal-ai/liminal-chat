# Feature & Story Planning Guide (Draft)

## Feature Planning

### Feature Structure
```
docs/planning/features/
├── 001-feature-name.md          # Feature document
└── 001-feature-name/            # Story folder
    ├── story-1-name.md
    ├── story-2-name.md
    └── story-N-name.md
```

### Feature Document Requirements
- **Abstract**: 2-4 sentence summary of what and why
- **Acceptance Criteria**: Feature-level success criteria
- **Dependencies**: What blocks this, what this blocks
- **Technical Requirements**: Architecture, environment, dependencies

## Story Planning

### Story Size
- **Target**: ~20 minutes for professional developer
- **Scope**: Single meaningful unit of work
- **Dependencies**: Clear what must be complete before starting

### Acceptance Criteria Standards

#### ✅ GOOD - Verifiable Criteria
```
- File `convex/schema.ts` exists with user table definition
- `npm run dev` starts without errors
- HTTP endpoint `/test` returns 200 response when called
- Convex dashboard shows users table with correct fields
```

#### ❌ BAD - Unverifiable Criteria  
```
- Authentication flow functional
- Development environment ready
- Database operations working
- System components integrated
```

#### The Rule
**If you can't tell someone exactly how to verify it in 30 seconds, rewrite it.**

### Time Estimation Guidelines

Based on Feature 1 data:

#### Infrastructure/Setup Tasks
- **Reduce estimates by 35%** from initial intuition
- Examples: Project setup, environment config, basic deployment

#### Schema/Business Logic Tasks  
- **Keep current estimates** (20% variance acceptable)
- Examples: Database design, function implementation, validation logic

#### Cloud Services
- **Always include deployment time** in estimates
- **Research deployment requirements** before estimating

## Architecture Research Requirements

### Before Creating Stories
- [ ] Understand deployment model (local vs cloud)
- [ ] Verify integration patterns and dependencies
- [ ] Research tool-specific requirements and limitations
- [ ] Identify potential blockers or unknowns

### For Cloud-First Services
- [ ] Deployment required for development? (e.g., Convex)
- [ ] Environment setup complexity
- [ ] Authentication/credential requirements
- [ ] Integration testing approach

## Validation Standards

### Story Approval Criteria
- [ ] All acceptance criteria verifiably met
- [ ] Functional verification (not just file existence)
- [ ] Deployment successful (for cloud services)
- [ ] No blocking issues for next story

### Validation Timing
- **Target**: Within 30 minutes of story completion
- **Method**: Test each acceptance criterion explicitly
- **Documentation**: Update time tracking with actual vs estimated

### Cloud Service Validation
- [ ] Deployment accessible and functional
- [ ] Core operations work end-to-end
- [ ] Integration points verified
- [ ] Performance within acceptable range

## Common Pitfalls

### Planning Phase
- **Vague acceptance criteria** - Use specific, testable conditions
- **Missing architecture research** - Understand deployment model first
- **Underestimating cloud complexity** - Factor in deployment requirements

### Implementation Phase  
- **File existence ≠ functionality** - Test actual operations
- **Delayed validation** - Validate immediately after completion
- **Scope creep** - Stick to story boundaries

### Estimation Phase
- **Infrastructure overestimation** - Modern tools are streamlined
- **Cloud deployment underestimation** - Research requirements first
- **Dependency blindness** - Map blocking relationships clearly

## Process Checkpoints

### Feature Planning
1. Architecture research complete?
2. Dependencies mapped?
3. Stories properly sized (~20 min each)?
4. Acceptance criteria verifiable?

### Story Implementation
1. All acceptance criteria met?
2. Functional verification complete?
3. Time tracking updated?
4. Next story unblocked?

### Feature Completion
1. All stories approved?
2. Integration testing complete?
3. Documentation updated?
4. Lessons captured in dev journal?

---

*This guide will evolve based on learnings from Feature 2 and beyond.*
