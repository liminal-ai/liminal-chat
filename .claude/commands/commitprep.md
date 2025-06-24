1. Pre-staging Review (Manual review required)
   - Command: `pnpm precommit:review`
     - Lists all modified and untracked files
   - Scan for potentially inappropriate files
   - Look for personal documents, backups, test data with real info
   - Check for files that seem out of place for the project
   - Present findings for user decision before staging

2. Stage all changes
   - Command: `pnpm precommit:stage-all`
   - Stages all changes with git add -A

3. Security Pass 1: Critical Security (Stop on fail)
   - Command: `pnpm precommit:trufflehog`
     - Runs trufflehog on staged files with .trufflehog-exclude file
     - Uses .trufflehog.yaml for custom detectors (Clerk, OpenRouter, Perplexity, Vercel v0)
   - Command: `pnpm precommit:sensitive-files`
     - Checks for sensitive filenames (*.pem, *.key, credentials.json, id_rsa)
   - Command: `pnpm precommit:env-files`
     - Checks for environment files (.env.*)
   - Command: `pnpm precommit:api-keys`
     - Additional pattern-based scan for API keys in ALL files
   - Stop and report if any issues found

4. Security Pass 2: Code Quality Security (Show warnings)
   - Command: `pnpm precommit:debug-statements`
     - Scans for debug statements (console.log, debugger)
   - Command: `pnpm precommit:security-todos`
     - Checks for TODO/FIXME with security keywords
   - Command: `pnpm precommit:hardcoded-ips`
     - Looks for hardcoded localhost/IPs
   - Show warnings but continue

5. Security Pass 3: Data Patterns (Info/Review)
   - Command: `pnpm precommit:large-files`
     - Checks for large files (>1MB)
   - Command: `pnpm precommit:binary-files`
     - Identifies binary files
   - Show for review

6. Code Standards Pass (Show violations)
   - Manual review against docs/development/liminal-chat-coding-standards.md
   - Flag any violations of standards
   - Show violations but continue

7. Dependency Security Pass (Stop on critical)
   - Command: `pnpm audit --prod`
     - Checks for vulnerable production dependencies
   - Stop if critical vulnerabilities found
   - Show high/medium vulnerabilities as warnings
   - Continue if only low severity issues

8. Lint Check (Stop on errors)
   - Command: `pnpm lint`
     - Checks code syntax and style across all packages
   - Stop if linting errors found
   - Show warnings but continue

9. Type Check (Stop on errors)
   - Command: `pnpm typecheck`
     - Ensures TypeScript compilation across all packages
   - Stop if type errors found

10. Branch Protection Check (Warning)
    - Command: `pnpm precommit:branch-check`
      - Checks if on main/master branch
    - Warn user if committing directly to protected branch
    - Ask for confirmation to continue

11. File Count Check (Warning)
    - Command: `pnpm precommit:file-count`
      - Counts number of files being staged
    - Warn if more than 20 files
    - Show file count and ask for confirmation

12. Final Summary
    - Show summary of all checks (passed/failed/warnings)
    - List any issues that need attention
    - If all critical checks pass, proceed to commit message

13. Commit Message Helper
    - If all checks pass, help craft commit message
    - Suggest format based on changes
    - Ensure message follows project conventions

All output should be shown in the conversation