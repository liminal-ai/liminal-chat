import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ILLMProvider } from "./llm-provider.interface";
import { EchoProvider } from "./providers/echo.provider";
import { VercelOpenAIProvider } from "./providers/vercel-openai.provider";
import { OpenRouterProvider } from "./providers/openrouter.provider";
import { ProviderNotFoundError } from "./errors";

@Injectable()
export class LlmProviderFactory implements OnModuleInit {
  private readonly logger = new Logger(LlmProviderFactory.name);
  private readonly providers = new Map<string, ILLMProvider>();
  private defaultProvider: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly echoProvider: EchoProvider,
    private readonly openAIProvider: VercelOpenAIProvider,
    private readonly openRouterProvider: OpenRouterProvider,
  ) {
    this.defaultProvider =
      this.configService.get<string>("DEFAULT_LLM_PROVIDER") || "echo";
  }

  onModuleInit() {
    // Register providers
    this.providers.set("echo", this.echoProvider);
    this.providers.set("openai", this.openAIProvider);
    this.providers.set("openrouter", this.openRouterProvider);

    // Log available providers
    this.logger.log("Initializing LLM providers...");
    const availableProviders = this.getAvailableProviders();
    this.logger.log(`Available providers: ${availableProviders.join(", ")}`);
    this.logger.log(`Default provider: ${this.defaultProvider}`);
  }

  getProvider(providerName?: string): ILLMProvider {
    const name = providerName || this.defaultProvider;
    const provider = this.providers.get(name);

    if (!provider) {
      throw new ProviderNotFoundError(name);
    }

    return provider;
  }

  getAvailableProviders(): string[] {
    const available: string[] = [];
    this.providers.forEach((provider, name) => {
      if (provider.isAvailable()) {
        available.push(name);
      }
    });
    return available;
  }
}
