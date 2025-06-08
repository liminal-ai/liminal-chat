import { Injectable, HttpException, HttpStatus } from "@nestjs/common";

export const ERROR_CODES = {
  INVALID_API_KEY: "INVALID_API_KEY",
  MODEL_NOT_FOUND: "MODEL_NOT_FOUND",
  PROVIDER_RATE_LIMITED: "PROVIDER_RATE_LIMITED",
  PROVIDER_QUOTA_EXCEEDED: "PROVIDER_QUOTA_EXCEEDED",
  PROVIDER_API_ERROR: "PROVIDER_API_ERROR",
  PROVIDER_NOT_CONFIGURED: "PROVIDER_NOT_CONFIGURED",
} as const;

@Injectable()
export class VercelErrorMapper {
  mapError(error: unknown, provider: string): HttpException {
    const errorString = error?.toString() || "";
    const errorMessage = error instanceof Error ? error.message : errorString;

    const lowerMessage = errorMessage.toLowerCase();

    // Provider not configured
    if (
      lowerMessage.includes("not configured") ||
      lowerMessage.includes("please set")
    ) {
      return new HttpException(
        {
          error: {
            code: ERROR_CODES.PROVIDER_NOT_CONFIGURED,
            message: `Provider '${provider}' requires configuration. Set ${provider.toUpperCase()}_API_KEY environment variable.`,
            details: { provider },
          },
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    // Invalid API key
    if (
      lowerMessage.includes("invalid api key") ||
      lowerMessage.includes("incorrect api key") ||
      lowerMessage.includes("authentication failed") ||
      errorMessage.includes("401") ||
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("invalid_api_key")
    ) {
      return new HttpException(
        {
          error: {
            code: ERROR_CODES.INVALID_API_KEY,
            message: `Invalid API key for provider '${provider}': ${this.sanitizeError(errorMessage)}`,
            provider,
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Model not found
    if (
      lowerMessage.includes("model not found") ||
      lowerMessage.includes("does not exist") ||
      lowerMessage.includes("invalid model") ||
      errorMessage.includes("model_not_found")
    ) {
      return new HttpException(
        {
          error: {
            code: ERROR_CODES.MODEL_NOT_FOUND,
            message: `Model not found for provider '${provider}'`,
            provider,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Rate limiting
    if (
      lowerMessage.includes("rate limit") ||
      lowerMessage.includes("too many requests") ||
      errorMessage.includes("429") ||
      errorMessage.includes("rate_limit")
    ) {
      return new HttpException(
        {
          error: {
            code: ERROR_CODES.PROVIDER_RATE_LIMITED,
            message: `Rate limit exceeded for provider '${provider}'`,
            provider,
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Quota exceeded
    if (
      lowerMessage.includes("quota") ||
      errorMessage.includes("insufficient_quota")
    ) {
      return new HttpException(
        {
          error: {
            code: ERROR_CODES.PROVIDER_QUOTA_EXCEEDED,
            message: `Quota exceeded for provider '${provider}'`,
            provider,
          },
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    // Default API error
    return new HttpException(
      {
        error: {
          code: ERROR_CODES.PROVIDER_API_ERROR,
          message: `API error from provider '${provider}': ${this.sanitizeError(errorMessage)}`,
          provider,
        },
      },
      HttpStatus.BAD_GATEWAY,
    );
  }

  private sanitizeError(message: string): string {
    // Remove sensitive information like API keys
    return message.replace(/sk-[a-zA-Z0-9]+/g, "sk-***");
  }
}
