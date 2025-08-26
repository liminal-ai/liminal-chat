import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MessageView from './ChatMessage';
import { useChatStream } from '../../hooks/useChatStream';
import { Composer } from './Composer';
import type { Capability } from '@/types/chat';
import { ProvenancePill } from './ProvenancePill';

interface CenterChatShellProps {
  threadId: string;
  capability: Capability;
  onScrollChange?: (scrolled: boolean) => void;
}

const ESTIMATED_ROW_PX = 88;
const BUFFER_ROWS = 6;

export const CenterChatShell: React.FC<CenterChatShellProps> = ({
  threadId,
  capability,
  onScrollChange,
}) => {
  const { messages, status, error, send, cancel, retry } = useChatStream(threadId, capability);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastOverlay = useRef<boolean>(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [showJump, setShowJump] = useState(false);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scTop = el.scrollTop;
    // Show a subtle top fade only when near the top (but not at exact top)
    // Standard behavior: show overlay whenever content is scrolled away from top
    const showOverlay = scTop > 0;
    if (showOverlay !== lastOverlay.current) {
      lastOverlay.current = showOverlay;
      onScrollChange?.(showOverlay);
    }
    setScrollTop(scTop);
    setClientHeight(el.clientHeight);
    const distanceFromBottom = el.scrollHeight - scTop - el.clientHeight;
    setShowJump(distanceFromBottom > 300);
  }, [onScrollChange]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Initialize
    handleScroll();
    el.addEventListener('scroll', handleScroll);
    return () => {
      el.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Simple windowing based on estimated heights
  const total = messages.length;
  const startIndex = Math.max(0, Math.floor(scrollTop / ESTIMATED_ROW_PX) - BUFFER_ROWS);
  const endIndex = Math.min(
    total,
    Math.ceil((scrollTop + clientHeight) / ESTIMATED_ROW_PX) + BUFFER_ROWS,
  );
  const visible = useMemo(
    () => messages.slice(startIndex, endIndex),
    [messages, startIndex, endIndex],
  );
  const topSpacer = startIndex * ESTIMATED_ROW_PX;
  const bottomSpacer = Math.max(0, (total - endIndex) * ESTIMATED_ROW_PX);

  const jumpToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, []);

  return (
    <div className="flex flex-col h-full" data-testid="center-chat">
      {/* Subheader */}
      <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Chat Session — Ready for streaming · {messages.length} messages
        </div>
      </div>

      {/* Messages Container - Ready for virtualization */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-4"
        data-testid="center-chat-list"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'End') {
            e.preventDefault();
            jumpToBottom();
          }
        }}
      >
        {/* Windowed list */}
        <div style={{ height: topSpacer }} />
        <div className="space-y-4">
          {visible.map((m) => (
            <div key={m.id} className="space-y-1">
              <MessageView message={m} />
              {m.role === 'assistant' && m.metadata?.provenance && (
                <div className="pl-4">
                  <ProvenancePill provenance={m.metadata.provenance} />
                </div>
              )}
            </div>
          ))}
          {status === 'error' && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error || 'Stream error'}
              <button
                className="ml-3 px-2 py-1 rounded bg-zinc-900 text-white text-xs dark:bg-zinc-200 dark:text-zinc-900"
                onClick={retry}
              >
                Retry
              </button>
            </div>
          )}
        </div>
        <div style={{ height: bottomSpacer }} />

        {showJump && (
          <button
            onClick={jumpToBottom}
            className="fixed bottom-24 right-6 px-3 py-2 rounded-full bg-zinc-900 text-white text-xs shadow-md hover:bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white"
          >
            Jump to bottom
          </button>
        )}
      </div>

      {/* Sticky Composer */}
      <div
        className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-950"
        data-testid="composer"
      >
        <div className="max-w-4xl mx-auto">
          <Composer
            status={status}
            onSend={(t) => {
              const nearBottom = (() => {
                const el = scrollRef.current;
                if (!el) return true;
                const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
                return distance < 200;
              })();
              send(t, {
                onToken: () => {
                  if (nearBottom) {
                    // Re-evaluate nearness each token; if still near, keep pinned
                    const el = scrollRef.current;
                    if (!el) return;
                    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
                    if (distance < 200) el.scrollTop = el.scrollHeight;
                  }
                },
              });
            }}
            onCancel={cancel}
          />
        </div>
      </div>
    </div>
  );
};
