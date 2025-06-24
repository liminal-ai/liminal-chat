import { query } from "./_generated/server";

// Simple query to test the Convex setup
export const ping = query({
  args: {},
  handler: async () => {
    return {
      message: "Pong! Convex is working correctly.",
      timestamp: Date.now(),
    };
  },
});