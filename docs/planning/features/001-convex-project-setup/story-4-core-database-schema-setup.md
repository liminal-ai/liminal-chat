# Story 4: Core Database Schema Setup

## Objective
Define and deploy core database schemas for users and basic system entities, establishing the data foundation for all future features.

## Acceptance Criteria
- [ ] User schema exists in `convex/schema.ts` with fields: tokenIdentifier, email, name, imageUrl, createdAt, updatedAt
- [ ] User schema has indexes: "by_token" and "by_email"
- [ ] Schema validation enabled: `schemaValidation: true` in schema export
- [ ] User query function: `api.users.getCurrentUser` callable via Convex dashboard
- [ ] User mutation function: `api.users.syncUser` callable via Convex dashboard
- [ ] Schema deployment successful: Convex dashboard shows users table with correct fields

## Implementation Tasks
1. Define user schema in `convex/schema.ts` with basic Clerk fields only
2. Create minimal team schema for future team features
3. Set up schema validation rules
4. Create basic query functions for user data
5. Create basic mutation functions for user operations
6. Test real-time subscription functionality
7. Verify data persistence across deployments

## Schema Requirements
- **User schema**: Basic Clerk data (userId, email, name, profileImageUrl)
- **Team schema**: Minimal structure for future expansion
- **Additional fields**: Can be added later as needed

## Definition of Done
- Core schemas deployed successfully to Convex
- User CRUD operations work correctly
- Real-time updates function properly
- Schema validation prevents invalid data
- Database operations complete quickly (<100ms)
- Foundation ready for agent system migration

## Estimated Time
25 minutes

## Dependencies
- Story 1: Convex Project Initialization (needs Convex project)
- Story 2: Clerk Authentication Setup (needs user authentication)
- Story 3: Development Environment Configuration (needs dev workflow)

## Blocks
- Feature 2: Vercel AI SDK Integration
- Feature 3: LLM Endpoints Migration
- All features requiring database operations
