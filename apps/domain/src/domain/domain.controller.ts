import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Sse,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Observable, from, map } from "rxjs";
import { HealthService } from "../health/health.service";
import { LlmService } from "../llm/llm.service";
import { LlmPromptRequestDto } from "./dto/llm-prompt-request.dto";
import { LlmResponse } from "../llm/dto/llm-response.dto";
import { ProviderHealthService } from "../providers/llm/provider-health.service";
import { ProviderStreamEvent } from "@liminal-chat/shared-types";

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
      throw new Error("Use /llm/prompt/stream endpoint for streaming requests");
    }
    return this.llmService.prompt(dto);
  }

  @Sse("llm/prompt/stream")
  @ApiOperation({
    summary: "Send prompt to LLM provider with streaming response",
  })
  @ApiResponse({ status: 200, description: "Server-sent events stream" })
  streamPrompt(
    @Body() dto: LlmPromptRequestDto,
  ): Observable<{ id?: string; type: string; data: string }> {
    return from(this.llmService.promptStream(dto)).pipe(
      map((event: ProviderStreamEvent) => ({
        id: event.eventId,
        type: event.type,
        data: JSON.stringify(event),
      })),
    );
  }

  @Get("llm/providers")
  @ApiOperation({ summary: "Get available LLM providers" })
  @ApiResponse({ status: 200, description: "Provider discovery information" })
  async getProviders() {
    return this.providerHealthService.getProviderDiscovery();
  }
}
