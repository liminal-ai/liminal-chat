import { validate } from "class-validator";
import { LlmPromptRequestDto } from "./llm-prompt-request.dto";
import { MessageDto } from "./message.dto";

// Test data builder for messages
const buildMessage = (
  role: "system" | "user" | "assistant",
  content: string,
) => {
  const msg = new MessageDto();
  msg.role = role;
  msg.content = content;
  return msg;
};

describe("LlmPromptRequestDto Validation", () => {
  describe("prompt mode", () => {
    it("should accept valid prompt string", async () => {
      const dto = new LlmPromptRequestDto();
      dto.prompt = "This is a valid prompt";

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it("should reject empty prompt", async () => {
      const dto = new LlmPromptRequestDto();
      dto.prompt = "";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === "prompt")).toBe(true);
    });

    it("should reject prompt over maxLength", async () => {
      const dto = new LlmPromptRequestDto();
      dto.prompt = "a".repeat(10001); // Assuming max length is 10000

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === "prompt")).toBe(true);
    });
  });

  describe("messages mode", () => {
    it("should accept valid messages array", async () => {
      const dto = new LlmPromptRequestDto();
      dto.messages = [
        buildMessage("system", "You are helpful"),
        buildMessage("user", "Hello"),
      ];

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it("should reject empty messages array", async () => {
      const dto = new LlmPromptRequestDto();
      dto.messages = [];

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === "messages")).toBe(true);
    });

    it("should reject messages without role", async () => {
      const dto = new LlmPromptRequestDto();
      dto.messages = [{ content: "Missing role" } as any];

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should reject messages without content", async () => {
      const dto = new LlmPromptRequestDto();
      dto.messages = [{ role: "user" } as any];

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should reject invalid role values", async () => {
      const dto = new LlmPromptRequestDto();
      const invalidMessage = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        role: "invalid" as any,
        content: "Test content",
      } as MessageDto;
      dto.messages = [invalidMessage];

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("oneOf constraint", () => {
    it("should reject request with both prompt and messages", async () => {
      const dto = new LlmPromptRequestDto();
      dto.prompt = "Test prompt";
      dto.messages = [buildMessage("user", "Test message")];

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should reject request with neither prompt nor messages", async () => {
      const dto = new LlmPromptRequestDto();
      // Neither prompt nor messages set

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("provider validation", () => {
    it("should accept valid provider enum values", async () => {
      const dto = new LlmPromptRequestDto();
      dto.prompt = "Test";
      dto.provider = "openai";

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it("should accept any provider string", async () => {
      const dto = new LlmPromptRequestDto();
      dto.prompt = "Test";
      dto.provider = "invalid-provider";

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it("should allow missing provider (optional)", async () => {
      const dto = new LlmPromptRequestDto();
      dto.prompt = "Test";
      // provider not set

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
