import { APIRequestContext } from '@playwright/test';
import { TEST_MODELS } from './config';

/**
 * Helper functions for integration tests
 */

// Get the test model for a provider, or use default if not overridden
export function getTestModel(provider: string): string | undefined {
  return TEST_MODELS[provider as keyof typeof TEST_MODELS];
}

// Check if provider has API key configured
export function hasApiKey(provider: string): boolean {
  const keyNames: Record<string, string> = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    google: 'GOOGLE_GENERATIVE_AI_API_KEY',
    perplexity: 'PERPLEXITY_API_KEY',
    vercel: 'VERCEL_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
  };
  
  const keyName = keyNames[provider];
  return !!process.env[keyName];
}

// Parse Vercel AI SDK data stream response
export function parseDataStream(text: string): string[] {
  const lines = text.split('\n');
  const chunks: string[] = [];
  
  for (const line of lines) {
    if (line.startsWith('0:')) {
      // Extract the actual content from the data stream
      try {
        const content = line.substring(2);
        if (content && content !== '""') {
          chunks.push(content);
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }
  
  return chunks;
}

/**
 * Sends a POST request to the specified chat endpoint with JSON data and optional authorization, returning the response and its parsed body.
 *
 * @param endpoint - The API endpoint to send the request to
 * @param data - The JSON payload to include in the request body
 * @returns An object containing the response and the parsed JSON body, or the raw text if parsing fails
 */
export async function makeChatRequest(
  request: APIRequestContext,
  endpoint: string,
  data: any
): Promise<{ response: any; body: any }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add auth token if provided via environment variable
  if (process.env.CLERK_TEST_TOKEN) {
    headers['Authorization'] = process.env.CLERK_TEST_TOKEN;
  }
  
  const response = await request.post(endpoint, { 
    data,
    headers 
  });
  const body = await response.text();
  
  try {
    return { response, body: JSON.parse(body) };
  } catch {
    return { response, body };
  }
}