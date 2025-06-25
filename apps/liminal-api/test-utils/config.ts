/**
 * Test configuration for integration tests
 * Uses low-cost models to minimize API expenses
 */

// Test-specific model overrides (only override expensive defaults)
export const TEST_MODELS = {
  openai: undefined, // Already using gpt-4o-mini
  anthropic: 'claude-3-haiku-20240307', // Override expensive Sonnet
  google: undefined, // Already using gemini-2.0-flash-exp
  perplexity: 'llama-3.1-sonar-small-128k-online', // Override sonar-pro
  vercel: undefined, // Use default
  openrouter: undefined, // Already using gemini flash
} as const;

// Deterministic test prompts that minimize ambiguity
export const TEST_PROMPTS = {
  simple: "Respond with only: OK",
  number: "What is 2+2? Reply with only the number.",
  json: 'Return this exact JSON: {"status":"ok"}',
  streaming: "Reply with only the word: STREAM",
  error: "This should trigger an error: ",
  memory: "Remember: TEST123",
  recall: "What did I ask you to remember?",
} as const;

// Test timeouts
export const TEST_TIMEOUTS = {
  short: 5000,
  medium: 15000,
  long: 30000,
} as const;

// Response validation helpers
export const RESPONSE_VALIDATORS = {
  hasText: (body: any): boolean => {
    return body && typeof body.text === 'string' && body.text.length > 0;
  },
  hasModel: (body: any): boolean => {
    return body && typeof body.model === 'string';
  },
  hasProvider: (body: any, provider: string): boolean => {
    return body && body.provider === provider;
  },
  isValidStream: (text: string): boolean => {
    // Vercel AI SDK stream format starts with "0:"
    return text.includes('0:');
  },
  hasStreamHeaders: (headers: Record<string, string>): boolean => {
    return headers['x-vercel-ai-data-stream'] === 'v1' ||
           headers['content-type']?.includes('text/plain');
  },
} as const;