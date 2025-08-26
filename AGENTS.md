# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed by `pnpm` workspaces. Primary code lives in `apps/*`.
- `apps/liminal-api`: Convex backend (functions in `convex/*`, scripts in `scripts/*`).
- `apps/web`: Next.js UI (components in `src/components/*`, routes in `src/app/*`).
- `apps/chat`: Vite + React demo and roundtable UIs (`src/*`).
- `apps/local-dev-service`: Fastify service for local LLM consulting.
- Documentation in `docs/*`; CI workflows in `.github/workflows/*`.

## Build, Test, and Development Commands
- Install: `pnpm i`.
- Start web + API: `pnpm dev:start` (pm2-managed). Stop/Restart: `pnpm dev:stop` / `pnpm dev:restart`.
- Per-app dev: `pnpm -F @liminal/api run dev:start`, `pnpm -F web run dev:start`, `pnpm -F @liminal/chat run dev:start`.
- Build all: `pnpm build`. Typecheck: `pnpm typecheck`. Lint: `pnpm lint`.
- Logs: `pnpm web:logs`, `pnpm convex:logs`. Convex dashboard: `pnpm convex:dashboard`.
- Integration tests (Playwright): `pnpm test:integration` or `pnpm test:integration:ui`.

## Coding Style & Naming Conventions
- Language: TypeScript across apps. Format with Prettier (2 spaces, single quotes, semicolons, trailing commas, width 100).
- Run `pnpm format` or `pnpm format:check` before committing. Fix lint: `pnpm -r run lint` or app-specific `lint:fix`.
- ESLint: Next.js core rules in `apps/web`; `@typescript-eslint` + React rules in `apps/chat`.
- Naming: React components `PascalCase.tsx`; utilities `kebab-case.ts`; tests `*.spec.ts(x)` or `*.test.ts(x)`.

## Testing Guidelines
- All tests: `pnpm test`.
- API e2e (Playwright): configured in `apps/liminal-api/playwright.config.ts`.
- Chat unit tests (Vitest): `pnpm -F @liminal/chat test`; colocate specs next to code or under `__tests__`.
- Add tests for new features and bug fixes; keep tests fast and deterministic.

## Commit & Pull Request Guidelines
- Conventional Commits: `feat:`, `fix:`, `chore:` with optional scope (e.g., `fix(chat): …`).
- PRs include: clear description, linked issues, screenshots/GIFs for UI, and test notes.
- Pre-submit: ensure `pnpm format:check && pnpm lint && pnpm test` succeed.

## Security & Configuration Tips
- Do not commit secrets. Use `.env` files per app (see `apps/*/.env.example`).
- Run secret checks: `pnpm precommit:api-keys` and `pnpm precommit:trufflehog`.
- Use `pnpm convex:dashboard` to review/set Convex environment variables.
- See `CLAUDE.md` files and `docs/*` for agent workflows and architecture.

