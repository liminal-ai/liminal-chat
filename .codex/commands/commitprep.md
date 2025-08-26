# Codex Commit Prep

This mirrors the Claude flow, tuned for this repo and the Codex CLI. Steps are safe-by-default, with optional network-dependent checks.

## Usage
```bash
# From repo root
pnpm run codex:commitprep

# Options
COMMITPREP_SKIP_DOCS=1 pnpm run codex:commitprep
COMMITPREP_SKIP_TESTS=1 pnpm run codex:commitprep
COMMITPREP_SKIP_AUDIT=1 pnpm run codex:commitprep
```

## Flow
1) Stage all (blocking)
- `pnpm precommit:stage-all` then `pnpm precommit:list-files`

2) Quick hygiene (warn-only)
- `pnpm precommit:branch-check`, `pnpm precommit:file-count`, `pnpm precommit:temp-files`

3) Format (auto-fix)
- `pnpm format:check || pnpm format:fix`
- `pnpm precommit:stage-all`

4) Secrets & sensitive checks
- Warn: `pnpm precommit:api-keys`, `pnpm precommit:sensitive-files`, `pnpm precommit:env-files`
- Gate: `pnpm precommit:trufflehog` (stop on findings)

5) Static hygiene (warn-only)
- `pnpm precommit:debug-statements`, `pnpm precommit:security-todos`, `pnpm precommit:hardcoded-ips`, `pnpm precommit:large-files`, `pnpm precommit:binary-files`

6) Lint & types (blocking)
- `pnpm lint` and `pnpm typecheck`

7) Tests (blocking unless skipped)
- Root tests: `pnpm test`
- Optional: `pnpm test:integration` (Playwright), `pnpm test:smoke`

8) Docs (optional)
- `pnpm -F @liminal/api docs:llm`
- `git add docs/tsdocs/*`

9) Dependency audit (optional; network)
- `pnpm audit --prod` or `pnpm precommit:snyk:test`

10) Summary & commit template
- Propose a Conventional Commit subject (e.g., `fix(chat): …`). Include scope, rationale, risk, test notes, and screenshots for UI.

