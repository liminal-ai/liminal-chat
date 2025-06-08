import { VercelErrorMapper } from "./vercel-error.mapper";

describe("VercelErrorMapper", () => {
  let mapper: VercelErrorMapper;

  beforeEach(() => {
    mapper = new VercelErrorMapper();
  });

  it("should map API key errors to INVALID_API_KEY", () => {
    const errors = [
      new Error("Invalid API key"),
      new Error("Incorrect API key provided"),
      new Error("Authentication failed"),
    ];

    errors.forEach((error) => {
      const mapped = mapper.mapError(error, "openai");
      const response = mapped.getResponse() as {
        error: { code: string; provider: string; message?: string };
      };
      expect(response.error.code).toBe("INVALID_API_KEY");
      expect(response.error.provider).toBe("openai");
    });
  });

  it("should map model errors to MODEL_NOT_FOUND", () => {
    const errors = [
      new Error("Model not found"),
      new Error("The model `gpt-5` does not exist"),
      new Error("Invalid model"),
    ];

    errors.forEach((error) => {
      const mapped = mapper.mapError(error, "openai");
      const response = mapped.getResponse() as {
        error: { code: string; provider: string; message?: string };
      };
      expect(response.error.code).toBe("MODEL_NOT_FOUND");
      expect(response.error.provider).toBe("openai");
    });
  });

  it("should map rate limit to PROVIDER_RATE_LIMITED", () => {
    const errors = [
      new Error("Rate limit exceeded"),
      new Error("Too many requests"),
      new Error("429: Rate limited"),
    ];

    errors.forEach((error) => {
      const mapped = mapper.mapError(error, "openai");
      const response = mapped.getResponse() as {
        error: { code: string; provider: string; message?: string };
      };
      expect(response.error.code).toBe("PROVIDER_RATE_LIMITED");
      expect(response.error.provider).toBe("openai");
    });
  });

  it("should map quota errors to PROVIDER_QUOTA_EXCEEDED", () => {
    const errors = [
      new Error("Quota exceeded"),
      new Error("Insufficient quota"),
      new Error("You have exceeded your quota"),
    ];

    errors.forEach((error) => {
      const mapped = mapper.mapError(error, "openai");
      const response = mapped.getResponse() as {
        error: { code: string; provider: string; message?: string };
      };
      expect(response.error.code).toBe("PROVIDER_QUOTA_EXCEEDED");
      expect(response.error.provider).toBe("openai");
    });
  });

  it("should map unknown errors to PROVIDER_API_ERROR", () => {
    const errors = [
      new Error("Unknown error"),
      new Error("Something went wrong"),
      new Error("Network timeout"),
    ];

    errors.forEach((error) => {
      const mapped = mapper.mapError(error, "openai");
      const response = mapped.getResponse() as {
        error: { code: string; provider: string; message?: string };
      };
      expect(response.error.code).toBe("PROVIDER_API_ERROR");
      expect(response.error.provider).toBe("openai");
    });
  });

  it("should include provider name in error details", () => {
    const error = new Error("Some error");
    const mapped = mapper.mapError(error, "anthropic");
    const response = mapped.getResponse() as {
      error: { provider: string; message: string };
    };

    expect(response.error.provider).toBe("anthropic");
    expect(response.error.message).toContain("anthropic");
  });

  it("should sanitize sensitive information", () => {
    const error = new Error("Invalid API key: sk-proj-abcd1234");
    const mapped = mapper.mapError(error, "openai");
    const response = mapped.getResponse() as {
      error: { message: string };
    };

    expect(response.error.message).not.toContain("sk-proj-abcd1234");
    expect(response.error.message).toContain("***");
  });
});
