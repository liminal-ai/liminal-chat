#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Codex Commit Prep starting..."

WARNINGS=()

run_warn() {
  local label="$1"; shift
  echo "\n— $label (warn-only)"
  if ! bash -lc "$*"; then
    WARNINGS+=("$label failed")
    echo "⚠️  $label: non-blocking failure"
  fi
}

run_stop() {
  local label="$1"; shift
  echo "\n— $label"
  bash -lc "$*"
}

# 1) Stage all
run_stop "Stage all" "pnpm precommit:stage-all"
run_warn "List staged files" "pnpm precommit:list-files || true"

# 2) Quick hygiene (warn-only)
run_warn "Branch check" "pnpm precommit:branch-check"
run_warn "File count" "pnpm precommit:file-count"
run_warn "Temporary/test files" "pnpm precommit:temp-files"

# 3) Format (auto-fix)
run_warn "Prettier check" "pnpm format:check"
run_warn "Prettier fix (if needed)" "pnpm format:fix"
run_stop "Re-stage after format" "pnpm precommit:stage-all"

# 4) Secrets & sensitive
run_warn "API key patterns" "pnpm precommit:api-keys"
run_warn "Sensitive filenames" "pnpm precommit:sensitive-files"
run_warn ".env files staged" "pnpm precommit:env-files"
run_stop "Trufflehog scan (blocking)" "pnpm precommit:trufflehog"

# 5) Static hygiene (warn-only)
run_warn "Debug statements" "pnpm precommit:debug-statements"
run_warn "Security TODOs" "pnpm precommit:security-todos"
run_warn "Hardcoded IPs" "pnpm precommit:hardcoded-ips"
run_warn "Large files" "pnpm precommit:large-files"
run_warn "Binary files" "pnpm precommit:binary-files"

# 6) Lint & types (blocking)
run_stop "Lint" "pnpm lint"
run_stop "Typecheck" "pnpm typecheck"

# 7) Tests (blocking unless skipped)
if [[ "${COMMITPREP_SKIP_TESTS:-}" != "1" ]]; then
  run_stop "Run tests" "pnpm test"
else
  echo "\n— Tests: skipped (COMMITPREP_SKIP_TESTS=1)"
fi

# 8) Docs (optional)
if [[ "${COMMITPREP_SKIP_DOCS:-}" != "1" ]]; then
  run_warn "Generate LLM docs" "pnpm -F @liminal/api docs:llm"
  run_warn "Stage docs" "git add docs/tsdocs/* || true"
else
  echo "\n— Docs: skipped (COMMITPREP_SKIP_DOCS=1)"
fi

# 9) Dependency audit (optional; network)
if [[ "${COMMITPREP_SKIP_AUDIT:-}" != "1" ]]; then
  run_warn "pnpm audit --prod" "pnpm audit --prod"
  run_warn "Snyk test (if installed)" "pnpm precommit:snyk:test"
else
  echo "\n— Audit: skipped (COMMITPREP_SKIP_AUDIT=1)"
fi

echo "\n✅ Codex Commit Prep complete."
if ((${#WARNINGS[@]})); then
  echo "\nSummary of warnings:"
  for w in "${WARNINGS[@]}"; do
    echo " - $w"
  done
fi

cat <<TEMPLATE

Suggested Conventional Commit message (edit as needed):

<type>(<scope>): <short summary>

Why:
- <reason/goal>

Changes:
- <key change 1>
- <key change 2>

Risks/Mitigations:
- <risk> / <mitigation>

Test Notes:
- <how tested / coverage>
TEMPLATE

