import { Injectable } from "@nestjs/common";
import { LlmService } from "../llm/llm.service";
import { LlmPromptRequestDto } from "./dto/llm-prompt-request.dto";
import { LlmResponse } from "../llm/dto/llm-response.dto";

@Injectable()
export class DomainService {
  constructor(private readonly llmService: LlmService) {}

  async prompt(dto: LlmPromptRequestDto): Promise<LlmResponse> {
    return this.llmService.prompt(dto);
  }
}
