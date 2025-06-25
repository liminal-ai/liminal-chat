"use node";

import { action } from "./_generated/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { createPerplexity } from "@ai-sdk/perplexity";
import { createVercel } from "@ai-sdk/vercel";
import { generateText, streamText } from "ai";
import { v } from "convex/values";

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
    const { prompt, provider = "openrouter" } = args;
    
    let model;
    let modelName;
    
    if (provider === "openai") {
      // Direct OpenAI provider
      modelName = args.model || "gpt-4o-mini";
      model = openai(modelName);
    } else if (provider === "anthropic") {
      // Direct Anthropic provider
      modelName = args.model || "claude-3-5-sonnet-20241022";
      model = anthropic(modelName);
    } else if (provider === "google") {
      // Direct Google provider
      modelName = args.model || "gemini-2.0-flash-exp";
      model = google(modelName);
    } else if (provider === "perplexity") {
      // Direct Perplexity provider
      modelName = args.model || "sonar-pro";
      const perplexity = createPerplexity({
        apiKey: process.env.PERPLEXITY_API_KEY,
      });
      model = perplexity(modelName);
    } else if (provider === "vercel") {
      // Vercel v0 AI provider
      modelName = args.model || "v0-1.0-md";
      const vercelProvider = createVercel({
        apiKey: process.env.VERCEL_API_KEY,
      });
      model = vercelProvider(modelName);
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
    const { prompt, provider = "openrouter" } = args;
    
    let model;
    let modelName;
    
    // Same provider logic as simpleChatAction
    if (provider === "openai") {
      modelName = args.model || "gpt-4o-mini";
      model = openai(modelName);
    } else if (provider === "anthropic") {
      modelName = args.model || "claude-3-5-sonnet-20241022";
      model = anthropic(modelName);
    } else if (provider === "google") {
      modelName = args.model || "gemini-2.0-flash-exp";
      model = google(modelName);
    } else if (provider === "perplexity") {
      modelName = args.model || "sonar-pro";
      const perplexity = createPerplexity({
        apiKey: process.env.PERPLEXITY_API_KEY,
      });
      model = perplexity(modelName);
    } else if (provider === "vercel") {
      modelName = args.model || "v0-1.0-md";
      const vercelProvider = createVercel({
        apiKey: process.env.VERCEL_API_KEY,
      });
      model = vercelProvider(modelName);
    } else {
      modelName = args.model || "google/gemini-2.5-flash";
      const openrouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
      });
      model = openrouter(modelName);
    }

    // Use streamText for streaming response
    const result = streamText({
      model,
      prompt,
    });

    // Collect all chunks
    const chunks = [];
    for await (const chunk of result.textStream) {
      chunks.push(chunk);
    }

    // Return complete text and metadata
    return {
      text: chunks.join(''),
      chunks: chunks.length,
      model: modelName,
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
    const { messages, provider = "openrouter" } = args;
    
    let model;
    let modelName;
    
    // Same provider logic
    if (provider === "openai") {
      modelName = args.model || "gpt-4o-mini";
      model = openai(modelName);
    } else if (provider === "anthropic") {
      modelName = args.model || "claude-3-5-sonnet-20241022";
      model = anthropic(modelName);
    } else if (provider === "google") {
      modelName = args.model || "gemini-2.0-flash-exp";
      model = google(modelName);
    } else if (provider === "perplexity") {
      modelName = args.model || "sonar-pro";
      const perplexity = createPerplexity({
        apiKey: process.env.PERPLEXITY_API_KEY,
      });
      model = perplexity(modelName);
    } else if (provider === "vercel") {
      modelName = args.model || "v0-1.0-md";
      const vercelProvider = createVercel({
        apiKey: process.env.VERCEL_API_KEY,
      });
      model = vercelProvider(modelName);
    } else {
      modelName = args.model || "google/gemini-2.5-flash";
      const openrouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
      });
      model = openrouter(modelName);
    }

    // Use generateText with messages
    const result = await generateText({
      model,
      messages,
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
