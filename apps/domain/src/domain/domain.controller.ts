import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
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
    return this.llmService.prompt(dto);
  }

  @Get("llm/providers")
  @ApiOperation({ summary: "Get available LLM providers" })
  @ApiResponse({ status: 200, description: "Provider discovery information" })
  async getProviders() {
    return this.providerHealthService.getProviderDiscovery();
  }
}
