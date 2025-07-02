"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { aiService } from "./ai/service";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { getAuthForAction } from "./lib/auth";

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
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args): Promise<{
    text: string;
    usage?: any;
    finishReason?: string;
    model: string;
    provider: string;
    conversationId?: Id<"conversations">;
  }> => {
    const { prompt, provider = "openrouter", model, conversationId } = args;
    
    // Get authenticated user (with dev user support)
    const identity = await getAuthForAction(ctx);
    const userId = identity?.tokenIdentifier || "anonymous";
    
    let actualConversationId = conversationId;
    
    // If no conversationId provided, create a new conversation
    if (!actualConversationId && identity) {
      actualConversationId = await ctx.runMutation(api.conversations.create, {
        title: prompt.slice(0, 50) + (prompt.length > 50 ? "..." : ""),
        type: "standard",
        metadata: {
          provider,
          model,
        },
      });
    }
    
    // Save user message if we have a conversation
    if (actualConversationId && identity) {
      await ctx.runMutation(api.messages.create, {
        conversationId: actualConversationId,
        authorType: "user",
        authorId: userId,
        type: "text",
        content: prompt,
      });
    }
    
    // Use AI service for clean abstraction
    const result = await aiService.generateText({
      provider: provider,
      modelId: model,
      prompt,
    });
    
    // Save assistant response if we have a conversation
    if (actualConversationId && identity) {
      await ctx.runMutation(api.messages.create, {
        conversationId: actualConversationId,
        authorType: "agent",
        authorId: provider,
        type: "text",
        content: result.text,
        metadata: {
          model: result.model,
          provider: result.provider,
          promptTokens: result.usage?.promptTokens,
          completionTokens: result.usage?.completionTokens,
          totalTokens: result.usage?.totalTokens,
          finishReason: result.finishReason,
        },
      });
    }

    return {
      ...result,
      conversationId: actualConversationId,
    };
  },
});

// Streaming chat action with message persistence
export const streamingChatAction = action({
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
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args): Promise<{
    conversationId?: Id<"conversations">;
    provider: string;
    model?: string;
  }> => {
    const { messages, provider = "openrouter", model, conversationId } = args;
    
    // Get authenticated user (with dev user support)
    const identity = await getAuthForAction(ctx);
    const userId = identity?.tokenIdentifier || "anonymous";
    
    let actualConversationId = conversationId;
    
    // Get the latest user message
    const userMessage = messages[messages.length - 1];
    if (!userMessage || userMessage.role !== "user") {
      throw new Error("Last message must be from user");
    }
    
    // If no conversationId provided, create a new conversation
    if (!actualConversationId && identity) {
      actualConversationId = await ctx.runMutation(api.conversations.create, {
        title: userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? "..." : ""),
        type: "standard",
        metadata: {
          provider,
          model,
        },
      });
    }
    
    // Save user message if we have a conversation
    if (actualConversationId && identity) {
      await ctx.runMutation(api.messages.create, {
        conversationId: actualConversationId,
        authorType: "user",
        authorId: userId,
        type: "text",
        content: userMessage.content,
      });
    }
    
    // Note: For streaming, we return the conversationId immediately
    // The actual response will be saved by the HTTP endpoint using onFinish callback
    return {
      conversationId: actualConversationId,
      provider,
      model,
    };
  },
});