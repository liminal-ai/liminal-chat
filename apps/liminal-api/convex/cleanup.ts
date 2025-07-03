/**
 * Development data cleanup utilities
 */

import { mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * Clear all messages and conversations (but preserve users)
 * Use this to clean up test data during development
 */
export const clearTestData = mutation({
  args: {},
  handler: async (ctx) => {
    console.log('Starting cleanup: clearing all messages and conversations');

    // Clear all messages
    const messages = await ctx.db.query('messages').collect();
    let messagesDeleted = 0;
    for (const message of messages) {
      await ctx.db.delete(message._id);
      messagesDeleted++;
    }

    // Clear all conversations
    const conversations = await ctx.db.query('conversations').collect();
    let conversationsDeleted = 0;
    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
      conversationsDeleted++;
    }

    console.log(
      `Cleanup complete: ${messagesDeleted} messages and ${conversationsDeleted} conversations deleted`,
    );
    return {
      messagesDeleted,
      conversationsDeleted,
      usersPreserved: await ctx.db
        .query('users')
        .collect()
        .then((users) => users.length),
    };
  },
});

/**
 * Get data counts for monitoring cleanup
 */
export const getDataCounts = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect();
    const conversations = await ctx.db.query('conversations').collect();
    const messages = await ctx.db.query('messages').collect();

    return {
      users: users.length,
      conversations: conversations.length,
      messages: messages.length,
    };
  },
});
