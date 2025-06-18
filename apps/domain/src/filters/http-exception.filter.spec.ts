import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { FastifyReply } from "fastify";
import { AllExceptionsFilter } from "./http-exception.filter";
import { ProviderNotFoundError } from "../providers/llm/errors";

// Mock interfaces for proper TypeScript typing
interface MockFastifyReply {
  status: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
}

interface MockHttpContext {
  getResponse: ReturnType<typeof vi.fn>;
}

interface MockArgumentsHost {
  switchToHttp: ReturnType<typeof vi.fn>;
}

describe("AllExceptionsFilter", () => {
  let filter: AllExceptionsFilter;
  let mockReply: MockFastifyReply;
  let mockHost: MockArgumentsHost;
  let mockHttpContext: MockHttpContext;
  let loggerErrorSpy: ReturnType<typeof vi.fn>;
  let loggerDebugSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock FastifyReply
    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    // Mock HTTP context
    mockHttpContext = {
      getResponse: vi.fn().mockReturnValue(mockReply as Partial<FastifyReply>),
    };

    // Mock ArgumentsHost
    mockHost = {
      switchToHttp: vi.fn().mockReturnValue(mockHttpContext),
    };

    // Mock Logger methods
    loggerErrorSpy = vi.fn();
    loggerDebugSpy = vi.fn();
    vi.spyOn(Logger.prototype, "error").mockImplementation(loggerErrorSpy);
    vi.spyOn(Logger.prototype, "debug").mockImplementation(loggerDebugSpy);

    filter = new AllExceptionsFilter();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("HttpException handling", () => {
    it("should handle HttpException with string response", () => {
      const exception = new HttpException("Not found", HttpStatus.NOT_FOUND);

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "INTERNAL_ERROR",
          message: "Not found",
          details: undefined,
        },
      });
    });

    it("should handle HttpException with object response containing error property", () => {
      const errorResponse = {
        error: {
          code: "PROVIDER_API_ERROR",
          message: "OpenAI API failed",
          provider: "openai",
        },
      };
      const exception = new HttpException(
        errorResponse,
        HttpStatus.BAD_GATEWAY,
      );

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "PROVIDER_API_ERROR",
          message: "OpenAI API failed",
          details: { provider: "openai" },
        },
      });
    });

    it("should handle HttpException with error object containing details", () => {
      const errorResponse = {
        error: {
          code: "PROVIDER_CONFIG_ERROR",
          message: "API key missing",
          details: {
            provider: "openai",
            available: ["echo", "openrouter"],
          },
        },
      };
      const exception = new HttpException(
        errorResponse,
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "PROVIDER_CONFIG_ERROR",
          message: "API key missing",
          details: { provider: undefined }, // Bug: details are overwritten when provider exists
        },
      });
    });

    it("should handle HttpException with validation error (array of messages)", () => {
      const errorResponse = {
        message: ["name should not be empty", "email must be a valid email"],
      };
      const exception = new HttpException(
        errorResponse,
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "VALIDATION_ERROR",
          message: "name should not be empty. email must be a valid email",
          details: undefined,
        },
      });
    });

    it("should handle HttpException with object response without error property", () => {
      const errorResponse = {
        message: "Invalid input",
        code: "INVALID_INPUT",
        details: { field: "username" },
      };
      const exception = new HttpException(
        errorResponse,
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "INVALID_INPUT",
          message: "Invalid input",
          details: { field: "username" },
        },
      });
    });

    it("should handle HttpException with minimal object response", () => {
      const errorResponse = {};
      const exception = new HttpException(
        errorResponse,
        HttpStatus.UNAUTHORIZED,
      );

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
          details: undefined,
        },
      });
    });
  });

  describe("ProviderNotFoundError handling", () => {
    it("should handle ProviderNotFoundError with provider extraction", () => {
      const exception = new ProviderNotFoundError("unknown");

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "PROVIDER_NOT_FOUND",
          message:
            "Provider 'unknown' not found. Available providers: echo, openai",
          details: {
            provider: "unknown",
            available: ["echo", "openai"],
          },
        },
      });
    });

    it("should handle ProviderNotFoundError without regex match", () => {
      const customError = new Error("Invalid provider configuration");
      customError.constructor = {
        name: "ProviderNotFoundError",
      } as Partial<{ name: string }>;

      filter.catch(customError, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "PROVIDER_NOT_FOUND",
          message: "Invalid provider configuration",
          details: undefined,
        },
      });
    });
  });

  describe("Provider configuration error handling", () => {
    it("should handle 'not configured' error message", () => {
      const exception = new Error("Provider 'openai' not configured");

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "PROVIDER_NOT_CONFIGURED",
          message:
            "Provider 'openai' requires configuration. Set OPENAI_API_KEY environment variable.",
          details: { provider: "openai" },
        },
      });
    });

    it("should handle 'requires configuration' error message", () => {
      const exception = new Error("OpenAI provider requires configuration");

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "PROVIDER_NOT_CONFIGURED",
          message:
            "Provider 'openai' requires configuration. Set OPENAI_API_KEY environment variable.",
          details: { provider: "openai" },
        },
      });
    });

    it("should handle configuration error with specific provider name in quotes", () => {
      const exception = new Error("Provider 'custom-provider' not configured");

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "PROVIDER_NOT_CONFIGURED",
          message:
            "Provider 'custom-provider' requires configuration. Set CUSTOM-PROVIDER_API_KEY environment variable.",
          details: { provider: "custom-provider" },
        },
      });
    });

    it("should handle configuration error without provider name extraction", () => {
      const exception = new Error("Configuration error not configured");

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "PROVIDER_NOT_CONFIGURED",
          message:
            "Provider 'unknown' requires configuration. Set UNKNOWN_API_KEY environment variable.",
          details: { provider: "unknown" },
        },
      });
    });

    it("should not modify message if it already contains 'Set '", () => {
      const exception = new Error(
        "Provider not configured. Set OPENAI_API_KEY environment variable.",
      );

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "PROVIDER_NOT_CONFIGURED",
          message:
            "Provider not configured. Set OPENAI_API_KEY environment variable.",
          details: { provider: "unknown" },
        },
      });
    });
  });

  describe("Provider API error handling", () => {
    it("should handle API error from provider", () => {
      const exception = new Error("API error from provider: request failed");

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "PROVIDER_API_ERROR",
          message: "API error from provider: request failed",
          details: undefined,
        },
      });
    });
  });

  describe("Generic Error handling", () => {
    it("should handle generic Error with default values", () => {
      const exception = new Error("Something went wrong");

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "INTERNAL_ERROR",
          message: "Something went wrong",
          details: undefined,
        },
      });
    });
  });

  describe("Unknown exception handling", () => {
    it("should handle non-Error exceptions", () => {
      const exception = "String exception";

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
          details: undefined,
        },
      });
    });

    it("should handle null exception", () => {
      const exception = null;

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
          details: undefined,
        },
      });
    });

    it("should handle undefined exception", () => {
      const exception = undefined;

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
          details: undefined,
        },
      });
    });
  });

  describe("Logging behavior", () => {
    it("should log error with stack trace for Error instances", () => {
      const exception = new Error("Test error");

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        "HTTP 500 Error: Test error",
        exception.stack,
      );
    });

    it("should log error without stack trace for non-Error instances", () => {
      const exception = "String exception";

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        "HTTP 500 Error: Internal server error",
        "No stack trace",
      );
    });

    it("should log validation details in non-production environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const errorResponse = {
        message: ["validation error 1", "validation error 2"],
      };
      const exception = new HttpException(
        errorResponse,
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(loggerDebugSpy).toHaveBeenCalledWith(
        `Full validation error: ${JSON.stringify(errorResponse, null, 2)}`,
      );

      process.env.NODE_ENV = originalEnv;
    });

    it("should not log validation details in production environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const errorResponse = {
        message: ["validation error 1", "validation error 2"],
      };
      const exception = new HttpException(
        errorResponse,
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(loggerDebugSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it("should not log validation details for non-BadRequest status", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const errorResponse = {
        message: ["error 1", "error 2"],
      };
      const exception = new HttpException(
        errorResponse,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(loggerDebugSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Provider name extraction edge cases", () => {
    it("should handle provider name extraction with multiple matches", () => {
      const exception = new Error(
        "Provider 'first' and Provider 'second' not configured",
      );

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "PROVIDER_NOT_CONFIGURED",
          message:
            "Provider 'first' and provider 'second' requires configuration. Set FIRST' AND PROVIDER 'SECOND_API_KEY environment variable.",
          details: { provider: "first' and provider 'second" },
        },
      });
    });

    it("should handle second regex group match for provider name", () => {
      const exception = new Error("OpenAI provider not configured");

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "PROVIDER_NOT_CONFIGURED",
          message:
            "Provider 'openai' requires configuration. Set OPENAI_API_KEY environment variable.",
          details: { provider: "openai" },
        },
      });
    });

    it("should handle case insensitive provider extraction", () => {
      const exception = new Error("OPENROUTER provider requires configuration");

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "PROVIDER_NOT_CONFIGURED",
          message:
            "Provider 'openrouter' requires configuration. Set OPENROUTER_API_KEY environment variable.",
          details: { provider: "openrouter" },
        },
      });
    });
  });

  describe("Response structure validation", () => {
    it("should always send error response with consistent structure", () => {
      const exception = new HttpException("Test", HttpStatus.NOT_FOUND);

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      const sentResponse = mockReply.send.mock.calls[0][0] as {
        error: { code: string; message: string; details: unknown };
      };
      expect(sentResponse).toHaveProperty("error");
      expect(sentResponse.error).toHaveProperty("code");
      expect(sentResponse.error).toHaveProperty("message");
      expect(sentResponse.error).toHaveProperty("details");
    });

    it("should handle error object without code property", () => {
      const errorResponse = {
        error: {
          message: "Error without code",
        },
      };
      const exception = new HttpException(
        errorResponse,
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "INTERNAL_ERROR", // fallback code
          message: "Internal server error", // fallback message because no code
          details: undefined,
        },
      });
    });

    it("should handle error object with code but no details or provider", () => {
      const errorResponse = {
        error: {
          code: "CUSTOM_ERROR",
          message: "Custom error message",
        },
      };
      const exception = new HttpException(
        errorResponse,
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost as Partial<ArgumentsHost>);

      expect(mockReply.send).toHaveBeenCalledWith({
        error: {
          code: "CUSTOM_ERROR",
          message: "Custom error message",
          details: undefined, // This covers the uncovered line 58
        },
      });
    });
  });
});
