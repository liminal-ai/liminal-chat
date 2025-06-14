import { Injectable, HttpException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { nanoid } from "nanoid";
import {
  ILLMProvider,
  LlmResponse,
  Message,
  StreamRequestParams,
} from "../llm-provider.interface";
import {
  ProviderStreamEvent,
  StreamErrorCode,
  StreamError,
} from "@liminal-chat/shared-types";
import {
  scrubSensitiveData,
  scrubErrorForLogging,
} from "../../../utils/security";
// Cryptographically secure ID generator for event IDs using nanoid
const generateId = (): string => {
  // Generate a compact, URL-safe unique ID (6 characters default)
  return nanoid(6);
};
import openRouterConfig from "../../../config/openrouter-models.json";

@Injectable()
export class OpenRouterProvider implements ILLMProvider {
  private readonly logger = new Logger(OpenRouterProvider.name);
  private readonly apiKey: string | undefined;
  private readonly model: string;
  private readonly appUrl: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>("OPENROUTER_API_KEY");
    this.model =
      this.configService.get<string>("OPENROUTER_MODEL") ||
      openRouterConfig.default;
    this.appUrl = this.configService.get<string>(
      "OPENROUTER_APP_URL",
      "http://localhost:3000",
    );
    this.baseUrl = this.configService.get<string>(
      "OPENROUTER_BASE_URL",
      "https://openrouter.ai/api/v1/chat/completions",
    );
    this.timeout = this.configService.get<number>("OPENROUTER_TIMEOUT", 30000);
  }

  async generate(input: string | Message[]): Promise<LlmResponse> {
    if (!this.apiKey) {
      throw new HttpException(
        {
          error: {
            code: "PROVIDER_NOT_CONFIGURED",
            message:
              "Provider 'openrouter' requires configuration. Set OPENROUTER_API_KEY environment variable.",
          },
        },
        502,
      );
    }

    // Convert string prompt to messages format
    const messages: Message[] =
      typeof input === "string" ? [{ role: "user", content: input }] : input;

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": this.appUrl,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = (await response
          .json()
          .catch(() => ({}) as Record<string, unknown>)) as {
          error?: { message?: string };
        };
        const rawErrorMessage =
          errorData.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        const errorMessage = scrubSensitiveData(rawErrorMessage);

        // Log the scrubbed error for debugging
        this.logger.error("OpenRouter API error", {
          status: response.status,
          message: errorMessage,
          model: this.model,
        });

        // Map specific HTTP status codes to appropriate errors
        if (response.status === 401) {
          throw new HttpException(
            {
              error: {
                code: "INVALID_API_KEY",
                message: "Invalid OpenRouter API key",
              },
            },
            401,
          );
        } else if (response.status === 429) {
          throw new HttpException(
            {
              error: {
                code: "PROVIDER_RATE_LIMITED",
                message: "OpenRouter rate limit exceeded",
              },
            },
            429,
          );
        } else if (response.status === 404) {
          throw new HttpException(
            {
              error: {
                code: "MODEL_NOT_FOUND",
                message: `Model '${this.model}' not found on OpenRouter`,
              },
            },
            404,
          );
        }

        throw new HttpException(
          {
            error: {
              code: "PROVIDER_API_ERROR",
              message: errorMessage,
            },
          },
          500,
        );
      }

      const data = (await response.json()) as {
        model?: string;
        choices?: Array<{ message?: { content?: string } }>;
        usage?: {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
        };
      };

      // Extract the assistant's response
      const assistantMessage = data.choices?.[0]?.message?.content;
      if (!assistantMessage) {
        throw new HttpException(
          {
            error: {
              code: "PROVIDER_API_ERROR",
              message: "No response content from OpenRouter",
            },
          },
          500,
        );
      }

      // Map OpenRouter response to our format
      return {
        content: assistantMessage,
        model: data.model || this.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      // Handle timeout specifically
      if (error instanceof Error && error.name === "AbortError") {
        throw new HttpException(
          {
            error: {
              code: "PROVIDER_API_ERROR",
              message: "OpenRouter request timeout",
            },
          },
          504,
        );
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new HttpException(
          {
            error: {
              code: "PROVIDER_API_ERROR",
              message: "Network error connecting to OpenRouter",
            },
          },
          503,
        );
      }

      // If it's already an HttpException, pass it through
      if (error instanceof HttpException) {
        throw error;
      }

      // Map any other errors
      const scrubbedError = scrubErrorForLogging(error);
      this.logger.error("OpenRouter unexpected error", scrubbedError);

      throw new HttpException(
        {
          error: {
            code: "PROVIDER_API_ERROR",
            message: `OpenRouter error: ${scrubbedError.message}`,
          },
        },
        500,
      );
    }
  }

  async *generateStream(
    input: string | Message[],
    originalRequestParams: StreamRequestParams = {},
    lastEventId?: string,
  ): AsyncIterable<ProviderStreamEvent> {
    // 1. Log received lastEventId for observability (if present)
    if (lastEventId) {
      this.logger.debug(
        `Received lastEventId: ${lastEventId} (not used for OpenRouter resumption)`,
      );
    }

    if (!this.apiKey) {
      yield {
        type: "error",
        data: {
          message:
            "Provider 'openrouter' requires configuration. Set OPENROUTER_API_KEY environment variable.",
          code: StreamErrorCode.AUTHENTICATION_FAILED,
          retryable: false,
        },
        eventId: `or-${Date.now()}-${generateId()}`,
      };
      return;
    }

    // Convert string prompt to messages format
    const messages: Message[] =
      typeof input === "string" ? [{ role: "user", content: input }] : input;

    // Initialize performance monitoring variables outside try block
    const streamId = `stream-${Date.now()}-${generateId()}`;
    const startTime = process.hrtime.bigint();
    let firstTokenTime: bigint | null = null;
    let lastChunkTime = startTime;
    let chunkCount = 0;
    const startMemory = process.memoryUsage().heapUsed;

    try {
      // 2. Initiate a NEW stream request to OpenRouter API with `stream: true`
      const response = await this.startStream(messages, {
        ...originalRequestParams,
        stream: true,
      });

      let lastContentEventId: string | undefined;
      for await (const chunk of this.parseSSEStream(response)) {
        const eventId = `or-${Date.now()}-${generateId()}`; // e.g., or-1733680800000-x7B9mK
        const chunkTime = process.hrtime.bigint();

        if (chunk.type === "data") {
          try {
            // Handle special [DONE] signal
            if (chunk.data === "[DONE]") {
              // Reuse the last content event's eventId for resumption continuity
              yield {
                type: "done",
                data: "[DONE]",
                eventId: lastContentEventId || eventId,
              };
              break;
            }

            // Parse JSON data
            const data = JSON.parse(chunk.data) as {
              choices?: Array<{ delta?: { content?: string } }>;
              usage?: {
                prompt_tokens: number;
                completion_tokens: number;
                total_tokens: number;
              };
              model?: string;
            };

            // Extract content delta
            const content = data.choices?.[0]?.delta?.content;
            if (content !== undefined && content !== "") {
              chunkCount++;

              // Record first token latency
              if (firstTokenTime === null) {
                firstTokenTime = chunkTime;
                const latency = Number(firstTokenTime - startTime) / 1000000; // Convert to ms
                if (process.env.NODE_ENV !== "production") {
                  this.logger.debug(
                    `First token latency: ${latency.toFixed(2)}ms [${streamId}]`,
                  );
                }
              } else {
                // Record inter-chunk latency (throttled logging)
                const interChunkLatency =
                  Number(chunkTime - lastChunkTime) / 1000000;
                if (
                  process.env.NODE_ENV !== "production" &&
                  chunkCount % 10 === 0
                ) {
                  this.logger.debug(
                    `Inter-chunk latency: ${interChunkLatency.toFixed(2)}ms [${streamId}] (chunk ${chunkCount})`,
                  );
                }
              }

              lastChunkTime = chunkTime;
              lastContentEventId = eventId; // Track for done event continuity
              yield {
                type: "content",
                data: {
                  delta: content,
                  model: data.model || this.model,
                },
                eventId,
              };
            }

            // Check for usage data
            if (data.usage) {
              yield {
                type: "usage",
                data: {
                  promptTokens: data.usage.prompt_tokens,
                  completionTokens: data.usage.completion_tokens,
                  totalTokens: data.usage.total_tokens,
                  model: data.model || this.model,
                },
                eventId,
              };
            }
          } catch {
            yield {
              type: "error",
              data: {
                message: "Malformed JSON data received from provider",
                code: StreamErrorCode.MALFORMED_JSON,
                retryable: false,
                details: { originalData: chunk.data },
              },
              eventId,
            };
          }
        }
        // Ignore SSE comments (lines starting with :)
      }

      // Log final performance metrics
      const endTime = process.hrtime.bigint();
      const totalDuration = Number(endTime - startTime) / 1000000; // Convert to ms
      const endMemory = process.memoryUsage().heapUsed;
      const memoryDelta = (endMemory - startMemory) / 1024 / 1024; // Convert to MB

      this.logger.debug(
        `Stream complete [${streamId}]: ${totalDuration.toFixed(2)}ms total, ${chunkCount} chunks, ${memoryDelta.toFixed(2)}MB memory delta`,
      );
    } catch (error) {
      // Log error performance metrics
      const endTime = process.hrtime.bigint();
      const totalDuration = Number(endTime - startTime) / 1000000;
      this.logger.debug(
        `Stream error [${streamId}]: ${totalDuration.toFixed(2)}ms before error, ${chunkCount} chunks processed`,
      );

      yield {
        type: "error",
        data: this.mapErrorToStreamError(error),
        eventId: `or-${Date.now()}-${generateId()}`,
      };
    }
  }

  private async startStream(
    messages: Message[],
    requestParams: StreamRequestParams,
  ): Promise<Response> {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": this.appUrl,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          stream: true,
          ...this.getApiSafeParams(requestParams),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = (await response
          .json()
          .catch(() => ({}) as Record<string, unknown>)) as {
          error?: { message?: string };
        };
        const errorMessage =
          errorData.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`;

        const scrubbedMessage = scrubSensitiveData(errorMessage);
        this.logger.error("OpenRouter streaming API error", {
          status: response.status,
          message: scrubbedMessage,
          model: this.model,
        });
        throw new Error(`OpenRouter API Error: ${scrubbedMessage}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async *parseSSEStream(
    response: Response,
  ): AsyncIterable<{ type: string; data: string }> {
    if (!response.body) {
      throw new Error("No response body available for streaming");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        // Keep the last line in buffer if it doesn't end with newline
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();

          // Skip empty lines and comments
          if (!trimmedLine || trimmedLine.startsWith(":")) {
            continue;
          }

          if (trimmedLine.startsWith("data: ")) {
            const data = trimmedLine.slice(6); // Remove 'data: ' prefix
            yield { type: "data", data };
          }
        }
      }

      // Flush any remaining bytes from decoder
      buffer += decoder.decode();

      // Process any remaining data in buffer
      if (buffer.trim()) {
        const trimmedLine = buffer.trim();
        if (trimmedLine.startsWith("data: ")) {
          const data = trimmedLine.slice(6);
          yield { type: "data", data };
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Filter out non-API parameters that should not be sent to OpenRouter
   * Removes local parameters like timeout, signal, wordDelay, stream, etc.
   */
  private getApiSafeParams(
    requestParams: StreamRequestParams,
  ): Record<string, unknown> {
    // Filter out non-serializable and non-API parameters before JSON serialization
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { timeout, signal, wordDelay, stream, ...apiSafeParams } =
      requestParams;

    return apiSafeParams;
  }

  private mapErrorToStreamError(error: unknown): StreamError {
    // Scrub the error for logging
    const scrubbedError = scrubErrorForLogging(error);
    this.logger.error("OpenRouter stream error", scrubbedError);

    // Handle timeout specifically
    if (error instanceof Error && error.name === "AbortError") {
      return {
        message: "OpenRouter request timeout",
        code: StreamErrorCode.CONNECTION_TIMEOUT,
        retryable: true,
      };
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        message: "Network error connecting to OpenRouter",
        code: StreamErrorCode.NETWORK_ERROR,
        retryable: true,
      };
    }

    // Handle general errors - use scrubbed message
    const errorMessage = scrubbedError.message;

    if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
      return {
        message: "Invalid OpenRouter API key",
        code: StreamErrorCode.AUTHENTICATION_FAILED,
        retryable: false,
      };
    }

    if (
      errorMessage.includes("429") ||
      errorMessage.toLowerCase().includes("rate limit")
    ) {
      return {
        message: "OpenRouter rate limit exceeded",
        code: StreamErrorCode.PROVIDER_RATE_LIMIT,
        retryable: true,
      };
    }

    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      return {
        message: `Model '${this.model}' not found on OpenRouter`,
        code: StreamErrorCode.PROVIDER_INVALID_RESPONSE,
        retryable: false,
      };
    }

    return {
      message: `OpenRouter error: ${errorMessage}`,
      code: StreamErrorCode.PROVIDER_UNAVAILABLE,
      retryable: true,
      details: { originalError: errorMessage },
    };
  }

  getName(): string {
    return "openrouter";
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }
}
