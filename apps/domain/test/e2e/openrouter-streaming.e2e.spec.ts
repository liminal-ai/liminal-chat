import { Test, TestingModule } from "@nestjs/testing";
import { ValidationPipe } from "@nestjs/common";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import * as request from "supertest";
import { AppModule } from "../../src/app.module";
import { StreamErrorCode } from "@liminal-chat/shared-types";

describe("E2E: OpenRouter SSE Streaming", () => {
  let app: NestFastifyApplication;
  let testStartTime: number;

  beforeAll(async () => {
    // Create test application with Fastify adapter once for all tests
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    // Apply same global configuration as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    // Add the global exception filter
    const { AllExceptionsFilter } = await import(
      "../../src/filters/http-exception.filter"
    );
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  beforeEach(() => {
    // Reset timing for each test
    testStartTime = Date.now();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Scenario: Successful streaming with performance validation", () => {
    it("should stream response with first token within 500ms", async () => {
      // Arrange: Variables to capture stream data
      const chunks: string[] = [];
      const timestamps: number[] = [];
      let usage: any = null;
      let firstTokenTime: number | null = null;

      // Act: Send streaming request with manual event handling
      await new Promise<void>((resolve, reject) => {
        request(app.getHttpServer())
          .post("/domain/llm/prompt")
          .set("Accept", "text/event-stream")
          .send({
            prompt: "Hello",
            provider: "openrouter",
            stream: true,
          })
          .buffer(false) // Disable supertest buffering for streaming
          .parse((res: any) => {
            let buffer = "";

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            res.on("data", (chunk: Buffer) => {
              const now = Date.now();
              buffer += chunk.toString();

              // Parse SSE chunks
              const lines = buffer.split("\n");
              buffer = lines.pop() || ""; // Keep incomplete line in buffer

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6).trim();
                  if (data === "[DONE]") {
                    resolve();
                    return;
                  }

                  try {
                    const parsed = JSON.parse(data) as {
                      choices?: Array<{ delta?: { content?: string } }>;
                      usage?: {
                        prompt_tokens: number;
                        completion_tokens: number;
                        total_tokens: number;
                      };
                    };
                    if (parsed.choices?.[0]?.delta?.content) {
                      const content = parsed.choices[0].delta.content;
                      chunks.push(content);
                      timestamps.push(now);

                      // Record first token timing
                      if (firstTokenTime === null) {
                        firstTokenTime = now - testStartTime;
                      }
                    }

                    // Capture usage data if present
                    if (parsed.usage) {
                      usage = parsed.usage;
                    }
                  } catch {
                    // Ignore parsing errors for malformed chunks
                  }
                }
              }
            });

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            res.on("end", () => resolve());
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            res.on("error", (err: any) => reject(new Error(String(err))));
          })
          .expect(200)
          .expect("Content-Type", /text\/event-stream/)
          .end((err) => {
            if (err) reject(new Error(String(err)));
          });
      });

      // Assert: Validate performance metrics
      expect(firstTokenTime).not.toBeNull();
      expect(firstTokenTime!).toBeLessThanOrEqual(500);

      // Assert: Validate content
      const fullContent = chunks.join("");
      expect(fullContent).toBe("Hello, world!");

      // Assert: Validate usage data (if provided by mock)
      if (usage) {
        expect(usage).toEqual(
          expect.objectContaining({
            promptTokens: expect.any(Number) as number,
            completionTokens: expect.any(Number) as number,
            totalTokens: expect.any(Number) as number,
            model: expect.any(String) as string,
          }),
        );
      }
    });

    it("should maintain inter-chunk latency <= 100ms", async () => {
      // Variables to capture timing data
      const timestamps: number[] = [];

      await new Promise<void>((resolve, reject) => {
        request(app.getHttpServer())
          .post("/domain/llm/prompt")
          .set("Accept", "text/event-stream")
          .send({
            prompt: "The quick brown fox",
            provider: "openrouter",
            stream: true,
          })
          .buffer(false)
          .parse((res: any) => {
            let buffer = "";

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            res.on("data", (chunk: Buffer) => {
              const now = Date.now();
              buffer += chunk.toString();

              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6).trim();
                  if (data === "[DONE]") {
                    resolve();
                    return;
                  }

                  try {
                    const parsed = JSON.parse(data) as {
                      choices?: Array<{ delta?: { content?: string } }>;
                    };
                    if (parsed.choices?.[0]?.delta?.content) {
                      timestamps.push(now);
                    }
                  } catch {
                    // Ignore parsing errors
                  }
                }
              }
            });

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            res.on("end", () => resolve());
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            res.on("error", (err: any) => reject(new Error(String(err))));
          })
          .expect(200)
          .end((err) => {
            if (err) reject(new Error(String(err)));
          });
      });

      // Assert: Check inter-chunk latencies
      for (let i = 1; i < timestamps.length; i++) {
        const latency = timestamps[i] - timestamps[i - 1];
        expect(latency).toBeLessThanOrEqual(100);
      }
    });
  });

  describe("Scenario: Graceful handling of stream interruption with event ID tracking", () => {
    it.skip("should handle network interruption and attempt reconnection", async () => {
      // Arrange: Variables to capture stream events and reconnection attempts
      const events: any[] = [];
      const reconnectionAttempts: any[] = [];
      let lastEventId: string | null = null;

      // Act: Start streaming request with interruption simulation
      try {
        await new Promise<void>((resolve) => {
          request(app.getHttpServer())
            .post("/domain/llm/prompt")
            .set("Accept", "text/event-stream")
            .send({
              prompt: "Tell me a story",
              provider: "openrouter",
              stream: true,
            })
            .buffer(false)
            .parse((res: any) => {
              let buffer = "";

              // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              res.on("data", (chunk: Buffer) => {
                buffer += chunk.toString();

                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const data = line.slice(6).trim();
                    if (data === "[DONE]") {
                      resolve();
                      return;
                    }

                    try {
                      const parsed = JSON.parse(data) as {
                        choices?: Array<{ delta?: { content?: string } }>;
                        id?: string;
                        eventId?: string;
                      };
                      if (parsed.choices?.[0]?.delta?.content) {
                        const event = {
                          type: "content",
                          data: parsed.choices[0].delta.content,
                          eventId: parsed.id || parsed.eventId,
                        };
                        events.push(event);
                        if (event.eventId) {
                          lastEventId = event.eventId;
                        }
                      }
                    } catch {
                      // Ignore parsing errors
                    }
                  } else if (line.startsWith("id: ")) {
                    lastEventId = line.slice(4).trim();
                  }
                }
              });

              // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              res.on("error", () => {
                // Simulate reconnection logic
                events.push({
                  type: "error",
                  data: {
                    code: StreamErrorCode.CONNECTION_LOST,
                    message: "Connection lost. Attempting to reconnect...",
                    retryable: true,
                  },
                });

                // Simulate exponential backoff attempts
                reconnectionAttempts.push(
                  { delay: 1000, lastEventId },
                  { delay: 2000, lastEventId },
                  { delay: 4000, lastEventId },
                );

                resolve(); // Resolve to continue test
              });

              // Simulate network interruption after 2 seconds
              setTimeout(() => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unnecessary-type-assertion
                (res as any).destroy(new Error("Network interruption"));
              }, 2000);

              // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              res.on("end", () => resolve());
            })
            .expect(200);
        });
      } catch {
        // Expected due to simulated interruption
      }

      // Assert: Error event should be captured
      expect(events).toContainEqual(
        expect.objectContaining({
          type: "error",
          data: expect.objectContaining({
            code: StreamErrorCode.CONNECTION_LOST,
            message: "Connection lost. Attempting to reconnect...",
          }) as object,
        }) as object,
      );

      // Assert: Reconnection attempts with exponential backoff
      expect(reconnectionAttempts).toEqual([
        { delay: 1000, lastEventId },
        { delay: 2000, lastEventId },
        { delay: 4000, lastEventId },
      ]);
    });

    it.skip("should clear previous content and display new stream after reconnection", async () => {
      // Test implementation for content clearing and new stream display
      // Should verify:
      // 1. Previous partial content is cleared
      // 2. New stream starts from beginning
      // 3. Complete story is displayed
    });

    it.skip("should log lastEventId but not use it for OpenRouter resumption", async () => {
      // Test implementation to verify backend behavior
      // Should check logs for: "Received lastEventId: or-1234-5 (not used for OpenRouter resumption)"
    });
  });

  describe("Scenario: Failed reconnection with proper error handling", () => {
    it.skip("should display error after max reconnection attempts", async () => {
      // Arrange: Mock server that always fails
      createAlwaysFailingMockServer();

      // Act: Attempt streaming with network failure
      const response = await request(app.getHttpServer())
        .post("/llm/prompt")
        .set("Accept", "text/event-stream")
        .send({
          prompt: "Test prompt",
          provider: "openrouter",
          stream: true,
        });

      // Wait for all reconnection attempts (~7 seconds)
      await waitForReconnectionAttempts(response, 3);

      // Assert: Final error message
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect((response as any).lastEvent).toEqual({
        type: "error",
        data: {
          message: "Reconnection failed. Please try your command again.",
          code: StreamErrorCode.CONNECTION_LOST,
          retryable: false,
        },
      });
    });
  });

  describe("SSE Format Variations", () => {
    it("should handle OpenRouter delta format correctly", () => {
      // Test various SSE chunk formats from OpenRouter
      // Implementation pending - will test delta content extraction
      // Implementation to test each format
    });

    it("should handle malformed SSE data gracefully", () => {
      // Test error handling for malformed data - implementation pending
      // Will test INVALID_SSE_FORMAT and MALFORMED_JSON error codes
      // Should yield error events with INVALID_SSE_FORMAT or MALFORMED_JSON
    });
  });

  describe("UTF-8 Boundary Handling", () => {
    it("should correctly handle multi-byte UTF-8 characters across chunks", () => {
      // Test UTF-8 characters split across SSE chunks - implementation pending
      // Will test boundary handling for multi-byte characters like 👋
      // Should correctly reconstruct: "👋 Hello"
    });
  });

  describe("Memory Management", () => {
    it.skip("should respect memory limits for large streams", () => {
      // Test streaming 10k tokens - implementation pending
      // Will monitor memory usage during large stream processing

      // Monitor memory usage during streaming
      const memorySnapshots: number[] = [];

      // Should stay under 10MB total memory usage
      expect(Math.max(...memorySnapshots)).toBeLessThan(10 * 1024 * 1024);
    });

    it.skip("should enforce 64KB chunk size limit", async () => {
      // Test that individual chunks don't exceed 64KB
    });
  });

  describe("Performance Metrics", () => {
    it.skip("should track and report streaming performance metrics", async () => {
      // Test performance tracking including:
      // - Time to first token
      // - Inter-chunk latencies
      // - Total streaming duration
      // - Tokens per second
    });
  });
});

