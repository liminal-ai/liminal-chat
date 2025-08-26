import { useEffect, useMemo, useState } from 'react';
import type { ChatMessage } from '@/types/chat';
// Prefer Convex if available; otherwise use mock data.
// For this repo, the byThread query may not exist yet, so we default to mock.

// Static mock import keeps things working immediately in dev.
import sample from '@/devdata/thread.sample.json';

export function useThreadMessages(threadId?: string): {
  messages: ChatMessage[];
  isLoading: boolean;
} {
  // In the future, if a Convex query like api.messages.byThread exists,
  // we can switch to it here. For now, rely on the mock data.
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate async load for a realistic UX
    const timer = setTimeout(() => {
      try {
        const data = (sample as unknown as ChatMessage[]).slice().sort((a, b) => a.ts - b.ts);
        setMessages(data);
      } finally {
        setLoading(false);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [threadId]);

  return useMemo(() => ({ messages, isLoading: loading }), [messages, loading]);
}
