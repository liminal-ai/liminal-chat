# Feature Planning Prompt

You are planning a new feature for Liminal Type Chat. Your job is to break it down into implementable stories that follow our vertical slice architecture.

## Core Principle: User-First Story Design

Every story MUST start with "As a user, I can..." and end with a specific command or action they can perform.

## Story Breakdown Rules

### 1. Start with User Actions
List all the things a user will DO with this feature:
- What commands will they type?
- What buttons will they click?
- What will they see happen?

### 2. Create Vertical Slices
Each story must include:
- **User Interface**: CLI command, web endpoint, or UI element
- **Business Logic**: What happens when they do it
- **Visible Result**: What they see that proves it worked

### 3. Story Validation Test
For each story, you MUST be able to write:
```bash
# User types this command
$ [exact command]

# User sees this result
[exact output]
```

If you can't write this, the story is invalid.

### 4. Anti-Patterns to Reject
❌ "Implement X provider in domain layer"
❌ "Add Y to database schema"  
❌ "Create service for Z"

✅ "User can chat with OpenAI by typing: liminal chat --provider openai 'Hello'"
✅ "User can see available providers by typing: liminal providers"

## Feature Planning Template

### Feature: [Name]

#### User Capabilities
What will users be able to DO:
1. [Action 1]
2. [Action 2]
3. [Action 3]

#### Story Breakdown

**Story 1: [User can...]**
- Command: `liminal [command]`
- Result: [what they see]
- Layers touched: CLI → Edge → Domain

**Story 2: [User can...]**
- Command: `liminal [command]`  
- Result: [what they see]
- Layers touched: CLI → Edge → Domain

#### Implementation Order
Order stories by:
1. Most basic functionality first
2. Each story builds on previous
3. User can test at every step

#### Out of Scope
What this feature does NOT include (yet)

## Example: Multi-Provider Feature

### User Capabilities
1. User can list available providers
2. User can chat with a specific provider
3. User can set a default provider

### Story Breakdown

**Story 1: User can list providers**
- Command: `liminal providers`
- Result: List of available providers with status
- Layers: CLI → Edge → Domain (provider discovery)

**Story 2: User can chat with specific provider**
- Command: `liminal chat --provider openai "Hello"`
- Result: Response from OpenAI
- Layers: CLI (new flag) → Edge (pass param) → Domain (use provider)

**Story 3: User can set default provider**
- Command: `liminal config set provider openai`
- Result: "Default provider set to: openai"
- Layers: CLI (config cmd) → Local file storage

Each story is independently testable and valuable to the user.