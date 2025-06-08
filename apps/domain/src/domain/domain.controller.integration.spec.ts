import { Test, TestingModule } from "@nestjs/testing";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import * as request from "supertest";
import { DomainModule } from "./domain.module";
import { ConfigModule } from "@nestjs/config";

describe("Domain Controller - LLM Endpoint", () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DomainModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    // Apply the global exception filter
    const { AllExceptionsFilter } = await import(
      "../filters/http-exception.filter"
    );
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("POST /domain/llm/prompt", () => {
    it("should process prompt with echo provider", async () => {
      const response = await request(app.getHttpServer())
        .post("/domain/llm/prompt")
        .send({
          prompt: "Hello, world!",
          provider: "echo",
        })
        .expect(200);

      expect(response.body).toHaveProperty("content", "Echo: Hello, world!");
      expect(response.body).toHaveProperty("model", "echo-1.0");
      expect(response.body).toHaveProperty("usage");
    });

    it("should process messages with echo provider", async () => {
      const response = await request(app.getHttpServer())
        .post("/domain/llm/prompt")
        .send({
          messages: [
            { role: "system", content: "You are helpful" },
            { role: "user", content: "Hello" },
          ],
          provider: "echo",
        })
        .expect(200);

      expect(response.body).toHaveProperty("content", "Echo: Hello");
      expect(response.body).toHaveProperty("model", "echo-1.0");
    });

    it("should return 400 for validation errors", async () => {
      const response = await request(app.getHttpServer())
        .post("/domain/llm/prompt")
        .send({
          // Missing both prompt and messages
          provider: "echo",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return proper error for missing provider", async () => {
      const response = await request(app.getHttpServer())
        .post("/domain/llm/prompt")
        .send({
          prompt: "Test",
          provider: "non-existent",
        });

      // The global exception filter now converts ProviderNotFoundError to 400
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(
        (response.body as { error: { code: string; message: string } }).error
          .code,
      ).toBe("PROVIDER_NOT_FOUND");
      expect(
        (response.body as { error: { code: string; message: string } }).error
          .message,
      ).toContain("Provider 'non-existent' not found");
    });
  });
});
