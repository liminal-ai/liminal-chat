import { query } from "./_generated/server";
import { v } from "convex/values";

// Test query to demonstrate hot reloading
export const greet = query({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name || "World";
    return {
      message: `Hello, ${name}!`,
      // Consider moving this to a `mutation` or
      // pass the timestamp in via the client if really needed.
      // timestamp: new Date().toISOString(),
      // Change this message to test hot reloading
      status: "Hot reloading is working!",
    };
  },
});

// List all greetings (for future use with database)
export const list = query({
  args: {},
  handler: async (_ctx) => {
    return {
      greetings: [],
      info: "Database queries will be added here",
    };
  },
});