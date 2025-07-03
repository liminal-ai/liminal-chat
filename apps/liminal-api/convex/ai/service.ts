"use node";

import { generateText as vercelGenerateText, streamText as vercelStreamText } from "ai";
import { ProviderName } from "./providers";
import { model, ModelParams } from "./modelBuilder";
import { createRateLimitError } from "../lib/errors";

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


/**
 * AI Service for centralized model operations.
 * Provides a unified interface for text generation across multiple providers.
 * Handles model configuration, error handling, and response formatting.
 * 
 * @example
 * const result = await aiService.generateText({
 *   provider: "openai",
 *   modelId: "gpt-4",
 *   prompt: "Explain quantum computing",
 *   params: { temperature: 0.7, maxTokens: 500 }
 * });
 */
export class AIService {
  /**
   * Builds a model instance with all specified parameters.
   * @private
   * @param params - Generation parameters including provider and model config
   * @returns Configured model builder
   */
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

  /**
   * Generates text using the specified provider and model.
   * Non-streaming version that returns complete text.
   * 
   * @param params - Generation parameters
   * @returns Generated text with metadata
   * @returns {string} text - The generated text
   * @returns {Object} usage - Token usage statistics  
   * @returns {string} finishReason - Why generation stopped
   * @returns {string} model - The actual model used
   * @returns {string} provider - The provider used
   * @throws {Error} Rate limit errors with retry guidance
   * @throws {Error} Model not found errors
   * @throws {Error} API key errors from env module
   * 
   * @example
   * const result = await aiService.generateText({
   *   provider: "anthropic",
   *   modelId: "claude-3-sonnet",
   *   messages: [
   *     { role: "system", content: "You are helpful" },
   *     { role: "user", content: "Hello!" }
   *   ]
   * });
   */
  async generateText(params: GenerateTextParams) {
    const { prompt, messages, params: _modelParams, provider } = params;

    try {
      // Build the model
      const builder = this.buildModel(params);
      const llm = await builder.build();

      // Call Vercel AI SDK
      const result = await vercelGenerateText({
        model: llm,
        ...(prompt ? { prompt } : {}),
        ...(messages ? { messages } : {}),
      });

      return {
        text: result.text,
        usage: result.usage,
        finishReason: result.finishReason,
        model: builder.getConfig().modelId,
        provider,
      };
    } catch (error: any) {
      // Handle common API errors with helpful messages
      if (error.message?.includes('rate limit')) {
        throw createRateLimitError(provider, error.retryAfter);
      }
      
      if (error.message?.includes('model not found') || error.message?.includes('does not exist')) {
        // For model errors, we'd need to know available models
        // For now, re-throw with the original error
        throw error;
      }
      
      // For API key errors, the env module already provides good errors
      // Re-throw other errors as-is
      throw error;
    }
  }

  /**
   * Streams text using the specified provider and model.
   * Returns a streaming response compatible with Vercel AI SDK.
   * 
   * @param params - Generation parameters
   * @returns Vercel AI SDK stream result
   * 
   * @example
   * const stream = await aiService.streamText({
   *   provider: "openai",
   *   messages: [{ role: "user", content: "Tell me a story" }],
   *   params: { temperature: 0.8 }
   * });
   * // Use stream.toDataStreamResponse() for HTTP streaming
   */
  async streamText(params: GenerateTextParams) {
    const { prompt, messages, params: _modelParams } = params;

    // Build the model
    const builder = this.buildModel(params);
    const llm = await builder.build();

    // Call Vercel AI SDK
    const result = vercelStreamText({
      model: llm,
      ...(prompt ? { prompt } : {}),
      ...(messages ? { messages } : {}),
    });

    return result;
  }

  /**
   * Creates a model instance for direct use.
   * Useful when you need to pass the model to other functions.
   * 
   * @param provider - The AI provider to use
   * @param modelId - Optional specific model ID
   * @returns Configured model instance
   * 
   * @example
   * const model = await aiService.createModel("google", "gemini-pro");
   * // Use with Vercel AI SDK directly
   * const result = await generateText({ model, prompt: "Hello" });
   */
  async createModel(provider: ProviderName, modelId?: string) {
    const builder = model(provider);
    if (modelId) builder.withModel(modelId);
    return builder.build();
  }
}

/**
 * Singleton instance of AIService.
 * Use this for all AI operations in the application.
 * 
 * @example
 * import { aiService } from "./ai/service";
 * 
 * const text = await aiService.generateText({
 *   provider: "openai",
 *   prompt: "Hello, world!"
 * });
 */
export const aiService = new AIService();