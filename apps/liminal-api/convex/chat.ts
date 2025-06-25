"use node";

import { action } from "./_generated/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { v } from "convex/values";

// Multi-provider chat action supporting OpenRouter and OpenAI
export const simpleChatAction = action({
  args: {
    prompt: v.string(),
    model: v.optional(v.string()),
    provider: v.optional(v.union(v.literal("openrouter"), v.literal("openai"))),
  },
  handler: async (_ctx, args) => {
    const { prompt, provider = "openrouter" } = args;
    
    let model;
    let modelName;
    
    if (provider === "openai") {
      // Direct OpenAI provider
      modelName = args.model || "gpt-4o-mini";
      model = openai(modelName);
    } else {
      // OpenRouter provider (default)
      modelName = args.model || "google/gemini-2.5-flash";
      const openrouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
      });
      model = openrouter(modelName);
    }

    // Use generateText for simple non-streaming response
    const result = await generateText({
      model,
      prompt,
    });

    // Return the generated text with metadata
    return {
      text: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
      model: modelName,
      provider,
    };
  },
});