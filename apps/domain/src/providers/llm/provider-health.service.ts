import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LlmProviderFactory } from "./llm-provider.factory";
import * as openRouterConfig from "../../config/openrouter-models.json";

@Injectable()
export class ProviderHealthService implements OnModuleInit {
  private readonly logger = new Logger(ProviderHealthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly llmProviderFactory: LlmProviderFactory,
  ) {}

  async onModuleInit() {
    this.logger.log("Validating LLM provider configurations...");

    const validationResults = await this.validateProviders();

    // Log validation results
    validationResults.forEach((result) => {
      if (result.isValid) {
        this.logger.log(
          `✅ Provider '${result.provider}' is configured and ready`,
        );
      } else {
        this.logger.warn(
          `⚠️ Provider '${result.provider}' is not configured: ${result.error}`,
        );
      }
    });

    // Log default provider
    const defaultProvider =
      this.configService.get<string>("DEFAULT_LLM_PROVIDER") || "echo";
    const defaultIsAvailable = validationResults.find(
      (r) => r.provider === defaultProvider,
    )?.isValid;

    if (defaultIsAvailable) {
      this.logger.log(`Default provider '${defaultProvider}' is available`);
    } else {
      this.logger.warn(
        `Default provider '${defaultProvider}' is not available, falling back to 'echo'`,
      );
    }
  }

  validateProviders(): Promise<
    Array<{ provider: string; isValid: boolean; error?: string }>
  > {
    const providers = ["echo", "openai", "anthropic", "google", "openrouter"];
    const results = [];

    for (const providerName of providers) {
      try {
        const provider = this.llmProviderFactory.getProvider(providerName);
        const isAvailable = provider.isAvailable();

        if (!isAvailable && providerName !== "echo") {
          const apiKeyEnvVar = `${providerName.toUpperCase()}_API_KEY`;
          results.push({
            provider: providerName,
            isValid: false,
            error: `Missing ${apiKeyEnvVar} environment variable`,
          });
        } else {
          results.push({
            provider: providerName,
            isValid: true,
          });
        }
      } catch (error) {
        results.push({
          provider: providerName,
          isValid: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return Promise.resolve(results);
  }

  checkProviderHealth(providerName: string): Promise<{
    provider: string;
    status: "healthy" | "unhealthy";
    message?: string;
  }> {
    try {
      const provider = this.llmProviderFactory.getProvider(providerName);

      if (!provider.isAvailable()) {
        return Promise.resolve({
          provider: providerName,
          status: "unhealthy",
          message: "Provider not configured",
        });
      }

      // For echo provider, always healthy if available
      if (providerName === "echo") {
        return Promise.resolve({
          provider: providerName,
          status: "healthy",
        });
      }

      // For other providers, we could do a minimal test request
      // For now, just check availability
      return Promise.resolve({
        provider: providerName,
        status: "healthy",
      });
    } catch (error) {
      return Promise.resolve({
        provider: providerName,
        status: "unhealthy",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getProviderDiscovery() {
    const availableProviders = this.llmProviderFactory.getAvailableProviders();
    const allProviders = [
      "echo",
      "openai",
      "anthropic",
      "google",
      "openrouter",
    ];

    const discovery = {
      defaultProvider:
        this.configService.get<string>("DEFAULT_LLM_PROVIDER") || "echo",
      availableProviders,
      providers: {} as Record<string, any>,
    };

    for (const providerName of allProviders) {
      const isAvailable = availableProviders.includes(providerName);
      const health = await this.checkProviderHealth(providerName);

      discovery.providers[providerName] = {
        available: isAvailable,
        status: health.status,
        models: this.getProviderModels(providerName),
      };
    }

    return discovery;
  }

  private getProviderModels(providerName: string): string[] {
    switch (providerName) {
      case "echo":
        return ["echo-1.0"];
      case "openai":
        return ["o4-mini", "gpt-4.1", "o3", "o4-mini-high"];
      case "anthropic":
        return ["claude-sonnet-4-20250514", "claude-opus-4-20250514"];
      case "google":
        return [
          "gemini-2.5-flash-preview-05-20",
          "gemini-2.5-pro-preview-05-06",
        ];
      case "openrouter":
        return openRouterConfig.models.map((m) => m.id);
      default:
        return [];
    }
  }
}
