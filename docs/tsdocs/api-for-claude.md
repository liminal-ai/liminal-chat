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

#### chat.ts

**`simpleChatAction`** (action) - convex/chat.ts:32  
Non-streaming text generation action for simple chat completions.  
Args: - The user's input prompt, - Optional model override (provider-specific), - AI provider to use (default: "openrouter"), - Optional existing conversation to continue  
Returns: Generated text response with metadata  

**`streamingChatAction`** (action) - convex/chat.ts:148  
Streaming chat action that prepares conversation context.  
Args: - Array of conversation messages, - Optional model override (provider-specific), - AI provider to use (default: "openrouter"), - Optional existing conversation to continue  
Returns: Conversation context for streaming  
Throws: Error if last message is not from user  

#### conversations.ts

**`create`** (mutation) - convex/conversations.ts:28  
Creates a new conversation for the authenticated user.  
Args: - The title of the conversation, - Type of conversation: "standard", "roundtable", or "pipeline" (defaults to "standard"), - Optional metadata including provider, model, and tags  
Returns: The ID of the created conversation  
Throws: Error if not authenticated  

**`list`** (query) - convex/conversations.ts:77  
Lists the authenticated user's conversations with pagination support.  
Args: - Filter by archived status (optional), - Pagination options, - Number of items per page (default: 50), - Cursor for pagination (optional)  
Returns: Empty result if not authenticated  

**`get`** (query) - convex/conversations.ts:135  
Gets a single conversation by ID.  
Args: - The ID of the conversation to retrieve  
Returns: The conversation object or null if not found/not owned by user  

**`update`** (mutation) - convex/conversations.ts:174  
Updates a conversation's title and/or metadata.  
Args: - The ID of the conversation to update, - New title (optional), - Metadata to update (optional, merged with existing)  
Throws: Error "Conversation not found" if not found or not owned by user  

**`archive`** (mutation) - convex/conversations.ts:230  
Archives a conversation (soft delete).  
Args: - The ID of the conversation to archive  
Throws: Error "Conversation not found" if not found or not owned by user  

**`updateLastMessageAt`** (mutation) - convex/conversations.ts:270  
Updates the last message timestamp for a conversation.  
Args: - The ID of the conversation to update  
Throws: Error "Conversation not found" if not found or not owned by user  

**`count`** (query) - convex/conversations.ts:306  
Counts the total number of conversations for the authenticated user.  
Args: - Filter by archived status (optional)  
Returns: 0 if not authenticated  

#### messages.ts

**`create`** (mutation) - convex/messages.ts:55  
Creates a new message in a conversation.  
Args: - The ID of the conversation, - Type of author: "user", "agent", or "system", - ID of the author (must match user token for "user" type), - Message type: "text", "tool_call", "tool_output", "chain_of_thought", or "error", - Message content (structure depends on type), - Optional metadata like model, tokens, etc.  
Returns: The ID of the created message  
Throws: Error if conversation not found or user doesn't own it, Error if user message authorId doesn't match authenticated user  

**`list`** (query) - convex/messages.ts:135  
Lists messages in a conversation with pagination support.  
Args: - The ID of the conversation, - Pagination options, - Number of items per page (default: 50), - Cursor for pagination  
Returns: Empty result if not authenticated or not owner  

**`getAll`** (query) - convex/messages.ts:199  
Gets all messages for a conversation with cursor-based pagination.  
Args: - The ID of the conversation, - Maximum messages to return (default: 100, max: 1000), - Message ID to start after (for pagination)  
Returns: Empty result if not authenticated or not owner  

**`createBatch`** (mutation) - convex/messages.ts:299  
Creates multiple messages at once in a conversation.  
Args: - The ID of the conversation, - Array of message objects to create  
Returns: Array of created message IDs  
Throws: Error if conversation not found or user doesn't own it, Error if any user message authorId doesn't match authenticated user  

