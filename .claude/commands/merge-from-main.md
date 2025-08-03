# Merge latest main into current branch

Execute these git commands in sequence:

```bash
# 1. Save current work
git stash --include-untracked

# 2. Update main
git checkout main
git pull origin main

# 3. Return and merge
git checkout -
git merge main

# 4. Restore work
git stash pop
```

This ensures all local changes are preserved during merge in all circumstances.
