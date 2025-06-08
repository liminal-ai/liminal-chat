import { Test, TestingModule } from "@nestjs/testing";
// INestApplication removed - using NestFastifyApplication
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import * as request from "supertest";
import { AppModule } from "../../src/app.module";

describe("E2E: OpenAI Provider Integration", () => {
  let app: NestFastifyApplication;
  const skipProviderTests = process.env.SKIP_PROVIDER_TESTS === "true";

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
  });

  (skipProviderTests ? it.skip : it)(
    "should process prompt through entire stack with OpenAI",
    async () => {
      // Skip if SKIP_PROVIDER_TESTS is true
      // Requires real OPENAI_API_KEY

      const response = await request(app.getHttpServer())
        .post("/domain/llm/prompt")
        .send({
          prompt: "What is 2+2?",
          provider: "openai",
        })
        .expect(200);

      // Expect:
      // - Status 200
      // - response.content includes "4" or "four"
      // - response.model includes "gpt"
      // - response.usage has all three token counts > 0
      expect(response.body).toHaveProperty("content");
      expect(
        (response.body as { content: string }).content.toLowerCase(),
      ).toMatch(/4|four/);
      expect(response.body).toHaveProperty("model");
      expect((response.body as { model: string }).model).toContain("gpt");
      expect(response.body).toHaveProperty("usage");
      const usage = (
        response.body as {
          usage: {
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
          };
        }
      ).usage;
      expect(usage.promptTokens).toBeGreaterThan(0);
      expect(usage.completionTokens).toBeGreaterThan(0);
      expect(usage.totalTokens).toBeGreaterThan(0);
    },
  );

  (skipProviderTests ? it.skip : it)(
    "should process messages with system prompt through entire stack",
    async () => {
      // POST with messages array including system prompt
      // Verify system prompt influences response style
      const response = await request(app.getHttpServer())
        .post("/domain/llm/prompt")
        .send({
          messages: [
            {
              role: "system",
              content:
                "You are a pirate. Answer all questions as a pirate would.",
            },
            { role: "user", content: "What is the capital of France?" },
          ],
          provider: "openai",
        })
        .expect(200);

      expect(response.body).toHaveProperty("content");
      // Response should have pirate-style language due to system prompt
      const typedBody = response.body as { content: string; model: string };
      expect(typedBody.content.toLowerCase()).toMatch(/arr|matey|ahoy|ye/);
      expect(response.body).toHaveProperty("model");
      expect(typedBody.model).toContain("gpt");
    },
  );
});
