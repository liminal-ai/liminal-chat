export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

import { ProviderStreamEvent } from "@liminal-chat/shared-types";

export interface ILLMProvider {
  generate(input: string | Message[]): Promise<LlmResponse>;
  generateStream?(
    input: string | Message[],
    originalRequestParams?: any,
    lastEventId?: string,
  ): AsyncIterable<ProviderStreamEvent>;
  getName(): string;
  isAvailable(): boolean;
}
