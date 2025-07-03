/**
 * Enhanced error utilities for better developer experience
 */

/**
 * Configuration error with helpful instructions.
 * Extends Error with additional context for missing configuration.
 */
export class ConfigurationError extends Error {
  constructor(
    message: string,
    public readonly variableName?: string,
    public readonly helpText?: string,
  ) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Creates a helpful configuration error message with setup instructions.
 *
 * @param variableName - The name of the missing environment variable
 * @param description - What the variable is used for
 * @param example - Example value format
 * @param additionalHelp - Extra help text specific to this variable
 * @returns ConfigurationError with formatted message
 *
 * @example
 * ```typescript
 * throw createConfigError(
 *   "OPENAI_API_KEY",
 *   "OpenAI API key for GPT models",
 *   "sk-...",
 *   "Get your key at: https://platform.openai.com/api-keys"
 * );
 * ```
 */
export function createConfigError(
  variableName: string,
  description: string,
  example?: string,
  additionalHelp?: string,
): ConfigurationError {
  let message = `❌ Missing required configuration: ${variableName}\n\n`;
  message += `📝 Description: ${description}\n`;

  if (example) {
    message += `💡 Example: ${example}\n`;
  }

  message += `\n🔧 To fix this:\n`;
  message += `npx convex env set ${variableName} "your-value-here"\n`;

  if (additionalHelp) {
    message += `\n${additionalHelp}`;
  }

  return new ConfigurationError(message, variableName, additionalHelp);
}

/**
 * Creates an API key error with provider-specific documentation links.
 *
 * @param provider - The AI provider name (e.g., "openai", "anthropic")
 * @param keyName - The environment variable name for the API key
 * @returns Error with setup instructions and documentation link
 *
 * @example
 * ```typescript
 * if (!process.env.OPENAI_API_KEY) {
 *   throw createApiKeyError("openai", "OPENAI_API_KEY");
 * }
 * ```
 */
export function createApiKeyError(provider: string, keyName: string): Error {
  const providerUrls: Record<string, string> = {
    openai: 'https://platform.openai.com/api-keys',
    anthropic: 'https://console.anthropic.com/settings/keys',
    google: 'https://makersuite.google.com/app/apikey',
    perplexity: 'https://docs.perplexity.ai/docs/getting-started',
    vercel: 'https://vercel.com/account/tokens',
    openrouter: 'https://openrouter.ai/keys',
  };

  const url = providerUrls[provider.toLowerCase()] || 'your provider dashboard';

  return new Error(
    `🔑 API Key Required for ${provider}\n\n` +
      `The ${keyName} environment variable is not set.\n\n` +
      `To use ${provider}, you need to:\n` +
      `1. Get your API key from: ${url}\n` +
      `2. Set it in Convex:\n` +
      `   npx convex env set ${keyName} "your-api-key"\n\n` +
      `Note: API keys are sensitive. Never commit them to version control.`,
  );
}

/**
 * Creates an authentication configuration error.
 * Different messages for production vs development contexts.
 *
 * @param context - Whether this is a production or development auth error
 * @returns Error with context-appropriate setup instructions
 *
 * @example
 * ```typescript
 * if (!identity && env.isProduction) {
 *   throw createAuthError('production');
 * }
 * ```
 */
export function createAuthError(context: 'production' | 'development'): Error {
  if (context === 'production') {
    return new Error(
      `🔒 Authentication Required\n\n` +
        `This endpoint requires authentication in production.\n` +
        `Please ensure you have:\n` +
        `1. Clerk authentication properly configured\n` +
        `2. Valid authentication token in your request headers\n` +
        `3. CLERK_ISSUER_URL environment variable set\n\n` +
        `For local development, you can enable dev auth:\n` +
        `npx convex env set DEV_AUTH_DEFAULT "true"`,
    );
  }

  return new Error(
    `🔧 Development Authentication Not Configured\n\n` +
      `Dev auth is enabled but required variables are missing.\n\n` +
      `Please set these environment variables:\n` +
      `• DEV_USER_ID - Clerk user ID for dev user\n` +
      `• DEV_USER_EMAIL - Email for dev user\n` +
      `• DEV_USER_NAME - Display name for dev user\n\n` +
      `Example:\n` +
      `npx convex env set DEV_USER_ID "user_123..."\n` +
      `npx convex env set DEV_USER_EMAIL "dev@example.com"\n` +
      `npx convex env set DEV_USER_NAME "Dev User"`,
  );
}

/**
 * Creates a model not found error with available alternatives.
 *
 * @param provider - The AI provider name
 * @param requestedModel - The model that was requested but not found
 * @param availableModels - List of models available for this provider
 * @returns Error with model suggestions
 *
 * @example
 * ```typescript
 * throw createModelError(
 *   "openai",
 *   "gpt-5",
 *   ["gpt-4", "gpt-3.5-turbo"]
 * );
 * ```
 */
export function createModelError(
  provider: string,
  requestedModel: string,
  availableModels: string[],
): Error {
  return new Error(
    `🤖 Model Not Found: ${requestedModel}\n\n` +
      `The model '${requestedModel}' is not available for ${provider}.\n\n` +
      `Available models:\n` +
      availableModels.map((m) => `• ${m}`).join('\n') +
      `\n\nTo use a different model, specify it in your request:\n` +
      `{ "provider": "${provider}", "model": "${availableModels[0]}" }`,
  );
}

/**
 * Creates a rate limit error with retry guidance.
 *
 * @param provider - The AI provider that returned rate limit error
 * @param retryAfter - Optional seconds to wait before retry
 * @returns Error with rate limit handling suggestions
 *
 * @example
 * ```typescript
 * // From a 429 response
 * throw createRateLimitError("openai", 60);
 * ```
 */
export function createRateLimitError(provider: string, retryAfter?: number): Error {
  let message = `⏱️ Rate Limit Exceeded for ${provider}\n\n`;
  message += `You've hit the rate limit for ${provider} API.\n\n`;

  if (retryAfter) {
    message += `Please retry after ${retryAfter} seconds.\n\n`;
  }

  message += `To avoid rate limits:\n`;
  message += `• Use a lower request frequency\n`;
  message += `• Implement exponential backoff\n`;
  message += `• Consider upgrading your API plan\n`;
  message += `• Use a different provider temporarily`;

  return new Error(message);
}

/**
 * Creates a webhook configuration or verification error.
 *
 * @param issue - The type of webhook error
 * @returns Error with webhook setup or debugging instructions
 *
 * @example
 * ```typescript
 * // When secret is missing
 * if (!env.CLERK_WEBHOOK_SECRET) {
 *   throw createWebhookError('missing_secret');
 * }
 *
 * // When signature verification fails
 * if (!isValidSignature) {
 *   throw createWebhookError('invalid_signature');
 * }
 * ```
 */
export function createWebhookError(issue: 'missing_secret' | 'invalid_signature'): Error {
  if (issue === 'missing_secret') {
    return new Error(
      `🔐 Webhook Secret Not Configured\n\n` +
        `The CLERK_WEBHOOK_SECRET is required for webhook verification.\n\n` +
        `To set up webhook security:\n` +
        `1. Go to your Clerk dashboard > Webhooks\n` +
        `2. Copy the signing secret (starts with 'whsec_')\n` +
        `3. Set it in Convex:\n` +
        `   npx convex env set CLERK_WEBHOOK_SECRET "whsec_..."\n\n` +
        `This prevents webhook spoofing attacks.`,
    );
  }

  return new Error(
    `❌ Invalid Webhook Signature\n\n` +
      `The webhook signature verification failed.\n` +
      `This could mean:\n` +
      `• The webhook secret is incorrect\n` +
      `• The request was tampered with\n` +
      `• The request is not from Clerk\n\n` +
      `Please verify your CLERK_WEBHOOK_SECRET matches the one in Clerk dashboard.`,
  );
}
