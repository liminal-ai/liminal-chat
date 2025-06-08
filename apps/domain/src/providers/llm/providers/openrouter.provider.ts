import { Injectable, HttpException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ILLMProvider, LlmResponse, Message } from "../llm-provider.interface";
import * as openRouterConfig from "../../../config/openrouter-models.json";

@Injectable()
export class OpenRouterProvider implements ILLMProvider {
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
        const errorMessage =
          errorData.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`;

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
      throw new HttpException(
        {
          error: {
            code: "PROVIDER_API_ERROR",
            message: `OpenRouter error: ${(error as Error).message}`,
          },
        },
        500,
      );
    }
  }

  getName(): string {
    return "openrouter";
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }
}
