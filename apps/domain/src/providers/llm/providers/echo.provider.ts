import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ILLMProvider,
  LlmResponse,
  Message,
  StreamRequestParams,
} from "../llm-provider.interface";
import {
  ProviderStreamEvent,
  StreamErrorCode,
} from "@liminal-chat/shared-types";

@Injectable()
export class EchoProvider implements ILLMProvider {
  constructor(private readonly configService: ConfigService) {}
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
    originalRequestParams?: StreamRequestParams,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lastEventId?: string,
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

    // Extract timeout and signal from request params
    const defaultTimeout = this.configService.get<number>(
      "ECHO_PROVIDER_TIMEOUT",
      30000,
    );
    const timeout = originalRequestParams?.timeout || defaultTimeout;
    const signal = originalRequestParams?.signal;
    const defaultWordDelay = this.configService.get<number>(
      "ECHO_PROVIDER_WORD_DELAY",
      50,
    );
    const wordDelay = originalRequestParams?.wordDelay || defaultWordDelay;

    // Set up timeout handling
    const startTime = Date.now();
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), timeout);

    try {
      // Simulate streaming by yielding one word at a time
      for (let i = 0; i < words.length; i++) {
        // Check for external cancellation
        if (signal?.aborted) {
          yield {
            type: "error",
            data: {
              message: "Request cancelled by client",
              code: StreamErrorCode.CONNECTION_TIMEOUT,
              retryable: false,
            },
            eventId: `echo-${Date.now()}-cancelled`,
          };
          return;
        }

        // Check for timeout
        if (
          timeoutController.signal.aborted ||
          Date.now() - startTime > timeout
        ) {
          yield {
            type: "error",
            data: {
              message: "Echo provider timeout",
              code: StreamErrorCode.CONNECTION_TIMEOUT,
              retryable: true,
            },
            eventId: `echo-${Date.now()}-timeout`,
          };
          return;
        }

        const word = words[i];
        yield {
          type: "content",
          data: {
            delta: word + " ",
            model: "echo-1.0",
          },
          eventId: `echo-${Date.now()}-${i}`,
        };

        // Simulate network delay, but check for cancellation during delay
        await new Promise<void>((resolve, reject) => {
          const delayTimeout = setTimeout(() => resolve(), wordDelay);

          // Listen for cancellation during delay
          const checkCancellation = () => {
            if (signal?.aborted || timeoutController.signal.aborted) {
              clearTimeout(delayTimeout);
              reject(new Error("Cancelled during delay"));
            }
          };

          signal?.addEventListener("abort", checkCancellation);
          timeoutController.signal.addEventListener("abort", checkCancellation);

          // Clean up listeners after delay
          setTimeout(() => {
            signal?.removeEventListener("abort", checkCancellation);
            timeoutController.signal.removeEventListener(
              "abort",
              checkCancellation,
            );
          }, wordDelay);
        }).catch(() => {
          // Cancellation occurred during delay, just return without yielding more
          return;
        });
      }

      // Send completion event if we made it through all words
      yield {
        type: "done",
        data: "[DONE]",
        eventId: `echo-${Date.now()}-done`,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  getName(): string {
    return "echo";
  }

  isAvailable(): boolean {
    return true;
  }
}
