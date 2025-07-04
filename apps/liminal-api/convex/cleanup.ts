/**
 * Development data cleanup utilities
 */

import { mutation } from './_generated/server';

/**
 * Clears all messages and conversations from the database.
 * This is a development utility for cleaning up test data.
 * Since authentication was removed, there are no users to preserve.
 *
 * @returns Object containing deletion counts
 * @returns {number} messagesDeleted - Number of messages deleted
 * @returns {number} conversationsDeleted - Number of conversations deleted
 * @returns {number} usersPreserved - Always 0 since users table was removed
 *
 * @example
 * ```typescript
 * const result = await ctx.runMutation(api.cleanup.clearTestData, {});
 * console.log(`Deleted ${result.messagesDeleted} messages and ${result.conversationsDeleted} conversations`);
 * ```
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
      usersPreserved: 0, // Users table removed
    };
  },
});

/**
 * Returns current count of data records in the database.
 * Useful for monitoring data growth and verifying cleanup operations.
 *
 * @returns Object containing current record counts
 * @returns {number} users - Always 0 since users table was removed
 * @returns {number} conversations - Current number of conversations
 * @returns {number} messages - Current number of messages
 *
 * @example
 * ```typescript
 * const counts = await ctx.runMutation(api.cleanup.getDataCounts, {});
 * console.log(`Database contains: ${counts.conversations} conversations, ${counts.messages} messages`);
 * ```
 */
export const getDataCounts = mutation({
  args: {},
  handler: async (ctx) => {
    const users: any[] = []; // Users table removed
    const conversations = await ctx.db.query('conversations').collect();
    const messages = await ctx.db.query('messages').collect();

    return {
      users: users.length,
      conversations: conversations.length,
      messages: messages.length,
    };
  },
});
