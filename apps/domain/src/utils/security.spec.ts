import { scrubSensitiveData, scrubErrorForLogging } from "./security";

describe("Security Utils", () => {
  describe("scrubSensitiveData", () => {
    it("should scrub OpenAI API keys", () => {
      const input =
        "Error: Invalid API key sk-1234567890abcdef1234567890abcdef12345678";
      const result = scrubSensitiveData(input);
      expect(result).toBe("Error: Invalid API key [REDACTED]");
    });

    it("should scrub Bearer tokens", () => {
      const input =
        "Authorization: Bearer abc123def456ghi789jkl012mno345pqr678stu";
      const result = scrubSensitiveData(input);
      expect(result).toBe("Authorization: [REDACTED]");
    });

    it("should scrub JSON API keys", () => {
      const input =
        '{"api_key": "sk-1234567890abcdef1234567890abcdef", "model": "gpt-4"}';
      const result = scrubSensitiveData(input);
      expect(result).toContain("[REDACTED]");
      expect(result).toContain('"model": "gpt-4"');
    });

    it("should scrub generic long tokens", () => {
      const input = "Token: abc123def456ghi789jkl012mno345pqr678stu901vwx234";
      const result = scrubSensitiveData(input);
      expect(result).toBe("Token: [REDACTED]");
    });

    it("should not scrub short strings", () => {
      const input = "Error: Invalid model name gpt-4";
      const result = scrubSensitiveData(input);
      expect(result).toBe("Error: Invalid model name gpt-4");
    });

    it("should handle empty strings", () => {
      const result = scrubSensitiveData("");
      expect(result).toBe("");
    });

    it("should scrub multiple sensitive values", () => {
      const input =
        "API Key: sk-1234567890abcdef1234567890abcdef and Token: abc123def456ghi789jkl012mno345pqr678stu";
      const result = scrubSensitiveData(input);
      expect(result).toBe("API Key: [REDACTED] and Token: [REDACTED]");
    });

    it("should scrub OpenAI project keys", () => {
      const input = "Using project key pk-abcd1234567890efghijklmnopqrstuvwxyz";
      const result = scrubSensitiveData(input);
      expect(result).toBe("Using project key [REDACTED]");
    });

    it("should scrub xAI/Anthropic keys", () => {
      const input = "Error with xai-123456789012345678901234567890abcdef";
      const result = scrubSensitiveData(input);
      expect(result).toBe("Error with [REDACTED]");
    });

    it("should scrub Claude API keys", () => {
      const input = "Claude key: claude-api-123456789012345678901234567890";
      const result = scrubSensitiveData(input);
      expect(result).toBe("Claude key: [REDACTED]");
    });

    it("should scrub GitHub tokens", () => {
      const input = "GitHub token ghp_1234567890123456789012345678901234567";
      const result = scrubSensitiveData(input);
      expect(result).toBe("GitHub token [REDACTED]");
    });

    it("should scrub AWS keys", () => {
      const input =
        "AWS key AKIAIOSFODNN7EXAMPLE and secret wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY123";
      const result = scrubSensitiveData(input);
      expect(result).toBe("AWS key [REDACTED] and secret [REDACTED]");
    });

    it("should scrub JSON config patterns", () => {
      const input =
        '{"api_key": "secret123456789012345678901234567890", "token": "token987654321098765432109876543210"}';
      const result = scrubSensitiveData(input);
      expect(result).toContain("[REDACTED]");
      expect(result).not.toContain("secret123456789012345678901234567890");
      expect(result).not.toContain("token987654321098765432109876543210");
    });

    it("should scrub authorization headers", () => {
      const input =
        "authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
      const result = scrubSensitiveData(input);
      expect(result).toBe("authorization: [REDACTED]");
    });
  });

  describe("scrubErrorForLogging", () => {
    it("should scrub Error objects", () => {
      const error = new Error(
        "API key sk-1234567890abcdef1234567890abcdef is invalid",
      );
      const result = scrubErrorForLogging(error);

      expect(result.message).toBe("API key [REDACTED] is invalid");
      expect(result.name).toBe("Error");
      expect(result.originalType).toBe("Error");
    });

    it("should scrub error stack traces", () => {
      const error = new Error("Test error");
      error.stack =
        "Error: Test with sk-1234567890abcdef1234567890abcdef\n    at test.js:1:1";

      const result = scrubErrorForLogging(error);
      expect(result.stack).toContain("[REDACTED]");
      expect(result.stack).not.toContain("sk-1234567890abcdef1234567890abcdef");
    });

    it("should handle string errors", () => {
      const error = "String error with sk-1234567890abcdef1234567890abcdef";
      const result = scrubErrorForLogging(error);

      expect(result.message).toBe("String error with [REDACTED]");
      expect(result.originalType).toBe("string");
    });

    it("should handle object errors", () => {
      const error = {
        message: "Object error with sk-1234567890abcdef1234567890abcdef",
        code: 401,
        details: "More info",
      };

      const result = scrubErrorForLogging(error);
      expect(result.message).toBe("Object error with [REDACTED]");
      expect(result.originalType).toBe("object");
    });

    it("should handle unknown error types", () => {
      const error = 42;
      const result = scrubErrorForLogging(error);

      expect(result.message).toBe("Unknown error type");
      expect(result.originalType).toBe("number");
    });

    it("should handle null/undefined errors", () => {
      const result1 = scrubErrorForLogging(null);
      const result2 = scrubErrorForLogging(undefined);

      expect(result1.originalType).toBe("object");
      expect(result2.originalType).toBe("undefined");
    });
  });
});
