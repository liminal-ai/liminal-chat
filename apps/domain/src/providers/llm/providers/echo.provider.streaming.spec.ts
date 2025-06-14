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
        .map((c) => c.data.delta);
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
        .map((c) => c.data.delta)
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
        .map((c) => c.data.delta);
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
          .map((c) => c.data.delta)
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
        .map((c) => c.data.delta)
        .join("");
      expect(fullResponse).toContain("特殊文字");
      expect(fullResponse).toContain("émojis");
      expect(fullResponse).toContain("🚀");
    });

    it("should handle very short client timeouts gracefully", async () => {
      // This test demonstrates the issue with 50ms timeouts on multi-word responses
      const prompt = "Hello world test"; // 4 words = ~200ms total with 50ms delay per word

      // Test with a 50ms timeout via originalRequestParams
      const chunks: ProviderStreamEvent[] = [];
      for await (const chunk of provider.generateStream(prompt, {
        timeout: 50,
      })) {
        chunks.push(chunk);
      }

      // Should get at least one content chunk before timeout error
      const contentChunks = chunks.filter((c) => c.type === "content");
      const errorChunks = chunks.filter((c) => c.type === "error");

      expect(contentChunks.length).toBeGreaterThan(0); // Should get some content
      expect(errorChunks.length).toBe(1); // Should get timeout error
      expect(errorChunks[0].data.message).toBe("Echo provider timeout");
      expect(errorChunks[0].data.code).toBe("CONNECTION_TIMEOUT");
      expect(errorChunks[0].data.retryable).toBe(true);
    });

    it("should handle AbortSignal cancellation gracefully", async () => {
      const prompt = "Hello world test";
      const controller = new AbortController();

      // Cancel after 75ms (should get 1-2 words before cancellation)
      setTimeout(() => controller.abort(), 75);

      const chunks: ProviderStreamEvent[] = [];
      for await (const chunk of provider.generateStream(prompt, {
        signal: controller.signal,
      })) {
        chunks.push(chunk);
      }

      // Should get some content before cancellation
      const contentChunks = chunks.filter((c) => c.type === "content");
      const errorChunks = chunks.filter((c) => c.type === "error");

      expect(contentChunks.length).toBeGreaterThan(0); // Should get some content
      expect(errorChunks.length).toBe(1); // Should get cancellation error
      expect(errorChunks[0].data.message).toBe("Request cancelled by client");
      expect(errorChunks[0].data.retryable).toBe(false);
    });

    it("should allow configurable word delay", async () => {
      const prompt = "Test word"; // 2 words
      const startTime = Date.now();

      const chunks: ProviderStreamEvent[] = [];
      // Use 10ms delay instead of default 50ms
      for await (const chunk of provider.generateStream(prompt, {
        wordDelay: 10,
      })) {
        chunks.push(chunk);
      }

      const duration = Date.now() - startTime;
      // Should be faster than default 50ms * 2 words = 100ms
      expect(duration).toBeLessThan(80); // Account for test overhead

      const contentChunks = chunks.filter((c) => c.type === "content");
      expect(contentChunks).toHaveLength(3); // "Echo:", "Test", "word"
    });
  });
});
