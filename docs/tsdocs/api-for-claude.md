# Liminal Chat API Reference for Claude

This is a comprehensive reference generated from the codebase, designed for AI agents.

## Quick Setup

```bash
# From project root
pnpm --filter liminal-api dev              # Start Convex backend
pnpm --filter web dev                      # Start Next.js frontend
pnpm --filter @liminal/cli dev             # Run CLI
```

## Environment Variables

### Required for Production
- `CLERK_ISSUER_URL` - From Clerk JWT Templates
- `CLERK_WEBHOOK_SECRET` - For user sync webhooks
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc. - For AI providers

### Development Mode
```bash
npx convex env set DEV_AUTH_DEFAULT true
npx convex env set DEV_USER_ID "user_2zINPyhtT9Wem9OeVW4eZDs21KI"  
npx convex env set DEV_USER_EMAIL "dev@liminal.chat"
npx convex env set DEV_USER_NAME "Dev User"
```

## API Reference

### convex/

#### auth-actions.ts

**`validateWorkOSToken`** (action) - convex/auth-actions.ts:66  
Validates a WorkOS JWT token and returns user information  

**`requireAuth`** (action) - convex/auth-actions.ts:79  
Validates authorization header and returns authenticated user  

**`optionalAuth`** (action) - convex/auth-actions.ts:108  
Optional authentication - returns null if no auth header provided  

#### chat.ts

**`simpleChatAction`** (action) - convex/chat.ts:37  
Non-streaming text generation action for simple chat completions.  
Args: - The user's input prompt, - Optional model override (provider-specific), - AI provider to use (default: "openrouter"), - Optional existing conversation to continue  
Returns: Generated text response with metadata including conversationId  

**`streamingChatAction`** (action) - convex/chat.ts:180  
Streaming chat action that prepares conversation context.  
Args: - Array of conversation messages, - Optional model override (provider-specific), - AI provider to use (default: "openrouter"), - Optional existing conversation to continue  
Returns: Conversation context for streaming  
Throws: Error if last message is not from user  

#### cleanup.ts

**`clearTestData`** (query) - convex/cleanup.ts:23  
Clears all messages and conversations from the database.  
Returns: usersPreserved - Always 0 since users table was removed  

**`getDataCounts`** (query) - convex/cleanup.ts:70  
Returns current count of data records in the database.  
Returns: messages - Current number of messages  

#### conversations.ts

**`create`** (mutation) - convex/conversations.ts:28  
Creates a new conversation in the public API.  
Args: - The title of the conversation, - Type of conversation: "standard", "roundtable", or "pipeline" (defaults to "standard"), - Optional metadata including provider, model, and tags  
Returns: The ID of the created conversation  

**`list`** (query) - convex/conversations.ts:78  
Lists all conversations in the public API with pagination support.  
Args: - Filter by archived status (optional), - Pagination options, - Number of items per page (default: 50), - Cursor for pagination (optional)  
Returns: Paginated conversation list with page array and isDone flag  

**`get`** (query) - convex/conversations.ts:122  
Gets a single conversation by ID from the public API.  
Args: - The ID of the conversation to retrieve  
Returns: The conversation object or null if not found  

**`update`** (mutation) - convex/conversations.ts:161  
Updates a conversation's title and/or metadata in the public API.  
Args: - The ID of the conversation to update, - New title (optional), - Metadata to update (optional, merged with existing)  
Throws: Error "Conversation not found" if conversation doesn't exist  

**`archive`** (mutation) - convex/conversations.ts:218  
Archives a conversation (soft delete) in the public API.  
Args: - The ID of the conversation to archive  
Throws: Error "Conversation not found" if conversation doesn't exist  

**`updateLastMessageAt`** (mutation) - convex/conversations.ts:259  
Updates the last message timestamp for a conversation.  
Args: - The ID of the conversation to update  
Throws: Error "Conversation not found" if conversation doesn't exist  

