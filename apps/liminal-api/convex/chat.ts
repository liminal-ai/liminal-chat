"use node";

import { action } from "./_generated/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { v } from "convex/values";

// Simple chat action for Story 1 - minimal implementation
// Testing Vercel AI SDK with OpenRouter provider
export const simpleChatAction = action({
  args: {
    prompt: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const { prompt, model = "google/gemini-2.5-flash" } = args;

    // Create OpenRouter provider instance
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    // Use generateText for simple non-streaming response
    const result = await generateText({
      model: openrouter(model),
      prompt,
    });

    // Return the generated text with metadata
    return {
      text: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
      model,
    };
  },
});