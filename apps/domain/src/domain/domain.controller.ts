import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
  Res,
  Headers,
} from "@nestjs/common";
import { FastifyReply } from "fastify";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { HealthService } from "../health/health.service";
import { LlmService } from "../llm/llm.service";
import { LlmPromptRequestDto } from "./dto/llm-prompt-request.dto";
import { LlmResponse } from "../llm/dto/llm-response.dto";
import { ProviderHealthService } from "../providers/llm/provider-health.service";

@ApiTags("domain")
@Controller("domain")
export class DomainController {
  constructor(
    private readonly healthService: HealthService,
    private readonly llmService: LlmService,
    private readonly providerHealthService: ProviderHealthService,
  ) {}

  @Get("health")
  @ApiOperation({ summary: "Get domain server health status" })
  @ApiResponse({ status: 200, description: "Health status" })
  getHealth() {
    return this.healthService.getHealth();
  }

  @Post("llm/prompt")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Send prompt to LLM provider" })
  @ApiResponse({ status: 200, type: LlmResponse })
  async prompt(@Body() dto: LlmPromptRequestDto): Promise<LlmResponse> {
    if (dto.stream) {
      throw new HttpException(
        "Use /llm/prompt/stream endpoint for streaming requests",
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.llmService.prompt(dto);
  }

  @Post("llm/prompt/stream")
  @ApiOperation({
    summary: "Send prompt to LLM provider with streaming response",
    description:
      "Uses POST (not GET) to support complex request bodies with message arrays and long prompts that exceed URL length limits",
  })
  @ApiResponse({ status: 200, description: "Server-sent events stream" })
  async streamPrompt(
    @Body() dto: LlmPromptRequestDto,
    @Res({ passthrough: false }) response: FastifyReply,
    @Headers("Last-Event-ID") lastEventId?: string,
  ): Promise<void> {
    // Validate that stream flag is set for streaming endpoint
    if (!dto.stream) {
      throw new HttpException(
        "Stream flag must be true for streaming endpoint",
        HttpStatus.BAD_REQUEST,
      );
    }

    // Set SSE headers (using Fastify's raw response)
    response.raw.setHeader("Content-Type", "text/event-stream");
    response.raw.setHeader("Cache-Control", "no-cache");
    response.raw.setHeader("Connection", "keep-alive");
    response.raw.setHeader("Access-Control-Allow-Origin", "*");
    response.raw.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Last-Event-ID",
    );

    // Flush headers immediately to establish SSE stream with proxies
    response.raw.flushHeaders();

    try {
      // Handle client disconnects to avoid dangling async iterators
      let clientClosed = false;
      response.raw.on("close", () => {
        clientClosed = true;
      });

      // Stream events from the LLM service
      for await (const event of this.llmService.promptStream(
        dto,
        lastEventId,
      )) {
        // Break early if client disconnected
        if (clientClosed) {
          break;
        }
        const sseData = {
          id: event.eventId,
          type: event.type,
          data:
            event.type === "content" ||
            event.type === "usage" ||
            event.type === "error"
              ? JSON.stringify(event.data)
              : "",
        };

        // Write SSE format
        let sseMessage = "";
        if (sseData.id) {
          sseMessage += `id: ${sseData.id}\n`;
        }
        sseMessage += `event: ${sseData.type}\n`;
        sseMessage += `data: ${sseData.data}\n\n`;

        response.raw.write(sseMessage);

        // Flush chunk immediately for prompt delivery
        if (typeof response.raw.flush === "function") {
          response.raw.flush();
        }

        // Exit on done event
        if (event.type === "done") {
          break;
        }
      }
    } catch (error) {
      // Send error event
      const errorMessage = `event: error\ndata: ${JSON.stringify({
        message: error instanceof Error ? error.message : "Unknown error",
        code: "INTERNAL_ERROR",
        retryable: false,
      })}\n\n`;
      response.raw.write(errorMessage);
    } finally {
      response.raw.end();
    }
  }

  @Get("llm/providers")
  @ApiOperation({ summary: "Get available LLM providers" })
  @ApiResponse({ status: 200, description: "Provider discovery information" })
  async getProviders() {
    return this.providerHealthService.getProviderDiscovery();
  }
}
