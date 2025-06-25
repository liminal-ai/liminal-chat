"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { aiService } from "./ai/service";

// Non-streaming text generation action used by /api/chat-text endpoint
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