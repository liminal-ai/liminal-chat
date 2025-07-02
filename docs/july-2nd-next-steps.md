
  1. Conversation List/Get Endpoints - Currently returning empty results or 404
    - The auth context isn't properly propagating for conversation queries
    - Need to fix /api/conversations listing and /api/conversations/:id fetching
    - This would get the last integration test passing (11/11)
  2. Update Auth Documentation - I had a pending todo to document the dev user approach

  Major Feature Gaps (Migration from Domain)

  3. CLI Integration ❌
    - Still pointing to old edge server URLs (http://localhost:8787)
    - Needs to connect directly to Convex endpoints
    - Update provider endpoints to match Convex implementation
  4. Web UI Implementation ❌
    - Currently minimal/no functional chat interface
    - Need to build actual chat components using Vercel AI SDK's useChat hook
    - Connect to Convex streaming endpoints
    - Add conversation management UI
  5. Agent System ❌ (Feature 7)
    - Completely missing from Convex implementation
    - Domain had: agents controller, service, tool registry
    - This appears to be a core feature for AI Roundtable conversations

  Features 2-8 Progress

  6. Feature 2-4 (Partially complete):
    - Provider integration works but needs polish
    - Testing infrastructure needs expansion
    - Multi-provider switching functional but incomplete
  7. Features 5-6 (Not started):
    - Model/Provider DTOs with persistence
    - Model tools registry
  8. Feature 8 (Not started):
    - CLI alignment with core APIs

  What would you like to tackle next? The conversation list fix would be a quick win, or we could start on one of the bigger
  features like the Web UI or CLI integration.