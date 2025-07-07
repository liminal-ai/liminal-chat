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
  if (!keyName) {
    console.warn(`⚠️ Unknown provider '${provider}' - cannot check for API key`);
    return false;
  }

  const hasKey = !!process.env[keyName];
  if (!hasKey) {
    console.info(
      `ℹ️ Skipping ${provider} tests - ${keyName} not set\n` +
        `To enable ${provider} tests, set the environment variable:\n` +
        `export ${keyName}="your-api-key"`,
    );
  }
  return hasKey;
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

// Make a chat request with standard error handling
// Get WorkOS M2M access token for API authentication using WorkOS SDK
async function getM2MAccessToken(): Promise<string> {
  const { WorkOS } = await import('@workos-inc/node');

  const apiKey = process.env.WORKOS_API_KEY;
  const clientId = process.env.WORKOS_M2M_CLIENT_ID;
  const clientSecret = process.env.WORKOS_M2M_CLIENT_SECRET;

  if (!apiKey || !clientId || !clientSecret) {
    throw new Error(
      'WORKOS_API_KEY, WORKOS_M2M_CLIENT_ID and WORKOS_M2M_CLIENT_SECRET must be set for authenticated tests',
    );
  }

  const workos = new WorkOS(apiKey);

  try {
    // Use WorkOS SDK for client credentials flow
    const response = await workos.userManagement.getAccessToken({
      clientId,
      clientSecret,
      grantType: 'client_credentials',
    });

    return response.accessToken;
  } catch (error) {
    throw new Error(`Failed to get M2M token: ${error}`);
  }
}

// Get auth headers for API requests
function getAuthHeaders(): Record<string, string> {
  // For now, return empty - will be populated by makeAuthenticatedRequest
  return {};
}

// Make an authenticated GET request
export async function makeAuthenticatedRequest(
  request: APIRequestContext,
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  data?: any,
): Promise<{ response: any; body: any }> {
  // Get M2M access token for authentication
  const accessToken = await getM2MAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };

  const options: any = { headers };
  if (data && method !== 'GET') {
    options.data = data;
  }

  const response = await request[method.toLowerCase() as 'get' | 'post' | 'patch' | 'delete'](
    endpoint,
    options,
  );
  const body = await response.text();

  try {
    return { response, body: JSON.parse(body) };
  } catch {
    return { response, body };
  }
}

// Make a chat request with standard error handling (no auth required)
export async function makeChatRequest(
  request: APIRequestContext,
  endpoint: string,
  data: any,
): Promise<{ response: any; body: any }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const response = await request.post(endpoint, {
    headers,
    data,
  });
  const body = await response.text();

  try {
    return { response, body: JSON.parse(body) };
  } catch {
    return { response, body };
  }
}
