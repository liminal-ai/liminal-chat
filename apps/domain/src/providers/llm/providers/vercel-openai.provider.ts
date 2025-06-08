import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { ILLMProvider, LlmResponse, Message } from "../llm-provider.interface";

@Injectable()
export class VercelOpenAIProvider implements ILLMProvider {
  private readonly logger = new Logger(VercelOpenAIProvider.name);
  private readonly apiKey: string;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>("OPENAI_API_KEY", "");
    this.modelName = this.configService.get<string>("OPENAI_MODEL", "o4-mini");
  }

  async generate(input: string | Message[]): Promise<LlmResponse> {
    if (!this.isAvailable()) {
      throw new Error(
        "OpenAI provider is not configured. Please set OPENAI_API_KEY.",
      );
    }

    const messages =
      typeof input === "string"
        ? [{ role: "user" as const, content: input }]
        : input;

    try {
      const openai = createOpenAI({
        apiKey: this.apiKey,
      });

      const result = await generateText({
        model: openai(this.modelName),
        messages,
      });

      return {
        content: result.text || "",
        model: this.modelName,
        usage: {
          promptTokens: result.usage?.promptTokens || 0,
          completionTokens: result.usage?.completionTokens || 0,
          totalTokens: result.usage?.totalTokens || 0,
        },
      };
    } catch (error) {
      this.logger.error("Error calling OpenAI API", error);
      throw error; // Will be mapped by error mapper
    }
  }

  getName(): string {
    return "openai";
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }
}
