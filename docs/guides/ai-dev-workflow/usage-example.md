# AI Dev Workflow Usage Example

## Example: Implementing Story 2 of Feature 002

### Step 1: Product Owner → Tech Lead
```bash
# PO provides requirements to Tech Lead
claude code --prompt "You are Tech Lead. Implement Story 2: Edge API Messages Support. 
Requirements: [provides story-2 requirements]. 
Use the multi-agent workflow."
```

### Step 2: Tech Lead Creates Structure
Tech Lead creates in `domain-server-nest/story-2/`:
```
prompts/
├── qa-write-tests.md
├── dev-implement.md  
└── qa-verify.md
context/
├── requirements.md
├── status.md
└── (others created by agents)
```

### Step 3: Tech Lead → QA (Write Tests)
Tech Lead constructs `prompts/qa-write-tests.md`:
```markdown
# QA Task: Write Tests for Story 2

[Contents of personas/qa-base.md]

## Context
[Contents of context/requirements.md]

## Your Task
Write comprehensive tests for Edge API Messages Support...
```

Then runs:
```bash
claude code --prompt domain-server-nest/story-2/prompts/qa-write-tests.md
```

### Step 4: Tech Lead → Developer (Implement)
After QA writes tests, Tech Lead constructs `prompts/dev-implement.md`:
```markdown
# Developer Task: Implement Story 2

[Contents of personas/developer-base.md]

## Context  
[Contents of context/requirements.md]
[Contents of context/qa-work.md]

## Your Task
Implement code to make these tests pass...
```

### Step 5: Tech Lead → QA (Verify)
After Developer implements, Tech Lead runs QA verification...

### Step 6: Iterate
Tech Lead continues Developer fixes → QA verification until all tests pass.

### Step 7: Tech Lead → Product Owner
Tech Lead reports: "Story 2 complete. All tests passing, coverage at 92%."

## Key Points

1. **Tech Lead manages all context** - other agents just read/write their work files
2. **Each prompt is self-contained** - includes persona + context + task
3. **Iteration continues until QA approves** - no premature "done"
4. **Clear evidence required** - test outputs, coverage numbers, etc.