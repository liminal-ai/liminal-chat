# Opencode Improvement Ideas & Contributions

## Planned Improvements

### 1. Context Engineering Hooks
**Goal**: Add hook system for dynamic system prompt manipulation and conversation history management

**Details**:
- Hook point at `src/session/index.ts:649` before `streamText()` call
- Handler interface: `processContext({ system, msgs, sessionID, tools }) => { system, msgs }`
- Enable multi-modal agent development (researcher/coder/QA modes)
- Multi-fidelity conversation history with XML checkpoint tags

**Status**: Planned - Phase 1 ready to implement

### 2. Configurable TUI Layout & Width
**Goal**: Make TUI layout constraints user-configurable instead of hardcoded

**Current Issues**:
- Container width hardcoded to 84 chars (`tui.go:426`)
- Editor width hardcoded to 80 chars (`tui.go:669`) 
- Forced centering creates excessive margins
- No way to use full terminal width

**Changes Made**:
- ✅ Removed 84-char container constraint → full width
- ✅ Removed 80-char editor constraint → full width  
- ✅ Disabled centering → left-aligned layout
- 🔲 TODO: Make these configurable via settings instead of hardcoded

**Community Validation**:
- Issue #368: "Make max width of the chat TUI configurable" (assigned to maintainer)
- Issue #525: "Screen Layout Compressed..." (assigned to maintainer)
- Issue #723: "Use the full terminal width to display diffs"
- Multiple user complaints about wasted screen space

**Status**: Partially implemented, needs configuration system

### 3. Better Session Continuation Interface  
**Goal**: Improve session management and continuation UX

**Current Problems**:
- 12+ sessions with cryptic IDs like `ses_81faab9b7ffe2EZEbLqCVlwxpR`
- No way to browse sessions by meaningful titles
- Sessions have good titles ("General codebase and product overview inquiry") but no CLI to see them
- Only `--continue` (last session) or `--session <cryptic-id>` options

**Proposed Solutions**:
- Session list command showing titles + dates
- Session search by title keywords
- Quick resume by partial title match
- Session cleanup/management tools

**Data Location**: `~/.local/share/opencode/project/{project}/storage/session/info/`

**Status**: Research complete, ready to implement

## Implementation Priority

1. **Session Management** (immediate personal value)
2. **Context Hooks** (core goal) 
3. **Configurable Layout** (polish + community contribution)

## Community Alignment

All three improvements address real community pain points with existing GitHub issues and maintainer acknowledgment. Strong potential for upstream contribution.