import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LlmService } from "./llm.service";
import { EchoProvider } from "../providers/llm/providers/echo.provider";
import { VercelOpenAIProvider } from "../providers/llm/providers/vercel-openai.provider";
import { OpenRouterProvider } from "../providers/llm/providers/openrouter.provider";
import { LlmProviderFactory } from "../providers/llm/llm-provider.factory";
import { VercelErrorMapper } from "../providers/llm/vercel-error.mapper";
import { ProviderHealthService } from "../providers/llm/provider-health.service";

@Module({
  imports: [ConfigModule],
  providers: [
    LlmService,
    EchoProvider,
    VercelOpenAIProvider,
    OpenRouterProvider,
    LlmProviderFactory,
    VercelErrorMapper,
    ProviderHealthService,
  ],
  exports: [LlmService, ProviderHealthService],
})
export class LlmModule {}
