# Liminal API Development Workflow

This document explains how to work with the Liminal API Convex project during development.

## Initial Setup

### 1. Environment Variables
Ensure your `.env.local` file contains:
- Clerk authentication keys (already configured)
- `CONVEX_DEPLOYMENT` URL (will be added after first run)

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Initialize Convex Deployment
For the first time setup, you need to create a Convex deployment:

```bash
# Run the development server
pnpm dev
```

When prompted:
1. Choose "Create a new project"
2. Enter a project name (e.g., "liminal-api")
3. The CLI will create a deployment and provide a URL

The deployment URL will be automatically saved to:
- `.env.local` as `CONVEX_DEPLOYMENT`
- `convex.json` configuration file

## Development Commands

### Starting Development
```bash
# Start Convex dev server with hot reloading
pnpm dev

# Start with TypeScript watch mode (recommended)
pnpm dev:all

# Open Convex dashboard in browser
pnpm dev:dashboard
```

### Hot Reloading
Convex automatically detects changes to:
- Functions in `convex/` directory
- Schema changes
- Environment variable updates

When you save a file:
1. Convex CLI detects the change
2. Recompiles TypeScript
3. Pushes updates to the development deployment
4. Updates are live immediately without restart

### TypeScript Development
```bash
# Run TypeScript in watch mode
pnpm dev:typecheck

# One-time build check
pnpm build

# Type check without emitting files
pnpm typecheck
```

### Viewing Logs
```bash
# Stream development logs
pnpm logs

# Stream production logs
pnpm logs:prod
```

## Convex Dashboard

Access your Convex dashboard to:
- View and query data
- Monitor function executions
- Manage environment variables
- Debug issues

```bash
pnpm dev:dashboard
```

Or visit: https://dashboard.convex.dev

## Deployment Process

### Development Deployment
Development deployments are automatically updated when running `pnpm dev`.

### Production Deployment
```bash
# Deploy to production
pnpm deploy:prod

# View production logs
pnpm logs:prod
```

## Environment Variables

### View Environment Variables
```bash
pnpm env:pull
```

### Set Environment Variables
```bash
pnpm env:set KEY=value
```

Environment variables are deployment-specific. Set them separately for dev and prod.

## Project Structure

```
liminal-api/
├── convex/              # Backend functions and schema
│   ├── _generated/      # Auto-generated types (git ignored)
│   ├── schema.ts        # Database schema
│   ├── auth.config.ts   # Clerk authentication setup
│   └── *.ts            # Your functions
├── .env.local          # Local environment variables (git ignored)
├── convex.json         # Deployment configuration
└── package.json        # Scripts and dependencies
```

## Troubleshooting

### Reset Generated Files
If you encounter issues with generated types:
```bash
pnpm reset
```

### Clean Build
```bash
pnpm clean
pnpm dev
```

### Common Issues

1. **"Cannot find module '_generated'"**
   - Run `pnpm dev` to generate types
   - Check that `convex/_generated/` exists

2. **Authentication Errors**
   - Verify Clerk keys in `.env.local`
   - Check CLERK_ISSUER_URL format

3. **TypeScript Errors**
   - Run `pnpm typecheck` to identify issues
   - Ensure `tsconfig.json` includes Convex paths

## Best Practices

1. **Always run `pnpm dev` during development** - This ensures hot reloading and type generation
2. **Use `pnpm dev:all` for full TypeScript checking** - Catches errors early
3. **Check logs frequently** - `pnpm logs` shows real-time function execution
4. **Keep `.env.local` secure** - Never commit sensitive keys
5. **Test locally before deploying** - Use dev deployment extensively

## Additional Resources

- [Convex Documentation](https://docs.convex.dev)
- [Clerk + Convex Integration](https://docs.convex.dev/auth/clerk)
- [TypeScript Best Practices](https://docs.convex.dev/using/typescript)