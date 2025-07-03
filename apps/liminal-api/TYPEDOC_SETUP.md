# TypeDoc Documentation Setup

## Overview
We've set up TypeDoc to generate API documentation from the TSDoc comments in our Convex functions.

## What was done:
1. Removed API Extractor (wrong tool for backends)
2. Installed TypeDoc (`pnpm --filter liminal-api add -D typedoc`)
3. Created `typedoc.json` configuration
4. Updated `package.json` with simple docs script

## Usage:
```bash
# From project root
pnpm --filter liminal-api docs

# Or from liminal-api directory
pnpm docs
```

## Output:
Documentation is generated in `apps/liminal-api/docs/api/` as static HTML files.

## Configuration:
- Entry point: `./convex` directory
- Excludes: node_modules, _generated, tests
- Theme: Default TypeDoc theme
- Privacy: Excludes private, protected, and internal members

## Known Issues:
- @security custom tag shows warning (expected, as it's our custom TSDoc tag)
- Some code blocks use unsupported syntax highlighting

These warnings don't affect the documentation quality.