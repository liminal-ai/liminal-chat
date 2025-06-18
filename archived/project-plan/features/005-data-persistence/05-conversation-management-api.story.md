# Story 05 • Conversation Management API

## Persona
@frontendUser – _"As a web UI user, I want to browse my past conversations and open any of them so that I can continue discussions or review prior insights."_

## Business Benefit
• Enables history sidebar in Web UI (Feature 008).  
• Foundation for analytics dashboards and export functions.

## Acceptance Criteria
1. **List Endpoint** – `GET /api/conversations` returns array of `{id,title,createdAt,updatedAt}` for authenticated user, ordered by `updatedAt` desc.  
   • Contract test validates JSON-schema and sorts order.  
2. **Metadata Endpoint** – `GET /api/conversations/{id}` returns conversation metadata plus last 3 messages preview.  
   • Unit test asserts preview length.  
3. **Full Fetch** – `GET /api/conversations/{id}/messages` streams reconstructed messages paginated (50 per page).  
   • E2E test fetches two pages, validates continuity.  
4. **Pagination Links** – Response contains `nextCursor` when more pages.  
   • Contract test verifies cursor null on last page.  
5. **Security** – Accessing another user's conversation returns 404.  
   • Security test with two users passes.  
6. **Performance** – List endpoint returns ≤ 30 ms for 1000 conversations on M2 laptop.  
7. **Logging & Metrics** – Each endpoint logs request id and latency; Prometheus summary `conversation_list_latency_ms`.  
8. **Coverage** – API handlers ≥ 85% branch coverage.

## Non-Functional
• Endpoints documented in OpenAPI spec.  
• lint, prettier clean. 