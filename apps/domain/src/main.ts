import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./filters/http-exception.filter";

/**
 * Initializes and starts the NestJS application with Fastify, applying global validation, exception handling, CORS, and Swagger documentation.
 *
 * Configures CORS origins based on the `CORS_ORIGINS` environment variable or defaults to `http://localhost:8787`. Sets up Swagger at `/api-docs` and listens on the port specified by the `PORT` environment variable or 8766.
 */
async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS - Environment-driven configuration
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
    : ["http://localhost:3000"]; // Next.js web app default

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Domain API")
    .setDescription("Liminal Type Chat Domain Server")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document);

  const port = process.env.PORT || 8766;
  await app.listen(port, "0.0.0.0");
  logger.log(`Domain server running on port ${port}`);
}
void bootstrap();
