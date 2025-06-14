/**
 * Security utilities for scrubbing sensitive data from logs and error messages
 */

// Simple patterns that match sensitive values
const SENSITIVE_PATTERNS = [
  // API Keys - various formats (order matters, most specific first)
  /sk-[a-zA-Z0-9\-_]{20,}/gi, // OpenAI API keys
  /pk-[a-zA-Z0-9\-_]{20,}/gi, // OpenAI project keys
  /xai-[a-zA-Z0-9\-_]{20,}/gi, // Anthropic/xAI keys
  /claude-[a-zA-Z0-9\-_]{20,}/gi, // Claude API keys
  /Bearer\s+[a-zA-Z0-9\-_.]{20,}/gi, // Bearer tokens
  /api[_-]?key["']\s*[:=]\s*["'][a-zA-Z0-9\-_.]{20,}["']/gi, // JSON/config API keys
  /token["']\s*[:=]\s*["'][a-zA-Z0-9\-_.]{20,}["']/gi, // JSON/config tokens
  /password["']\s*[:=]\s*["'][^"']+["']/gi, // Passwords in JSON/config
  /secret["']\s*[:=]\s*["'][^"']+["']/gi, // Secrets in JSON/config
  /authorization:\s*["']?[a-zA-Z0-9\-_.]{20,}["']?/gi, // Authorization headers
  /\bghp_[a-zA-Z0-9]{36}\b/gi, // GitHub personal access tokens
  /\bgho_[a-zA-Z0-9]{36}\b/gi, // GitHub OAuth tokens
  /\bghs_[a-zA-Z0-9]{36}\b/gi, // GitHub server tokens
  /\bghr_[a-zA-Z0-9]{36}\b/gi, // GitHub refresh tokens
  /\bAKIA[0-9A-Z]{16}\b/gi, // AWS Access Key IDs
  /\b[0-9a-zA-Z+/]{40,}\b/gi, // AWS Secret Access Keys (base64, 40+ chars)
  /\b[a-zA-Z0-9\-_]{32,}\b/gi, // Generic long tokens (must be last)
];

const REPLACEMENT_TEXT = "[REDACTED]";

/**
 * Replaces sensitive data in a string with a redaction marker.
 *
 * Scans the input for known sensitive patterns (such as API keys, tokens, passwords, and secrets) and replaces any matches with "[REDACTED]".
 *
 * @param input - The string to sanitize.
 * @returns The input string with sensitive data redacted. If the input is not a string, it is returned unchanged.
 */
export function scrubSensitiveData(input: string): string {
  if (typeof input !== "string") {
    return input;
  }

  let scrubbed = input;

  for (const pattern of SENSITIVE_PATTERNS) {
    scrubbed = scrubbed.replace(pattern, REPLACEMENT_TEXT);
  }

  return scrubbed;
}

/**
 * Returns a sanitized error object with sensitive data redacted from message, stack trace, and name fields.
 *
 * Accepts any error-like input and produces an object safe for logging by removing sensitive information from string properties. Handles standard Error instances, string errors, and generic objects with string fields. For unrecognized types, returns a generic error message.
 *
 * @param error - The error or value to sanitize for logging.
 * @returns An object containing the scrubbed message, optional stack and name, and the original type of the input.
 */
export function scrubErrorForLogging(error: unknown): {
  message: string;
  stack?: string;
  name?: string;
  originalType: string;
} {
  if (error instanceof Error) {
    return {
      message: scrubSensitiveData(error.message),
      stack: error.stack ? scrubSensitiveData(error.stack) : undefined,
      name: error.name,
      originalType: "Error",
    };
  }

  if (typeof error === "string") {
    return {
      message: scrubSensitiveData(error),
      originalType: "string",
    };
  }

  if (error && typeof error === "object") {
    const errorObj = error as Record<string, unknown>;
    const scrubbed: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(errorObj)) {
      if (typeof value === "string") {
        scrubbed[key] = scrubSensitiveData(value);
      } else {
        scrubbed[key] = value;
      }
    }

    return {
      message:
        typeof scrubbed.message === "string"
          ? scrubbed.message
          : "Unknown error",
      stack: typeof scrubbed.stack === "string" ? scrubbed.stack : undefined,
      name: typeof scrubbed.name === "string" ? scrubbed.name : undefined,
      originalType: "object",
    };
  }

  return {
    message: "Unknown error type",
    originalType: typeof error,
  };
}
