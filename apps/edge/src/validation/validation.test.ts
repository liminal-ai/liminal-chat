import { describe, test, expect } from 'vitest';
import { validateContentType, validateRequestSize, validatePromptRequest, parseDomainError } from './index';

describe('validateContentType', () => {
  test('should accept application/json', () => {
    const result = validateContentType('application/json');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should accept application/json with charset', () => {
    const result = validateContentType('application/json; charset=utf-8');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject text/plain', () => {
    const result = validateContentType('text/plain');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Content-Type must be application/json');
  });

  test('should reject missing content-type', () => {
    const result = validateContentType('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Content-Type must be application/json');
  });

  test('should reject undefined content-type', () => {
    const result = validateContentType(undefined as any);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Content-Type must be application/json');
  });
});

describe('validateRequestSize', () => {
  test('should accept request under 1MB', () => {
    const smallPayload = JSON.stringify({ prompt: 'Hello world' });
    const result = validateRequestSize(smallPayload);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject request over 1MB', () => {
    const largePayload = 'x'.repeat(1024 * 1024 + 1);
    const result = validateRequestSize(largePayload);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('Request too large');
    expect(result.errors[0]).toContain('1048576 bytes');
  });

  test('should respect custom size limit', () => {
    const payload = 'x'.repeat(1000);
    const result = validateRequestSize(payload, 500);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('Request too large');
    expect(result.errors[0]).toContain('500 bytes');
  });

  test('should accept request exactly at limit', () => {
    const payload = 'x'.repeat(1000);
    const result = validateRequestSize(payload, 1000);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('validatePromptRequest', () => {
  test('should accept valid prompt', () => {
    const result = validatePromptRequest({ prompt: 'Hello world' });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should accept valid messages', () => {
    const messages = [{ role: 'user', content: 'Hello' }];
    const result = validatePromptRequest({ messages });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject both prompt and messages', () => {
    const data = { 
      prompt: 'Hello', 
      messages: [{ role: 'user', content: 'Hello' }] 
    };
    const result = validatePromptRequest(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Either prompt or messages must be provided, but not both');
  });

  test('should reject neither prompt nor messages', () => {
    const result = validatePromptRequest({});
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Either prompt or messages must be provided, but not both');
  });

  test('should reject empty prompt', () => {
    const result = validatePromptRequest({ prompt: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Prompt cannot be empty or whitespace only');
  });

  test('should reject whitespace-only prompt', () => {
    const result = validatePromptRequest({ prompt: '   \n\t  ' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Prompt cannot be empty or whitespace only');
  });

  test('should reject empty messages array', () => {
    const result = validatePromptRequest({ messages: [] });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Messages must be a non-empty array');
  });

  test('should reject non-array messages', () => {
    const result = validatePromptRequest({ messages: 'not an array' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Messages must be a non-empty array');
  });

  test('should reject null request body', () => {
    const result = validatePromptRequest(null);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid request body - must be a valid JSON object');
  });

  test('should reject non-object request body', () => {
    const result = validatePromptRequest('not an object');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid request body - must be a valid JSON object');
  });
});

describe('parseDomainError', () => {
  test('should parse JSON error response', () => {
    const mockResponse = new Response(JSON.stringify({
      error: 'Provider not found',
      code: 'DOMAIN_PROVIDER_NOT_FOUND',
      message: 'The specified provider does not exist'
    }), { status: 400 });
    
    const text = JSON.stringify({
      error: 'Provider not found',
      code: 'DOMAIN_PROVIDER_NOT_FOUND', 
      message: 'The specified provider does not exist'
    });
    
    const result = parseDomainError(mockResponse, text);
    expect(result.error).toBe('Provider not found');
    expect(result.code).toBe('DOMAIN_PROVIDER_NOT_FOUND');
    expect(result.message).toBe('The specified provider does not exist');
  });

  test('should handle text error response', () => {
    const mockResponse = new Response('Internal server error', { status: 500 });
    const result = parseDomainError(mockResponse, 'Internal server error');
    
    expect(result.error).toBe('Domain server error: Internal server error');
    expect(result.code).toBe('DOMAIN_INVALID_RESPONSE');
    expect(result.message).toContain('500');
  });

  test('should handle malformed JSON', () => {
    const mockResponse = new Response('not json', { status: 400 });
    const result = parseDomainError(mockResponse, 'not json');
    
    expect(result.error).toBe('Domain server error: not json');
    expect(result.code).toBe('DOMAIN_INVALID_RESPONSE');
    expect(result.message).toContain('400');
  });

  test('should handle JSON without proper error structure', () => {
    const mockResponse = new Response('{"someField": "someValue"}', { status: 400 });
    const result = parseDomainError(mockResponse, '{"someField": "someValue"}');
    
    expect(result.error).toBe('Domain server error: {"someField": "someValue"}');
    expect(result.code).toBe('DOMAIN_INVALID_RESPONSE');
    expect(result.message).toContain('400');
  });

  test('should handle JSON error response with missing message', () => {
    const mockResponse = new Response(JSON.stringify({
      error: 'Test error',
      code: 'TEST_ERROR'
    }), { status: 422 });
    
    const text = JSON.stringify({
      error: 'Test error',
      code: 'TEST_ERROR'
    });
    
    const result = parseDomainError(mockResponse, text);
    expect(result.error).toBe('Test error');
    expect(result.code).toBe('TEST_ERROR');
    expect(result.message).toContain('422');
  });
});