import { describe, it, expect, beforeEach } from "vitest";
import { EchoProvider } from "./echo.provider";
import { ProviderStreamEvent } from "@liminal-chat/shared-types";

describe("EchoProvider - Streaming", () => {
  let provider: EchoProvider;

  beforeEach(() => {
    provider = new EchoProvider();
  });

  describe("generateStream", () => {
    it("should stream response word by word", async () => {
      const prompt = "Hello world";
      const chunks: ProviderStreamEvent[] = [];

      for await (const chunk of provider.generateStream(prompt)) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBeGreaterThan(1);
      const contentChunks = chunks
        .filter((c) => c.type === "content")
        .map((c) => c.data);
      expect(contentChunks.join("")).toBe("Echo: Hello world ");
    });

    it("should handle messages array in streaming", async () => {
      const messages = [
        { role: "system" as const, content: "System prompt" },
        { role: "user" as const, content: "User message" },
        { role: "assistant" as const, content: "Assistant reply" },
      ];

      const chunks: ProviderStreamEvent[] = [];

      for await (const chunk of provider.generateStream(messages)) {
        chunks.push(chunk);
      }

      const fullResponse = chunks
        .filter((c) => c.type === "content")
        .map((c) => c.data)
        .join("");
      expect(fullResponse).toBe("Echo: User message Assistant reply ");
      expect(fullResponse).not.toContain("System prompt");
    });

    it("should handle empty input", async () => {
      const chunks: ProviderStreamEvent[] = [];

      for await (const chunk of provider.generateStream("")) {
        chunks.push(chunk);
      }

      const contentChunks = chunks
        .filter((c) => c.type === "content")
        .map((c) => c.data);
      expect(contentChunks.join("")).toBe("Echo:  ");
    });

    it("should yield chunks with delays", async () => {
      const prompt = "Test streaming";
      const startTime = Date.now();
      const chunks: ProviderStreamEvent[] = [];

      for await (const chunk of provider.generateStream(prompt)) {
        chunks.push(chunk);
      }

      const duration = Date.now() - startTime;
      // Should take at least 100ms for 3 words (Echo: Test streaming)
      expect(duration).toBeGreaterThan(100);
    });

    it("should handle concurrent streaming requests", async () => {
      const prompts = ["First prompt", "Second prompt", "Third prompt"];

      const streamPromises = prompts.map(async (prompt) => {
        const chunks: ProviderStreamEvent[] = [];
        for await (const chunk of provider.generateStream(prompt)) {
          chunks.push(chunk);
        }
        return chunks
          .filter((c) => c.type === "content")
          .map((c) => c.data)
          .join("");
      });

      const results = await Promise.all(streamPromises);

      expect(results[0]).toBe("Echo: First prompt ");
      expect(results[1]).toBe("Echo: Second prompt ");
      expect(results[2]).toBe("Echo: Third prompt ");
    });

    it("should handle special characters in streaming", async () => {
      const prompt = "Test with 特殊文字 and émojis 🚀";
      const chunks: ProviderStreamEvent[] = [];

      for await (const chunk of provider.generateStream(prompt)) {
        chunks.push(chunk);
      }

      const fullResponse = chunks
        .filter((c) => c.type === "content")
        .map((c) => c.data)
        .join("");
      expect(fullResponse).toContain("特殊文字");
      expect(fullResponse).toContain("émojis");
      expect(fullResponse).toContain("🚀");
    });
  });
});
