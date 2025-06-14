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
 * Validates that the provided content type is JSON.
 *
 * Accepts content types containing 'application/json' and rejects others.
 *
 * @param contentType - The value of the Content-Type header to validate.
 * @returns A {@link ValidationResult} indicating whether the content type is valid.
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
 * Validates that the request body does not exceed the specified maximum byte size.
 *
 * @param body - The request body as a string.
 * @param maxBytes - The maximum allowed size in bytes. Defaults to 1MB.
 * @returns A {@link ValidationResult} indicating whether the body size is within the allowed limit.
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
 * Validates that the input object for a prompt request contains exactly one of a non-empty string `prompt` or a non-empty array `messages`.
 *
 * Returns a validation result indicating whether the structure is valid, with error messages for any violations.
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
 * Parses a domain service error response and returns a standardized error object.
 *
 * Attempts to extract structured error information from a JSON response. If the response is not valid JSON or lacks expected fields, returns a generic error object with status information.
 *
 * @param response - The HTTP response object from the domain service.
 * @param text - The response body as a string.
 * @returns An object containing `error`, `code`, and `message` fields for consistent error handling.
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