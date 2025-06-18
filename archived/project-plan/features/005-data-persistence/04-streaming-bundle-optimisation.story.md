# Story 04 • Streaming Bundle Optimisation

## Persona
@networkOptimizer – _"As a performance-minded engineer, I want the streaming layer to send small 20-token bundles to the client while writing larger 60-token chunks to disk so that users perceive low-latency updates and the persistence layer remains efficient."_

## Business Benefit
• Balances **UX latency** with **IO throughput**, lowering storage syscalls by 66 %.  
• Reduces server bandwidth without affecting perceived responsiveness.

## Acceptance Criteria
1. **Dual Buffer Strategy** – Stream emits SSE bundle every 20 tokens or ≤ 500 ms timeout (whichever first).  
   • Integration test asserts client receives ≤ 500 ms updates under 100 tps load.  
2. **Chunk Aggregation** – Persistence layer writes a 60-token chunk file after every third 20-token bundle.  
   • Unit test verifies write frequency ratio 3:1.  
3. **Flush on Stream End** – When the stream ends or aborts, any partial ( < 60 token) buffer is flushed to disk.  
   • Abort simulation leaves no unwritten tokens.  
4. **Configurable Ratios** – Ratios are configurable via env vars `LIMINAL_STREAM_BUNDLE_SIZE` and `LIMINAL_CHUNK_SIZE`; defaults remain 20/60.  
   • Changing env propagates to both stream and storage without restart (hot reload via config observable).  
5. **Performance Metrics** – p95 end-to-end latency client-token ≤ 250 ms for 1k token message on dev laptop.  
   • Benchmark test passes threshold.  
6. **Instrumentation** – Prometheus counter `chunks_written_total` and histogram `bundle_latency_ms` exported.  
   • Metrics endpoint test asserts values increment.

## Non-Functional
• No memory leak under 30-minute continuous stream (heap usage < 50 MB growth).  
• No eslint warnings. 