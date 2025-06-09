import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { LlmResponse } from "./dto/llm-response.dto";
import { LlmPromptRequestDto } from "../domain/dto/llm-prompt-request.dto";
import { LlmProviderFactory } from "../providers/llm/llm-provider.factory";
import { VercelErrorMapper } from "../providers/llm/vercel-error.mapper";
import { ProviderNotFoundError } from "../providers/llm/errors";
import { ProviderStreamEvent } from "@liminal-chat/shared-types";

@Injectable()
export class LlmService {
  constructor(
    private readonly providerFactory: LlmProviderFactory,
    private readonly errorMapper: VercelErrorMapper,
  ) {}

  async prompt(dto: LlmPromptRequestDto): Promise<LlmResponse> {
    try {
      // Validate that either prompt or messages is provided
      if (!dto.prompt && !dto.messages) {
        throw new HttpException(
          { error: "Either prompt or messages must be provided" },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (dto.prompt && dto.messages) {
        throw new HttpException(
          { error: "Cannot provide both prompt and messages" },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Get the provider
      const provider = this.providerFactory.getProvider(dto.provider);

      // Generate response
      const input = dto.prompt || dto.messages!;
      const response = await provider.generate(input);

      return response;
    } catch (error) {
      // Handle specific errors
      if (error instanceof ProviderNotFoundError) {
        // Let the global exception filter handle this
        throw error;
      }

      if (error instanceof HttpException) {
        throw error;
      }

      // Map other errors
      throw this.errorMapper.mapError(error, dto.provider || "unknown");
    }
  }

  async *promptStream(
    dto: LlmPromptRequestDto,
  ): AsyncIterable<ProviderStreamEvent> {
    try {
      // Validate that either prompt or messages is provided
      if (!dto.prompt && !dto.messages) {
        throw new HttpException(
          { error: "Either prompt or messages must be provided" },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (dto.prompt && dto.messages) {
        throw new HttpException(
          { error: "Cannot provide both prompt and messages" },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Get the provider
      const provider = this.providerFactory.getProvider(dto.provider);

      // Check if provider supports streaming
      if (!provider.generateStream) {
        throw new HttpException(
          { error: "Provider does not support streaming" },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Generate streaming response
      const input = dto.prompt || dto.messages!;
      yield* provider.generateStream(input);
    } catch (error) {
      // Handle specific errors
      if (error instanceof ProviderNotFoundError) {
        // Let the global exception filter handle this
        throw error;
      }

      if (error instanceof HttpException) {
        throw error;
      }

      // Map other errors
      throw this.errorMapper.mapError(error, dto.provider || "unknown");
    }
  }
}
