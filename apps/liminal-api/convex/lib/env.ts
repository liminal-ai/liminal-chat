/**
 * Environment variable validation and type-safe access
 * Provides centralized environment configuration with clear error messages
 */

import { ConvexError } from "convex/values";

/**
 * Required environment variables for the application
 */
const REQUIRED_ENV_VARS = {
  // AI Provider API Keys
  OPENAI_API_KEY: {
    description: "OpenAI API key for GPT models",
    example: "sk-...",
    docs: "https://platform.openai.com/api-keys"
  },
  ANTHROPIC_API_KEY: {
    description: "Anthropic API key for Claude models",
    example: "sk-ant-...",
    docs: "https://console.anthropic.com/settings/keys"
  },
  GOOGLE_GENERATIVE_AI_API_KEY: {
    description: "Google AI API key for Gemini models",
    example: "AIza...",
    docs: "https://makersuite.google.com/app/apikey"
  },
  PERPLEXITY_API_KEY: {
    description: "Perplexity API key for search-enhanced models",
    example: "pplx-...",
    docs: "https://docs.perplexity.ai/docs/getting-started"
  },
  VERCEL_API_KEY: {
    description: "Vercel API key for v0 models",
    example: "...",
    docs: "https://vercel.com/account/tokens"
  },
  OPENROUTER_API_KEY: {
    description: "OpenRouter API key for multi-provider access",
    example: "sk-or-...",
    docs: "https://openrouter.ai/keys"
  },
  
  // Authentication
  CLERK_ISSUER_URL: {
    description: "Clerk JWT issuer URL for authentication",
    example: "https://your-app.clerk.accounts.dev",
    docs: "https://clerk.com/docs/backend-requests/handling-cors#clerk-issuer-url"
  },
  CLERK_WEBHOOK_SECRET: {
    description: "Clerk webhook signing secret for Svix verification",
    example: "whsec_...",
    docs: "https://clerk.com/docs/integrations/webhooks"
  }
} as const;

/**
 * Conditionally required environment variables
 */
const CONDITIONAL_ENV_VARS = {
  DEV_AUTH: {
    condition: () => process.env.DEV_AUTH_DEFAULT === "true",
    vars: {
      DEV_USER_ID: {
        description: "Development user Clerk ID",
        example: "user_2zINPyhtT9Wem9OeVW4eZDs21KI",
        docs: "Set when DEV_AUTH_DEFAULT is true"
      },
      DEV_USER_EMAIL: {
        description: "Development user email",
        example: "dev@liminal.chat",
        docs: "Set when DEV_AUTH_DEFAULT is true"
      },
      DEV_USER_NAME: {
        description: "Development user display name",
        example: "Dev User",
        docs: "Set when DEV_AUTH_DEFAULT is true"
      }
    }
  }
} as const;

/**
 * Optional environment variables with defaults
 */
const OPTIONAL_ENV_VARS = {
  NODE_ENV: {
    description: "Node environment",
    default: "development",
    values: ["development", "production", "test"]
  },
  DEV_AUTH_DEFAULT: {
    description: "Enable development authentication bypass",
    default: "false",
    values: ["true", "false"]
  }
} as const;

/**
 * Type-safe environment variable access
 */
export const env = {
  // Required vars (will throw if not set)
  get OPENAI_API_KEY(): string {
    return getRequiredEnv("OPENAI_API_KEY");
  },
  get ANTHROPIC_API_KEY(): string {
    return getRequiredEnv("ANTHROPIC_API_KEY");
  },
  get GOOGLE_GENERATIVE_AI_API_KEY(): string {
    return getRequiredEnv("GOOGLE_GENERATIVE_AI_API_KEY");
  },
  get PERPLEXITY_API_KEY(): string {
    return getRequiredEnv("PERPLEXITY_API_KEY");
  },
  get VERCEL_API_KEY(): string {
    return getRequiredEnv("VERCEL_API_KEY");
  },
  get OPENROUTER_API_KEY(): string {
    return getRequiredEnv("OPENROUTER_API_KEY");
  },
  get CLERK_ISSUER_URL(): string {
    return getRequiredEnv("CLERK_ISSUER_URL");
  },
  get CLERK_WEBHOOK_SECRET(): string {
    return getRequiredEnv("CLERK_WEBHOOK_SECRET");
  },
  
  // Conditional vars
  get DEV_USER_ID(): string {
    return getConditionalEnv("DEV_USER_ID", "DEV_AUTH");
  },
  get DEV_USER_EMAIL(): string {
    return getConditionalEnv("DEV_USER_EMAIL", "DEV_AUTH");
  },
  get DEV_USER_NAME(): string {
    return getConditionalEnv("DEV_USER_NAME", "DEV_AUTH");
  },
  
  // Optional vars with defaults
  get NODE_ENV(): string {
    return process.env.NODE_ENV || OPTIONAL_ENV_VARS.NODE_ENV.default;
  },
  get DEV_AUTH_DEFAULT(): boolean {
    return process.env.DEV_AUTH_DEFAULT === "true";
  },
  
  // Helper to check if in production
  get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  },
  
  // Helper to check if dev auth is enabled (with production protection)
  get isDevAuthEnabled(): boolean {
    return process.env.DEV_AUTH_DEFAULT === "true" && process.env.NODE_ENV !== "production";
  }
};

