# Feature 001: Convex Project Setup

## Abstract

Establish the foundational Convex backend infrastructure for Liminal Chat, replacing the current NestJS/ArangoDB architecture. This feature creates the core project structure, authentication system, and development environment that all subsequent features will depend on. The setup includes Convex project initialization, Clerk authentication integration for simple OAuth workflows, and a complete development environment with proper TypeScript configuration and deployment pipeline.

This feature represents the critical foundation layer that enables the migration from the documented NestJS/ArangoDB stack to the preferred Convex + Next.js architecture while maintaining the same user authentication patterns and development workflow quality.

## Acceptance Criteria

### 1. Convex Project Initialization
- [ ] New Convex project created with latest stable version
- [ ] TypeScript configuration properly set up with strict mode
- [ ] Project structure follows Convex best practices
- [ ] Package.json includes all necessary Convex dependencies
- [ ] Convex development server starts without errors
- [ ] Basic schema definitions can be created and deployed

### 2. Clerk Authentication Integration
- [ ] Clerk provider configured in Convex project
- [ ] OAuth providers (Google, GitHub) configured and working
- [ ] User authentication flow works end-to-end
- [ ] User sessions persist correctly across browser refreshes
- [ ] Authentication state accessible in Convex functions
- [ ] User management (signup, signin, signout) functional

### 3. Development Environment Setup
- [ ] Local development workflow established
- [ ] Environment variables properly configured
- [ ] Convex dashboard accessible and functional
- [ ] Hot reloading works for schema and function changes
- [ ] TypeScript compilation works without errors
- [ ] Deployment to Convex cloud successful

### 4. Core Database Foundation
- [ ] Basic user schema defined and deployed
- [ ] Database queries and mutations work correctly
- [ ] Real-time subscriptions functional
- [ ] Data persistence verified across deployments
- [ ] Database indexes properly configured
- [ ] Schema validation working correctly

### 5. Integration Readiness
- [ ] Project ready for Vercel AI SDK integration
- [ ] Node.js runtime support verified
- [ ] HTTP Actions capability confirmed
- [ ] Environment prepared for multi-provider LLM integration
- [ ] Development workflow supports rapid iteration
- [ ] Documentation updated with setup instructions

## Technical Requirements

### Dependencies
- Convex latest stable version
- Clerk authentication provider
- TypeScript with strict configuration
- Node.js 18+ runtime support

### Environment Variables
```bash
# Convex Configuration
CONVEX_DEPLOYMENT=<deployment-url>

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk-key>
CLERK_SECRET_KEY=<clerk-secret>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### Project Structure
```
liminal-chat/
├── apps/
│   ├── cli/           # Existing CLI app
│   ├── domain/        # Existing NestJS domain (keep during migration)
│   ├── edge/          # Existing edge app (keep during migration)
│   └── convex/        # New Convex backend (liminal-api)
│       ├── _generated/    # Auto-generated Convex files
│       ├── schema.ts      # Database schema definitions
│       ├── auth.config.ts # Clerk authentication config
│       └── functions/     # Convex functions directory
└── docs/              # Project documentation
```

## Success Metrics

- [ ] Convex project deploys successfully to cloud
- [ ] Authentication flow completes in <3 seconds
- [ ] Development server starts in <10 seconds
- [ ] Zero TypeScript compilation errors
- [ ] All Convex functions execute without runtime errors
- [ ] Database operations complete in <100ms locally

## Dependencies

**Blocks**: All subsequent milestones (Vercel AI SDK Integration, LLM Endpoints Migration, Agent System Migration)

**Requires**: None (foundation feature)

## Notes

This feature establishes the technical foundation that replaces the current NestJS/ArangoDB architecture. Success here is critical for the entire Phase 0 migration timeline. The authentication setup with Clerk provides the simple, standard solution preferred over complex custom implementations.

The development environment must support the AI-augmented development workflow with rapid iteration cycles and unlimited token usage for Claude Code implementation phases.
