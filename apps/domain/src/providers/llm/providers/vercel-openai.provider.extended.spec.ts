import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  type MockedFunction,
} from "vitest";
// ConfigService import removed - mocked inline
import { ConfigService } from "@nestjs/config";
import { VercelOpenAIProvider } from "./vercel-openai.provider";
import { generateText } from "ai";

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

describe("VercelOpenAIProvider - Extended Tests", () => {
  let provider: VercelOpenAIProvider;
  let mockGenerateText: MockedFunction<typeof generateText>;

  beforeEach(() => {
    mockGenerateText = generateText as MockedFunction<typeof generateText>;
    mockGenerateText.mockClear();

    const configService = {
      get: vi.fn((key: string, defaultValue?: string) => {
        if (key === "OPENAI_API_KEY") return "test-api-key";
        if (key === "OPENAI_MODEL") return "o4-mini";
        return defaultValue;
      }),
    };

    provider = new VercelOpenAIProvider(
      configService as unknown as ConfigService,
    );
  });

  describe("Network and Error Handling", () => {
    it("should handle network timeout", async () => {
      const timeoutError = new Error("Network timeout");
      timeoutError.name = "TimeoutError";
      mockGenerateText.mockRejectedValue(timeoutError);

      await expect(provider.generate("test")).rejects.toThrow(timeoutError);
    });

    it("should handle malformed API responses", async () => {
      // Simulate malformed response by returning incomplete data
      mockGenerateText.mockResolvedValue({
        text: undefined as unknown as string,
        usage: null as unknown as {
          promptTokens: number;
          completionTokens: number;
          totalTokens: number;
        },
      } as unknown as Awaited<ReturnType<typeof generateText>>);

      const result = await provider.generate("test");

      expect(result.content).toBe("");
      expect(result.usage.promptTokens).toBe(0);
      expect(result.usage.completionTokens).toBe(0);
      expect(result.usage.totalTokens).toBe(0);
    });

    it("should handle token limit exceeded error", async () => {
      const tokenLimitError = new Error(
        "This model's maximum context length is 4096 tokens",
      );
      mockGenerateText.mockRejectedValue(tokenLimitError);

      await expect(provider.generate("test")).rejects.toThrow(tokenLimitError);
    });
  });

  describe("Concurrent Request Handling", () => {
    it("should handle multiple concurrent requests", async () => {
      const responses = [
        {
          text: "Response 1",
          usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        },
        {
          text: "Response 2",
          usage: { promptTokens: 20, completionTokens: 10, totalTokens: 30 },
        },
        {
          text: "Response 3",
          usage: { promptTokens: 30, completionTokens: 15, totalTokens: 45 },
        },
      ];

      let callCount = 0;
      mockGenerateText.mockImplementation(() => {
        const response = responses[callCount % responses.length];
        callCount++;
        return Promise.resolve(
          response as Awaited<ReturnType<typeof generateText>>,
        );
      });

      // Make concurrent requests
      const promises = [
        provider.generate("test 1"),
        provider.generate("test 2"),
        provider.generate("test 3"),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0].content).toBe("Response 1");
      expect(results[1].content).toBe("Response 2");
      expect(results[2].content).toBe("Response 3");
      expect(mockGenerateText).toHaveBeenCalledTimes(3);
    });

    it("should handle mixed success and failure in concurrent requests", async () => {
      let callCount = 0;
      mockGenerateText.mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          throw new Error("API Error on request 2");
        }
        return Promise.resolve({
          text: `Response ${callCount}`,
          usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        } as Awaited<ReturnType<typeof generateText>>);
      });

      const promises = [
        provider.generate("test 1"),
        provider.generate("test 2").catch((e: Error) => ({ error: e.message })),
        provider.generate("test 3"),
      ];

      const results = await Promise.all(promises);

      expect(results[0]).toHaveProperty("content", "Response 1");
      expect(results[1]).toHaveProperty("error", "API Error on request 2");
      expect(results[2]).toHaveProperty("content", "Response 3");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty prompt", async () => {
      mockGenerateText.mockResolvedValue({
        text: "",
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      } as unknown as Awaited<ReturnType<typeof generateText>>);

      const result = await provider.generate("");

      expect(result.content).toBe("");
      expect(result.usage.totalTokens).toBe(0);
    });

    it("should handle very long messages array", async () => {
      const longMessages = Array(100)
        .fill(null)
        .map((_, i) => ({
          role: "user" as const,
          content: `Message ${i}`,
        }));

      mockGenerateText.mockResolvedValue({
        text: "Long conversation response",
        usage: { promptTokens: 1000, completionTokens: 50, totalTokens: 1050 },
      } as unknown as Awaited<ReturnType<typeof generateText>>);

      const result = await provider.generate(longMessages);

      expect(result.content).toBe("Long conversation response");
      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: longMessages,
        }),
      );
    });

    it("should handle special characters in prompts", async () => {
      const specialPrompt =
        "Test with 特殊文字 and émojis 🚀 and \n\t special chars";

      mockGenerateText.mockResolvedValue({
        text: "Response with special chars",
        usage: { promptTokens: 20, completionTokens: 10, totalTokens: 30 },
      } as unknown as Awaited<ReturnType<typeof generateText>>);

      const result = await provider.generate(specialPrompt);

      expect(result).toBeDefined();
      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: "user", content: specialPrompt }],
        }),
      );
    });
  });
});
