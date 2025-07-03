/**
 * Database migrations for schema changes
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

/**
 * Migration: Add updatedAt field to existing messages
 * 
 * This migration adds the updatedAt field to messages that don't have it,
 * setting it to the same value as createdAt for backwards compatibility.
 */
export const addUpdatedAtToMessages = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting migration: addUpdatedAtToMessages");
    
    // Find all messages without updatedAt field
    const messages = await ctx.db.query("messages").collect();
    
    let migrated = 0;
    for (const message of messages) {
      const messageData = message as Doc<"messages"> & { updatedAt?: number };
      if (!("updatedAt" in messageData)) {
        await ctx.db.patch(message._id, {
          updatedAt: message.createdAt, // Set updatedAt to createdAt for existing messages
        });
        migrated++;
      }
    }
    
    console.log(`Migration complete: ${migrated} messages updated`);
    return { migrated, total: messages.length };
  },
});

/**
 * Migration: Add updatedAt field to existing conversations
 * 
 * Similar migration for conversations table if needed
 */
export const addUpdatedAtToConversations = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting migration: addUpdatedAtToConversations");
    
    const conversations = await ctx.db.query("conversations").collect();
    
    let migrated = 0;
    for (const conversation of conversations) {
      const conversationData = conversation as Doc<"conversations"> & { updatedAt?: number };
      if (!("updatedAt" in conversationData)) {
        await ctx.db.patch(conversation._id, {
          updatedAt: conversation.createdAt,
        });
        migrated++;
      }
    }
    
    console.log(`Migration complete: ${migrated} conversations updated`);
    return { migrated, total: conversations.length };
  },
});