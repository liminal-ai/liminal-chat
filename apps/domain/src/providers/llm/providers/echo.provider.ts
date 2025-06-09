import { Injectable } from "@nestjs/common";
import { ILLMProvider, LlmResponse, Message } from "../llm-provider.interface";

@Injectable()
export class EchoProvider implements ILLMProvider {
  generate(input: string | Message[]): Promise<LlmResponse> {
    let textContent: string;

    if (typeof input === "string") {
      textContent = input;
    } else {
      // Concatenate only user and assistant messages, ignore system
      textContent = input
        .filter((msg) => msg.role !== "system")
        .map((msg) => msg.content)
        .join(" ");
    }

    const content = `Echo: ${textContent}`;
    const promptTokens = Math.ceil(textContent.length / 4);
    const completionTokens = Math.ceil(content.length / 4);

    return Promise.resolve({
      content,
      model: "echo-1.0",
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
    });
  }

  async *generateStream(input: string | Message[]): AsyncIterable<string> {
    let textContent: string;

    if (typeof input === "string") {
      textContent = input;
    } else {
      textContent = input
        .filter((msg) => msg.role !== "system")
        .map((msg) => msg.content)
        .join(" ");
    }

    const response = `Echo: ${textContent}`;
    const words = response.split(" ");

    // Simulate streaming by yielding one word at a time
    for (const word of words) {
      yield word + " ";
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  getName(): string {
    return "echo";
  }

  isAvailable(): boolean {
    return true;
  }
}
