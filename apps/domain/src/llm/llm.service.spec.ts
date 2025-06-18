import { describe, it, expect, beforeEach, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus } from "@nestjs/common";
import { LlmService } from "./llm.service";
import { LlmProviderFactory } from "../providers/llm/llm-provider.factory";
import { VercelErrorMapper } from "../providers/llm/vercel-error.mapper";
import { LlmPromptRequestDto } from "../domain/dto/llm-prompt-request.dto";
import { ProviderNotFoundError } from "../providers/llm/errors";
import { ProviderStreamEvent } from "@liminal-chat/shared-types";

// Mock interfaces for proper TypeScript typing
interface MockLLMProvider {
  generate: ReturnType<typeof vi.fn>;
  generateStream?: ReturnType<typeof vi.fn>;
  getName: ReturnType<typeof vi.fn>;
  isAvailable: ReturnType<typeof vi.fn>;
}

interface MockLlmProviderFactory {
  getProvider: ReturnType<typeof vi.fn>;
  getAvailableProviders: ReturnType<typeof vi.fn>;
  onModuleInit: ReturnType<typeof vi.fn>;
}

interface MockVercelErrorMapper {
  mapError: ReturnType<typeof vi.fn>;
}

describe("LlmService", () => {
  let service: LlmService;
  let mockProviderFactory: MockLlmProviderFactory;
  let mockErrorMapper: MockVercelErrorMapper;
  let mockProvider: MockLLMProvider;

  beforeEach(async () => {
    mockProvider = {
      generate: vi.fn(),
      generateStream: vi.fn(),
      getName: vi.fn().mockReturnValue("echo"),
      isAvailable: vi.fn().mockReturnValue(true),
    };

    mockProviderFactory = {
      getProvider: vi.fn().mockReturnValue(mockProvider),
      getAvailableProviders: vi.fn().mockReturnValue(["echo"]),
      onModuleInit: vi.fn(),
    };

    mockErrorMapper = {
      mapError: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmService,
        {
          provide: LlmProviderFactory,
          useValue: mockProviderFactory,
        },
        {
          provide: VercelErrorMapper,
          useValue: mockErrorMapper,
        },
      ],
    }).compile();

    service = module.get<LlmService>(LlmService);
  });

  describe("prompt", () => {
    it("should process prompt successfully", async () => {
      const mockResponse = {
        content: "Echo: Hello",
        model: "echo-1.0",
        usage: { promptTokens: 2, completionTokens: 3, totalTokens: 5 },
      };
      mockProvider.generate.mockResolvedValue(mockResponse);

      const result = await service.prompt({ prompt: "Hello" });

      expect(mockProviderFactory.getProvider).toHaveBeenCalledWith(undefined);

      expect(mockProvider.generate).toHaveBeenCalledWith("Hello");
      expect(result).toEqual(mockResponse);
    });

    it("should process messages successfully", async () => {
      const messages = [{ role: "user" as const, content: "Hello" }];
      const mockResponse = {
        content: "Hi there!",
        model: "echo-1.0",
        usage: { promptTokens: 2, completionTokens: 3, totalTokens: 5 },
      };
      mockProvider.generate.mockResolvedValue(mockResponse);

      const result = await service.prompt({ messages });

      expect(mockProvider.generate).toHaveBeenCalledWith(messages);
      expect(result).toEqual(mockResponse);
    });

    it("should use specified provider", async () => {
      const mockResponse = {
        content: "OpenAI response",
        model: "gpt-4",
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      };
      mockProvider.generate.mockResolvedValue(mockResponse);

      await service.prompt({ prompt: "Hello", provider: "openai" });

      expect(mockProviderFactory.getProvider).toHaveBeenCalledWith("openai");
    });

    it("should throw 400 when neither prompt nor messages provided", async () => {
      await expect(service.prompt({} as LlmPromptRequestDto)).rejects.toThrow(
        HttpException,
      );
      await expect(
        service.prompt({} as LlmPromptRequestDto),
      ).rejects.toMatchObject({
        response: { error: "Either prompt or messages must be provided" },
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it("should throw 400 when both prompt and messages provided", async () => {
      await expect(
        service.prompt({
          prompt: "Hello",
          messages: [{ role: "user" as const, content: "Hello" }],
        } as LlmPromptRequestDto),
      ).rejects.toThrow(HttpException);
    });

    it("should throw 404 for provider not found", async () => {
      mockProviderFactory.getProvider.mockImplementation(() => {
        throw new ProviderNotFoundError("unknown");
      });

      await expect(
        service.prompt({ prompt: "Hello", provider: "unknown" }),
      ).rejects.toThrow(ProviderNotFoundError);
    });

    it("should map provider errors using error mapper", async () => {
      const providerError = new Error("API Error");
      mockProvider.generate.mockRejectedValue(providerError);

      const mappedException = new HttpException(
        {
          error: {
            code: "PROVIDER_API_ERROR",
            message: "Error",
            provider: "echo",
          },
        },
        HttpStatus.BAD_GATEWAY,
      );
      mockErrorMapper.mapError.mockReturnValue(mappedException);

      await expect(service.prompt({ prompt: "Hello" })).rejects.toThrow(
        mappedException,
      );

      expect(mockErrorMapper.mapError).toHaveBeenCalledWith(
        providerError,
        "unknown",
      );
    });
  });

  describe("promptStream", () => {
    const createMockStreamEvents = (): ProviderStreamEvent[] => [
      {
        type: "content",
        data: { delta: "Hello", model: "echo-1.0" },
        eventId: "event-1",
      },
      {
        type: "content",
        data: { delta: " world", model: "echo-1.0" },
        eventId: "event-2",
      },
      {
        type: "usage",
        data: {
          promptTokens: 2,
          completionTokens: 2,
          totalTokens: 4,
          model: "echo-1.0",
        },
        eventId: "event-3",
      },
      {
        type: "done",
        data: "stream complete",
        eventId: "event-4",
      },
    ];

    it("should stream prompt successfully", async () => {
      const mockEvents = createMockStreamEvents();
      mockProvider.generateStream!.mockImplementation(async function* () {
        for (const event of mockEvents) {
          yield await Promise.resolve(event);
        }
      });

      const results: ProviderStreamEvent[] = [];
      for await (const event of service.promptStream({ prompt: "Hello" })) {
        results.push(event);
      }

      expect(mockProviderFactory.getProvider).toHaveBeenCalledWith(undefined);
      expect(mockProvider.generateStream).toHaveBeenCalledWith(
        "Hello",
        undefined,
        undefined,
      );
      expect(results).toEqual(mockEvents);
    });

    it("should stream messages successfully", async () => {
      const messages = [{ role: "user" as const, content: "Hello" }];
      const mockEvents = createMockStreamEvents();
      mockProvider.generateStream!.mockImplementation(async function* () {
        for (const event of mockEvents) {
          yield await Promise.resolve(event);
        }
      });

      const results: ProviderStreamEvent[] = [];
      for await (const event of service.promptStream({ messages })) {
        results.push(event);
      }

      expect(mockProvider.generateStream).toHaveBeenCalledWith(
        messages,
        undefined,
        undefined,
      );
      expect(results).toEqual(mockEvents);
    });

    it("should pass lastEventId to provider stream", async () => {
      const mockEvents = createMockStreamEvents();
      mockProvider.generateStream!.mockImplementation(async function* () {
        for (const event of mockEvents) {
          yield await Promise.resolve(event);
        }
      });

      const results: ProviderStreamEvent[] = [];
      for await (const event of service.promptStream(
        { prompt: "Hello", provider: "openai" },
        "last-event-123",
      )) {
        results.push(event);
      }

      expect(mockProviderFactory.getProvider).toHaveBeenCalledWith("openai");
      expect(mockProvider.generateStream).toHaveBeenCalledWith(
        "Hello",
        undefined,
        "last-event-123",
      );
    });

    it("should throw 400 when neither prompt nor messages provided for streaming", async () => {
      await expect(async () => {
        for await (const _event of service.promptStream(
          {} as LlmPromptRequestDto,
        )) {
          void _event; // Explicitly mark as used
          // Should not get here
        }
      }).rejects.toThrow(HttpException);
    });

    it("should throw 400 when both prompt and messages provided for streaming", async () => {
      await expect(async () => {
        for await (const _event of service.promptStream({
          prompt: "Hello",
          messages: [{ role: "user" as const, content: "Hello" }],
        } as LlmPromptRequestDto)) {
          void _event; // Explicitly mark as used
          // Should not get here
        }
      }).rejects.toThrow(HttpException);
    });

    it("should throw 400 when provider does not support streaming", async () => {
      // Mock provider without generateStream method
      const nonStreamingProvider = {
        generate: vi.fn(),
        getName: vi.fn().mockReturnValue("non-streaming"),
        isAvailable: vi.fn().mockReturnValue(true),
      };
      mockProviderFactory.getProvider.mockReturnValue(nonStreamingProvider);

      await expect(async () => {
        for await (const _event of service.promptStream({ prompt: "Hello" })) {
          void _event; // Explicitly mark as used
          // Should not get here
        }
      }).rejects.toThrow(HttpException);

      await expect(async () => {
        for await (const _event of service.promptStream({ prompt: "Hello" })) {
          void _event; // Explicitly mark as used
          // Should not get here
        }
      }).rejects.toMatchObject({
        response: { error: "Provider does not support streaming" },
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it("should throw ProviderNotFoundError for unknown provider in streaming", async () => {
      mockProviderFactory.getProvider.mockImplementation(() => {
        throw new ProviderNotFoundError("unknown");
      });

      await expect(async () => {
        for await (const _event of service.promptStream({
          prompt: "Hello",
          provider: "unknown",
        })) {
          void _event; // Explicitly mark as used
          // Should not get here
        }
      }).rejects.toThrow(ProviderNotFoundError);
    });

    it("should rethrow HttpException from streaming", async () => {
      const httpException = new HttpException(
        { error: "Custom error" },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      mockProvider.generateStream!.mockImplementation(async function* () {
        await Promise.resolve(); // Satisfy require-await
        yield { type: "chunk", content: "test" }; // Satisfy require-yield
        throw httpException;
      });

      await expect(async () => {
        for await (const _event of service.promptStream({ prompt: "Hello" })) {
          void _event; // Explicitly mark as used
          // Should not get here
        }
      }).rejects.toThrow(httpException);
    });

    it("should map provider errors using error mapper in streaming", async () => {
      const providerError = new Error("Stream API Error");
      mockProvider.generateStream!.mockImplementation(async function* () {
        await Promise.resolve(); // Satisfy require-await
        yield { type: "chunk", content: "test" }; // Satisfy require-yield
        throw providerError;
      });

      const mappedException = new HttpException(
        {
          error: {
            code: "PROVIDER_STREAM_ERROR",
            message: "Stream Error",
            provider: "echo",
          },
        },
        HttpStatus.BAD_GATEWAY,
      );
      mockErrorMapper.mapError.mockReturnValue(mappedException);

      await expect(async () => {
        for await (const _event of service.promptStream({ prompt: "Hello" })) {
          void _event; // Explicitly mark as used
          // Should not get here
        }
      }).rejects.toThrow(mappedException);

      expect(mockErrorMapper.mapError).toHaveBeenCalledWith(
        providerError,
        "unknown",
      );
    });

    it("should handle empty stream gracefully", async () => {
      mockProvider.generateStream!.mockImplementation(async function* () {
        // Empty generator
      });

      const results: ProviderStreamEvent[] = [];
      for await (const event of service.promptStream({ prompt: "Hello" })) {
        results.push(event);
      }

      expect(results).toEqual([]);
    });

    it("should pass provider name to generateStream correctly", async () => {
      const mockEvents = createMockStreamEvents();
      mockProvider.generateStream!.mockImplementation(function* () {
        for (const event of mockEvents) {
          yield event;
        }
      });

      const results: ProviderStreamEvent[] = [];
      for await (const event of service.promptStream({
        prompt: "Hello",
        provider: "specific-provider",
      })) {
        results.push(event);
      }

      expect(mockProviderFactory.getProvider).toHaveBeenCalledWith(
        "specific-provider",
      );
      expect(results).toEqual(mockEvents);
    });

    it("should handle streaming with complex message array", async () => {
      const complexMessages = [
        { role: "system" as const, content: "You are a helpful assistant" },
        { role: "user" as const, content: "Hello" },
        { role: "assistant" as const, content: "Hi there!" },
        { role: "user" as const, content: "How are you?" },
      ];
      const mockEvents = createMockStreamEvents();
      mockProvider.generateStream!.mockImplementation(function* () {
        for (const event of mockEvents) {
          yield event;
        }
      });

      const results: ProviderStreamEvent[] = [];
      for await (const event of service.promptStream({
        messages: complexMessages,
        provider: "test-provider",
      })) {
        results.push(event);
      }

      expect(mockProvider.generateStream).toHaveBeenCalledWith(
        complexMessages,
        undefined,
        undefined,
      );
      expect(results).toEqual(mockEvents);
    });

    it("should handle streaming with both lastEventId and provider specified", async () => {
      const mockEvents = createMockStreamEvents();
      mockProvider.generateStream!.mockImplementation(function* () {
        for (const event of mockEvents) {
          yield event;
        }
      });

      const results: ProviderStreamEvent[] = [];
      for await (const event of service.promptStream(
        { prompt: "Resume conversation", provider: "custom-provider" },
        "event-resume-123",
      )) {
        results.push(event);
      }

      expect(mockProviderFactory.getProvider).toHaveBeenCalledWith(
        "custom-provider",
      );
      expect(mockProvider.generateStream).toHaveBeenCalledWith(
        "Resume conversation",
        undefined,
        "event-resume-123",
      );
      expect(results).toEqual(mockEvents);
    });

    it("should handle error in error mapper for streaming", async () => {
      const originalError = new Error("Stream processing failed");
      mockProvider.generateStream!.mockImplementation(() => {
        throw originalError;
      });

      // Mock error mapper to throw its own error
      const mapperError = new Error("Error mapper failed");
      mockErrorMapper.mapError.mockImplementation(() => {
        throw mapperError;
      });

      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _event of service.promptStream({ prompt: "Hello" })) {
          // Should not get here
        }
      }).rejects.toThrow(mapperError);

      expect(mockErrorMapper.mapError).toHaveBeenCalledWith(
        originalError,
        "unknown",
      );
    });

    it("should propagate provider name correctly to error mapper when provider specified", async () => {
      const providerError = new Error("Custom provider error");
      mockProvider.generateStream!.mockImplementation(() => {
        throw providerError;
      });

      const mappedException = new HttpException(
        {
          error: {
            code: "CUSTOM_PROVIDER_ERROR",
            message: "Custom Error",
            provider: "custom-provider",
          },
        },
        HttpStatus.BAD_GATEWAY,
      );
      mockErrorMapper.mapError.mockReturnValue(mappedException);

      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _event of service.promptStream({
          prompt: "Hello",
          provider: "custom-provider",
        })) {
          // Should not get here
        }
      }).rejects.toThrow(mappedException);

      expect(mockErrorMapper.mapError).toHaveBeenCalledWith(
        providerError,
        "custom-provider",
      );
    });

    it("should handle streaming with very long prompt string", async () => {
      const longPrompt = "A".repeat(10000); // Very long prompt
      const mockEvents = createMockStreamEvents();
      mockProvider.generateStream!.mockImplementation(function* () {
        for (const event of mockEvents) {
          yield event;
        }
      });

      const results: ProviderStreamEvent[] = [];
      for await (const event of service.promptStream({ prompt: longPrompt })) {
        results.push(event);
      }

      expect(mockProvider.generateStream).toHaveBeenCalledWith(
        longPrompt,
        undefined,
        undefined,
      );
      expect(results).toEqual(mockEvents);
    });

    it("should handle streaming interruption correctly", async () => {
      const mockEvents = createMockStreamEvents();
      mockProvider.generateStream!.mockImplementation(function* () {
        yield mockEvents[0];
        yield mockEvents[1];
        // Simulate interruption after partial stream
        throw new Error("Stream interrupted");
      });

      const mappedException = new HttpException(
        { error: "Stream processing error" },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      mockErrorMapper.mapError.mockReturnValue(mappedException);

      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _event of service.promptStream({ prompt: "Hello" })) {
          // Only first two events should be yielded before error
        }
      }).rejects.toThrow(mappedException);
    });
  });
});
