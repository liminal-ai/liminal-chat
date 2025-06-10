import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { FastifyReply } from "fastify";

interface ErrorDetails {
  provider?: string;
  available?: string[];
  [key: string]: unknown;
}

interface ErrorResponse {
  error?: {
    code?: string;
    message?: string;
    details?: ErrorDetails;
    provider?: string;
  };
  message?: string;
  code?: string;
  details?: ErrorDetails;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_ERROR";
    let message = "Internal server error";
    let details: ErrorDetails | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === "object") {
        // Check if it has the error property (from vercel-error.mapper)
        const responseObj = exceptionResponse as ErrorResponse;
        const errorObj = responseObj.error;
        if (errorObj) {
          message = errorObj.message || message;
          code = errorObj.code || code;
          details =
            errorObj.details || errorObj.provider
              ? { provider: errorObj.provider }
              : details;
        } else {
          message = responseObj.message || message;
          code = responseObj.code || code;
          details = responseObj.details;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;

      // Handle specific provider errors
      if (exception.constructor.name === "ProviderNotFoundError") {
        status = HttpStatus.BAD_REQUEST;
        code = "PROVIDER_NOT_FOUND";
        // Extract provider name from message
        const match = message.match(/Provider '(.+)' not found/);
        if (match) {
          details = {
            provider: match[1],
            available: ["echo", "openai"],
          };
          message = `Provider '${match[1]}' not found. Available providers: echo, openai`;
        }
      } else if (
        message.includes("not configured") ||
        message.includes("requires configuration")
      ) {
        status = HttpStatus.BAD_GATEWAY;
        code = "PROVIDER_NOT_CONFIGURED";
        // Extract provider name from message
        const match = message.match(/Provider '(.+)'|(\w+) provider/i);
        const providerName = match
          ? (match[1] || match[2] || "unknown").toLowerCase()
          : "unknown";
        details = { provider: providerName };
        if (!message.includes("Set ")) {
          message = `Provider '${providerName}' requires configuration. Set ${providerName.toUpperCase()}_API_KEY environment variable.`;
        }
      } else if (message.includes("API error from provider")) {
        status = HttpStatus.BAD_GATEWAY;
        code = "PROVIDER_API_ERROR";
      }
    }

    this.logger.error(
      `HTTP ${status} Error: ${message}`,
      exception instanceof Error ? exception.stack : "No stack trace",
    );

    // For debugging: log the full exception for validation errors
    if (
      status === HttpStatus.BAD_REQUEST &&
      exception instanceof HttpException
    ) {
      this.logger.error(
        "Full validation error:",
        JSON.stringify(exception.getResponse(), null, 2),
      );
    }

    response.status(status).send({
      error: {
        code,
        message,
        details,
      },
    });
  }
}
