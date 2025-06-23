1. Pre-staging Review (Manual review required)
   - Scan for potentially inappropriate files
   - Look for personal documents, backups, test data with real info
   - Check for files that seem out of place for the project
   - Present findings for user decision before staging

2. Stage all changes

3. Security Pass 1: Critical Security (Stop on fail)
   - Run trufflehog on staged files with .trufflehog-exclude file
   - Check for sensitive filenames (*.pem, *.key, credentials.json, id_rsa)
   - Check for environment files (.env.*)
   - Stop and report if any issues found

4. Security Pass 2: Code Quality Security (Show warnings)
   - Scan for debug statements (console.log, debugger)
   - Check for TODO/FIXME with security keywords
   - Look for hardcoded localhost/IPs
   - Show warnings but continue

5. Security Pass 3: Data Patterns (Info/Review)
   - Check for large files
   - Identify binary files
   - Scan for email/phone patterns
   - Show for review

6. Code Standards Pass (Show violations)
   - Check staged code against docs/development/liminal-chat-coding-standards.md
   - Flag any violations of standards
   - Show violations but continue

7. Dependency Security Pass (Stop on critical)
   - Run pnpm audit to check for vulnerable dependencies
   - Stop if critical vulnerabilities found
   - Show high/medium vulnerabilities as warnings
   - Continue if only low severity issues

8. Lint Check (Stop on errors)
   - Run pnpm lint to check code syntax and style
   - Stop if linting errors found
   - Show warnings but continue

9. Type Check (Stop on errors)
   - Run pnpm typecheck to ensure TypeScript compilation
   - Stop if type errors found

10. Branch Protection Check (Warning)
    - Check if on main/master branch
    - Warn user if committing directly to protected branch
    - Ask for confirmation to continue

11. File Count Check (Warning)
    - Count number of files being staged
    - Warn if more than 20 files (configurable threshold)
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