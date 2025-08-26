import type React from 'react';
import { useMemo } from 'react';
import type { ChatMessage as ChatMsg } from '@/types/chat';

function formatTime(ts: number): string {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function parseBlocks(text: string): Array<{ type: 'code' | 'text'; content: string }> {
  const lines = text.split(/\r?\n/);
  const parts: Array<{ type: 'code' | 'text'; content: string }> = [];
  let inCode = false;
  let buffer: string[] = [];

  const flush = (type: 'code' | 'text') => {
    if (buffer.length) {
      parts.push({ type, content: buffer.join('\n') });
      buffer = [];
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith('```') && !inCode) {
      // start code block
      flush('text');
      inCode = true;
      continue;
    }
    if (line.trim().startsWith('```') && inCode) {
      // end code block
      flush('code');
      inCode = false;
      continue;
    }
    buffer.push(line);
  }

  flush(inCode ? 'code' : 'text');
  return parts;
}

export default function ChatMessage({ message }: { message: ChatMsg }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';

  const containerAlign = isUser ? 'justify-end' : 'justify-start';
  const bubbleClass = isSystem
    ? 'border border-zinc-200 dark:border-zinc-700 bg-transparent'
    : isUser
      ? 'bg-zinc-100 dark:bg-zinc-900 ml-12'
      : 'bg-sky-50 dark:bg-sky-900/20 mr-12';

  const parts = useMemo(() => parseBlocks(message.text), [message.text]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
    } catch {
      // no-op
    }
  };

  return (
    <div className={`flex ${containerAlign}`} data-testid={`msg-${message.id}`}>
      <div className={`max-w-2xl rounded-lg p-4 ${bubbleClass}`}>
        <div className="flex items-start gap-3">
          {/* Avatar placeholder */}
          <div
            className={`w-8 h-8 rounded-full mt-0.5 ${
              isUser
                ? 'bg-zinc-300'
                : isAssistant
                  ? 'bg-sky-200 dark:bg-sky-800'
                  : 'bg-zinc-200 dark:bg-zinc-700'
            }`}
            aria-hidden="true"
          />
          <div className="flex-1">
            {parts.map((p, idx) =>
              p.type === 'code' ? (
                <pre
                  key={idx}
                  className="font-mono text-[13px] whitespace-pre overflow-auto rounded bg-zinc-50 dark:bg-zinc-900 p-3 mb-2"
                >
                  {p.content}
                </pre>
              ) : (
                <div key={idx} className="whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">
                  {p.content}
                </div>
              ),
            )}
            <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>{formatTime(message.ts)}</span>
              <button
                onClick={copy}
                className="px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Copy message"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