**`count`** (query) - convex/conversations.ts:295  
Counts the total number of conversations in the public API.  
Args: - Filter by archived status (optional)  
Returns: The count of conversations matching the filter  

#### messages.ts

**`create`** (mutation) - convex/messages.ts:54  
Creates a new message in a conversation using the public API.  
Args: - The ID of the conversation, - Type of author: "user", "agent", or "system", - ID of the author ("anonymous" for users, provider name for agents), - Message type: "text", "tool_call", "tool_output", "chain_of_thought", or "error", - Message content (structure depends on type), - Optional metadata like model, tokens, etc.  
Returns: The ID of the created message  
Throws: Error if conversation not found  

**`list`** (query) - convex/messages.ts:132  
Lists messages in a conversation with pagination support.  
Args: - The ID of the conversation, - Pagination options, - Number of items per page (default: 50), - Cursor for pagination  
Returns: Empty result if conversation not found  

**`getAll`** (query) - convex/messages.ts:197  
Gets all messages for a conversation with cursor-based pagination.  
Args: - The ID of the conversation, - Maximum messages to return (default: 100, max: 1000), - Message ID to start after (for pagination)  
Returns: Empty result if conversation not found  

**`createBatch`** (mutation) - convex/messages.ts:297  
Creates multiple messages at once in a conversation using the public API.  
Args: - The ID of the conversation, - Array of message objects to create  
Returns: Array of created message IDs  
Throws: Error if conversation not found  

**`count`** (query) - convex/messages.ts:389  
Counts messages in a conversation, optionally filtered by type.  
Args: - The ID of the conversation, - Optional filter by message type  
Returns: 0 if conversation not found  

**`getLatest`** (query) - convex/messages.ts:445  
Gets the latest messages from a conversation.  
Args: - The ID of the conversation, - Number of messages to return (default: 10)  
Returns: Empty array if conversation not found  

#### migrations.ts

**`addUpdatedAtToMessages`** (query) - convex/migrations.ts:14  
Migration: Add updatedAt field to existing messages  

**`addUpdatedAtToConversations`** (query) - convex/migrations.ts:43  
Migration: Add updatedAt field to existing conversations  

#### startup.ts

**`validateStartup`** (internalMutation) - convex/startup.ts:9  
Internal mutation to validate environment configuration at startup  

**`checkEnvironmentHealth`** (internalMutation) - convex/startup.ts:49  
Internal mutation to check environment health  

### convex/ai/

#### httpHelpers.ts

**`createModelForHttp`** (function) - convex/ai/httpHelpers.ts:7  

**`getStreamingHeaders`** (function) - convex/ai/httpHelpers.ts:20  

#### modelBuilder.ts

**`model`** (function) - convex/ai/modelBuilder.ts:183  

**`ModelBuilder`** (class) - convex/ai/modelBuilder.ts:19  

Interfaces: `ModelParams`  

#### providers.ts

**`providerRegistry`** (function) - convex/ai/providers.ts:12  

**`getProviderConfig`** (function) - convex/ai/providers.ts:49  

**`getProviderApiKey`** (function) - convex/ai/providers.ts:58  

Types: `ProviderName`  

Interfaces: `ProviderConfig`  

#### service.ts

**`aiService`** (function) - convex/ai/service.ts:195  
Singleton instance of AIService.  

**`AIService`** (class) - convex/ai/service.ts:36  
AI Service for centralized model operations.  

Interfaces: `GenerateTextParams`  

### convex/lib/

#### env.ts

**`env`** (function) - convex/lib/env.ts:85  
Type-safe environment variable access.  

**`validateEnvironment`** (function) - convex/lib/env.ts:158  
Validates all environment variables at startup.  
Returns: Validation result  

**`logEnvironmentStatus`** (function) - convex/lib/env.ts:191  
Logs environment configuration status to console.  

#### errors.ts

