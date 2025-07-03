'use node';

import { ProviderName, getProviderConfig, getProviderApiKey } from './providers';

// Standard Vercel AI SDK parameters
export interface ModelParams {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  seed?: number;
  maxRetries?: number;
}

// Builder class for fluent API
export class ModelBuilder {
  private provider: ProviderName;
  private modelId?: string;
  private params: ModelParams = {};
  private providerOptions: Record<string, any> = {};

  constructor(provider: ProviderName) {
    this.provider = provider;
  }

  withModel(modelId: string): this {
    this.modelId = modelId;
    return this;
  }

  withTemperature(temperature: number): this {
    this.params.temperature = temperature;
    return this;
  }

  withMaxTokens(maxTokens: number): this {
    this.params.maxTokens = maxTokens;
    return this;
  }

  withTopP(topP: number): this {
    this.params.topP = topP;
    return this;
  }

  withTopK(topK: number): this {
    this.params.topK = topK;
    return this;
  }

  withFrequencyPenalty(penalty: number): this {
    this.params.frequencyPenalty = penalty;
    return this;
  }

  withPresencePenalty(penalty: number): this {
    this.params.presencePenalty = penalty;
    return this;
  }

  withStopSequences(sequences: string[]): this {
    this.params.stopSequences = sequences;
    return this;
  }

  withSeed(seed: number): this {
    this.params.seed = seed;
    return this;
  }

  withMaxRetries(retries: number): this {
    this.params.maxRetries = retries;
    return this;
  }

  withProviderOptions(options: Record<string, any>): this {
    this.providerOptions = { ...this.providerOptions, ...options };
    return this;
  }

  async build(): Promise<any> {
    const config = getProviderConfig(this.provider);
    const modelId = this.modelId || config.defaultModel;
    const apiKey = getProviderApiKey(this.provider);

    // The getProviderApiKey function now throws with a helpful error message
    // if the API key is missing, so we don't need additional error handling here

    // Build model options including parameters and provider-specific settings
    const modelOptions = {
      ...this.params,
      ...this.providerOptions,
    };

    // Dynamic imports based on provider
    switch (this.provider) {
      case 'openai': {
        const { openai } = await import('@ai-sdk/openai');
        const provider = openai({
          apiKey,
          ...this.providerOptions,
        });
        return provider(modelId, modelOptions);
      }
      case 'anthropic': {
        const { anthropic } = await import('@ai-sdk/anthropic');
        const provider = anthropic({
          apiKey,
          ...this.providerOptions,
        });
        return provider(modelId, modelOptions);
      }
      case 'google': {
        const { google } = await import('@ai-sdk/google');
        const provider = google({
          apiKey,
          ...this.providerOptions,
        });
        return provider(modelId, modelOptions);
      }
      case 'perplexity': {
        const { createPerplexity } = await import('@ai-sdk/perplexity');
        const provider = createPerplexity({ 
          apiKey,
          ...this.providerOptions,
        });
        return provider(modelId, modelOptions);
      }
      case 'vercel': {
        const { createVercel } = await import('@ai-sdk/vercel');
        const provider = createVercel({ 
          apiKey,
          ...this.providerOptions,
        });
        return provider(modelId, modelOptions);
      }
      case 'openrouter': {
        const { createOpenRouter } = await import('@openrouter/ai-sdk-provider');
        const provider = createOpenRouter({ 
          apiKey,
          ...this.providerOptions,
        });
        return provider(modelId, modelOptions);
      }
      default:
        throw new Error(`Unknown provider: ${String(this.provider)}`);
    }
  }

  // Get configuration for use with AI SDK functions
  getConfig() {
    const config = getProviderConfig(this.provider);
    return {
      provider: this.provider,
      modelId: this.modelId || config.defaultModel,
      params: this.params,
      providerOptions: this.providerOptions,
    };
  }
}

// Factory function for cleaner API
export function model(provider: ProviderName): ModelBuilder {
  return new ModelBuilder(provider);
}
