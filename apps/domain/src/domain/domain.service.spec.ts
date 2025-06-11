import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  type MockedFunction,
} from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { DomainService } from "./domain.service";
import { LlmService } from "../llm/llm.service";
import { LlmResponse } from "../llm/dto/llm-response.dto";
import { LlmPromptRequestDto } from "./dto/llm-prompt-request.dto";

interface MockLlmService {
  prompt: MockedFunction<(dto: LlmPromptRequestDto) => Promise<LlmResponse>>;
}

describe("DomainService", () => {
  let service: DomainService;
  let mockLlmService: MockLlmService;

  beforeEach(async () => {
    mockLlmService = {
      prompt: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DomainService,
        {
          provide: LlmService,
          useValue: mockLlmService as unknown as LlmService,
        },
      ],
    }).compile();

    service = module.get<DomainService>(DomainService);
  });

  describe("prompt", () => {
    it("should delegate to LlmService", async () => {
      const dto = { prompt: "test prompt" };
      const expectedResponse = {
        content: "Test response",
        model: "test-model",
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      };

      mockLlmService.prompt.mockResolvedValue(expectedResponse);

      const result = await service.prompt(dto);

      expect(mockLlmService.prompt).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });

    it("should pass through messages mode", async () => {
      const dto = {
        messages: [{ role: "user" as const, content: "Hello" }],
        provider: "openai",
      };
      const expectedResponse = {
        content: "Hi there!",
        model: "gpt-4",
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      };

      mockLlmService.prompt.mockResolvedValue(expectedResponse);

      const result = await service.prompt(dto);

      expect(mockLlmService.prompt).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });

    it("should propagate errors from LlmService", async () => {
      const dto = { prompt: "test" };
      const error = new Error("Service error");

      mockLlmService.prompt.mockRejectedValue(error);

      await expect(service.prompt(dto)).rejects.toThrow(error);
    });
  });
});