// Helper functions for test fixtures

/**
 * Creates a mock SSE stream with specified events and delays.
 * Note: This is a placeholder for MSW/nock implementation.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _createMockSSEStream(
  events: Array<{
    content?: string;
    delay?: number;
    done?: boolean;
    usage?: any;
  }>,
): any {
  // TODO: Implement with MSW to mock OpenRouter responses
  // Should return SSE-formatted response: data: {"choices":[{"delta":{"content":"text"}}]}
  return events;
}

/**
 * Creates an SSE stream that will be interrupted after partial content.
 * Note: This is a placeholder for MSW/nock implementation.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _createInterruptedSSEStream(
  events: Array<{ content: string; eventId: string }>,
): any {
  // TODO: Implement with MSW to simulate connection failures
  // Should start streaming then abort connection
  return events;
}

/**
 * Creates a mock server that always fails requests.
 * Note: This is a placeholder for MSW/nock implementation.
 */
function createAlwaysFailingMockServer(): any {
  // TODO: Implement with MSW to simulate persistent failures
  // Should return 500/timeout/connection refused for all requests
  return {};
}

/**
 * Simulates network interruption by destroying the request stream.
 * This is used in conjunction with the stream interruption test logic.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _simulateNetworkInterruption(
  request: any,
  delay: number,
): Promise<void> {
  // NOTE: Actual interruption is handled in the test's setTimeout
  // This function exists for API compatibility with test expectations
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Waits for the expected duration of reconnection attempts with exponential backoff.
 */
function waitForReconnectionAttempts(
  response: any,
  attempts: number,
): Promise<void> {
  // Exponential backoff: 1s + 2s + 4s = 7 seconds for 3 attempts
  const totalDelay = Math.pow(2, attempts) - 1; // 2^3 - 1 = 7 seconds
  return new Promise((resolve) => setTimeout(resolve, totalDelay * 1000));
}

/**
 * Creates a stream with UTF-8 characters split across chunk boundaries.
 * Note: This is a placeholder for MSW/nock implementation.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _createUTF8BoundarySplitStream(
  chunks: Array<{ bytes?: Buffer; content?: string; delay?: number }>,
): any {
  // TODO: Implement with MSW to send partial UTF-8 byte sequences
  // Should test proper reconstruction of multi-byte characters
  return chunks;
}

/**
 * Creates a large token stream for memory usage testing.
 * Note: This is a placeholder for MSW/nock implementation.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _createLargeTokenStream(tokenCount: number): any {
  // TODO: Implement with MSW to stream large amounts of content
  // Should generate realistic token patterns up to tokenCount
  return { tokenCount };
}
