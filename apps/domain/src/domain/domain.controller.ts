import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Headers,
} from "@nestjs/common";
import { FastifyReply } from "fastify";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { LlmService } from "../llm/llm.service";
import { LlmPromptRequestDto } from "./dto/llm-prompt-request.dto";
import { LlmResponse } from "../llm/dto/llm-response.dto";
import { ProviderHealthService } from "../providers/llm/provider-health.service";

@ApiTags("domain")
@Controller("domain")
export class DomainController {
  constructor(
    private readonly llmService: LlmService,
    private readonly providerHealthService: ProviderHealthService,
  ) {}

  @Post("llm/prompt")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Send prompt to LLM provider",
    description:
      "Unified endpoint that handles both streaming and non-streaming requests based on the 'stream' parameter",
  })
  @ApiResponse({
    status: 200,
    type: LlmResponse,
    description: "Non-streaming response",
  })
  @ApiResponse({
    status: 200,
    description: "Server-sent events stream (when stream=true)",
  })
  async prompt(
    @Body() dto: LlmPromptRequestDto,
    @Res({ passthrough: false }) response: FastifyReply,
    @Headers("Last-Event-ID") lastEventId?: string,
  ): Promise<LlmResponse | void> {
    // Handle streaming requests
    if (dto.stream) {
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
      if (typeof response.raw.flushHeaders === "function") {
        response.raw.flushHeaders();
      }

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
              event.type === "error" ||
              (event.type === "done" && event.data)
                ? JSON.stringify(event.data)
                : event.type === "done" && !event.data
                  ? "[DONE]"
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
      return;
    }

    // Handle non-streaming requests
    const result = await this.llmService.prompt(dto);
    response.code(200).send(result);
    return result;
  }

  @Get("llm/providers")
  @ApiOperation({ summary: "Get available LLM providers" })
  @ApiResponse({ status: 200, description: "Provider discovery information" })
  async getProviders() {
    return this.providerHealthService.getProviderDiscovery();
  }
}
