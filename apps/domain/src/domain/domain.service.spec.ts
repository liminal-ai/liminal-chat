import { Test, TestingModule } from "@nestjs/testing";
import { DomainService } from "./domain.service";
import { LlmService } from "../llm/llm.service";

describe("DomainService", () => {
  let service: DomainService;
  let mockLlmService: jest.Mocked<LlmService>;

  beforeEach(async () => {
    mockLlmService = {
      prompt: jest.fn(),
    } as unknown as jest.Mocked<LlmService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DomainService,
        {
          provide: LlmService,
          useValue: mockLlmService,
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

      // eslint-disable-next-line @typescript-eslint/unbound-method
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

      // eslint-disable-next-line @typescript-eslint/unbound-method
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
