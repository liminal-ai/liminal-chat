import { Injectable } from "@nestjs/common";
import { ILLMProvider, LlmResponse, Message } from "../llm-provider.interface";
import { ProviderStreamEvent } from "@liminal-chat/shared-types";

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

  async *generateStream(
    input: string | Message[],
  ): AsyncIterable<ProviderStreamEvent> {
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

    // Simulate streaming by yielding one word at a time with proper event format
    for (let i = 0; i < words.length; i++) {
      yield {
        type: "content",
        data: words[i] + " ",
        eventId: `echo-${Date.now()}-${i}`,
      };
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Yield usage data at the end
    const promptTokens = Math.ceil(textContent.length / 4);
    const completionTokens = Math.ceil(response.length / 4);

    yield {
      type: "usage",
      data: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        model: "echo-1.0",
      },
      eventId: `echo-${Date.now()}-usage`,
    };

    // Yield done event
    yield {
      type: "done",
      eventId: `echo-${Date.now()}-done`,
    };
  }

  getName(): string {
    return "echo";
  }

  isAvailable(): boolean {
    return true;
  }
}
