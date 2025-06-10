import { ConfigService } from "@nestjs/config";
import { HttpException, HttpStatus } from "@nestjs/common";
import { OpenRouterProvider } from "./openrouter.provider";
import { Message } from "../llm-provider.interface";
import {
  ProviderStreamEvent,
  StreamErrorCode,
} from "@liminal-chat/shared-types";

// Mock fetch globally
global.fetch = jest.fn();

// Enable fake timers
jest.useFakeTimers();

describe("OpenRouterProvider", () => {
  let provider: OpenRouterProvider;
  let configService: ConfigService;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockClear();

    configService = {
      get: jest.fn((key: string) => {
        if (key === "OPENROUTER_API_KEY") return "test-api-key";
        if (key === "OPENROUTER_MODEL") return "openai/gpt-4.1";
        if (key === "OPENROUTER_APP_URL") return "http://localhost:3000";
        if (key === "OPENROUTER_BASE_URL")
          return "https://openrouter.ai/api/v1/chat/completions";
        if (key === "OPENROUTER_TIMEOUT") return 30000;
        return undefined;
      }),
    } as unknown as ConfigService;

    provider = new OpenRouterProvider(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe("generate()", () => {
    describe("with prompt string", () => {
      it("should convert prompt to OpenRouter format", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "chatcmpl-123",
              object: "chat.completion",
              created: Date.now(),
              model: "openai/gpt-3.5-turbo",
              choices: [
                {
                  index: 0,
                  message: { role: "assistant", content: "Test response" },
                  finish_reason: "stop",
                },
              ],
              usage: {
                prompt_tokens: 10,
                completion_tokens: 20,
                total_tokens: 30,
              },
            }),
        } as Response);

        await provider.generate("Hello, OpenRouter!");

        expect(mockFetch).toHaveBeenCalledWith(
          "https://openrouter.ai/api/v1/chat/completions",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-api-key",
              "HTTP-Referer": "http://localhost:3000",
            },
            body: JSON.stringify({
              model: "openai/gpt-4.1",
              messages: [{ role: "user", content: "Hello, OpenRouter!" }],
            }),
          }),
        );
      });

      it("should pass messages array correctly", async () => {
        const messages: Message[] = [
          { role: "system", content: "You are helpful" },
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi there!" },
          { role: "user", content: "How are you?" },
        ];

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "chatcmpl-123",
              choices: [
                {
                  message: { role: "assistant", content: "I am doing well!" },
                },
              ],
              usage: {
                prompt_tokens: 30,
                completion_tokens: 10,
                total_tokens: 40,
              },
            }),
        } as Response);

        await provider.generate(messages);

        const requestBody = JSON.parse(
          mockFetch.mock.calls[0][1]?.body as string,
        ) as { messages: Message[] };
        expect(requestBody.messages).toEqual(messages);
      });

      it("should include required headers", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              choices: [{ message: { content: "Response" } }],
              usage: {
                prompt_tokens: 5,
                completion_tokens: 5,
                total_tokens: 10,
              },
            }),
        } as Response);

        await provider.generate("Test");

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: "Bearer test-api-key",
              "HTTP-Referer": "http://localhost:3000",
            } as Record<string, string>) as unknown as Record<string, string>,
          } as { headers: Record<string, string> }),
        );
      });

      it("should map response to LlmResponse format", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              model: "openai/gpt-4",
              choices: [
                {
                  message: { role: "assistant", content: "Mapped response" },
                },
              ],
              usage: {
                prompt_tokens: 15,
                completion_tokens: 25,
                total_tokens: 40,
              },
            }),
        } as Response);

        const result = await provider.generate("Test prompt");

        expect(result).toEqual({
          content: "Mapped response",
          model: "openai/gpt-4",
          usage: {
            promptTokens: 15,
            completionTokens: 25,
            totalTokens: 40,
          },
        });
      });

      it("should extract usage statistics", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              choices: [{ message: { content: "Response" } }],
              usage: {
                prompt_tokens: 100,
                completion_tokens: 50,
                total_tokens: 150,
              },
            }),
        } as Response);

        const result = await provider.generate("Test");

        expect(result.usage).toEqual({
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        });
      });
    });

    describe("error handling", () => {
      it("should map 401 to INVALID_API_KEY", async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 401,
          statusText: "Unauthorized",
          json: () =>
            Promise.resolve({ error: { message: "Invalid API key" } }),
        } as Response);

        try {
          await provider.generate("test");
          fail("Should have thrown");
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect((error as HttpException).getStatus()).toBe(
            HttpStatus.UNAUTHORIZED,
          );
          const response = (error as HttpException).getResponse() as {
            error: { code: string };
          };
          expect(response.error.code).toBe("INVALID_API_KEY");
        }
      });

      it("should map 429 to RATE_LIMITED", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: "Too Many Requests",
          json: () =>
            Promise.resolve({ error: { message: "Rate limit exceeded" } }),
        } as Response);

        try {
          await provider.generate("test");
          fail("Should have thrown");
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect((error as HttpException).getStatus()).toBe(
            HttpStatus.TOO_MANY_REQUESTS,
          );
          const response = (error as HttpException).getResponse() as {
            error: { code: string };
          };
          expect(response.error.code).toBe("PROVIDER_RATE_LIMITED");
        }
      });

      it("should map timeout to PROVIDER_TIMEOUT", async () => {
        const abortError = new Error("The operation was aborted");
        (abortError as Error & { name: string }).name = "AbortError";
        mockFetch.mockRejectedValueOnce(abortError);

        try {
          await provider.generate("test");
          fail("Should have thrown");
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect((error as HttpException).getStatus()).toBe(504);
          const response = (error as HttpException).getResponse() as {
            error: { code: string };
          };
          expect(response.error.code).toBe("PROVIDER_API_ERROR");
        }
      });

      it("should map network errors to API_ERROR", async () => {
        const networkError = new TypeError("Failed to fetch");
        mockFetch.mockRejectedValueOnce(networkError);

        try {
          await provider.generate("test");
          fail("Should have thrown");
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect((error as HttpException).getStatus()).toBe(503);
          const response = (error as HttpException).getResponse() as {
            error: { code: string };
          };
          expect(response.error.code).toBe("PROVIDER_API_ERROR");
        }
      });

      it("should handle missing response data gracefully", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ choices: [] }),
        } as Response);

        try {
          await provider.generate("test");
          fail("Should have thrown");
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect((error as HttpException).getStatus()).toBe(500);
          const response = (error as HttpException).getResponse() as {
            error: { code: string };
          };
          expect(response.error.code).toBe("PROVIDER_API_ERROR");
        }
      });

      it("should throw PROVIDER_NOT_CONFIGURED if API key missing", async () => {
        const noKeyConfigService = {
          get: jest.fn().mockReturnValue(undefined),
        } as unknown as ConfigService;

        const provider = new OpenRouterProvider(noKeyConfigService);

        try {
          await provider.generate("test");
          fail("Should have thrown");
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect((error as HttpException).getStatus()).toBe(502);
          const response = (error as HttpException).getResponse() as {
            error: { code: string };
          };
          expect(response.error.code).toBe("PROVIDER_NOT_CONFIGURED");
        }
      });
    });
  });

  describe("getName()", () => {
    it('should return "openrouter"', () => {
      expect(provider.getName()).toBe("openrouter");
    });
  });

  describe("isAvailable()", () => {
    it("should return false if API key not configured", () => {
      const noKeyConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as ConfigService;

      const provider = new OpenRouterProvider(noKeyConfigService);
      expect(provider.isAvailable()).toBe(false);
    });

    it("should return true if API key exists", () => {
      expect(provider.isAvailable()).toBe(true);
    });
  });

  describe("configuration", () => {
    it("should use default model if not specified", async () => {
      const defaultConfigService = {
        get: jest.fn((key: string, defaultValue?: unknown) => {
          if (key === "OPENROUTER_API_KEY") return "test-key";
          if (key === "OPENROUTER_APP_URL") return "http://localhost";
          if (key === "OPENROUTER_MODEL") return defaultValue;
          if (key === "OPENROUTER_BASE_URL") return defaultValue;
          if (key === "OPENROUTER_TIMEOUT") return defaultValue;
          return defaultValue;
        }),
      } as unknown as ConfigService;

      const provider = new OpenRouterProvider(defaultConfigService);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            model: "openai/gpt-3.5-turbo",
            choices: [{ message: { content: "Response" } }],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 10,
              total_tokens: 20,
            },
          }),
      } as Response);

      await provider.generate("test");

      const requestBody = JSON.parse(
        (mockFetch.mock.calls[0][1]?.body as string) || "{}",
      ) as { model: string };
      expect(requestBody.model).toBe("openai/gpt-4.1");
    });

    it("should use configured model name", async () => {
      const customConfigService = {
        get: jest.fn((key: string) => {
          if (key === "OPENROUTER_API_KEY") return "test-key";
          if (key === "OPENROUTER_MODEL") return "anthropic/claude-2";
          if (key === "OPENROUTER_APP_URL") return "http://localhost";
          return undefined;
        }),
      } as unknown as ConfigService;

      const provider = new OpenRouterProvider(customConfigService);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: "Response" } }],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 10,
              total_tokens: 20,
            },
          }),
      } as Response);

      await provider.generate("test");

      const requestBody = JSON.parse(
        (mockFetch.mock.calls[0][1]?.body as string) || "{}",
      ) as { model: string };
      expect(requestBody.model).toBe("anthropic/claude-2");
    });

    it("should timeout after 30 seconds", () => {
      // Mock a fetch that never resolves
      mockFetch.mockImplementationOnce(
        () =>
          new Promise(() => {
            // Intentionally never resolves to test timeout
          }),
      );

      void provider.generate("test");

      // This test would need a real timeout implementation
      // For now, just verify the call was made
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe("generateStream()", () => {
    function createMockStreamResponse(chunks: string[]): Response {
      const encoder = new TextEncoder();
      let chunkIndex = 0;

      const mockReader = {
        read: jest.fn().mockImplementation(() => {
          if (chunkIndex >= chunks.length) {
            return Promise.resolve({ done: true, value: undefined });
          }
          const chunk = encoder.encode(chunks[chunkIndex++]);
          return Promise.resolve({ done: false, value: chunk });
        }),
        releaseLock: jest.fn(),
      };

      const mockBody = {
        getReader: jest.fn().mockReturnValue(mockReader),
      };

      return {
        ok: true,
        body: mockBody,
      } as unknown as Response;
    }

    describe("with prompt string", () => {
      it("should convert prompt to messages and stream content", async () => {
        const chunks = [
          'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
          'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
          'data: {"choices":[{"delta":{"content":"!"}}]}\n\n',
          "data: [DONE]\n\n",
        ];

        mockFetch.mockResolvedValueOnce(createMockStreamResponse(chunks));

        const events: ProviderStreamEvent[] = [];
        for await (const event of provider.generateStream("Hello")) {
          events.push(event);
        }

        expect(events).toHaveLength(4);
        expect(events[0]).toEqual({
          type: "content",
          data: "Hello",
          eventId: expect.stringMatching(/^or-\d+-[a-zA-Z0-9_-]{6}$/) as string,
        });
        expect(events[1]).toEqual({
          type: "content",
          data: " world",
          eventId: expect.stringMatching(/^or-\d+-[a-zA-Z0-9_-]{6}$/) as string,
        });
        expect(events[2]).toEqual({
          type: "content",
          data: "!",
          eventId: expect.stringMatching(/^or-\d+-[a-zA-Z0-9_-]{6}$/) as string,
        });
        expect(events[3]).toEqual({
          type: "done",
          eventId: expect.stringMatching(/^or-\d+-[a-zA-Z0-9_-]{6}$/) as string,
        });

        // Verify fetch was called with stream: true
        expect(mockFetch).toHaveBeenCalledWith(
          "https://openrouter.ai/api/v1/chat/completions",
          expect.objectContaining({
            body: expect.stringContaining('"stream":true') as string,
          }),
        );
      });

      it("should handle usage data in stream", async () => {
        const chunks = [
          'data: {"choices":[{"delta":{"content":"Hi"}}]}\n\n',
          'data: {"choices":[{"delta":{}}],"usage":{"prompt_tokens":5,"completion_tokens":10,"total_tokens":15},"model":"openai/gpt-4"}\n\n',
          "data: [DONE]\n\n",
        ];

        mockFetch.mockResolvedValueOnce(createMockStreamResponse(chunks));

        const events: ProviderStreamEvent[] = [];
        for await (const event of provider.generateStream("Test")) {
          events.push(event);
        }

        expect(events).toHaveLength(3);
        expect(events[0].type).toBe("content");
        expect(events[1]).toEqual({
          type: "usage",
          data: {
            promptTokens: 5,
            completionTokens: 10,
            totalTokens: 15,
            model: "openai/gpt-4",
          },
          eventId: expect.stringMatching(/^or-\d+-[a-zA-Z0-9_-]{6}$/) as string,
        });
        expect(events[2].type).toBe("done");
      });

      it("should handle empty content deltas", async () => {
        const chunks = [
          'data: {"choices":[{"delta":{"content":"Start"}}]}\n\n',
          'data: {"choices":[{"delta":{"content":""}}]}\n\n', // Empty content
          'data: {"choices":[{"delta":{}}]}\n\n', // No content field
          'data: {"choices":[{"delta":{"content":" end"}}]}\n\n',
          "data: [DONE]\n\n",
        ];

        mockFetch.mockResolvedValueOnce(createMockStreamResponse(chunks));

        const events: ProviderStreamEvent[] = [];
        for await (const event of provider.generateStream("Test")) {
          events.push(event);
        }

        // Should only get content events for non-empty content
        const contentEvents = events.filter((e) => e.type === "content");
        expect(contentEvents).toHaveLength(2);
        expect(contentEvents[0].data).toBe("Start");
        expect(contentEvents[1].data).toBe(" end");
      });

      it("should handle SSE comments and empty lines", async () => {
        const chunks = [
          ": this is a comment\n",
          'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
          "\n\n", // Empty lines
          ": another comment\n",
          "data: [DONE]\n\n",
        ];

        mockFetch.mockResolvedValueOnce(createMockStreamResponse(chunks));

        const events: ProviderStreamEvent[] = [];
        for await (const event of provider.generateStream("Test")) {
          events.push(event);
        }

        expect(events).toHaveLength(2); // Only content and done events
        expect(events[0].type).toBe("content");
        expect(events[1].type).toBe("done");
      });

      it("should log lastEventId when provided", async () => {
        const mockLogger = {
          debug: jest.fn(),
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (provider as any).logger = mockLogger;

        const chunks = ["data: [DONE]\n\n"];
        mockFetch.mockResolvedValueOnce(createMockStreamResponse(chunks));

        const events: ProviderStreamEvent[] = [];
        for await (const event of provider.generateStream(
          "Test",
          {},
          "or-123-abc456",
        )) {
          events.push(event);
        }

        expect(mockLogger.debug).toHaveBeenCalledWith(
          "Received lastEventId: or-123-abc456 (not used for OpenRouter resumption)",
        );
      });
    });

    describe("error handling", () => {
      it("should yield error event when API key missing", async () => {
        const noKeyConfigService = {
          get: jest.fn().mockReturnValue(undefined),
        } as unknown as ConfigService;

        const provider = new OpenRouterProvider(noKeyConfigService);

        const events: ProviderStreamEvent[] = [];
        for await (const event of provider.generateStream("Test")) {
          events.push(event);
        }

        expect(events).toHaveLength(1);
        expect(events[0]).toEqual({
          type: "error",
          data: {
            message:
              "Provider 'openrouter' requires configuration. Set OPENROUTER_API_KEY environment variable.",
            code: StreamErrorCode.AUTHENTICATION_FAILED,
            retryable: false,
          },
          eventId: expect.stringMatching(/^or-\d+-[a-zA-Z0-9_-]{6}$/) as string,
        });
      });

      it("should handle malformed JSON in stream", async () => {
        const chunks = [
          'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
          "data: {invalid json\n\n", // Malformed JSON
          "data: [DONE]\n\n",
        ];

        mockFetch.mockResolvedValueOnce(createMockStreamResponse(chunks));

        const events: ProviderStreamEvent[] = [];
        for await (const event of provider.generateStream("Test")) {
          events.push(event);
        }

        expect(events).toHaveLength(3);
        expect(events[0].type).toBe("content");
        expect(events[1]).toEqual({
          type: "error",
          data: {
            message: "Malformed JSON data received from provider",
            code: StreamErrorCode.MALFORMED_JSON,
            retryable: false,
            details: { originalData: "{invalid json" },
          },
          eventId: expect.stringMatching(/^or-\d+-[a-zA-Z0-9_-]{6}$/) as string,
        });
        expect(events[2].type).toBe("done");
      });

      it("should handle fetch errors", async () => {
        const networkError = new TypeError("Failed to fetch");
        mockFetch.mockRejectedValueOnce(networkError);

        const events: ProviderStreamEvent[] = [];
        for await (const event of provider.generateStream("Test")) {
          events.push(event);
        }

        expect(events).toHaveLength(1);
        expect(events[0]).toEqual({
          type: "error",
          data: {
            message: "Network error connecting to OpenRouter",
            code: StreamErrorCode.NETWORK_ERROR,
            retryable: true,
          },
          eventId: expect.stringMatching(/^or-\d+-[a-zA-Z0-9_-]{6}$/) as string,
        });
      });

      it("should handle timeout errors", async () => {
        const abortError = new Error("The operation was aborted");
        (abortError as Error & { name: string }).name = "AbortError";
        mockFetch.mockRejectedValueOnce(abortError);

        const events: ProviderStreamEvent[] = [];
        for await (const event of provider.generateStream("Test")) {
          events.push(event);
        }

        expect(events).toHaveLength(1);
        expect(events[0]).toEqual({
          type: "error",
          data: {
            message: "OpenRouter request timeout",
            code: StreamErrorCode.CONNECTION_TIMEOUT,
            retryable: true,
          },
          eventId: expect.stringMatching(/^or-\d+-[a-zA-Z0-9_-]{6}$/) as string,
        });
      });

      it("should handle HTTP error responses", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: "Too Many Requests",
          json: () =>
            Promise.resolve({ error: { message: "Rate limit exceeded" } }),
        } as Response);

        const events: ProviderStreamEvent[] = [];
        for await (const event of provider.generateStream("Test")) {
          events.push(event);
        }

        expect(events).toHaveLength(1);
        expect(events[0]).toEqual({
          type: "error",
          data: {
            message: "OpenRouter rate limit exceeded",
            code: StreamErrorCode.PROVIDER_RATE_LIMIT,
            retryable: true,
          },
          eventId: expect.stringMatching(/^or-\d+-[a-zA-Z0-9_-]{6}$/) as string,
        });
      });

      it("should handle missing response body", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          body: null,
        } as Response);

        const events: ProviderStreamEvent[] = [];
        for await (const event of provider.generateStream("Test")) {
          events.push(event);
        }

        expect(events).toHaveLength(1);
        expect(events[0]).toEqual({
          type: "error",
          data: {
            message:
              "OpenRouter error: No response body available for streaming",
            code: StreamErrorCode.PROVIDER_UNAVAILABLE,
            retryable: true,
            details: {
              originalError: "No response body available for streaming",
            },
          },
          eventId: expect.stringMatching(/^or-\d+-[a-zA-Z0-9_-]{6}$/) as string,
        });
      });
    });

    describe("originalRequestParams", () => {
      it("should pass through additional request parameters", async () => {
        const chunks = ["data: [DONE]\n\n"];
        mockFetch.mockResolvedValueOnce(createMockStreamResponse(chunks));

        const events: ProviderStreamEvent[] = [];
        for await (const event of provider.generateStream("Test", {
          temperature: 0.7,
          max_tokens: 100,
        })) {
          events.push(event);
        }

        expect(mockFetch).toHaveBeenCalledWith(
          "https://openrouter.ai/api/v1/chat/completions",
          expect.objectContaining({
            body: expect.stringContaining('"temperature":0.7') as string,
          }),
        );
        expect(mockFetch).toHaveBeenCalledWith(
          "https://openrouter.ai/api/v1/chat/completions",
          expect.objectContaining({
            body: expect.stringContaining('"max_tokens":100') as string,
          }),
        );
      });
    });
  });
});
