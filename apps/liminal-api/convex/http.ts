import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Hono } from "hono";
import { HonoWithConvex, HttpRouterWithHono as _HttpRouterWithHono } from "convex-helpers/server/hono";
import { ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";
import { Webhook } from "svix";
import { Id } from "./_generated/dataModel";
import { env } from "./lib/env";

// Create Hono app with Convex context
const app: HonoWithConvex<ActionCtx> = new Hono();

// Enhanced health check endpoint
app.get("/health", async (c) => {
  const ctx = c.env;
  try {
    // Query the users table to verify database connectivity
    const userCount = await ctx.runQuery(api.users.getUserCount);
    
    // Get a sample user (without sensitive data)
    const sampleUser = await ctx.runQuery(api.users.getSampleUser);
    
    const response = {
      status: "healthy",
      database: {
        connected: true,
        userCount,
        hasSampleUser: !!sampleUser,
      },
      timestamp: new Date().toISOString(),
    };
    
    return c.json(response);
  } catch (error) {
    return c.json({
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, 503);
  }
});

// TypeScript types for Clerk webhook events
interface ClerkWebhookEvent {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    email_addresses?: Array<{
      email_address: string;
      verification?: {
        status: string;
      };
    }>;
    first_name?: string;
    last_name?: string;
    username?: string;
    image_url?: string;
    created_at: number;
    updated_at: number;
  };
  object: string;
  event_attributes?: {
    http_request: {
      client_ip: string;
    };
  };
}

// TypeScript types for conversation endpoints
interface CreateConversationRequest {
  title: string;
  type?: "standard" | "roundtable" | "pipeline";
  metadata?: {
    provider?: string;
    model?: string;
    [key: string]: unknown;
  };
}

interface UpdateConversationRequest {
  title?: string;
  metadata?: {
    provider?: string;
    model?: string;
    [key: string]: unknown;
  };
}

// Clerk webhook endpoint with Svix signature verification
app.post("/clerk-webhook", async (c) => {
  const _ctx = c.env;
  
  // Security: Get the webhook secret from environment with better error handling
  let webhookSecret: string;
  try {
    webhookSecret = env.CLERK_WEBHOOK_SECRET;
  } catch (error) {
    console.error("CLERK_WEBHOOK_SECRET configuration error:", error);
    return c.json({ 
      error: "Webhook configuration error",
      details: process.env.NODE_ENV === "development" 
        ? (error instanceof Error ? error.message : "Unknown error")
        : "An internal error occurred while processing the webhook configuration"
    }, 500);
  }
  
  // Security: Extract required headers for signature verification
  const svixId = c.req.header("svix-id");
  const svixTimestamp = c.req.header("svix-timestamp");
  const svixSignature = c.req.header("svix-signature");
  
  if (!svixId || !svixTimestamp || !svixSignature) {
    console.warn("Missing required webhook headers for signature verification");
    return c.json({ error: "Missing webhook headers" }, 401);
  }
  
  try {
    // Get the raw body for signature verification
    const body = await c.req.text();
    
    // Security: Verify the webhook signature using Svix
    const webhook = new Webhook(webhookSecret);
    let event: ClerkWebhookEvent;
    
    try {
      // This will throw an error if signature verification fails
      event = webhook.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkWebhookEvent;
    } catch (verifyError) {
      console.error("Webhook signature verification failed:", verifyError);
      return c.json({ error: "Invalid webhook signature" }, 401);
    }
    
    // Security check passed - process the verified webhook event
    console.log(`Processing verified Clerk webhook event: ${event.type}`);
    
    // Handle different webhook events from Clerk
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const userData = event.data;
        
        // Extract user information
        const email = userData.email_addresses?.[0]?.email_address;
        
        if (email) {
          // Note: We can't directly call syncUser here because webhooks don't have auth context
          // Instead, we'd need to store this data temporarily or use a different approach
          // TODO: Implement proper webhook handling without auth context
          console.log(`User ${event.type}: ${email}`);
        }
        break;
      }
      
      case "user.deleted": {
        // Handle user deletion if needed
        // TODO: Implement proper user deletion handling
        console.log(`User deleted: ${event.data.id}`);
        break;
      }
      
      default: {
        // Log unhandled event types for monitoring
        console.log(`Unhandled webhook event type: ${(event as any).type}`);
      }
    }
    
    return c.json({ status: "OK" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});

// Non-streaming text chat endpoint - returns complete text response
app.post("/api/chat-text", async (c) => {
  const ctx = c.env;
  try {
    const body = await c.req.json();
    const { prompt, model, conversationId } = body;

    if (!prompt) {
      return c.json({ error: "Prompt is required" }, 400);
    }

    // Call the action with conversation support
    const result = await ctx.runAction(api.chat.simpleChatAction, {
      prompt,
      model,
      provider: body.provider,
      conversationId,
    });

    return c.json(result);
  } catch (error) {
    console.error("Chat endpoint error:", error);
    return c.json({
      error: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

// Conversation management endpoints
// List conversations
app.get("/api/conversations", async (c) => {
  const ctx = c.env;
  try {
    const archived = c.req.query("archived") === "true";
    const cursor = c.req.query("cursor") || undefined;
    const limit = parseInt(c.req.query("limit") || "50");

    const result = await ctx.runQuery(api.conversations.list, {
      archived,
      paginationOpts: {
        numItems: limit,
        cursor,
      },
    });

    return c.json(result);
  } catch (error) {
    console.error("List conversations error:", error);
    return c.json({
      error: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

// Create conversation
app.post("/api/conversations", async (c) => {
  const ctx = c.env;
  try {
    const body: CreateConversationRequest = await c.req.json();
    const { title, type = "standard", metadata } = body;

    if (!title) {
      return c.json({ error: "Title is required" }, 400);
    }

    const conversationId = await ctx.runMutation(api.conversations.create, {
      title,
      type,
      metadata,
    });

    return c.json({ id: conversationId }, 201);
  } catch (error) {
    console.error("Create conversation error:", error);
    return c.json({
      error: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

// Get conversation with messages - NOW WITH PROPER PATH PARAMS!
app.get("/api/conversations/:id", async (c) => {
  const ctx = c.env;
  try {
    const conversationId = c.req.param("id") as Id<"conversations">;

    // Get conversation details
    const conversation = await ctx.runQuery(api.conversations.get, {
      conversationId,
    });

    if (!conversation) {
      return c.json({ error: "Conversation not found" }, 404);
    }

    // Get messages
    const messages = await ctx.runQuery(api.messages.getAll, {
      conversationId,
    });

    return c.json({
      conversation,
      messages,
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    return c.json({
      error: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

// Update conversation - NOW WITH PROPER PATH PARAMS!
app.patch("/api/conversations/:id", async (c) => {
  const ctx = c.env;
  try {
    const conversationId = c.req.param("id") as Id<"conversations">;
    const body: UpdateConversationRequest = await c.req.json();
    const { title, metadata } = body;

    await ctx.runMutation(api.conversations.update, {
      conversationId,
      title,
      metadata,
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Update conversation error:", error);
    return c.json({
      error: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

// Archive conversation - NOW WITH PROPER PATH PARAMS!
app.delete("/api/conversations/:id", async (c) => {
  const ctx = c.env;
  try {
    const conversationId = c.req.param("id") as Id<"conversations">;

    await ctx.runMutation(api.conversations.archive, {
      conversationId,
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Archive conversation error:", error);
    return c.json({
      error: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

// For streaming endpoints, we need to handle them separately
// Create a traditional httpRouter for streaming endpoints
const http = httpRouter();

// Messages-based chat endpoint - Vercel AI SDK standard streaming
http.route({
  path: "/api/chat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    "use node";
    
    const { streamText } = await import("ai");
    const { createModelForHttp, getStreamingHeaders } = await import("./ai/httpHelpers");
    
    try {
      const body = await request.json();
      const { messages, model: requestedModel, provider = "openrouter", conversationId } = body;

      if (!messages || !Array.isArray(messages)) {
        return new Response(
          JSON.stringify({ error: "Messages array is required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Handle conversation persistence
      const chatContext = await ctx.runAction(api.chat.streamingChatAction, {
        messages,
        model: requestedModel,
        provider,
        conversationId,
      });

      // Use helper to create model
      const model = await createModelForHttp(
        provider,
        requestedModel
      );

      // Stream the response with onFinish callback for persistence
      const result = streamText({
        model,
        messages,
        onFinish: async ({ text, usage, finishReason }) => {
          // Save the assistant response after streaming completes
          if (chatContext.conversationId) {
            await ctx.runMutation(api.messages.create, {
              conversationId: chatContext.conversationId,
              authorType: "agent",
              authorId: provider,
              type: "text",
              content: text,
              metadata: {
                model: requestedModel,
                provider,
                promptTokens: usage?.promptTokens,
                completionTokens: usage?.completionTokens,
                totalTokens: usage?.totalTokens,
                finishReason,
              },
            });
          }
        },
      });

      // Add conversationId to headers so client knows which conversation this is for
      const headers = getStreamingHeaders();
      if (chatContext.conversationId) {
        headers.set("X-Conversation-Id", chatContext.conversationId);
      }

      // Return data stream response with headers
      return result.toDataStreamResponse({ headers });
    } catch (error) {
      console.error("Chat endpoint error:", error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Completion endpoint - streaming with prompt (Vercel AI SDK standard)
http.route({
  path: "/api/completion",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    "use node";
    
    const { streamText } = await import("ai");
    const { createModelForHttp, getStreamingHeaders } = await import("./ai/httpHelpers");
    
    try {
      const body = await request.json();
      const { prompt, model: requestedModel, provider = "openrouter" } = body;

      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "Prompt is required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Use helper to create model
      const model = await createModelForHttp(
        provider,
        requestedModel
      );

      // Stream the response
      const result = streamText({
        model,
        prompt,
      });

      // Return data stream response with headers
      return result.toDataStreamResponse({ headers: getStreamingHeaders() });
    } catch (error) {
      console.error("Completion endpoint error:", error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Delegate all other routes to Hono
http.route({
  pathPrefix: "/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return app.fetch(request, ctx);
  }),
});

http.route({
  pathPrefix: "/",
  method: "POST", 
  handler: httpAction(async (ctx, request) => {
    return app.fetch(request, ctx);
  }),
});

http.route({
  pathPrefix: "/",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    return app.fetch(request, ctx);
  }),
});

http.route({
  pathPrefix: "/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    return app.fetch(request, ctx);
  }),
});

export default http;