// Provider configuration and registry

import { env } from '../../lib/env';

export interface ProviderConfig {
  name: string;
  defaultModel: string;
  keyName: string;
}

// Provider registry with all supported providers
export const providerRegistry = {
  openai: {
    name: 'openai',
    defaultModel: 'gpt-4o-mini',
    keyName: 'OPENAI_API_KEY',
  },
  anthropic: {
    name: 'anthropic',
    defaultModel: 'claude-3-5-sonnet-20241022',
    keyName: 'ANTHROPIC_API_KEY',
  },
  google: {
    name: 'google',
    defaultModel: 'gemini-2.0-flash-exp',
    keyName: 'GOOGLE_GENERATIVE_AI_API_KEY',
  },
  perplexity: {
    name: 'perplexity',
    defaultModel: 'sonar-pro',
    keyName: 'PERPLEXITY_API_KEY',
  },
  vercel: {
    name: 'vercel',
    defaultModel: 'v0-1.0-md',
    keyName: 'VERCEL_API_KEY',
  },
  openrouter: {
    name: 'openrouter',
    defaultModel: 'google/gemini-2.5-flash',
    keyName: 'OPENROUTER_API_KEY',
  },
} as const;

// Type-safe provider names
export type ProviderName = keyof typeof providerRegistry;

// Helper to get provider config
export function getProviderConfig(name: ProviderName): ProviderConfig {
  const config = providerRegistry[name];
  if (!config) {
    throw new Error(`Unknown provider: ${name}`);
  }
  return config;
}

// Get API key for a provider with better error handling
export function getProviderApiKey(name: ProviderName): string {
  switch (name) {
    case 'openai':
      return env.OPENAI_API_KEY;
    case 'anthropic':
      return env.ANTHROPIC_API_KEY;
    case 'google':
      return env.GOOGLE_GENERATIVE_AI_API_KEY;
    case 'perplexity':
      return env.PERPLEXITY_API_KEY;
    case 'vercel':
      return env.VERCEL_API_KEY;
    case 'openrouter':
      return env.OPENROUTER_API_KEY;
    default: {
      // TypeScript exhaustive check
      const _exhaustiveCheck: never = name;
      return _exhaustiveCheck;
    }
  }
}
