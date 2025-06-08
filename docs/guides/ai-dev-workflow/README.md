# AI Multi-Agent Development Workflow

## Overview

This workflow implements a multi-agent system for software development where specialized AI agents collaborate to ensure high-quality, test-driven development. The system uses Claude Code's batch mode to orchestrate multiple AI personas working together.

## Agent Roles

### 1. Implementation Lead (IL)
**Primary Interface**: The human developer interacts with this agent
- Strategic oversight and task breakdown
- Context management for other agents
- Progress tracking and iteration management
- Final verification and reporting

### 2. Quality Engineer (QE)
**Test-First Mindset**: Adversarial quality role
- Writes tests from requirements
- Runs verification checks
- Reports issues objectively
- Blocks completion until satisfied

### 3. Engineer (E)
**Implementation Focus**: Makes things work
- Implements code to pass tests
- Fixes issues found by QE
- Optimizes and refactors
- Documents implementation decisions

## Workflow Pattern

```
Human <-> Implementation Lead
            |
            ├-> Quality Engineer (writes tests)
            |     |
            |     └-> context/qe-work.md
            |
            └-> Engineer (implements)
                  |
                  └-> context/engineer-work.md
```

## Context Management

Each agent maintains its context in dedicated files:
- `context/requirements.md` - Current requirements (IL maintains)
- `context/qe-work.md` - Test status and issues (QE writes, IL manages)
- `context/engineer-work.md` - Implementation notes (E writes, IL manages)
- `context/status.md` - Overall progress (IL maintains)

## Execution Pattern

```bash
# IL breaks down work
claude code --prompt prompts/il-breakdown.md

# IL assigns test writing to QE
claude code --prompt prompts/qe-write-tests.md

# IL assigns implementation to E
claude code --prompt prompts/e-implement.md

# IL assigns verification to QE
claude code --prompt prompts/qe-verify.md

# Iterate until done
```

## Benefits

1. **Natural Quality Gates**: QE won't pass bad work
2. **Focused Context**: Each agent maintains specialized knowledge
3. **Objective Verification**: Separation prevents optimism bias
4. **Clear Accountability**: Each role has specific deliverables
5. **Scalable Pattern**: Can add more specialized agents as needed

## Future Extensions

- **Architect**: High-level design decisions
- **Security Engineer**: Security-focused reviews
- **Performance Engineer**: Optimization specialist
- **Documentation Writer**: Maintains docs in sync