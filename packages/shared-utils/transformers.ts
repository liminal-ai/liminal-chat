import { ChatCompletionResponse, DomainLLMResponse } from '@liminal-chat/shared-types';

/**
 * Transforms domain service response (camelCase) to edge API response (snake_case)
 */
export function domainToEdgeResponse(domainResponse: DomainLLMResponse): ChatCompletionResponse {
  return {
    content: domainResponse.content,
    model: domainResponse.model,
    usage: {
      prompt_tokens: domainResponse.usage.promptTokens,
      completion_tokens: domainResponse.usage.completionTokens
    }
  };
}

/**
 * Converts camelCase keys to snake_case (generic helper)
 */
export function camelToSnake(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => camelToSnake(item));
  }

  if (typeof obj === 'object') {
    const converted: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        converted[snakeKey] = camelToSnake(obj[key]);
      }
    }
    
    return converted;
  }

  return obj;
}

/**
 * Converts snake_case keys to camelCase (generic helper)
 */
export function snakeToCamel(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item));
  }

  if (typeof obj === 'object') {
    const converted: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        converted[camelKey] = snakeToCamel(obj[key]);
      }
    }
    
    return converted;
  }

  return obj;
}