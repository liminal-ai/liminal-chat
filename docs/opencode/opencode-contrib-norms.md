# Opencode Contribution Norms & Process

## Official Policy

**From README.md**:
- **Issue-first approach**: "open an issue first to discuss what you'd like to implement"
- **Very responsive**: "We're pretty responsive there"
- **Saves work**: "it'll save you from working on something that we don't end up using"
- **Simple fixes**: "No need to do this for simpler fixes"

## Observed Patterns from PR Analysis

### ✅ Gets Merged Fast
**Small fixes** (1-9 line changes):
- **#726**: Fix Elixir LSP startup (1 line) - merged quickly
- **#720**: Skip upgrade if same version (9 lines) - merged quickly
- **#670**: Document instructions config - merged
- **#666**: Add dev script - merged

**Characteristics**:
- Clear, focused value proposition
- Good descriptions with screenshots/examples
- Minimal scope and risk

### 🔄 Long Review Process  
**Big features** (100+ line changes):
- **#518**: Text selection and copy (2416 additions) - assigned to @thdxr, still open
- **#722**: MCP project-scoped support - complex feature, still open
- **#719**: `/config` command - new functionality, still open
- **#707**: Custom slash command - still open

**Characteristics**:
- Major functionality additions
- Complex implementation requiring careful review
- Gets assigned to core maintainers for thorough evaluation

### 🚫 Gets Closed
**Duplicate/alternative approaches**:
- **#673**: Add biome formatter - closed (probably conflicts with existing formatter approach)

## Key Contributors & Decision Makers

**Core Maintainers**:
- **@thdxr** - Primary maintainer, assigns complex PRs to himself
- **@adamdotdevin** - Secondary maintainer (frequently mentioned in issues)

**The Assignment Pattern**:
1. Community submits PR
2. Maintainers review and either:
   - Merge simple fixes immediately
   - Assign complex features to themselves for detailed review
   - Close if conflicts with project direction

## Recommended Strategy for Our Contributions

### 1. Session Management (Low Risk)
**Approach**: Direct PR with issue
- Small, focused improvement
- Clear personal and community value
- Minimal complexity and risk

### 2. Configurable Layout (Medium Risk)  
**Approach**: Issue discussion first
- Medium complexity (touching TUI layout code)
- Community demand proven (multiple issues)
- Should align with maintainer plans

### 3. Context Hooks (High Risk)
**Approach**: Detailed issue discussion essential
- Major architectural addition
- Needs buy-in on approach and API design
- Large implementation requiring maintainer review

## Process Timing Expectations

**Simple fixes**: Days to weeks
**Medium features**: Weeks to months  
**Major features**: Months (if accepted at all)

## Quality Standards

**Required**:
- Clear problem statement
- Good documentation/screenshots
- Test plan description
- Clean, focused implementation

**Recommended**:
- Reference existing community issues
- Show community demand/validation
- Propose minimal viable implementation first