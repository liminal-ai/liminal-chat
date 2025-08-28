import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import MessageView from './ChatMessage';
import { useChatStream } from '../../hooks/useChatStream';
import { Composer } from './Composer';
import type { Capability } from '@/types/chat';
import { ProvenancePill } from './ProvenancePill';

interface CenterChatShellProps {
  threadId: string;
  capability: Capability;
  rag?: unknown;
  onScrollChange?: (scrolled: boolean) => void;
}

// NOTE: We temporarily removed naive estimated-height virtualization to fix
// scroll jumping. We’ll reintroduce variable-size virtualization later.

export const CenterChatShell: React.FC<CenterChatShellProps> = ({
  threadId,
  capability,
  rag,
  onScrollChange,
}) => {
  const { messages, status, error, send, cancel, retry } = useChatStream(threadId, capability);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);
  const pinnedToBottomRef = useRef<boolean>(true);
  const lastOverlay = useRef<boolean>(false);
  // No need to track scrollTop/clientHeight for windowing anymore.
  const [showJump, setShowJump] = useState(false);
  const animRef = useRef<number | null>(null); // rAF id for inertial follow
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // How close to bottom we consider "pinned" (px)
  const AUTO_FOLLOW_THRESHOLD = 240;

  // helper removed; we rely on kickFollow() or direct scrolls

  // Inertial follow: smoothly approach the bottom while pinned.
  const cancelFollow = useCallback(() => {
    if (animRef.current != null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  }, []);

  const kickFollow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (!pinnedToBottomRef.current) return;
    if (prefersReducedMotion) {
      // Respect user preference: jump, no animation.
      el.scrollTop = el.scrollHeight;
      return;
    }
    if (animRef.current != null) return; // already animating
    const step = () => {
      // Stop if user scrolled away or element vanished
      const elNow = scrollRef.current;
      if (!elNow || !pinnedToBottomRef.current) {
        animRef.current = null;
        return;
      }
      const maxTop = Math.max(0, elNow.scrollHeight - elNow.clientHeight);
      const curr = elNow.scrollTop;
      const delta = maxTop - curr;
      if (Math.abs(delta) < 0.5) {
        elNow.scrollTop = maxTop;
        animRef.current = null;
        return;
      }
      // Ease 35% toward target each frame (feels natural, adapts as content grows)
      elNow.scrollTop = curr + delta * 0.35;
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  }, [prefersReducedMotion]);

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
    const distanceFromBottom = el.scrollHeight - scTop - el.clientHeight;
    // Show chip when clearly not at bottom
    setShowJump(distanceFromBottom > 300);
    // Update "pinned" state so we auto-follow only when near bottom
    pinnedToBottomRef.current = distanceFromBottom < AUTO_FOLLOW_THRESHOLD;
    if (!pinnedToBottomRef.current) {
      // If the user scrolled away, stop any running animation
      if (animRef.current != null) cancelFollow();
    }
  }, [onScrollChange, cancelFollow]);

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

  // When new messages are appended (user submit or assistant row created),
  // follow the bottom smoothly if we were already near it.
  useEffect(() => {
    if (!pinnedToBottomRef.current) return;
    // Coalesce into one smooth animator instead of many tiny jumps
    const id = requestAnimationFrame(() => kickFollow());
    return () => cancelAnimationFrame(id);
    // Only care that the list length changed; token updates are handled in onToken
  }, [messages.length, kickFollow]);

  // Cleanup any pending animation on unmount
  useEffect(() => () => cancelFollow(), [cancelFollow]);

  // Removed windowing; render full list to avoid jumpiness for now.

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

      {/* Messages Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-4 [overflow-anchor:none] [overscroll-behavior:contain] [scrollbar-gutter:stable]"
        data-testid="center-chat-list"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'End') {
            e.preventDefault();
            jumpToBottom();
          }
        }}
      >
        <div className="space-y-4">
          {messages.map((m) => (
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
        {/* Sentinel helps smooth scrollToBottom target and future virtualization */}
        <div ref={bottomSentinelRef} data-testid="bottom-sentinel" />

        {showJump && (
          <button
            onClick={jumpToBottom}
            className="fixed bottom-24 right-6 px-3 py-2 rounded bg-zinc-900 text-white text-sm shadow-sm hover:opacity-90 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white"
            aria-label="Jump to bottom"
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
            onSend={(t, opts) => {
              // Snapshot whether we were near the bottom right before sending
              const wasPinned = (() => {
                const el = scrollRef.current;
                if (!el) return true;
                const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
                return distance < AUTO_FOLLOW_THRESHOLD;
              })();
              send(t, {
                onToken: () => {
                  // While streaming, keep a single smooth animator running.
                  if (!pinnedToBottomRef.current) return;
                  kickFollow();
                },
                artifactIds: opts?.artifactIds,
                rag,
              });
              // After we optimistically append the user message, follow if we were pinned
              if (wasPinned) {
                requestAnimationFrame(() => kickFollow());
              }
            }}
            onCancel={cancel}
          />
        </div>
      </div>
    </div>
  );
};
