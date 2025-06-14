# Story 03 • Edge Message Reconstruction

## Persona
@edgeAPI – _"As the Edge API, I need to reconstruct full messages from stored chunks on-demand so that clients receive complete, correctly ordered messages even if they reconnect later."_

## Business Benefit
• Allows seamless resume of long conversations across browser refreshes.  
• Provides deterministic message ordering required for AI routing analytics.

## Acceptance Criteria
1. **Deterministic Reconstruction** – Given a set of chunk files `{messageId}-{seq}.json`, the reconstruction algorithm returns the concatenated token stream in ascending `seq` order.  
   • Unit test provides shuffled input, expects ordered result.  
2. **Partial Message Handling** – If the latest chunk has `status:"streaming"`, the API returns `status:"in-progress"` for that message.  
   • Integration test simulates live stream with last chunk incomplete.  
3. **Pagination Support** – `/api/conversations/{id}/messages?cursor=` returns messages in chronological order, 50 per page; cursors are opaque strings.  
   • API contract test round-trips through two pages.  
4. **Caching Layer** – Recently reconstructed messages (≤ 5 min old) are cached in memory; cache invalidates if new chunk arrives.  
   • Cache-hit unit test asserts single disk read.  
5. **Error Cases** – Missing chunk causes 500 with error code `CHUNK_MISSING`; corrupt JSON causes 500 `CHUNK_CORRUPT`.  
   • Unit tests cover both cases.  
6. **Performance** – Reconstruction of 10k-token message completes < 40 ms on M2 dev laptop.  
   • Benchmark test passes threshold.  
7. **Coverage** – Reconstruction module ≥ 90% branch coverage.

## Non-Functional
• API schema validated via zod/ajv.  
• No eslint warnings. 