import { describe, it, expect, beforeEach, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus } from "@nestjs/common";
import { LlmService } from "./llm.service";
import { LlmProviderFactory } from "../providers/llm/llm-provider.factory";
import { VercelErrorMapper } from "../providers/llm/vercel-error.mapper";
import { LlmPromptRequestDto } from "../domain/dto/llm-prompt-request.dto";
import { ProviderNotFoundError } from "../providers/llm/errors";

// Mock interfaces for proper TypeScript typing
interface MockLLMProvider {
  generate: ReturnType<typeof vi.fn>;
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
});
