# Workplan-to-Story Prompt Template

This prompt synthesizes architectural systems thinking (TaskMaster approach) with rigorous TDD methodology (Claude approach) using slice-based agent delegation for optimal execution.

## 🎯 **Complete Workplan Creation Prompt**

```
**CONTEXT REVIEW AND SYNTHESIS:**
Before creating the workplan, review and ultrathink through the following project documents to ensure the plan is grounded in actual project reality:

1. **Primary Requirements**: Read the complete [STORY SPECIFICATION] document
2. **Development Standards**: Review `docs/technical/engineering-practices.md` for coding standards and practices
3. **Technical Architecture**: Review `docs/technical/decisions.md` for architectural patterns and constraints
4. **Project Status**: Check `docs/project-status.md` for current implementation state and dependencies
5. **Testing Practices**: Review `docs/technical/testing-practices.md` for test patterns and requirements
6. **Feature Context**: Review any related feature documentation in `docs/features/` directory

**ULTRATHINK SYNTHESIS:**
Spend significant thinking tokens (8k+) to synthesize this information and consider:
- How does this story fit into the existing architecture?
- What are the specific technical constraints and decisions that apply?
- Which existing patterns and practices should be followed?
- What are the integration points with current system state?
- Are there any architectural decisions that impact implementation approach?
- What testing patterns are established that should be maintained?

Create a detailed slice-based implementation plan for [STORY NAME] that incorporates this project context and combines architectural systems thinking with rigorous TDD methodology using agent delegation:

**ARCHITECTURAL INTEGRATION APPROACH:**
1. Think about system integration explicitly - identify coordination work beyond individual components
2. Sequence tasks by buildable dependencies and demonstrable deliverables, not just logical grouping  
3. Frame each task as something users/stakeholders can see working
4. Consider the complete user journey through the system (CLI → Edge → Domain → Response)
5. Include all work needed to ship (integration, documentation, error handling coordination)
6. Recognize system-level behaviors that need explicit attention

**TDD METHODOLOGY REQUIREMENTS:**
1. Break work into 6-15 minute time-boxed agent tasks with clear verification criteria
2. Follow Red → Green → Refactor cycle with tests-first approach
3. Each slice must pass `pnpm verify:all` before proceeding to next slice
4. Include specific Definition of Done with coverage thresholds (Domain 80%, CLI/Edge 70%)
5. Create shared types and interfaces before implementation
6. Write comprehensive test suites covering edge cases and error scenarios

**SLICE-BASED AGENT DELEGATION:**
1. Switch to TechLead Mode for all slice execution and coordination work
2. Structure implementation into slices of 2-4 parallel agent tasks
3. Each slice should represent a complete milestone that can be validated independently
4. Agents in same slice should have minimal interdependencies
5. Each slice builds on validated foundation from previous slice
6. After each slice, return to Chat Mode with summary for user validation
7. Only proceed to next slice when user gives explicit go-ahead

**TEST STATE DISCIPLINE:**
1. Plan test enablement strategy for each slice:
   - SLICE 1: Create E2E tests as .skip() or .todo(), unit tests passing with mocks
   - SLICE 2: Enable core unit tests, keep E2E skipped until integration ready
   - SLICE 3: Enable all tests including E2E when full integration complete
2. Use .skip() or .todo() for tests not ready to run with documented rationale
3. All uncommented tests MUST pass for slice completion
4. NEVER delete or artificially modify tests under completion pressure
5. If blocked, return to user early rather than compromise test integrity

**SLICE COMPLETION GATES:**
Each slice must achieve:
- `pnpm verify:all` shows clean summary (lint ✅, typecheck ✅, test ✅, coverage ✅)
- All uncommented tests passing
- Skipped tests documented with TODO comments and rationale
- No completion pressure violations (deleted tests, artificial modifications)

**FORBIDDEN ACTIONS UNDER PRESSURE:**
❌ NEVER delete tests that were created intentionally
❌ NEVER skip tests that should be running  
❌ NEVER modify test expectations to make them pass artificially
❌ NEVER ignore lint failures at slice completion
❌ NEVER proceed to next slice without user validation

**ALLOWED PRESSURE RESPONSES:**
✅ Return to user early with partial slice if blocked
✅ Create targeted fix agent with narrow scope for specific issue
✅ Document why test remains skipped with TODO comment
✅ Ask user for guidance when test strategy unclear

**SLICE EXECUTION PROTOCOL:**
When executing each slice:
1. Announce "Switching to TechLead Mode" for slice coordination
2. Spawn agents using Agent Mode with 10k token context budget allocation
3. Coordinate agent work and validate integration points
4. Run `pnpm verify:all` to ensure slice completion meets quality gates
5. Return to Chat Mode and provide human validation handoff

**HUMAN VALIDATION HANDOFF:**
After each slice, provide:
- Summary of what each agent accomplished with specific deliverables
- Technical validation results from `pnpm verify:all` output
- Specific items for user to verify (functionality, integration, edge cases)
- Recommended QA checks and testing approaches
- Clear go/no-go decision point for next slice
- Any blockers or concerns that need user input

**DELIVERABLE FOCUS:**
Each agent task should result in something demonstrable:
- Working code with passing tests
- Validated system behavior  
- Integrated functionality across tiers
- Clear evidence of completion (test output, demo commands)
Avoid pure infrastructure work unless essential for the delivery sequence.

**QUALITY GATES:**
- Unit tests written before corresponding implementation
- Integration tests validate cross-tier communication  
- E2E tests prove user scenarios work end-to-end
- Performance and error handling verified with evidence
- Memory constraints and edge cases tested
- Complete App Verification Protocol for final validation

**VERIFICATION PROTOCOL:**
Include the complete verification sequence for final slice:
1. `pnpm verify:all` passes completely
2. Manual integration testing with `pnpm start:all` and `pnpm cli:chat:openrouter`
3. Performance validation against specified thresholds
4. Edge case testing with real provider APIs
5. Ready for user review, QA agent consultation, and PR creation

**SLICE EXECUTION PROMPT GENERATION:**
For each slice, generate a detailed execution prompt that specifies:

1. **Agent Spawn Strategy:**
   - Exact number of agents (2-4 optimal based on slice complexity)
   - Specific task assignment for each agent with clear boundaries
   - Agent naming/identification for coordination (Agent A, Agent B, etc.)
   - Inter-agent dependencies and sequencing within parallel execution

2. **Agent Thinking Framework:**
   - All agents use 10k tokens with context budget allocation:
     - 25% Domain understanding (architecture, interfaces, system context)
     - 35% Implementation focus (the specific task and deliverables)
     - 30% Integration points (how work connects to other components)
     - 10% Progress tracking (decisions made, next steps, handoff context)
   - Every agent prompt starts with: "Think hard with 10k tokens allocated as: 25% domain understanding, 35% implementation, 30% integration, 10% progress tracking."

3. **Agent Task Templates:**
   - Detailed prompt for each agent role with specific context and constraints
   - Expected deliverables and output format for each agent
   - Success criteria and verification steps for each agent's work
   - Integration points where agents must coordinate or hand off artifacts

4. **Slice Completion Verification:**
   - Specific `pnpm verify:all` expectations and acceptable output
   - Manual testing steps required for slice validation
   - Integration checkpoints and cross-tier verification
   - Performance or functional criteria that must be met

5. **Agent Coordination Protocol:**
   - Shared artifacts that must be created/consumed between agents
   - Handoff points and dependencies within the slice
   - Conflict resolution strategy if agents produce incompatible outputs
   - Recovery strategy if any agent fails or produces incomplete work

Use [STORY SPECIFICATION] as the input requirements document.
```

