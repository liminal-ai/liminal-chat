import { Test, TestingModule } from "@nestjs/testing";
import { ValidationPipe } from "@nestjs/common";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import * as request from "supertest";
import { AppModule } from "../../src/app.module";

describe("E2E: OpenRouter Provider Integration", () => {
  let app: NestFastifyApplication;

  // Mock server for OpenRouter API - will be implemented with MSW (Mock Service Worker)
  // let mockServer: any;

  beforeAll(async () => {
    // TODO: Set up MSW mock server for OpenRouter API
    // import { setupServer } from 'msw/node';
    // import { rest } from 'msw';
    // mockServer = setupServer();
    // mockServer.listen();
  });

  afterAll(async () => {
    // TODO: Clean up MSW mock server
    // mockServer.close();
  });

  beforeEach(async () => {
    // Create test application with Fastify adapter
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    // Apply same global configuration as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    // Add the global exception filter
    const { AllExceptionsFilter } = await import(
      "../../src/filters/http-exception.filter"
    );
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
    // TODO: Reset mock server handlers
    // mockServer.resetHandlers();
  });

  describe("Full Stack Integration", () => {
    it("should process prompt through full stack", async () => {
      // TODO: Mock OpenRouter API response for simple prompt using MSW
      // mockServer.use(
      //   rest.post('https://openrouter.ai/api/v1/chat/completions', (req, res, ctx) => {
      //     return res(
      //       ctx.status(200),
      //       ctx.json({
      //         id: 'chatcmpl-test',
      //         object: 'chat.completion',
      //         created: Date.now(),
      //         model: 'openai/gpt-3.5-turbo',
      //         choices: [{
      //           index: 0,
      //           message: { role: 'assistant', content: 'Test response from OpenRouter' },
      //           finish_reason: 'stop'
      //         }],
      //         usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
      //       })
      //     );
      //   })
      // );

      const response = await request(app.getHttpServer())
        .post("/domain/llm/prompt")
        .send({
          provider: "openrouter",
          prompt: "Hello, OpenRouter!",
        })
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty("content");
      expect(response.body).toHaveProperty("model");
      expect(response.body).toHaveProperty("usage");
      const typedBody = response.body as {
        content: string;
        model: string;
        usage: {
          promptTokens: number;
          completionTokens: number;
          totalTokens: number;
        };
      };
      expect(typedBody.content).toBe("Test response from OpenRouter");
      expect(typedBody.model).toBe("openai/gpt-3.5-turbo");
      expect(typedBody.usage).toEqual({
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      });
    });

    it("should process messages with system prompt", async () => {
      // TODO: Mock OpenRouter API response for messages with system prompt using MSW
      // mockServer.use(
      //   rest.post('https://openrouter.ai/api/v1/chat/completions', async (req, res, ctx) => {
      //     // Verify the request includes system message
      //     const body = await req.json();
      //     expect(body.messages).toHaveLength(4);
      //     expect(body.messages[0].role).toBe('system');
      //
      //     return res(
      //       ctx.status(200),
      //       ctx.json({
      //         id: 'chatcmpl-test-2',
      //         object: 'chat.completion',
      //         created: Date.now(),
      //         model: 'openai/gpt-4',
      //         choices: [{
      //           index: 0,
      //           message: { role: 'assistant', content: 'Acknowledged system prompt. User input processed.' },
      //           finish_reason: 'stop'
      //         }],
      //         usage: { prompt_tokens: 25, completion_tokens: 15, total_tokens: 40 }
      //       })
      //     );
      //   })
      // );

      const response = await request(app.getHttpServer())
        .post("/domain/llm/prompt")
        .send({
          provider: "openrouter",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "What is 2+2?" },
            { role: "assistant", content: "2+2 equals 4." },
            { role: "user", content: "What about 3+3?" },
          ],
        })
        .expect(200);

      // Verify system prompt influences response
      expect(response.body).toHaveProperty("content");
      const typedResponse = response.body as { content: string; model: string };
      expect(typedResponse.content).toContain("Acknowledged system prompt");
      expect(typedResponse.model).toBe("openai/gpt-4");
    });
  });

  describe("Error Handling", () => {
    it("should handle provider not found error", async () => {
      // This should fail until OpenRouter provider is implemented
      const response = await request(app.getHttpServer())
        .post("/domain/llm/prompt")
        .send({
          provider: "openrouter",
          prompt: "This should fail",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      const errorBody = response.body as {
        error: {
          code: string;
          message: string;
          details: { available: string[] };
        };
      };
      expect(errorBody.error.code).toBe("PROVIDER_NOT_FOUND");
      expect(errorBody.error.message).toContain(
        "Provider 'openrouter' not found",
      );
      expect(errorBody.error.message).toContain(
        "Available providers: echo, openai",
      );
      expect(errorBody.error.details.available).toContain("echo");
      expect(errorBody.error.details.available).toContain("openai");
    });

    it("should handle missing API key", async () => {
      // TODO: Test with provider available but no API key configured
      // This will be implemented once the provider exists
    });

    it("should handle OpenRouter API errors", async () => {
      // TODO: Mock various API error responses (401, 429, 500, etc.)
      // These will be implemented once error mapping is added
    });
  });
});
