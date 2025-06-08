import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { ProviderHealthService } from "./provider-health.service";
import { LlmProviderFactory } from "./llm-provider.factory";
import { ILLMProvider } from "./llm-provider.interface";

describe("ProviderHealthService", () => {
  let service: ProviderHealthService;
  let mockEchoProvider: ILLMProvider;
  let mockOpenAIProvider: ILLMProvider;
  let mockFactory: jest.Mocked<LlmProviderFactory>;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    // Create mock providers
    mockEchoProvider = {
      generate: jest.fn(),
      generateStream: jest.fn(),
      getName: jest.fn().mockReturnValue("echo"),
      isAvailable: jest.fn().mockReturnValue(true),
    };

    mockOpenAIProvider = {
      generate: jest.fn(),
      generateStream: jest.fn(),
      getName: jest.fn().mockReturnValue("openai"),
      isAvailable: jest.fn().mockReturnValue(false),
    };

    // Create mock factory
    mockFactory = {
      getProvider: jest.fn(),
      getDefaultProvider: jest.fn().mockReturnValue("echo"),
      getAvailableProviders: jest.fn().mockReturnValue(["echo"]),
      onModuleInit: jest.fn(),
    } as unknown as jest.Mocked<LlmProviderFactory>;

    // Create mock config service
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === "DEFAULT_LLM_PROVIDER") return "echo";
        return undefined;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    // Override getProvider to return our mock providers
    mockFactory.getProvider.mockImplementation((name?: string) => {
      if (name === "openai") return mockOpenAIProvider;
      if (name === "echo") return mockEchoProvider;
      throw new Error(`Provider ${name} not found`);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderHealthService,
        { provide: LlmProviderFactory, useValue: mockFactory },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ProviderHealthService>(ProviderHealthService);
  });

  describe("onModuleInit", () => {
    it("should validate all providers on startup", async () => {
      const loggerLogSpy = jest
        .spyOn(service["logger"], "log")
        .mockImplementation();
      const loggerWarnSpy = jest
        .spyOn(service["logger"], "warn")
        .mockImplementation();

      await service.onModuleInit();

      expect(loggerLogSpy).toHaveBeenCalled();
      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Validating LLM provider configurations"),
      );
      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("✅ Provider 'echo' is configured and ready"),
      );

      loggerLogSpy.mockRestore();
      loggerWarnSpy.mockRestore();
    });

    it("should log default provider status", async () => {
      const loggerLogSpy = jest
        .spyOn(service["logger"], "log")
        .mockImplementation();

      await service.onModuleInit();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Default provider 'echo' is available"),
      );

      loggerLogSpy.mockRestore();
    });
  });

  describe("validateProviders", () => {
    it("should validate all provider configurations", async () => {
      const results = await service.validateProviders();

      const echoResult = results.find((r) => r.provider === "echo");
      const openaiResult = results.find((r) => r.provider === "openai");

      expect(echoResult).toEqual({
        provider: "echo",
        isValid: true,
      });

      expect(openaiResult).toEqual({
        provider: "openai",
        isValid: false,
        error: "Missing OPENAI_API_KEY environment variable",
      });
    });
  });

  describe("checkProviderHealth", () => {
    it("should return healthy for echo provider", async () => {
      const health = await service.checkProviderHealth("echo");

      expect(health).toEqual({
        provider: "echo",
        status: "healthy",
      });
    });

    it("should return unhealthy for unavailable providers", async () => {
      const health = await service.checkProviderHealth("openai");

      expect(health).toEqual({
        provider: "openai",
        status: "unhealthy",
        message: "Provider not configured",
      });
    });

    it("should handle provider errors", async () => {
      mockFactory.getProvider.mockImplementation((name?: string) => {
        if (name === "error") throw new Error("Provider error");
        return mockEchoProvider;
      });

      const health = await service.checkProviderHealth("error");

      expect(health).toEqual({
        provider: "error",
        status: "unhealthy",
        message: "Provider error",
      });
    });
  });

  describe("getProviderDiscovery", () => {
    it("should return provider discovery information", async () => {
      const discovery = await service.getProviderDiscovery();
      const typedDiscovery = discovery as {
        defaultProvider: string;
        availableProviders: string[];
        providers: Record<
          string,
          {
            available: boolean;
            status: string;
            models: string[];
          }
        >;
      };

      expect(typedDiscovery.defaultProvider).toBe("echo");
      expect(typedDiscovery.availableProviders).toEqual(["echo"]);
      expect(typedDiscovery.providers).toMatchObject({
        echo: {
          available: true,
          status: "healthy",
          models: ["echo-1.0"],
        },
        openai: {
          available: false,
          status: "unhealthy",
          models: ["o4-mini", "gpt-4.1", "o3", "o4-mini-high"],
        },
      });
    });
  });
});
