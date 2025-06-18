import { describe, it, expect, beforeEach, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { DomainController } from "./domain.controller";
import { LlmService } from "../llm/llm.service";
import { ProviderHealthService } from "../providers/llm/provider-health.service";
import { LlmPromptRequestDto } from "./dto/llm-prompt-request.dto";
import { LlmResponse } from "../llm/dto/llm-response.dto";
import { ProviderStreamEvent } from "@liminal-chat/shared-types";

// Mock interfaces for proper TypeScript typing
interface MockLlmService {
  prompt: ReturnType<typeof vi.fn>;
  promptStream: ReturnType<typeof vi.fn>;
}

interface MockProviderHealthService {
  getProviderDiscovery: ReturnType<typeof vi.fn>;
}

interface MockConfigService {
  get: ReturnType<typeof vi.fn>;
}

interface MockFastifyReply {
  raw: {
    setHeader: ReturnType<typeof vi.fn>;
    flushHeaders?: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
    write: ReturnType<typeof vi.fn>;
    end: ReturnType<typeof vi.fn>;
  };
  code: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
}

describe("DomainController", () => {
  let controller: DomainController;
  let mockLlmService: MockLlmService;
  let mockProviderHealthService: MockProviderHealthService;
  let mockConfigService: MockConfigService;
  let mockResponse: MockFastifyReply;

  beforeEach(async () => {
    mockLlmService = {
      prompt: vi.fn(),
      promptStream: vi.fn(),
    };

    mockProviderHealthService = {
      getProviderDiscovery: vi.fn(),
    };

    mockConfigService = {
      get: vi.fn(),
    };

    // Set up default CORS config values
    mockConfigService.get.mockImplementation(
      (key: string, defaultValue?: string) => {
        switch (key) {
          case "CORS_ALLOW_ORIGIN":
            return defaultValue || "*";
          case "CORS_ALLOW_HEADERS":
            return defaultValue || "Content-Type, Last-Event-ID";
          default:
            return defaultValue;
        }
      },
    );

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DomainController],
      providers: [
        {
          provide: LlmService,
          useValue: mockLlmService,
        },
        {
          provide: ProviderHealthService,
          useValue: mockProviderHealthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<DomainController>(DomainController);

    // Mock FastifyReply
    mockResponse = {
      raw: {
        setHeader: vi.fn(),
        flushHeaders: vi.fn(),
        on: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      },
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  describe("constructor", () => {
    it("should initialize with cached CORS configuration", () => {
      expect(mockConfigService.get).toHaveBeenCalledWith(
        "CORS_ALLOW_ORIGIN",
        "*",
      );
      expect(mockConfigService.get).toHaveBeenCalledWith(
        "CORS_ALLOW_HEADERS",
        "Content-Type, Last-Event-ID",
      );
    });

    it("should use custom CORS configuration when provided", async () => {
      const customMockConfigService = {
        get: vi
          .fn()
          .mockImplementation((key: string, defaultValue?: string) => {
            switch (key) {
              case "CORS_ALLOW_ORIGIN":
                return "https://example.com";
              case "CORS_ALLOW_HEADERS":
                return "Authorization, Content-Type";
              default:
                return defaultValue;
            }
          }),
      };

      const module: TestingModule = await Test.createTestingModule({
        controllers: [DomainController],
        providers: [
          {
            provide: LlmService,
            useValue: mockLlmService,
          },
          {
            provide: ProviderHealthService,
            useValue: mockProviderHealthService,
          },
          {
            provide: ConfigService,
            useValue: customMockConfigService,
          },
        ],
      }).compile();

      module.get<DomainController>(DomainController);

      expect(customMockConfigService.get).toHaveBeenCalledWith(
        "CORS_ALLOW_ORIGIN",
        "*",
      );
      expect(customMockConfigService.get).toHaveBeenCalledWith(
        "CORS_ALLOW_HEADERS",
        "Content-Type, Last-Event-ID",
      );
    });
  });

  describe("prompt - non-streaming", () => {
    it("should handle non-streaming prompt successfully", async () => {
      const dto: LlmPromptRequestDto = { prompt: "Hello", stream: false };
      const mockLlmResponse: LlmResponse = {
        content: "Hello response",
        model: "echo-1.0",
        usage: { promptTokens: 2, completionTokens: 3, totalTokens: 5 },
      };

      mockLlmService.prompt.mockResolvedValue(mockLlmResponse);

      const result = await controller.prompt(dto, mockResponse);

      expect(mockLlmService.prompt).toHaveBeenCalledWith(dto);
      expect(mockResponse.code).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockLlmResponse);
      expect(result).toEqual(mockLlmResponse);
    });

    it("should handle non-streaming prompt without explicit stream=false", async () => {
      const dto: LlmPromptRequestDto = { prompt: "Hello" };
      const mockLlmResponse: LlmResponse = {
        content: "Hello response",
        model: "echo-1.0",
        usage: { promptTokens: 2, completionTokens: 3, totalTokens: 5 },
      };

      mockLlmService.prompt.mockResolvedValue(mockLlmResponse);

      const result = await controller.prompt(dto, mockResponse);

      expect(mockLlmService.prompt).toHaveBeenCalledWith(dto);
      expect(mockResponse.code).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockLlmResponse);
      expect(result).toEqual(mockLlmResponse);
    });

    it("should handle messages in non-streaming mode", async () => {
      const dto: LlmPromptRequestDto = {
        messages: [{ role: "user", content: "Hello" }],
        stream: false,
      };
      const mockLlmResponse: LlmResponse = {
        content: "Hello response",
        model: "echo-1.0",
        usage: { promptTokens: 2, completionTokens: 3, totalTokens: 5 },
      };

      mockLlmService.prompt.mockResolvedValue(mockLlmResponse);

      const result = await controller.prompt(dto, mockResponse);

      expect(mockLlmService.prompt).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockLlmResponse);
    });
  });

  describe("prompt - streaming", () => {
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

    it("should handle streaming prompt successfully", async () => {
      const dto: LlmPromptRequestDto = { prompt: "Hello", stream: true };
      const mockEvents = createMockStreamEvents();

      mockLlmService.promptStream.mockImplementation(async function* () {
        await new Promise((resolve) => setTimeout(resolve, 0));
        for (const event of mockEvents) {
          yield event;
        }
      });

      const result = await controller.prompt(dto, mockResponse);

      expect(mockLlmService.promptStream).toHaveBeenCalledWith(dto, undefined);

      // Verify SSE headers were set
      expect(mockResponse.raw.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "text/event-stream",
      );
      expect(mockResponse.raw.setHeader).toHaveBeenCalledWith(
        "Cache-Control",
        "no-cache",
      );
      expect(mockResponse.raw.setHeader).toHaveBeenCalledWith(
        "Connection",
        "keep-alive",
      );

      // Verify CORS headers were set
      expect(mockResponse.raw.setHeader).toHaveBeenCalledWith(
        "Access-Control-Allow-Origin",
        "*",
      );
      expect(mockResponse.raw.setHeader).toHaveBeenCalledWith(
        "Access-Control-Allow-Headers",
        "Content-Type, Last-Event-ID",
      );
      expect(mockResponse.raw.setHeader).toHaveBeenCalledWith(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS",
      );

      // Verify headers were flushed
      expect(mockResponse.raw.flushHeaders).toHaveBeenCalled();

      // Verify client disconnect handler was set
      expect(mockResponse.raw.on).toHaveBeenCalledWith(
        "close",
        expect.any(Function),
      );

      // Verify each event was written in SSE format
      expect(mockResponse.raw.write).toHaveBeenCalledWith(
        `id: event-1\nevent: content\ndata: {"delta":"Hello","model":"echo-1.0"}\n\n`,
      );
      expect(mockResponse.raw.write).toHaveBeenCalledWith(
        `id: event-2\nevent: content\ndata: {"delta":" world","model":"echo-1.0"}\n\n`,
      );
      expect(mockResponse.raw.write).toHaveBeenCalledWith(
        `id: event-3\nevent: usage\ndata: {"promptTokens":2,"completionTokens":2,"totalTokens":4,"model":"echo-1.0"}\n\n`,
      );
      expect(mockResponse.raw.write).toHaveBeenCalledWith(
        `id: event-4\nevent: done\ndata: "stream complete"\n\n`,
      );

      // Verify stream was ended
      expect(mockResponse.raw.end).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it("should handle streaming with Last-Event-ID header", async () => {
      const dto: LlmPromptRequestDto = { prompt: "Hello", stream: true };
      const lastEventId = "last-event-123";
      const mockEvents = createMockStreamEvents();

      mockLlmService.promptStream.mockImplementation(async function* () {
        await new Promise((resolve) => setTimeout(resolve, 0));
        for (const event of mockEvents) {
          yield event;
        }
      });

      await controller.prompt(dto, mockResponse, lastEventId);

      expect(mockLlmService.promptStream).toHaveBeenCalledWith(
        dto,
        lastEventId,
      );
    });

    it("should handle streaming done event without data", async () => {
      const dto: LlmPromptRequestDto = { prompt: "Hello", stream: true };
      const mockEvents: ProviderStreamEvent[] = [
        {
          type: "content",
          data: { delta: "Hello", model: "echo-1.0" },
          eventId: "event-1",
        },
        {
          type: "done",
          eventId: "event-2",
        },
      ];

      mockLlmService.promptStream.mockImplementation(async function* () {
        await new Promise((resolve) => setTimeout(resolve, 0));
        for (const event of mockEvents) {
          yield event;
        }
      });

      await controller.prompt(dto, mockResponse);

      expect(mockResponse.raw.write).toHaveBeenCalledWith(
        `id: event-1\nevent: content\ndata: {"delta":"Hello","model":"echo-1.0"}\n\n`,
      );
      expect(mockResponse.raw.write).toHaveBeenCalledWith(
        `id: event-2\nevent: done\ndata: [DONE]\n\n`,
      );
    });

    it("should handle streaming error event", async () => {
      const dto: LlmPromptRequestDto = { prompt: "Hello", stream: true };
      const mockEvents: ProviderStreamEvent[] = [
        {
          type: "error",
          data: {
            message: "Provider error",
            code: "PROVIDER_ERROR",
            retryable: false,
          },
          eventId: "error-1",
        },
      ];

      mockLlmService.promptStream.mockImplementation(async function* () {
        await new Promise((resolve) => setTimeout(resolve, 0));
        for (const event of mockEvents) {
          yield event;
        }
      });

      await controller.prompt(dto, mockResponse);

      expect(mockResponse.raw.write).toHaveBeenCalledWith(
        `id: error-1\nevent: error\ndata: {"message":"Provider error","code":"PROVIDER_ERROR","retryable":false}\n\n`,
      );
    });

    it("should handle streaming client disconnect gracefully", async () => {
      const dto: LlmPromptRequestDto = { prompt: "Hello", stream: true };
      let clientDisconnectCallback: () => void;

      // Capture the disconnect callback
      mockResponse.raw.on.mockImplementation(
        (event: string, callback: () => void) => {
          if (event === "close") {
            clientDisconnectCallback = callback;
          }
        },
      );

      mockLlmService.promptStream.mockImplementation(async function* () {
        await new Promise((resolve) => setTimeout(resolve, 0));
        yield {
          type: "content",
          data: { delta: "Hello", model: "echo-1.0" },
          eventId: "event-1",
        };

        // Simulate client disconnect during streaming
        clientDisconnectCallback();

        yield {
          type: "content",
          data: { delta: " world", model: "echo-1.0" },
          eventId: "event-2",
        };
      });

      await controller.prompt(dto, mockResponse);

      // Should write first event but not second due to client disconnect
      expect(mockResponse.raw.write).toHaveBeenCalledWith(
        `id: event-1\nevent: content\ndata: {"delta":"Hello","model":"echo-1.0"}\n\n`,
      );
      expect(mockResponse.raw.write).not.toHaveBeenCalledWith(
        `id: event-2\nevent: content\ndata: {"delta":" world","model":"echo-1.0"}\n\n`,
      );
    });

    it("should handle streaming service errors", async () => {
      const dto: LlmPromptRequestDto = { prompt: "Hello", stream: true };
      const streamError = new Error("Stream failed");

      mockLlmService.promptStream.mockImplementation(async function* () {
        await new Promise((resolve) => setTimeout(resolve, 0));
        throw streamError;
        yield; // Never reached but satisfies require-yield
      });

      await controller.prompt(dto, mockResponse);

      // Verify error event was written
      expect(mockResponse.raw.write).toHaveBeenCalledWith(
        `event: error\ndata: {"message":"Stream failed","code":"INTERNAL_ERROR","retryable":false}\n\n`,
      );
      expect(mockResponse.raw.end).toHaveBeenCalled();
    });

    it("should handle streaming service errors with non-Error objects", async () => {
      const dto: LlmPromptRequestDto = { prompt: "Hello", stream: true };
      const streamError = "String error";

      mockLlmService.promptStream.mockImplementation(async function* () {
        await new Promise((resolve) => setTimeout(resolve, 0));
        throw new Error(String(streamError));
        yield; // Never reached but satisfies require-yield
      });

      await controller.prompt(dto, mockResponse);

      // Verify error event was written with string error message
      expect(mockResponse.raw.write).toHaveBeenCalledWith(
        `event: error\ndata: {"message":"String error","code":"INTERNAL_ERROR","retryable":false}\n\n`,
      );
    });

    it("should handle streaming without flushHeaders method", async () => {
      const dto: LlmPromptRequestDto = { prompt: "Hello", stream: true };

      // Remove flushHeaders method
      delete mockResponse.raw.flushHeaders;

      mockLlmService.promptStream.mockImplementation(async function* () {
        await new Promise((resolve) => setTimeout(resolve, 0));
        yield {
          type: "done",
          eventId: "event-1",
        };
      });

      await controller.prompt(dto, mockResponse);

      // Should not throw error and should complete successfully
      expect(mockResponse.raw.end).toHaveBeenCalled();
    });

    it("should handle unknown event types with empty data", async () => {
      const dto: LlmPromptRequestDto = { prompt: "Hello", stream: true };
      const mockEvents: ProviderStreamEvent[] = [
        {
          type: "unknown" as "content" | "usage" | "error" | "done", // Force unknown event type
          data: "some data",
          eventId: "event-1",
        },
        {
          type: "done",
          eventId: "event-2",
        },
      ];

      mockLlmService.promptStream.mockImplementation(async function* () {
        await new Promise((resolve) => setTimeout(resolve, 0));
        for (const event of mockEvents) {
          yield event;
        }
      });

      await controller.prompt(dto, mockResponse);

      expect(mockResponse.raw.write).toHaveBeenCalledWith(
        `id: event-1\nevent: unknown\ndata: \n\n`,
      );
      expect(mockResponse.raw.write).toHaveBeenCalledWith(
        `id: event-2\nevent: done\ndata: [DONE]\n\n`,
      );
    });

    it("should use custom CORS headers in streaming", async () => {
      // Create a new controller with custom CORS config
      const customMockConfigService = {
        get: vi
          .fn()
          .mockImplementation((key: string, defaultValue?: string) => {
            switch (key) {
              case "CORS_ALLOW_ORIGIN":
                return "https://custom.com";
              case "CORS_ALLOW_HEADERS":
                return "Authorization, Content-Type, Custom-Header";
              default:
                return defaultValue;
            }
          }),
      };

      const module: TestingModule = await Test.createTestingModule({
        controllers: [DomainController],
        providers: [
          {
            provide: LlmService,
            useValue: mockLlmService,
          },
          {
            provide: ProviderHealthService,
            useValue: mockProviderHealthService,
          },
          {
            provide: ConfigService,
            useValue: customMockConfigService,
          },
        ],
      }).compile();

      const customController = module.get<DomainController>(DomainController);

      const dto: LlmPromptRequestDto = { prompt: "Hello", stream: true };

      mockLlmService.promptStream.mockImplementation(async function* () {
        await new Promise((resolve) => setTimeout(resolve, 0));
        yield {
          type: "done",
          eventId: "event-1",
        };
      });

      await customController.prompt(dto, mockResponse);

      expect(mockResponse.raw.setHeader).toHaveBeenCalledWith(
        "Access-Control-Allow-Origin",
        "https://custom.com",
      );
      expect(mockResponse.raw.setHeader).toHaveBeenCalledWith(
        "Access-Control-Allow-Headers",
        "Authorization, Content-Type, Custom-Header",
      );
    });
  });

  describe("getProviders", () => {
    it("should return provider discovery information", async () => {
      const mockProviderDiscovery = {
        providers: [
          {
            name: "echo",
            available: true,
            models: ["echo-1.0"],
          },
          {
            name: "openai",
            available: true,
            models: ["gpt-3.5-turbo", "gpt-4"],
          },
        ],
        default: "echo",
        timestamp: "2024-01-01T00:00:00.000Z",
      };

      mockProviderHealthService.getProviderDiscovery.mockResolvedValue(
        mockProviderDiscovery,
      );

      const result = await controller.getProviders();

      expect(mockProviderHealthService.getProviderDiscovery).toHaveBeenCalled();
      expect(result).toEqual(mockProviderDiscovery);
    });

    it("should handle provider health service errors", async () => {
      const healthError = new Error("Health check failed");
      mockProviderHealthService.getProviderDiscovery.mockRejectedValue(
        healthError,
      );

      await expect(controller.getProviders()).rejects.toThrow(healthError);
    });
  });
});
