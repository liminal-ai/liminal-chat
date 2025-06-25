import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { clerkWebhook } from "./webhooks";
import { api } from "./_generated/api";

const http = httpRouter();

// Test endpoint with Node.js functionality via actions
http.route({
  path: "/test",
  method: "GET",
  handler: httpAction(async (ctx, _request) => {
    try {
      // Get authentication status
      const identity = await ctx.auth.getUserIdentity();
      
      // Prepare response
      const response = {
        status: "success",
        message: "Test endpoint working",
        auth: {
          authenticated: !!identity,
          tokenIdentifier: identity?.tokenIdentifier || null,
          email: identity?.email || null,
          name: identity?.name || null,
        },
        timestamp: new Date().toISOString(),
      };
      
      return new Response(JSON.stringify(response, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }),
});

// Enhanced health check endpoint with database integration and Node.js info
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async (ctx) => {
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
      
      return new Response(JSON.stringify(response, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          status: "unhealthy",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 503,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }),
});

// Clerk webhook endpoint
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: clerkWebhook,
});

// Simple chat endpoint for Story 1 - Vercel AI SDK integration
http.route({
  path: "/api/chat/simple",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { prompt, model } = body;

      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "Prompt is required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Call the action
      const result = await ctx.runAction(api.chat.simpleChatAction, {
        prompt,
        model,
        provider: body.provider,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
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


// Messages-based chat endpoint - Vercel AI SDK standard streaming
http.route({
  path: "/api/chat",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    "use node";
    
    const { streamText } = await import("ai");
    const { createModelForHttp, getStreamingHeaders } = await import("./ai/httpHelpers");
    
    try {
      const body = await request.json();
      const { messages, model: requestedModel, provider = "openrouter" } = body;

      if (!messages || !Array.isArray(messages)) {
        return new Response(
          JSON.stringify({ error: "Messages array is required" }),
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
        messages,
      });

      // Return data stream response with headers
      return result.toDataStreamResponse({ headers: getStreamingHeaders() });
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

// Streaming chat endpoint - returns real-time stream
http.route({
  path: "/api/chat/stream",
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
      console.error("Stream endpoint error:", error);
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

export default http;