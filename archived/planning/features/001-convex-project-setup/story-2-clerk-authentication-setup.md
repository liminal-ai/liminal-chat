# Story 2: Clerk Authentication Setup

## Objective
Integrate Clerk authentication provider with Convex to enable simple OAuth workflows for user management.

## Acceptance Criteria
- [ ] Clerk provider configured in Convex project
- [ ] OAuth providers (Google, GitHub) configured in Clerk dashboard
- [ ] Authentication configuration file created
- [ ] Environment variables properly set up
- [ ] Basic authentication flow functional
- [ ] User sessions persist correctly

## Implementation Tasks
1. Install Clerk dependencies (`@clerk/nextjs`, `@clerk/convex`)
2. **Get Clerk credentials from user** - existing Liminal Chat app already created
3. Set up environment variables for provided Clerk keys
4. Create `convex/auth.config.ts` configuration file
5. Configure Convex to use Clerk authentication
6. Test basic sign-in/sign-out flow with existing OAuth providers
7. Verify authentication state accessible in Convex functions

## Definition of Done
- Clerk authentication integrated with Convex
- OAuth providers working in development
- User can sign in and sign out successfully
- Authentication state accessible in Convex functions
- Environment variables properly configured
- No authentication errors in console

## Estimated Time
25 minutes

## Dependencies
- Story 1: Convex Project Initialization (needs Convex project)

## Blocks
- Story 3: Development Environment Configuration
- Story 4: Core Database Schema Setup