**`createConfigError`** (function) - convex/lib/errors.ts:39  
Creates a helpful configuration error message with setup instructions.  
Args: - The name of the missing environment variable, - What the variable is used for, - Example value format, - Extra help text specific to this variable  
Returns: ConfigurationError with formatted message  

**`createApiKeyError`** (function) - convex/lib/errors.ts:76  
Creates an API key error with provider-specific documentation links.  
Args: - The AI provider name (e.g., "openai", "anthropic"), - The environment variable name for the API key  
Returns: Error with setup instructions and documentation link  

**`createAuthError`** (function) - convex/lib/errors.ts:113  
Creates an authentication configuration error.  
Args: - Whether this is a production or development auth error  
Returns: Error with context-appropriate setup instructions  

**`createModelError`** (function) - convex/lib/errors.ts:158  
Creates a model not found error with available alternatives.  
Args: - The AI provider name, - The model that was requested but not found, - List of models available for this provider  
Returns: Error with model suggestions  

**`createRateLimitError`** (function) - convex/lib/errors.ts:186  
Creates a rate limit error with retry guidance.  
Args: - The AI provider that returned rate limit error, - Optional seconds to wait before retry  
Returns: Error with rate limit handling suggestions  

**`createWebhookError`** (function) - convex/lib/errors.ts:222  
Creates a webhook configuration or verification error.  
Args: - The type of webhook error  
Returns: Error with webhook setup or debugging instructions  

**`ConfigurationError`** (class) - convex/lib/errors.ts:9  
Configuration error with helpful instructions.  

### lib/auth/

#### middleware.ts

**`requireAuth`** (function) - lib/auth/middleware.ts:9  
Secure JWT authentication middleware for WorkOS tokens  

**`requireAuthForRequest`** (function) - lib/auth/middleware.ts:39  
Authentication middleware for Convex HTTP actions (streaming endpoints)  

#### system-user-token-manager.ts

**`systemUserTokenManager`** (function) - lib/auth/system-user-token-manager.ts:178  
Global singleton instance for integration testing.  

**`SystemUserTokenManager`** (class) - lib/auth/system-user-token-manager.ts:27  
Manages authentication tokens for a system user in WorkOS.  

#### workos-auth.ts

**`validateWorkOSToken`** (function) - lib/auth/workos-auth.ts:37  
Validates a WorkOS JWT token and returns user information  

**`extractBearerToken`** (function) - lib/auth/workos-auth.ts:73  
Extract Bearer token from Authorization header  

**`requireWorkOSAuth`** (function) - lib/auth/workos-auth.ts:83  
Middleware function to validate WorkOS authentication  

Interfaces: `WorkOSUser`  

### lib/test/

#### system-auth-helper.ts

**`getSystemAuthHelper`** (function) - lib/test/system-auth-helper.ts:210  
Gets or creates the global SystemAuthHelper instance.  
Returns: Promise<SystemAuthHelper> Global auth helper  

**`SystemAuthHelper`** (class) - lib/test/system-auth-helper.ts:28  
Helper class for system user authentication in tests.  

### lib/utils/

#### project-root.ts

**`findProjectRoot`** (function) - lib/utils/project-root.ts:7  
Finds the project root by looking for package.json with "liminal-chat" name  


## Function Index by Type

### Convex Queries
cleanup.ts: `clearTestData`, `getDataCounts`  
conversations.ts: `list`, `get`, `count`  
messages.ts: `list`, `getAll`, `count`, `getLatest`  
migrations.ts: `addUpdatedAtToMessages`, `addUpdatedAtToConversations`  

### Convex Mutations
conversations.ts: `create`, `update`, `archive`, `updateLastMessageAt`  
messages.ts: `create`, `createBatch`  

### Convex Actions
auth-actions.ts: `validateWorkOSToken`, `requireAuth`, `optionalAuth`  
chat.ts: `simpleChatAction`, `streamingChatAction`  
