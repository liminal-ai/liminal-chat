"use node";

import { generateText as vercelGenerateText, streamText as vercelStreamText } from "ai";
import { ProviderName } from "./providers";
import { model, ModelParams } from "./modelBuilder";

// Parameters for AI operations
export interface GenerateTextParams {
  provider: ProviderName;
  modelId?: string;
  prompt?: string;
  messages?: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  params?: ModelParams;
  providerOptions?: Record<string, any>;
}

export interface StreamTextParams extends GenerateTextParams {}

// AI Service for centralized model operations
export class AIService {
  // Build model with all parameters
  private buildModel(params: GenerateTextParams) {
    const { provider, modelId, params: modelParams, providerOptions } = params;

    const builder = model(provider);
    if (modelId) builder.withModel(modelId);
    if (modelParams?.temperature !== undefined) builder.withTemperature(modelParams.temperature);
    if (modelParams?.maxTokens !== undefined) builder.withMaxTokens(modelParams.maxTokens);
    if (modelParams?.topP !== undefined) builder.withTopP(modelParams.topP);
    if (modelParams?.topK !== undefined) builder.withTopK(modelParams.topK);
    if (modelParams?.frequencyPenalty !== undefined) builder.withFrequencyPenalty(modelParams.frequencyPenalty);
    if (modelParams?.presencePenalty !== undefined) builder.withPresencePenalty(modelParams.presencePenalty);
    if (modelParams?.stopSequences) builder.withStopSequences(modelParams.stopSequences);
    if (modelParams?.seed !== undefined) builder.withSeed(modelParams.seed);
    if (providerOptions) builder.withProviderOptions(providerOptions);

    return builder;
  }

  // Generate text (non-streaming)
  async generateText(params: GenerateTextParams) {
    const { prompt, messages, params: modelParams, provider } = params;

    // Build the model
    const builder = this.buildModel(params);
    const llm = await builder.build();

    // Call Vercel AI SDK
    const result = await vercelGenerateText({
      model: llm,
      ...(prompt ? { prompt } : {}),
      ...(messages ? { messages } : {}),
      ...modelParams,
    });

    return {
      text: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
      model: builder.getConfig().modelId,
      provider,
    };
  }

  // Stream text
  async streamText(params: StreamTextParams) {
    const { prompt, messages, params: modelParams } = params;

    // Build the model
    const builder = this.buildModel(params);
    const llm = await builder.build();

    // Call Vercel AI SDK
    const result = vercelStreamText({
      model: llm,
      ...(prompt ? { prompt } : {}),
      ...(messages ? { messages } : {}),
      ...modelParams,
    });

    return result;
  }

  // Create a model instance (for direct use)
  async createModel(provider: ProviderName, modelId?: string) {
    const builder = model(provider);
    if (modelId) builder.withModel(modelId);
    return builder.build();
  }
}

// Singleton instance
export const aiService = new AIService();