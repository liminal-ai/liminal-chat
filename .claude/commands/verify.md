Type Check (Stop on errors)
   - Command: `pnpm typecheck`
     - Ensures TypeScript compilation across all packages
   - Stop if type errors found
   - Fix any compilation issues before proceeding

Lint Check (Stop on errors)
   - Command: `pnpm lint`
     - Checks code syntax and style across all packages
   - Stop if linting errors found
   - Show warnings but continue

Integration Tests (Stop on critical failures)
   - Command: `pnpm --filter liminal-api test`
     - Runs Playwright integration tests (11 tests)
     - Verifies Convex backend + AI provider integration
     - Tests conversation CRUD, message persistence, provider functionality
   - Stop if critical test failures found
   - Show warnings for flaky tests but continue

Build Verification (Stop on errors)
   - Command: `pnpm --filter web build`
     - Verifies Next.js production build succeeds
     - Catches build-time errors and missing dependencies
     - Ensures deployment readiness
   - Stop if build fails

Dependency Security Check (Show warnings)
   - Command: `pnpm audit --prod`
     - Checks for vulnerable production dependencies
   - Show high/medium vulnerabilities as warnings
   - Continue if only low severity issues

Final Summary
   - Show summary of all checks (passed/failed/warnings)
   - List any issues that need attention
   - If all critical checks pass, code is ready for commitprep
   - Note: Manual verification still recommended for UI changes

All output should be shown in the conversation