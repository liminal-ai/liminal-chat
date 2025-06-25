"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { aiService } from "./ai/service";

// Multi-provider chat action supporting 6 providers
export const simpleChatAction = action({
  args: {
    prompt: v.string(),
    model: v.optional(v.string()),
    provider: v.optional(v.union(
      v.literal("openrouter"), 
      v.literal("openai"),
      v.literal("anthropic"),
      v.literal("google"),
      v.literal("perplexity"),
      v.literal("vercel")
    )),
  },
  handler: async (_ctx, args) => {
    const { prompt, provider = "openrouter", model } = args;
    
    // Use AI service for clean abstraction
    const result = await aiService.generateText({
      provider: provider,
      modelId: model,
      prompt,
    });

    return result;
  },
});

// Streaming chat action - returns chunks for real-time responses
export const streamChatAction = action({
  args: {
    prompt: v.string(),
    model: v.optional(v.string()),
    provider: v.optional(v.union(
      v.literal("openrouter"), 
      v.literal("openai"),
      v.literal("anthropic"),
      v.literal("google"),
      v.literal("perplexity"),
      v.literal("vercel")
    )),
  },
  handler: async (_ctx, args) => {
    const { prompt, provider = "openrouter", model } = args;
    
    // Use AI service for streaming
    const stream = await aiService.streamText({
      provider: provider,
      modelId: model,
      prompt,
    });

    // Collect all chunks
    const chunks = [];
    for await (const chunk of stream.textStream) {
      chunks.push(chunk);
    }

    // Return complete text and metadata
    const config = (await import("./ai/providers")).getProviderConfig(provider);
    return {
      text: chunks.join(''),
      chunks: chunks.length,
      model: model || config.defaultModel,
      provider,
    };
  },
});

// Messages-based chat action for conversation mode
export const chatAction = action({
  args: {
    messages: v.array(v.object({
      role: v.union(v.literal("system"), v.literal("user"), v.literal("assistant")),
      content: v.string(),
    })),
    model: v.optional(v.string()),
    provider: v.optional(v.union(
      v.literal("openrouter"), 
      v.literal("openai"),
      v.literal("anthropic"),
      v.literal("google"),
      v.literal("perplexity"),
      v.literal("vercel")
    )),
  },
  handler: async (_ctx, args) => {
    const { messages, provider = "openrouter", model } = args;
    
    // Use AI service for messages-based generation
    const result = await aiService.generateText({
      provider: provider,
      modelId: model,
      messages,
    });

    return result;
  },
});
