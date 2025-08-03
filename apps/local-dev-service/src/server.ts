// Load environment variables FIRST, before any other imports
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

console.log(`Loading environment from: ${envPath}`);
config({ path: envPath });

// Validate critical environment variables immediately
const requiredEnvVars = [
  'SYSTEM_USER_EMAIL',
  'SYSTEM_USER_PASSWORD',
  'WORKOS_CLIENT_ID',
  'WORKOS_API_KEY',
];
const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please ensure these are set in your .env file');
  process.exit(1);
}

console.log('✅ All required environment variables loaded');
console.log(`   SYSTEM_USER_EMAIL: ${process.env.SYSTEM_USER_EMAIL}`);

// Now import everything else
import fastify from 'fastify';
import cors from '@fastify/cors';
import { createClient } from 'redis';
import { getDevAuthService } from './auth.js';

const server = fastify({
  logger: true,
});

// Redis client for agent laboratory
const redis = createClient({
  url: 'redis://localhost:6379',
});

// Connect to Redis and handle errors
redis.on('error', (err) => {
  server.log.error('Redis connection error:', err);
});

redis.on('connect', () => {
  server.log.info('✅ Connected to Redis');
});

// Connect to Redis with proper error handling
try {
  await redis.connect();
  server.log.info('✅ Successfully connected to Redis');
} catch (err) {
  server.log.error('❌ Failed to connect to Redis:', err);
  server.log.error('Please ensure Redis is running: brew services start redis');
  process.exit(1);
}

