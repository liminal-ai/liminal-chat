import { ProviderStreamEvent } from '@liminal-chat/shared-types';

export interface StreamDisplayOptions {
  showUsage?: boolean;
  clearOnReconnect?: boolean;
  errorPrefix?: string;
}

export class StreamingDisplayHandler {
  private content: string = '';
  private lastEventId?: string;
  private isComplete: boolean = false;

  constructor(private options: StreamDisplayOptions = {}) {
    this.options = {
      showUsage: true,
      clearOnReconnect: true,
      errorPrefix: '[ERROR]',
      ...options
    };
  }

  processEvent(event: ProviderStreamEvent): void {
    this.lastEventId = event.eventId;

    switch (event.type) {
      case 'content':
        this.content += event.data;
        process.stdout.write(event.data);
        break;

      case 'usage':
        if (this.options.showUsage) {
          const usage = event.data;
          const usageText = `\n\n[Model: ${usage.model} | Tokens: ${usage.totalTokens} (${usage.promptTokens}+${usage.completionTokens})]`;
          process.stdout.write(usageText);
        }
        break;

      case 'done':
        this.isComplete = true;
        process.stdout.write('\n');
        break;

      case 'error':
        const errorMsg = `${this.options.errorPrefix} ${event.data.message}\n`;
        process.stderr.write(errorMsg);
        break;

      default:
        // Ignore unknown event types
        break;
    }
  }

  clear(): void {
    if (this.options.clearOnReconnect) {
      // Move cursor to beginning of current content and clear
      const lines = this.content.split('\n').length;
      if (lines > 1) {
        process.stdout.write(`\x1b[${lines - 1}A`); // Move cursor up
      }
      process.stdout.write('\x1b[0J'); // Clear from cursor to end
      this.content = '';
      this.isComplete = false;
    }
  }

  getLastEventId(): string | undefined {
    return this.lastEventId;
  }

  getContent(): string {
    return this.content;
  }

  isStreamComplete(): boolean {
    return this.isComplete;
  }

  displayReconnectMessage(): void {
    process.stdout.write('\n[Connection lost. Attempting to reconnect...]\n');
  }

  displayReconnectSuccess(): void {
    process.stdout.write('[Reconnected. Restarting stream...]\n');
  }

  displayReconnectFailure(): void {
    process.stderr.write('[Reconnection failed. Please try your command again.]\n');
  }
}