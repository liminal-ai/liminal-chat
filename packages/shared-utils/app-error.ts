import { ERROR_CODES } from './error-codes';

export class AppError extends Error {
  constructor(
    public code: string,
    message?: string,
    public details?: unknown
  ) {
    super(message || `Error: ${code}`);
    this.name = 'AppError';
    
    // Capture stack trace (Node.js specific)
    const errorConstructor = Error as any;
    if (typeof errorConstructor.captureStackTrace === 'function') {
      errorConstructor.captureStackTrace(this, AppError);
    }

    // Log TODO errors in development (only in Node.js environment)
    // @ts-ignore - global may not exist in all environments
    const globalObj = typeof globalThis !== 'undefined' ? globalThis : 
                     typeof (globalThis as any).window !== 'undefined' ? (globalThis as any).window : 
                     {} as any;
    
    if (globalObj.process?.env?.NODE_ENV === 'development' && 
        code.startsWith('TODO_') &&
        globalObj.console) {
      globalObj.console.warn(`
⚠️  TODO Error Used: ${code}
   Message: ${message}
   Stack: ${this.stack}
   
   Please replace with a specific error code.
   See: docs/guides/engineering-practices.md#error-handling
`);
    }
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      details: this.details
    };
  }
}

// Convenience factory functions
export function createEdgeError(code: keyof typeof ERROR_CODES.EDGE, message?: string, details?: unknown) {
  return new AppError(ERROR_CODES.EDGE[code], message, details);
}

export function createDomainError(code: keyof typeof ERROR_CODES.DOMAIN, message?: string, details?: unknown) {
  return new AppError(ERROR_CODES.DOMAIN[code], message, details);
}

export function createTodoError(message: string, details?: unknown) {
  return new AppError(ERROR_CODES.TODO.NEEDS_SPECIFIC_CODE, message, details);
}