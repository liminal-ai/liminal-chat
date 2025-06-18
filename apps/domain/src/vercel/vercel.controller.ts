import { Body, Controller, Post, Res } from "@nestjs/common";
import { FastifyReply } from "fastify";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { createVercel } from "@ai-sdk/vercel";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, streamObject, generateText } from "ai";
import { z } from "zod";

interface ChatRequest {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  id?: string;
  provider?: "openai" | "anthropic" | "google" | "openrouter" | "vercel";
  model?: string;
}

interface CompletionRequest {
  prompt: string;
  provider?: "openai" | "anthropic" | "google" | "openrouter" | "vercel";
  model?: string;
}

interface UseObjectRequest {
  prompt: string;
  schema?: z.ZodType<unknown>;
  provider?: "openai" | "anthropic" | "google" | "openrouter" | "vercel";
  model?: string;
}

interface GenerateTextRequest {
  prompt: string;
  provider?: "openai" | "anthropic" | "google" | "openrouter" | "vercel";
  model?: string;
}

@Controller("api")
export class VercelController {
  private getModel(provider: string = "openai", model?: string) {
    switch (provider) {
      case "openai":
        return openai(model || "gpt-4.1");
      case "anthropic":
        return anthropic(model || "claude-4-sonnet-20250514");
      case "google":
        return google(model || "gemini-2.5-pro-preview-06-05");
      case "openrouter": {
        const openrouter = createOpenRouter({
          apiKey: process.env.OPENROUTER_API_KEY,
        });
        return openrouter(model || "openai/gpt-4.1");
      }
      case "vercel": {
        const vercelProvider = createVercel({
          apiKey: process.env.VERCEL_API_KEY,
        });
        return vercelProvider(model || "v0-1.0-md");
      }
      default:
        throw new Error(
          `Unsupported provider: ${provider}. Only 'openai', 'anthropic', 'google', 'openrouter', and 'vercel' are currently enabled.`,
        );
    }
  }
  @Post("chat")
  async chat(@Body() body: ChatRequest, @Res() res: FastifyReply) {
    const result = streamText({
      model: this.getModel(body.provider, body.model),
      messages: body.messages,
    });

    res.header("X-Vercel-AI-Data-Stream", "v1");
    res.header("Content-Type", "text/plain; charset=utf-8");

    return res.send(result.toDataStream());
  }

  @Post("completion")
  async completion(@Body() body: CompletionRequest, @Res() res: FastifyReply) {
    try {
      console.log(
        `Testing ${body.provider} with model:`,
        this.getModel(body.provider, body.model),
      );
      const result = streamText({
        model: this.getModel(body.provider, body.model),
        prompt: body.prompt,
      });

      res.header("X-Vercel-AI-Data-Stream", "v1");
      res.header("Content-Type", "text/plain; charset=utf-8");

      const stream = result.toDataStream();
      return res.send(stream);
    } catch (error) {
      console.error("Provider Error:", error);
      return res
        .status(500)
        .send(
          `Error: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
  }

  @Post("use-object")
  async useObject(@Body() body: UseObjectRequest, @Res() res: FastifyReply) {
    const schema =
      body.schema ??
      z.object({
        result: z.string().describe("The result of the operation"),
      });

    const result = streamObject({
      model: this.getModel(body.provider, body.model),
      prompt: body.prompt,
      schema,
    });

    res.header("X-Vercel-AI-Data-Stream", "v1");
    res.header("Content-Type", "text/plain; charset=utf-8");

    return res.send(result.toTextStreamResponse());
  }

  @Post("generate-text")
  async generateText(
    @Body() body: GenerateTextRequest,
    @Res() res: FastifyReply,
  ) {
    try {
      const result = await generateText({
        model: this.getModel(body.provider, body.model),
        prompt: body.prompt,
      });

      res.header("Content-Type", "application/json");

      return res.send({
        text: result.text,
        usage: result.usage,
        finishReason: result.finishReason,
      });
    } catch (error) {
      console.error("Generate Text Error:", error);
      return res
        .status(500)
        .send(
          `Error: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
  }
}
