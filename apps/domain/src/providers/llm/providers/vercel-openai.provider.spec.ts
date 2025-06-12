import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  type MockedFunction,
} from "vitest";
// TestingModule import removed - not used
import { ConfigService } from "@nestjs/config";
import { VercelOpenAIProvider } from "./vercel-openai.provider";
import { generateText } from "ai";

// Mock the Vercel AI SDK
vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn(() => {
    return vi.fn((modelName: string) => ({
      id: modelName,
      __type: "openai-model",
    }));
  }),
}));

describe("VercelOpenAIProvider", () => {
  let provider: VercelOpenAIProvider;
  let configService: ConfigService;
  let mockGenerateText: MockedFunction<typeof generateText>;

  beforeEach(() => {
    mockGenerateText = generateText as MockedFunction<typeof generateText>;
    mockGenerateText.mockClear();

    configService = {
      get: vi.fn((key: string) => {
        if (key === "OPENAI_API_KEY") return "test-api-key";
        if (key === "OPENAI_MODEL") return "gpt-4.1-turbo";
        return undefined;
      }),
    } as unknown as ConfigService;

    provider = new VercelOpenAIProvider(configService);
  });

  describe("configuration", () => {
    it("should throw PROVIDER_NOT_CONFIGURED if API key missing", async () => {
      const noKeyConfigService = {
        get: vi.fn().mockReturnValue(undefined),
      } as unknown as ConfigService;

      const provider = new VercelOpenAIProvider(noKeyConfigService);

      await expect(provider.generate("test")).rejects.toThrow(
        "OpenAI provider is not configured",
      );
    });

    it("should use configured model name", async () => {
      mockGenerateText.mockResolvedValue({
        text: "Test response",
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      } as unknown as Awaited<ReturnType<typeof generateText>>);

      await provider.generate("test prompt");

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          model: expect.objectContaining({ id: "gpt-4.1-turbo" } as {
            id: string;
          }) as unknown,
        }),
      );
    });

    it("should default to o4-mini if no model specified", async () => {
      const defaultConfigService = {
        get: vi.fn((key: string, defaultValue?: string) => {
          if (key === "OPENAI_API_KEY") return "test-api-key";
          if (key === "OPENAI_MODEL") return defaultValue;
          return defaultValue;
        }),
      } as unknown as ConfigService;

      const defaultProvider = new VercelOpenAIProvider(defaultConfigService);

      mockGenerateText.mockResolvedValue({
        text: "Test response",
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      } as unknown as Awaited<ReturnType<typeof generateText>>);

      await defaultProvider.generate("test");

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          model: expect.objectContaining({ id: "o4-mini" } as {
            id: string;
          }) as unknown,
        }),
      );
    });
  });

  describe("generate with prompt", () => {
    it("should convert prompt to messages format", async () => {
      mockGenerateText.mockResolvedValue({
        text: "Test response",
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      } as unknown as Awaited<ReturnType<typeof generateText>>);

      await provider.generate("test prompt");

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: "user", content: "test prompt" }],
        }),
      );
    });

    it("should call generateText with correct parameters", async () => {
      mockGenerateText.mockResolvedValue({
        text: "Test response",
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      } as unknown as Awaited<ReturnType<typeof generateText>>);

      await provider.generate("test prompt");

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.any(Array) as unknown[],
          model: expect.any(Object) as Record<string, unknown>,
        }),
      );
    });

    it("should return mapped response with content, model, usage", async () => {
      mockGenerateText.mockResolvedValue({
        text: "Test response",
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      } as unknown as Awaited<ReturnType<typeof generateText>>);

      const result = await provider.generate("test prompt");

      expect(result).toEqual({
        content: "Test response",
        model: "gpt-4.1-turbo",
        usage: {
          promptTokens: 10,
          completionTokens: 5,
          totalTokens: 15,
        },
      });
    });
  });

  describe("generate with messages", () => {
    it("should pass messages array directly to generateText", async () => {
      const messages = [
        { role: "system" as const, content: "You are helpful" },
        { role: "user" as const, content: "Hello" },
      ];

      mockGenerateText.mockResolvedValue({
        text: "Hi there!",
        usage: { promptTokens: 20, completionTokens: 10, totalTokens: 30 },
      } as unknown as Awaited<ReturnType<typeof generateText>>);

      await provider.generate(messages);

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: messages,
        }),
      );
    });

    it("should handle system, user, and assistant roles", async () => {
      const messages = [
        { role: "system" as const, content: "System prompt" },
        { role: "user" as const, content: "User message" },
        { role: "assistant" as const, content: "Assistant message" },
        { role: "user" as const, content: "Another user message" },
      ];

      mockGenerateText.mockResolvedValue({
        text: "Response",
        usage: { promptTokens: 50, completionTokens: 10, totalTokens: 60 },
      } as unknown as Awaited<ReturnType<typeof generateText>>);

      const result = await provider.generate(messages);

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: messages,
        }),
      );
      expect(result.content).toBe("Response");
    });

    it("should aggregate token usage correctly", async () => {
      mockGenerateText.mockResolvedValue({
        text: "Response text",
        usage: { promptTokens: 25, completionTokens: 15, totalTokens: 40 },
      } as unknown as Awaited<ReturnType<typeof generateText>>);

      const result = await provider.generate([
        { role: "user", content: "Test message" },
      ]);

      expect(result.usage).toEqual({
        promptTokens: 25,
        completionTokens: 15,
        totalTokens: 40,
      });
    });
  });

  describe("error handling", () => {
    it("should throw error for invalid API key", async () => {
      const error = new Error("Invalid API key");
      mockGenerateText.mockRejectedValue(error);

      await expect(provider.generate("test")).rejects.toThrow(error);
    });

    it("should throw error for model not found", async () => {
      const error = new Error("Model not found");
      mockGenerateText.mockRejectedValue(error);

      await expect(provider.generate("test")).rejects.toThrow(error);
    });

    it("should throw error for rate limit", async () => {
      const error = new Error("Rate limit exceeded");
      mockGenerateText.mockRejectedValue(error);

      await expect(provider.generate("test")).rejects.toThrow(error);
    });

    it("should throw error for network errors", async () => {
      const error = new Error("Network error");
      mockGenerateText.mockRejectedValue(error);

      await expect(provider.generate("test")).rejects.toThrow(error);
    });
  });

  describe("availability", () => {
    it("should return false if API key not configured", () => {
      const noKeyConfigService = {
        get: vi.fn().mockReturnValue(undefined),
      } as unknown as ConfigService;

      // Create provider that doesn't throw in constructor
      provider = new VercelOpenAIProvider(noKeyConfigService);

      expect(provider.isAvailable()).toBe(false);
    });

    it("should return true if API key exists", () => {
      expect(provider.isAvailable()).toBe(true);
    });

    it('should return "openai" for getName', () => {
      expect(provider.getName()).toBe("openai");
    });
  });
});
