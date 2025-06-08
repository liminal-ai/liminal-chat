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

export interface ILLMProvider {
  generate(input: string | Message[]): Promise<LlmResponse>;
  generateStream?(input: string | Message[]): AsyncIterable<string>;
  getName(): string;
  isAvailable(): boolean;
}
