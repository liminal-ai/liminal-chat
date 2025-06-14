import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConfigService } from "@nestjs/config";
import { EchoProvider } from "./echo.provider";

describe("EchoProvider", () => {
  let provider: EchoProvider;
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: vi.fn((key: string) => {
        if (key === "ECHO_PROVIDER_TIMEOUT") return 12345; // Test value
        if (key === "ECHO_PROVIDER_WORD_DELAY") return 100; // Test value
        return undefined;
      }),
    } as unknown as ConfigService;

    provider = new EchoProvider(configService);
  });

  describe("with prompt string", () => {
    it('should return "Echo: {prompt}"', async () => {
      const prompt = "Hello, world!";
      const result = await provider.generate(prompt);

      expect(result.content).toBe(`Echo: ${prompt}`);
    });

    it("should calculate tokens as length/4", async () => {
      const prompt = "Test prompt here!";
      const result = await provider.generate(prompt);

      const expectedTokens = Math.ceil(prompt.length / 4);
      expect(result.usage.promptTokens).toBe(expectedTokens);
      expect(result.usage.completionTokens).toBe(
        Math.ceil(result.content.length / 4),
      );
    });

    it('should return model as "echo-1.0"', async () => {
      const result = await provider.generate("test");

      expect(result.model).toBe("echo-1.0");
    });
  });

  describe("with messages array", () => {
    it('should concatenate user messages with "Echo: " prefix', async () => {
      const messages = [
        { role: "user" as const, content: "First message" },
        { role: "user" as const, content: "Second message" },
      ];

      const result = await provider.generate(messages);
      expect(result.content).toBe("Echo: First message Second message");
    });

    it("should ignore system messages in output", async () => {
      const messages = [
        { role: "system" as const, content: "System prompt" },
        { role: "user" as const, content: "User message" },
      ];

      const result = await provider.generate(messages);
      expect(result.content).toBe("Echo: User message");
    });

    it("should include assistant messages in output", async () => {
      const messages = [
        { role: "user" as const, content: "Hello" },
        { role: "assistant" as const, content: "Hi there" },
        { role: "user" as const, content: "How are you?" },
      ];

      const result = await provider.generate(messages);
      expect(result.content).toBe("Echo: Hello Hi there How are you?");
    });

    it("should calculate tokens for all messages", async () => {
      const messages = [
        { role: "system" as const, content: "System" },
        { role: "user" as const, content: "User" },
        { role: "assistant" as const, content: "Assistant" },
      ];

      const result = await provider.generate(messages);

      // Echo provider only counts non-system messages for tokens
      const nonSystemMessages = messages.filter((msg) => msg.role !== "system");
      const totalInputLength = nonSystemMessages
        .map((m) => m.content)
        .join(" ").length;
      expect(result.usage.promptTokens).toBe(Math.ceil(totalInputLength / 4));
    });
  });

  describe("availability", () => {
    it("should always return true for isAvailable", () => {
      expect(provider.isAvailable()).toBe(true);
    });

    it('should return "echo" for getName', () => {
      expect(provider.getName()).toBe("echo");
    });
  });
});
