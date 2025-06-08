// Stream error taxonomy for SSE streaming

/**
 * Categorized error codes for SSE streaming operations.
 * 
 * Error code ranges:
 * - 1xxx: Network-related errors
 * - 2xxx: Provider-related errors  
 * - 3xxx: Stream parsing errors
 * - 4xxx: Client request errors
 */
export enum StreamErrorCode {
  // Network errors (1xxx)
  NETWORK_ERROR = 1000,
  CONNECTION_TIMEOUT = 1001,
  CONNECTION_LOST = 1002,
  
  // Provider errors (2xxx)
  PROVIDER_UNAVAILABLE = 2000,
  PROVIDER_RATE_LIMIT = 2001,
  PROVIDER_INVALID_RESPONSE = 2002,
  
  // Stream parsing errors (3xxx)
  INVALID_SSE_FORMAT = 3000,
  MALFORMED_JSON = 3001,
  UNEXPECTED_STREAM_END = 3002,
  
  // Client errors (4xxx)
  INVALID_REQUEST = 4000,
  AUTHENTICATION_FAILED = 4001,
  INSUFFICIENT_QUOTA = 4002,
}

/**
 * User-facing error messages mapped to stream error codes.
 * Frozen to prevent runtime modifications.
 */
export const STREAM_ERROR_MESSAGES: Record<StreamErrorCode, string> = {
  [StreamErrorCode.NETWORK_ERROR]: "Network error occurred during streaming",
  [StreamErrorCode.CONNECTION_TIMEOUT]: "Connection timed out",
  [StreamErrorCode.CONNECTION_LOST]: "Connection lost. Attempting to reconnect...",
  [StreamErrorCode.PROVIDER_UNAVAILABLE]: "AI provider temporarily unavailable",
  [StreamErrorCode.PROVIDER_RATE_LIMIT]: "Rate limit exceeded. Please try again later",
  [StreamErrorCode.PROVIDER_INVALID_RESPONSE]: "Invalid response from AI provider",
  [StreamErrorCode.INVALID_SSE_FORMAT]: "Invalid streaming format received",
  [StreamErrorCode.MALFORMED_JSON]: "Malformed data received from provider",
  [StreamErrorCode.UNEXPECTED_STREAM_END]: "Stream ended unexpectedly",
  [StreamErrorCode.INVALID_REQUEST]: "Invalid request format",
  [StreamErrorCode.AUTHENTICATION_FAILED]: "Authentication failed",
  [StreamErrorCode.INSUFFICIENT_QUOTA]: "Insufficient quota for this request",
} as const;