# Story Template - VERTICAL SLICE REQUIRED

## Story: [Name]

### Vertical Slice Checklist
A story is NOT valid unless it includes ALL layers:
- [ ] **UI Change** (CLI command, web page, or API endpoint)
- [ ] **Edge Change** (if needed for routing/validation)
- [ ] **Domain Change** (business logic)
- [ ] **E2E Test Path** (user can actually test the feature)

### Definition of Done
- [ ] User can execute a command and see the feature work
- [ ] All layers have tests
- [ ] Feature is documented with usage example

### Anti-Pattern Warning
❌ DO NOT create stories that only touch one layer
❌ DO NOT create "backend only" stories
❌ DO NOT create stories that can't be tested by a user

### Story Description
[Only write description AFTER confirming vertical slice]

### Usage Example
```bash
# What command will the user run to test this?
# If you can't write this, the story is invalid
```