**`count`** (query) - convex/messages.ts:393  
Counts messages in a conversation, optionally filtered by type.  
Args: - The ID of the conversation, - Optional filter by message type  
Returns: 0 if not authenticated or not owner  

**`getLatest`** (query) - convex/messages.ts:448  
Gets the latest messages from a conversation.  
Args: - The ID of the conversation, - Number of messages to return (default: 10)  
Returns: Empty array if not authenticated or not owner  

#### startup.ts

**`validateStartup`** (internalMutation) - convex/startup.ts:9  
Internal mutation to validate environment configuration at startup  

**`checkEnvironmentHealth`** (internalMutation) - convex/startup.ts:49  
Internal mutation to check environment health  

#### users.ts

**`getCurrentUser`** (query) - convex/users.ts:19  
Gets the current authenticated user from the database.  
Returns: The user object if authenticated, null otherwise  

**`syncUser`** (query) - convex/users.ts:57  
Synchronizes user data from authentication provider to the database.  
Args: - The mutation arguments, - User's email address, - User's display name (optional), - URL to user's profile image (optional)  
Throws: Error if not authenticated  

**`testAuth`** (query) - convex/users.ts:105  
Tests the authentication status and returns user information.  
Returns: Object with authentication status and user data  

**`getUserCount`** (query) - convex/users.ts:141  
Gets the total count of users in the database.  
Returns: The total number of users  

**`getSampleUser`** (query) - convex/users.ts:166  
Gets a sanitized sample user for health checks.  
Returns: Sanitized user data or null if no users exist  

**`initializeDevUser`** (query) - convex/users.ts:213  
Initializes the default development user for local testing.  
Returns: Object with creation status  
Throws: Error if called in production environment, Error if dev environment variables are not configured  

#### webhooks.ts

**`clerkWebhook`** (httpAction) - convex/webhooks.ts:20  
Webhook handler for Clerk user lifecycle events.  
Args: - Convex action context, - HTTP request containing Clerk webhook payload  
Returns: HTTP response confirming webhook processing  
Throws: WebhookError if signature verification fails  

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

#### auth.ts

**`getDEV_USER_CONFIG`** (function) - convex/lib/auth.ts:19  
Gets the development user configuration.  
Returns: Development user configuration object  

**`validateDevConfig`** (function) - convex/lib/auth.ts:49  
Validates that development user configuration is properly set.  
Throws: ConvexError if dev auth is enabled but required env vars are missing  

**`requireAuth`** (function) - convex/lib/auth.ts:93  
Requires authentication for a query or mutation.  
Args: - Convex query or mutation context  
Returns: User identity object with tokenIdentifier  
Throws: Error "Authentication required" if not authenticated in production  

**`getAuth`** (function) - convex/lib/auth.ts:134  
Gets authentication if available, returns null if not authenticated.  
Args: - Convex query or mutation context  
Returns: User identity object or null  

**`getAuthForAction`** (function) - convex/lib/auth.ts:164  
Gets authentication for Convex actions.  
Args: - Convex action context  
Returns: User identity object or null  

#### env.ts

**`env`** (function) - convex/lib/env.ts:120  
Type-safe environment variable access.  

**`validateEnvironment`** (function) - convex/lib/env.ts:234  
Validates all environment variables at startup.  
Returns: Validation result  

**`logEnvironmentStatus`** (function) - convex/lib/env.ts:276  
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


## Function Index by Type

### Convex Queries
conversations.ts: `list`, `get`, `count`  
messages.ts: `list`, `getAll`, `count`, `getLatest`  
users.ts: `getCurrentUser`, `syncUser`, `testAuth`, `getUserCount`, `getSampleUser`, `initializeDevUser`  

### Convex Mutations
conversations.ts: `create`, `update`, `archive`, `updateLastMessageAt`  
messages.ts: `create`, `createBatch`  

### Convex Actions
chat.ts: `simpleChatAction`, `streamingChatAction`  
webhooks.ts: `clerkWebhook`  
