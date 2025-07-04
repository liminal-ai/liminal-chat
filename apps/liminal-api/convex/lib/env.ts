/**
 * Environment variable validation and type-safe access
 * Provides centralized environment configuration with clear error messages
 */

import { ConvexError } from 'convex/values';

/**
 * Required environment variables for the application
 */
const REQUIRED_ENV_VARS = {
  // AI Provider API Keys
  OPENAI_API_KEY: {
    description: 'OpenAI API key for GPT models',
    example: 'sk-...',
    docs: 'https://platform.openai.com/api-keys',
  },
  ANTHROPIC_API_KEY: {
    description: 'Anthropic API key for Claude models',
    example: 'sk-ant-...',
    docs: 'https://console.anthropic.com/settings/keys',
  },
  GOOGLE_GENERATIVE_AI_API_KEY: {
    description: 'Google AI API key for Gemini models',
    example: 'AIza...',
    docs: 'https://makersuite.google.com/app/apikey',
  },
  PERPLEXITY_API_KEY: {
    description: 'Perplexity API key for search-enhanced models',
    example: 'pplx-...',
    docs: 'https://docs.perplexity.ai/docs/getting-started',
  },
  VERCEL_API_KEY: {
    description: 'Vercel API key for v0 models',
    example: '...',
    docs: 'https://vercel.com/account/tokens',
  },
  OPENROUTER_API_KEY: {
    description: 'OpenRouter API key for multi-provider access',
    example: 'sk-or-...',
    docs: 'https://openrouter.ai/keys',
  },

  // Auth system removed
} as const;

/**
 * Conditionally required environment variables
 */
// Development auth system removed
const CONDITIONAL_ENV_VARS = {} as const;

/**
 * Optional environment variables with defaults
 */
const OPTIONAL_ENV_VARS = {
  NODE_ENV: {
    description: 'Node environment',
    default: 'development',
    values: ['development', 'production', 'test'],
  },
  // Dev auth removed
} as const;

/**
 * Type-safe environment variable access.
 * All getters use lazy evaluation to prevent module loading failures.
 *
 * @example
 * ```typescript
 * // Access API keys
 * const apiKey = env.OPENAI_API_KEY; // Throws helpful error if not set
 *
 * // Check environment
 * if (env.isProduction) {
 *   // Production-only code
 * }
 *
 * // Check dev auth
 * if (env.isDevAuthEnabled) {
 *   // Use dev user
 * }
 * ```
 */
export const env = {
  // Required vars (will throw if not set)
  get OPENAI_API_KEY(): string {
    return getRequiredEnv('OPENAI_API_KEY');
  },
  get ANTHROPIC_API_KEY(): string {
    return getRequiredEnv('ANTHROPIC_API_KEY');
  },
  get GOOGLE_GENERATIVE_AI_API_KEY(): string {
    return getRequiredEnv('GOOGLE_GENERATIVE_AI_API_KEY');
  },
  get PERPLEXITY_API_KEY(): string {
    return getRequiredEnv('PERPLEXITY_API_KEY');
  },
  get VERCEL_API_KEY(): string {
    return getRequiredEnv('VERCEL_API_KEY');
  },
  get OPENROUTER_API_KEY(): string {
    return getRequiredEnv('OPENROUTER_API_KEY');
  },
  // Auth system removed

  // Auth vars removed

  // Optional vars with defaults
  get NODE_ENV(): string {
    return process.env.NODE_ENV || OPTIONAL_ENV_VARS.NODE_ENV.default;
  },
  // Helper to check if in production
  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  },
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
        `npx convex env set ${key} "your-value-here"`,
    );
  }
  return value;
}

/**
 * Get a conditionally required environment variable
 */
// Conditional env function removed - no conditional vars

/**
 * Validates all environment variables at startup.
 * Checks required and conditionally required variables.
 *
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const { valid, errors } = validateEnvironment();
 * if (!valid) {
 *   console.error("Missing environment variables:");
 *   errors.forEach(error => console.error(`  - ${error}`));
 * }
 * ```
 */
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required vars
  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!process.env[key]) {
      errors.push(`${key}: ${config.description} (see: ${config.docs})`);
    }
  }

  // No conditional vars to check

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Logs environment configuration status to console.
 * Masks sensitive values for security (shows only first 4 chars).
 *
 * @example
 * ```typescript
 * // Call during startup or debugging
 * logEnvironmentStatus();
 * // Output:
 * // === Environment Configuration Status ===
 * // Required Variables:
 * //   OPENAI_API_KEY: ✅ Set (sk-p...)
 * //   ANTHROPIC_API_KEY: ❌ Missing (Not set)
 * ```
 */
export function logEnvironmentStatus(): void {
  console.log('=== Environment Configuration Status ===');

  // Required vars
  console.log('\nRequired Variables:');
  for (const key of Object.keys(REQUIRED_ENV_VARS)) {
    const value = process.env[key];
    const status = value ? '✅ Set' : '❌ Missing';
    const masked = value ? `${value.substring(0, 4)}...` : 'Not set';
    console.log(`  ${key}: ${status} (${masked})`);
  }

  // No conditional vars to display

  // Optional vars
  console.log('\nOptional Variables:');
  for (const [key, config] of Object.entries(OPTIONAL_ENV_VARS)) {
    const value = process.env[key] || config.default;
    console.log(`  ${key}: ${value} (default: ${config.default})`);
  }

  console.log('\n=======================================');
}
