# Story 01 • File-system Structure & User Management

## Persona
@localUser – _"As a privacy-conscious power-user running Liminal Chat locally, I want my conversations stored in an isolated, predictable file-system structure so that I can back them up, audit them, or selectively delete them without exposing other users' data."_

## Business Benefit
• Enables off-site backups and GDPR-style data export/delete.  
• Provides the foundation for future multi-tenant deployments.

## Acceptance Criteria
1. **Directory Creation** – When the first conversation is started for a new user, a directory structure `users/{userId}/data/conversations/messages/` is created automatically.  
   • Verified by E2E test that checks existence on disk.  
2. **User Isolation** – Files created by one user MUST NOT appear in another user's directory listing.  
   • Attempting to read another user's conversation returns 404.  
3. **ID Conventions** – All message-chunk filenames follow pattern `{userId}-{conversationId}-{messageId}(-{chunkId}).json`.  
   • Regex validation unit test passes for 100 random IDs.  
4. **Metadata Integrity** – Each directory contains an `index.json` with an array of conversation IDs; this file is updated atomically.  
   • Concurrency stress test (10 parallel writers) maintains a valid JSON index with no lost updates.  
5. **Configurable Root Path** – Root data directory path is derived from environment variable `LIMINAL_DATA_ROOT` (defaults to `./data`).  
   • Changing env var re-locates new files; existing files remain accessible if env is reset.  
6. **Coverage** – Persistence helpers achieve ≥ 90% line coverage.

## Non-Functional
• Directory operations add &lt; 3 ms latency per conversation start (p95).  
• Implementation passes `pnpm lint` with zero warnings. 