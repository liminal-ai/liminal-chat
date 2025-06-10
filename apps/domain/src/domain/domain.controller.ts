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
  })
  @ApiResponse({ status: 200, description: "Server-sent events stream" })
  async streamPrompt(
    @Body() dto: LlmPromptRequestDto,
    @Res({ passthrough: false }) response: any,
    @Headers("Last-Event-ID") lastEventId?: string,
  ): Promise<void> {
    // Set SSE headers
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    response.header("Content-Type", "text/event-stream");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    response.header("Cache-Control", "no-cache");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    response.header("Connection", "keep-alive");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    response.header("Access-Control-Allow-Origin", "*");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    response.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Last-Event-ID",
    );

    try {
      // Stream events from the LLM service
      for await (const event of this.llmService.promptStream(
        dto,
        lastEventId,
      )) {
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

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        response.write(sseMessage);

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      response.write(errorMessage);
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      response.end();
    }
  }

  @Get("llm/providers")
  @ApiOperation({ summary: "Get available LLM providers" })
  @ApiResponse({ status: 200, description: "Provider discovery information" })
  async getProviders() {
    return this.providerHealthService.getProviderDiscovery();
  }
}
