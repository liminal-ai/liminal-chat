# Story Writing Standards

## Acceptance Criteria Requirements

**RULE**: Acceptance criteria must be either obviously verifiable or explicitly state how they can be verified.

### ✅ Good Examples

**Obviously Verifiable:**
- `npm run dev` starts without errors
- File `convex/auth.config.ts` exists with Clerk issuer URL
- Environment variable `CONVEX_DEPLOYMENT` set in `.env.local`

**States How to Verify:**
- Authentication working: `api.users.testAuth` query returns authenticated user data
- HTTP Actions working: `/test` endpoint returns 200 response when called
- Performance targets met: Convex dashboard shows function execution <100ms

### ❌ Bad Examples

**Vague/Subjective:**
- "Basic authentication flow functional" (functional how? tested where?)
- "User sessions persist correctly" (persist how long? verified how?)
- "Development environment ready" (ready for what? measured how?)
- "All project components working together" (which components? how tested?)

## Validation Standard

**If I can't tell you exactly how to verify a criterion in 30 seconds, it's poorly written.**

Each criterion should either be:
1. **Binary obvious** (file exists, command succeeds, no errors)
2. **Include verification method** (call this function, check this dashboard, run this test)

## Story Completion Rules

**A story is NOT complete until:**
- All acceptance criteria are verifiably met
- For cloud services: deployment is successful and functional
- For authentication: actual auth calls work, not just files exist
- For APIs: endpoints return expected responses, not just code exists

## Time Tracking

Track estimated vs actual time for each story to improve future estimates:
- Record in `docs/planning/time-tracking.md`
- Include variance analysis and notes
- Use data to adjust future estimates

## Dependencies

Clearly state what each story depends on and what it blocks:
- **Dependencies**: What must be complete before this story starts
- **Blocks**: What cannot start until this story is complete

## Architecture Compliance

Stories must align with:
- Current system architecture decisions
- Established coding standards
- Security requirements
- Performance targets

## Phase 0 Relaxed Standards

During migration phase:
- Focus on working functionality over perfect implementation
- Basic error handling acceptable
- Comprehensive tests not required
- Performance optimization can be deferred

## Quality Gates

Never approve stories that:
- Have unverifiable acceptance criteria
- Cannot be functionally tested
- Depend on manual user actions for completion
- Lack proper deployment verification
