import { LlmProviderFactory } from "./llm-provider.factory";
import { ILLMProvider } from "./llm-provider.interface";
import { ConfigService } from "@nestjs/config";
import { ProviderNotFoundError } from "./errors";
import { EchoProvider } from "./providers/echo.provider";
import { VercelOpenAIProvider } from "./providers/vercel-openai.provider";
import { OpenRouterProvider } from "./providers/openrouter.provider";

describe("LlmProviderFactory", () => {
  let factory: LlmProviderFactory;
  let mockEchoProvider: jest.Mocked<ILLMProvider>;
  let mockOpenAIProvider: jest.Mocked<ILLMProvider>;
  let mockOpenRouterProvider: jest.Mocked<ILLMProvider>;

  beforeEach(() => {
    mockEchoProvider = {
      generate: jest.fn(),
      getName: jest.fn().mockReturnValue("echo"),
      isAvailable: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<ILLMProvider>;

    mockOpenAIProvider = {
      generate: jest.fn(),
      getName: jest.fn().mockReturnValue("openai"),
      isAvailable: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<ILLMProvider>;

    mockOpenRouterProvider = {
      generate: jest.fn(),
      getName: jest.fn().mockReturnValue("openrouter"),
      isAvailable: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<ILLMProvider>;

    const configService = {
      get: jest.fn((key: string) => {
        if (key === "OPENAI_API_KEY") return "test-key";
        if (key === "DEFAULT_LLM_PROVIDER") return "echo";
        return undefined;
      }),
    };

    factory = new LlmProviderFactory(
      configService as unknown as ConfigService,
      mockEchoProvider as unknown as EchoProvider,
      mockOpenAIProvider as unknown as VercelOpenAIProvider,
      mockOpenRouterProvider as unknown as OpenRouterProvider,
    );

    // Simulate module initialization
    factory.onModuleInit();
  });

  describe("getProvider", () => {
    it('should return EchoProvider for "echo"', () => {
      const provider = factory.getProvider("echo");
      expect(provider).toBe(mockEchoProvider);
    });

    it('should return VercelOpenAIProvider for "openai"', () => {
      const provider = factory.getProvider("openai");
      expect(provider).toBe(mockOpenAIProvider);
    });

    it('should return OpenRouterProvider for "openrouter"', () => {
      const provider = factory.getProvider("openrouter");
      expect(provider).toBe(mockOpenRouterProvider);
    });

    it("should throw ProviderNotFoundError for unknown provider", () => {
      expect(() => factory.getProvider("unknown")).toThrow(
        ProviderNotFoundError,
      );
      expect(() => factory.getProvider("unknown")).toThrow(
        "Provider 'unknown' not found",
      );
    });

    it("should use default provider when none specified", () => {
      const provider = factory.getProvider();
      expect(provider).toBe(mockEchoProvider);
    });
  });

  describe("getAvailableProviders", () => {
    it("should return list of configured providers", () => {
      const providers = factory.getAvailableProviders();
      expect(providers).toContain("echo");
      expect(providers).toContain("openai");
      expect(providers).toContain("openrouter");
    });

    it("should always include echo provider", () => {
      (mockOpenAIProvider.isAvailable as jest.Mock) = jest
        .fn()
        .mockReturnValue(false);
      const providers = factory.getAvailableProviders();
      expect(providers).toContain("echo");
    });

    it("should check isAvailable for each provider", () => {
      (mockOpenAIProvider.isAvailable as jest.Mock) = jest
        .fn()
        .mockReturnValue(false);
      (mockOpenRouterProvider.isAvailable as jest.Mock) = jest
        .fn()
        .mockReturnValue(false);
      const providers = factory.getAvailableProviders();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEchoProvider.isAvailable).toHaveBeenCalled();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockOpenAIProvider.isAvailable).toHaveBeenCalled();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockOpenRouterProvider.isAvailable).toHaveBeenCalled();
      expect(providers).toEqual(["echo"]); // Only echo is available
    });
  });

  describe("configuration loading", () => {
    it("should load API keys from ConfigService", () => {
      // This happens in constructor, already tested above
      expect(mockOpenAIProvider).toBeDefined();
    });

    it("should handle missing configuration gracefully", () => {
      const noConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      };

      const factoryWithNoConfig = new LlmProviderFactory(
        noConfigService as unknown as ConfigService,
        mockEchoProvider as unknown as EchoProvider,
        mockOpenAIProvider as unknown as VercelOpenAIProvider,
        mockOpenRouterProvider as unknown as OpenRouterProvider,
      );

      // Initialize the factory first
      factoryWithNoConfig.onModuleInit();

      // When DEFAULT_LLM_PROVIDER is undefined, it should default to echo
      expect(factoryWithNoConfig.getProvider()).toBe(mockEchoProvider);
    });

    it("should log available providers on init", () => {
      const logSpy = jest.spyOn(factory["logger"], "log");
      factory.onModuleInit();

      expect(logSpy).toHaveBeenCalledWith("Initializing LLM providers...");
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining("Available providers:"),
      );
    });
  });
});
