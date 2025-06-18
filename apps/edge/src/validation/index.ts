import { ERROR_CODES } from '@liminal-chat/shared-utils';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface EdgeError {
  error: string;
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Validates request content type
 * Should accept: application/json, application/json; charset=utf-8
 * Should reject: text/plain, undefined, etc.
 */
export function validateContentType(contentType: string): ValidationResult {
  if (!contentType || !contentType.includes('application/json')) {
    return {
      isValid: false,
      errors: ['Content-Type must be application/json']
    };
  }
  
  return {
    isValid: true,
    errors: []
  };
}

/**
 * Validates request size against maximum limit
 * Default max size is 1MB to enforce Cloudflare Workers limits
 */
export function validateRequestSize(body: string, maxBytes: number = 1024 * 1024): ValidationResult {
  const bodySize = new TextEncoder().encode(body).length;
  
  if (bodySize > maxBytes) {
    return {
      isValid: false,
      errors: [`Request too large - size ${bodySize} bytes exceeds limit of ${maxBytes} bytes`]
    };
  }
  
  return {
    isValid: true,
    errors: []
  };
}

/**
 * Validates prompt request body structure
 * Rules:
 * - Must have either 'prompt' XOR 'messages' (not both, not neither)
 * - 'prompt' must be non-empty string if present
 * - 'messages' must be non-empty array with valid message objects if present
 */
export function validatePromptRequest(data: any): ValidationResult {
  // Check if request body is valid
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Invalid request body - must be a valid JSON object']
    };
  }

  const hasPrompt = data.prompt !== undefined && data.prompt !== null;
  const hasMessages = data.messages !== undefined && data.messages !== null;

  // Exactly one should be provided (XOR logic)
  if (!(hasPrompt && !hasMessages) && !(!hasPrompt && hasMessages)) {
    return {
      isValid: false,
      errors: ['Either prompt or messages must be provided, but not both']
    };
  }

  // Validate prompt if provided
  if (hasPrompt) {
    if (typeof data.prompt !== 'string' || data.prompt.trim() === '') {
      return {
        isValid: false,
        errors: ['Prompt cannot be empty or whitespace only']
      };
    }
  }

  // Validate messages if provided
  if (hasMessages) {
    if (!Array.isArray(data.messages) || data.messages.length === 0) {
      return {
        isValid: false,
        errors: ['Messages must be a non-empty array']
      };
    }
  }

  return {
    isValid: true,
    errors: []
  };
}

/**
 * Parses Domain error response and extracts proper error structure
 * Handles both JSON error responses and plain text responses
 * Returns consistent error structure for Edge client consumption
 */
export function parseDomainError(response: Response, text: string): { error: string; code: string; message: string } {
  try {
    const parsed = JSON.parse(text);
    
    // If Domain returned a structured error, extract the fields
    if (parsed && typeof parsed === 'object' && parsed.error && parsed.code) {
      return {
        error: parsed.error,
        code: parsed.code,
        message: parsed.message || `Domain service error: ${response.status} ${response.statusText}`
      };
    }
    
    // If JSON but not structured error, treat as raw content
    return {
      error: `Domain server error: ${text}`,
      code: ERROR_CODES.DOMAIN.INVALID_RESPONSE,
      message: `Domain service returned error: ${response.status} ${response.statusText}`
    };
  } catch {
    // Not JSON, treat as raw text
    return {
      error: `Domain server error: ${text}`,
      code: ERROR_CODES.DOMAIN.INVALID_RESPONSE,
      message: `Domain service returned error: ${response.status} ${response.statusText}`
    };
  }
}