# Liminal Chat AI Agent Prompts

This directory contains the system prompts and templates for AI agents used in the Liminal Chat development workflow.

## Agent Prompts

### `augy.md` - Architect & Code Review Sentinel
**Role**: Augment Agent (Augy) - Strategic planning, architecture, and quality assurance
**Purpose**: 
- Break features into detailed stories with acceptance criteria
- Create comprehensive test suites and implementation specifications
- Review and validate Claude Code's work against architectural standards
- Enforce quality gates and hunt for completion bias

**Key Features**:
- A.R.C.H. Review Protocol (Architectural Compliance, Requirements Fulfillment, Code Quality, Handoff Readiness)
- Completion bias detection and architectural drift prevention
- "Augy Pause" coherence anchor for long-context stability

### `claude.md` - Implementation Engineer
**Role**: Claude Code - Tactical implementation and coordination
**Purpose**:
- Execute detailed implementation tasks following Augy's specifications
- Coordinate multi-agent work slices in TechLead mode
- Handle mechanical coding work efficiently
- Implement to satisfy acceptance criteria

**Key Features**:
- Three operational modes (Chat, Agent, TechLead)
- Agent spawning and slice coordination protocols
- "Implementation Pause" coherence anchor
- Systematic debug protocol and anti-pattern defenses

## Planning Templates

### `workplan-to-story-prompt.md` - Feature Planning Framework
**Purpose**: Template for creating comprehensive implementation workplans
**Usage**: Used by Augy to break complex features into executable slices

**Key Components**:
- Context review and synthesis requirements
- Slice-based agent delegation strategy
- TDD methodology integration
- Quality gate enforcement
- Anti-completion-pressure safeguards

**Workflow**:
1. Augy uses this template to create detailed workplans
2. Workplan includes ready-to-execute slice prompts for Claude
3. Each slice has 2-4 agents with specific task boundaries
4. Human validation checkpoints between slices

## Usage Guidelines

### AI-Augmented Development Workflow

```
User (Strategic Direction)
    ↓
Augy (Planning & Architecture)
    ↓ [Detailed Specs & Tests]
Claude Code (Implementation)
    ↓ [Working Code]
Augy (Quality Review)
    ↓ [Approval/Rejection]
User (Acceptance Testing)
```

### Prompt Management Best Practices

1. **Coherence Anchors**: Both agent prompts include mandatory response prefixes to maintain identity over long contexts
2. **Quality Gates**: Never compromise on test coverage, linting, or architectural standards
3. **Slice Boundaries**: Keep agent tasks focused and non-overlapping to prevent conflicts
4. **Context Preservation**: Use scratchpad locations for agent coordination and handoffs

### Key Principles

- **Architecture First**: Every decision aligns with established patterns
- **Test-Driven Discipline**: Comprehensive test suites before implementation
- **Quality Gate Enforcement**: No shortcuts or rationalized failures
- **Completion Bias Detection**: Actively hunt for test shortcuts and drift
- **Specification Precision**: Create specs so detailed that success is inevitable

## Integration with Development Process

These prompts integrate with the broader Liminal Chat development standards:

- **Architecture**: `docs/architecture/liminal-chat-architecture.md`
- **System Design**: `docs/architecture/liminal-chat-system-design.md`
- **Coding Standards**: `docs/development/liminal-chat-coding-standards.md`
- **Development Process**: `docs/development/liminal-chat-development-process.md`
- **Testing Guidelines**: `docs/development/liminal-chat-testing-guidelines.md`
- **Quality Gates**: `docs/development/liminal-chat-quality-gates.md`

## Maintenance

- Update prompts when architectural patterns evolve
- Refine coherence anchors based on long-context performance
- Document new anti-patterns as they're discovered
- Keep quality standards aligned with project requirements