/**
 * Get a required environment variable with helpful error message
 */
function getRequiredEnv(key: keyof typeof REQUIRED_ENV_VARS): string {
  const value = process.env[key];
  if (!value) {
    const config = REQUIRED_ENV_VARS[key];
    throw new ConvexError(
      `Missing required environment variable: ${key}\n` +
      `Description: ${config.description}\n` +
      `Example: ${config.example}\n` +
      `Documentation: ${config.docs}\n\n` +
      `To set this variable in Convex:\n` +
      `npx convex env set ${key} "your-value-here"`
    );
  }
  return value;
}

/**
 * Get a conditionally required environment variable
 */
function getConditionalEnv(key: string, conditionName: keyof typeof CONDITIONAL_ENV_VARS): string {
  const condition = CONDITIONAL_ENV_VARS[conditionName];
  if (condition.condition()) {
    const value = process.env[key];
    if (!value) {
      const config = condition.vars[key as keyof typeof condition.vars];
      throw new ConvexError(
        `Missing required environment variable: ${key}\n` +
        `Description: ${config.description}\n` +
        `Example: ${config.example}\n` +
        `Note: ${config.docs}\n\n` +
        `To set this variable in Convex:\n` +
        `npx convex env set ${key} "your-value-here"`
      );
    }
    return value;
  }
  return "";
}

/**
 * Validate all environment variables at startup
 * Call this in your Convex functions that depend on environment variables
 */
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required vars
  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!process.env[key]) {
      errors.push(
        `${key}: ${config.description} (see: ${config.docs})`
      );
    }
  }
  
  // Check conditional vars
  for (const [conditionName, condition] of Object.entries(CONDITIONAL_ENV_VARS)) {
    if (condition.condition()) {
      for (const [key, config] of Object.entries(condition.vars)) {
        if (!process.env[key]) {
          errors.push(
            `${key}: ${config.description} (required when ${conditionName})`
          );
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Log environment configuration status (masks sensitive values)
 */
export function logEnvironmentStatus(): void {
  console.log("=== Environment Configuration Status ===");
  
  // Required vars
  console.log("\nRequired Variables:");
  for (const key of Object.keys(REQUIRED_ENV_VARS)) {
    const value = process.env[key];
    const status = value ? "✅ Set" : "❌ Missing";
    const masked = value ? `${value.substring(0, 4)}...` : "Not set";
    console.log(`  ${key}: ${status} (${masked})`);
  }
  
  // Conditional vars
  console.log("\nConditional Variables:");
  for (const [conditionName, condition] of Object.entries(CONDITIONAL_ENV_VARS)) {
    const isRequired = condition.condition();
    console.log(`  ${conditionName} (required: ${isRequired}):`);
    if (isRequired) {
      for (const key of Object.keys(condition.vars)) {
        const value = process.env[key];
        const status = value ? "✅ Set" : "❌ Missing";
        console.log(`    ${key}: ${status}`);
      }
    }
  }
  
  // Optional vars
  console.log("\nOptional Variables:");
  for (const [key, config] of Object.entries(OPTIONAL_ENV_VARS)) {
    const value = process.env[key] || config.default;
    console.log(`  ${key}: ${value} (default: ${config.default})`);
  }
  
  console.log("\n=======================================");
}