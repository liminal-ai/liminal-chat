import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus } from "@nestjs/common";
import { LlmService } from "./llm.service";
import { LlmProviderFactory } from "../providers/llm/llm-provider.factory";
import { VercelErrorMapper } from "../providers/llm/vercel-error.mapper";
import { ILLMProvider } from "../providers/llm/llm-provider.interface";
import { LlmPromptRequestDto } from "../domain/dto/llm-prompt-request.dto";
import { ProviderNotFoundError } from "../providers/llm/errors";

describe("LlmService", () => {
  let service: LlmService;
  let mockProviderFactory: jest.Mocked<LlmProviderFactory>;
  let mockErrorMapper: jest.Mocked<VercelErrorMapper>;
  let mockProvider: jest.Mocked<ILLMProvider>;

  beforeEach(async () => {
    mockProvider = {
      generate: jest.fn(),
      getName: jest.fn().mockReturnValue("echo"),
      isAvailable: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<ILLMProvider>;

    mockProviderFactory = {
      getProvider: jest.fn().mockReturnValue(mockProvider),
      getAvailableProviders: jest.fn().mockReturnValue(["echo"]),
      onModuleInit: jest.fn(),
    } as unknown as jest.Mocked<LlmProviderFactory>;

    mockErrorMapper = {
      mapError: jest.fn(),
    } as unknown as jest.Mocked<VercelErrorMapper>;

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
      (mockProvider.generate as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.prompt({ prompt: "Hello" });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockProviderFactory.getProvider).toHaveBeenCalledWith(undefined);
      // eslint-disable-next-line @typescript-eslint/unbound-method
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
      (mockProvider.generate as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.prompt({ messages });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockProvider.generate).toHaveBeenCalledWith(messages);
      expect(result).toEqual(mockResponse);
    });

    it("should use specified provider", async () => {
      const mockResponse = {
        content: "OpenAI response",
        model: "gpt-4",
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      };
      (mockProvider.generate as jest.Mock).mockResolvedValue(mockResponse);

      await service.prompt({ prompt: "Hello", provider: "openai" });

      // eslint-disable-next-line @typescript-eslint/unbound-method
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
      (mockProvider.generate as jest.Mock).mockRejectedValue(providerError);

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
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockErrorMapper.mapError).toHaveBeenCalledWith(
        providerError,
        "unknown",
      );
    });
  });
});
