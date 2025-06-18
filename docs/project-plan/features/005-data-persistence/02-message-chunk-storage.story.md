# Story 02 • Message-Chunk Storage

## Persona
@streamEngine – _"As the streaming engine inside the Domain tier, I need to persist message chunks to disk as they are generated so that conversation history is never lost, even if the process crashes mid-stream."_

## Business Benefit
• Guarantees durability of user data (compliance, trust).  
• Enables crash-resumption and future analytics on token-level data.

## Acceptance Criteria
1. **Streaming Write Path** – During an active SSE stream, every bundle (20 tokens) is persisted via an async write to `{root}/users/{userId}/.../{messageId}-{seq}.json`.  
   • Verified by unit test that mocks `fs.writeFile` and asserts call per bundle.  
2. **Back-Pressure Safe** – Write operations are non-blocking; if disk IO is slow, the stream continues and buffers up to 5 bundles before applying flow-control.  
   • Stress test simulating 50 ms IO latency shows < 2% token delay.  
3. **Atomic Chunk Files** – Each chunk file is fully written or not present; partial files are cleaned on next startup.  
   • Crash simulation test leaves corrupt file, bootstrap removes/repairs it.  
4. **Schema Validation** – Each chunk passes JSON-Schema `messageChunk.schema.json` validation before write; invalid chunks throw and abort stream.  
   • Validation unit tests cover happy & error paths.  
5. **Logging** – Each write logs `chunk_saved` with `userId`, `conversationId`, `messageId`, `seq` using pino child-logger.  
   • Log entry verified in integration test.  
6. **Coverage** – Storage writer module ≥ 85% statement coverage.

## Non-Functional
• Added write latency per chunk < 5 ms (p95) on SSD.  
• Works on Windows, macOS, and Linux (CI matrix). 