## 📋 **Usage Instructions**

1. **Replace Placeholders**: 
   - `[STORY NAME]` with actual story identifier
   - `[STORY SPECIFICATION]` with path to the complete story document

2. **Context Preparation**:
   - Ensure all referenced documents are current and accessible
   - Verify `docs/project-status.md` reflects current implementation state
   - Check that architecture decisions and engineering practices are up to date
   - Context synthesis will use TechLead Mode thinking allocation

3. **Before Execution**:
   - Ensure current branch is clean and up to date
   - Run `pnpm verify:all` to establish baseline
   - Have QA agent process ready for slice validation

3. **During Execution**:
   - User validates each slice before proceeding
   - Consult QA agent between slices as needed
   - Commit and push validated slices immediately
   - Stop execution if any completion pressure violations detected

4. **Slice Validation Checklist**:
   - [ ] `pnpm verify:all` shows clean SUMMARY
   - [ ] All deliverables demonstrated working
   - [ ] Integration tested manually where applicable
   - [ ] No artificial test modifications or deletions
   - [ ] Ready for QA agent review
   - [ ] Committed and pushed to branch

## 🎪 **Key Principles**

This approach combines:
- **TaskMaster's architectural wisdom**: System integration, dependency logic, deliverable focus
- **Claude's implementation rigor**: TDD discipline, quality gates, verification protocols  
- **Agent delegation benefits**: Context isolation, parallelization, drift prevention
- **Human control gates**: Validation checkpoints, QA integration, git hygiene
- **Anti-pressure safeguards**: Test integrity protection, early return options

The result is controlled, parallel execution with architectural soundness and implementation quality.

## 📦 **Expected Workplan Deliverables**

Using this prompt should produce a comprehensive workplan containing:

### **1. Context Integration Summary**
- Key architectural decisions that impact implementation
- Relevant patterns from engineering practices that apply
- Integration points with existing system components
- Constraints from technical architecture that must be respected

### **2. Slice-Based Implementation Structure**
- 3-5 logical slices representing implementation milestones
- Clear dependencies between slices with rationale
- Estimated agent count and complexity for each slice
- Human validation checkpoints between slices

### **3. Ready-to-Execute Slice Prompts**
- Detailed agent spawn instructions for each slice
- Specific thinking token allocations with rationale
- Agent coordination protocols and handoff points
- Slice completion verification criteria

### **4. Quality Integration**
- Test enablement strategy across slices
- `pnpm verify:all` expectations for each slice
- Anti-completion-pressure safeguards
- Final verification protocol

### **5. Risk Mitigation**
- Anticipated integration challenges
- Agent coordination failure recovery strategies
- Test state management across slice boundaries
- Escalation paths for blocked execution

This creates a **fully executable implementation strategy** rather than high-level task lists.