// Background processing function for o3-pro requests
async function processO3ProInBackground(id: string, prompt: string) {
  try {
    server.log.info(`🚀 Starting o3-pro processing for ID: ${id}`);

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'o3-pro',
        input: prompt,
        max_output_tokens: 100000,
        reasoning: {
          effort: 'high',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    // Store completed response
    const completedResponse = {
      id: id,
      status: 'completed',
      timestamp: new Date().toISOString(),
      prompt: prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''),
      model: data.model || 'o3-pro',
      usage: data.usage || {},
      response: data,
    };

    await redis.setEx(`o3-pro-response-${id}`, 604800, JSON.stringify(completedResponse)); // 7 days TTL
    server.log.info(`✅ o3-pro processing completed for ID: ${id}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    server.log.error(`❌ o3-pro processing failed for ID: ${id}:`, errorMessage);

    // Store error response
    const errorResponse = {
      id: id,
      status: 'error',
      timestamp: new Date().toISOString(),
      prompt: prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''),
      error: errorMessage,
    };

    await redis.setEx(`o3-pro-response-${id}`, 604800, JSON.stringify(errorResponse)); // 7 days TTL
  }
}

// Background processing function for sonar-deep-research requests
async function processDeepResearchInBackground(
  id: string,
  query: string,
  reasoningEffort: string = 'high',
) {
  try {
    server.log.info(`🚀 Starting sonar-deep-research processing for ID: ${id}`);

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-deep-research',
        messages: [{ role: 'user', content: query }],
        max_tokens: 5000,
        temperature: 0.2,
        reasoning_effort: reasoningEffort,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Perplexity API error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const data = await response.json();

    // Store completed response
    const completedResponse = {
      id: id,
      status: 'completed',
      timestamp: new Date().toISOString(),
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      model: 'sonar-deep-research',
      reasoning_effort: reasoningEffort,
      usage: data.usage || {},
      response: data,
    };

    await redis.setEx(`deep-research-response-${id}`, 604800, JSON.stringify(completedResponse)); // 7 days TTL
    server.log.info(`✅ sonar-deep-research processing completed for ID: ${id}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    server.log.error(`❌ sonar-deep-research processing failed for ID: ${id}:`, errorMessage);

    // Store error response
    const errorResponse = {
      id: id,
      status: 'error',
      timestamp: new Date().toISOString(),
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      error: errorMessage,
    };

    await redis.setEx(`deep-research-response-${id}`, 604800, JSON.stringify(errorResponse)); // 7 days TTL
  }
}

// Enable CORS for localhost development
server.register(cors, {
  origin: (origin, callback) => {
    // Allow requests from localhost origins only
    if (
      !origin ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
});

// Force localhost only
const HOST = '127.0.0.1';
const PORT = 8081;

// Health check endpoint
server.get('/health', async (_request, _reply) => {
  return {
    status: 'ok',
    service: 'local-dev-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
});

// Dev JWT endpoint - only accessible from localhost
server.post('/auth/token', async (request, reply) => {
  // Additional security: verify request is from localhost
  const clientIp = request.ip;
  if (clientIp !== '127.0.0.1' && clientIp !== '::1') {
    reply.code(403);
    return { error: 'Forbidden: This endpoint is only accessible from localhost' };
  }

  try {
    const devAuthService = getDevAuthService();
    const tokenData = await devAuthService.getDevToken();
    return tokenData;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    server.log.error('Failed to generate dev token:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    reply.code(500);
    return { error: 'Failed to generate authentication token', details: errorMessage };
  }
});

// v0 consultation endpoint
server.post('/consult/v0', async (request, reply) => {
  const clientIp = request.ip;
  if (clientIp !== '127.0.0.1' && clientIp !== '::1') {
    reply.code(403);
    return { error: 'Forbidden: This endpoint is only accessible from localhost' };
  }

  const { prompt, useLargeModel = false } = request.body as {
    prompt: string;
    useLargeModel?: boolean;
  };

  if (!prompt) {
    reply.code(400);
    return { error: 'Prompt is required' };
  }

  if (!process.env.VERCEL_API_TOKEN) {
    reply.code(500);
    return { error: 'VERCEL_API_TOKEN not configured' };
  }

  // Select model based on useLargeModel flag
  const selectedModel = useLargeModel ? 'v0-1.5-lg' : 'v0-1.5-md';

  try {
    const response = await fetch('https://api.v0.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`v0 API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      response: data.choices[0]?.message?.content || 'No response from v0',
      model: selectedModel,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    server.log.error('v0 consultation failed:', errorMessage);
    reply.code(500);
    return { error: 'v0 consultation failed', details: errorMessage };
  }
});

// Perplexity sonar-pro consultation endpoint
server.post('/consult/perplexity/sonar-pro', async (request, reply) => {
  const clientIp = request.ip;
  if (clientIp !== '127.0.0.1' && clientIp !== '::1') {
    reply.code(403);
    return { error: 'Forbidden: This endpoint is only accessible from localhost' };
  }

  const { query } = request.body as { query: string };

  if (!query) {
    reply.code(400);
    return { error: 'Query is required' };
  }

  if (!process.env.PERPLEXITY_API_KEY) {
    reply.code(500);
    return { error: 'PERPLEXITY_API_KEY not configured' };
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{ role: 'user', content: query }],
        max_tokens: 2000,
        temperature: 0.2,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Perplexity API error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const data = await response.json();
    return {
      response: data.choices[0]?.message?.content || 'No response from Perplexity',
      model: 'sonar-pro',
      sources: data.citations || [],
      usage: data.usage || {},
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    server.log.error('Perplexity sonar-pro consultation failed:', errorMessage);
    reply.code(500);
    return { error: 'Perplexity sonar-pro consultation failed', details: errorMessage };
  }
});

// Perplexity sonar-deep-research async consultation endpoint - returns ID immediately, processes in background
server.post('/consult/perplexity/sonar-deep-research', async (request, reply) => {
  const clientIp = request.ip;
  if (clientIp !== '127.0.0.1' && clientIp !== '::1') {
    reply.code(403);
    return { error: 'Forbidden: This endpoint is only accessible from localhost' };
  }

  const { query, reasoning_effort = 'high' } = request.body as {
    query: string;
    reasoning_effort?: string;
  };

  // Basic validation before starting expensive background work
  if (!query) {
    reply.code(400);
    return { error: 'Query is required' };
  }

  if (!process.env.PERPLEXITY_API_KEY) {
    reply.code(500);
    return { error: 'PERPLEXITY_API_KEY not configured' };
  }

  // Validate reasoning_effort parameter
  if (reasoning_effort && !['low', 'medium', 'high'].includes(reasoning_effort)) {
    reply.code(400);
    return { error: 'reasoning_effort must be "low", "medium", or "high"' };
  }

  try {
    // Get next incremental ID
    const currentCount = (await redis.get('deep-research:counter')) || '0';
    const nextId = String(parseInt(currentCount) + 1).padStart(4, '0');
    await redis.set('deep-research:counter', nextId);

    // Store initial processing status
    const initialStatus = {
      id: nextId,
      status: 'processing',
      timestamp: new Date().toISOString(),
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      reasoning_effort: reasoning_effort,
    };

    await redis.setEx(`deep-research-response-${nextId}`, 604800, JSON.stringify(initialStatus)); // 7 days TTL

    // Start background processing (don't await)
    processDeepResearchInBackground(nextId, query, reasoning_effort);

    server.log.info(`✅ sonar-deep-research request queued: deep-research-response-${nextId}`);

    // Return immediately with ID
    return { id: nextId, status: 'processing' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    server.log.error('Failed to queue sonar-deep-research request:', errorMessage);
    reply.code(500);
    return { error: 'Failed to queue sonar-deep-research request', details: errorMessage };
  }
});

// o3-pro async consultation endpoint - returns ID immediately, processes in background
server.post('/consult/o3-pro', async (request, reply) => {
  const clientIp = request.ip;
  if (clientIp !== '127.0.0.1' && clientIp !== '::1') {
    reply.code(403);
    return { error: 'Forbidden: This endpoint is only accessible from localhost' };
  }

  const { prompt } = request.body as { prompt: string };

  // Basic validation before starting expensive background work
  if (!prompt) {
    reply.code(400);
    return { error: 'Prompt is required' };
  }

  if (!process.env.OPENAI_API_KEY) {
    reply.code(500);
    return { error: 'OPENAI_API_KEY not configured' };
  }

  try {
    // Get next incremental ID
    const currentCount = (await redis.get('o3-pro:counter')) || '0';
    const nextId = String(parseInt(currentCount) + 1).padStart(4, '0');
    await redis.set('o3-pro:counter', nextId);

    // Store initial processing status
    const initialStatus = {
      id: nextId,
      status: 'processing',
      timestamp: new Date().toISOString(),
      prompt: prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''),
    };

    await redis.setEx(`o3-pro-response-${nextId}`, 604800, JSON.stringify(initialStatus)); // 7 days TTL

    // Start background processing (don't await)
    processO3ProInBackground(nextId, prompt);

    server.log.info(`✅ o3-pro request queued: o3-pro-response-${nextId}`);

    // Return immediately with ID
    return { id: nextId, status: 'processing' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    server.log.error('Failed to queue o3-pro request:', errorMessage);
    reply.code(500);
    return { error: 'Failed to queue o3-pro request', details: errorMessage };
  }
});

// Get o3-pro response status/result by ID
server.get('/o3-pro/response/:id', async (request, reply) => {
  const clientIp = request.ip;
  if (clientIp !== '127.0.0.1' && clientIp !== '::1') {
    reply.code(403);
    return { error: 'Forbidden: This endpoint is only accessible from localhost' };
  }

  const { id } = request.params as { id: string };

  try {
    const data = await redis.get(`o3-pro-response-${id}`);
    if (!data) {
      reply.code(404);
      return { error: `Response ${id} not found` };
    }

    const response = JSON.parse(data);

    // Return just the status info, not the full stored object
    if (response.status === 'processing') {
      return { status: 'processing' };
    } else if (response.status === 'error') {
      return { status: 'error', error: response.error };
    } else if (response.status === 'completed') {
      return { status: 'completed', response: response.response };
    }

    // Fallback
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    server.log.error(`Failed to retrieve o3-pro response ${id}:`, errorMessage);
    reply.code(500);
    return { error: 'Failed to retrieve response', details: errorMessage };
  }
});

// Get sonar-deep-research response status/result by ID
server.get('/deep-research/response/:id', async (request, reply) => {
  const clientIp = request.ip;
  if (clientIp !== '127.0.0.1' && clientIp !== '::1') {
    reply.code(403);
    return { error: 'Forbidden: This endpoint is only accessible from localhost' };
  }

  const { id } = request.params as { id: string };

  try {
    const data = await redis.get(`deep-research-response-${id}`);
    if (!data) {
      reply.code(404);
      return { error: `Deep research response ${id} not found` };
    }

    const response = JSON.parse(data);

    // Return just the status info, not the full stored object
    if (response.status === 'processing') {
      return { status: 'processing' };
    } else if (response.status === 'error') {
      return { status: 'error', error: response.error };
    } else if (response.status === 'completed') {
      return { status: 'completed', response: response.response };
    }

    // Fallback
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    server.log.error(`Failed to retrieve deep research response ${id}:`, errorMessage);
    reply.code(500);
    return { error: 'Failed to retrieve response', details: errorMessage };
  }
});

// Get all o3-pro responses (list)
server.get('/o3/responses', async (request, reply) => {
  const clientIp = request.ip;
  if (clientIp !== '127.0.0.1' && clientIp !== '::1') {
    reply.code(403);
    return { error: 'Forbidden: This endpoint is only accessible from localhost' };
  }

  try {
    const keys = await redis.keys('o3-pro-response-*');
    const responses = [];

    for (const key of keys.sort()) {
      const data = await redis.get(key);
      if (data) {
        const parsed = JSON.parse(data);
        responses.push({
          id: parsed.id,
          timestamp: parsed.timestamp,
          prompt: parsed.prompt,
          model: parsed.model,
          usage: parsed.usage,
        });
      }
    }

    return { responses, count: responses.length };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    server.log.error('Failed to retrieve o3-pro responses:', errorMessage);
    reply.code(500);
    return { error: 'Failed to retrieve responses', details: errorMessage };
  }
});

// Get specific o3-pro response by ID
server.get('/o3/responses/:id', async (request, reply) => {
  const clientIp = request.ip;
  if (clientIp !== '127.0.0.1' && clientIp !== '::1') {
    reply.code(403);
    return { error: 'Forbidden: This endpoint is only accessible from localhost' };
  }

  const { id } = request.params as { id: string };

  try {
    const data = await redis.get(`o3-pro-response-${id}`);
    if (!data) {
      reply.code(404);
      return { error: `Response ${id} not found` };
    }

    return JSON.parse(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    server.log.error(`Failed to retrieve o3-pro response ${id}:`, errorMessage);
    reply.code(500);
    return { error: 'Failed to retrieve response', details: errorMessage };
  }
});

// Basic agent memory endpoints
server.post('/agent/memory', async (request, reply) => {
  const clientIp = request.ip;
  if (clientIp !== '127.0.0.1' && clientIp !== '::1') {
    reply.code(403);
    return { error: 'Forbidden: This endpoint is only accessible from localhost' };
  }

  const { key, data, ttl = 3600 } = request.body as { key: string; data: any; ttl?: number };

  if (!key || !data) {
    reply.code(400);
    return { error: 'Key and data are required' };
  }

  try {
    const memoryData = {
      timestamp: new Date().toISOString(),
      data,
    };

    await redis.setEx(`agent:memory:${key}`, ttl, JSON.stringify(memoryData));
    return { success: true, key: `agent:memory:${key}`, ttl };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    server.log.error('Failed to store agent memory:', errorMessage);
    reply.code(500);
    return { error: 'Failed to store memory', details: errorMessage };
  }
});

server.get('/agent/memory/:key', async (request, reply) => {
  const clientIp = request.ip;
  if (clientIp !== '127.0.0.1' && clientIp !== '::1') {
    reply.code(403);
    return { error: 'Forbidden: This endpoint is only accessible from localhost' };
  }

  const { key } = request.params as { key: string };

  try {
    const data = await redis.get(`agent:memory:${key}`);
    if (!data) {
      reply.code(404);
      return { error: `Memory key '${key}' not found` };
    }

    return JSON.parse(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    server.log.error(`Failed to retrieve agent memory ${key}:`, errorMessage);
    reply.code(500);
    return { error: 'Failed to retrieve memory', details: errorMessage };
  }
});

// Start server
const start = async () => {
  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`Local dev service running on http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
