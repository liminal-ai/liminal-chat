import { useCallback, useRef, useState } from 'react';
import type { ChatMessage, StreamStatus, Capability, MessageProvenance } from '../types/chat';

type SendOptions = {
  onToken?: (chunk: string) => void;
  artifactIds?: string[];
  rag?: unknown;
};

export function useChatStream(threadId: string, capability: Capability) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<StreamStatus>('idle');
  const [error, setError] = useState<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const pendingAssistantId = useRef<string | null>(null);
  const lastUserId = useRef<string | null>(null);
  const lastPayload = useRef<{ text: string } | null>(null);

  const appendAssistant = useCallback((id: string, chunk: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text: m.text + chunk } : m)));
  }, []);

  const addMessage = useCallback((m: ChatMessage) => {
    setMessages((prev) => [...prev, m]);
  }, []);

  const startAssistant = useCallback(() => {
    const id = `a_${Date.now()}`;
    pendingAssistantId.current = id;
    addMessage({
      id,
      threadId,
      role: 'assistant',
      text: '',
      ts: Date.now(),
      pending: true,
      metadata: {},
    });
    return id;
  }, [addMessage, threadId]);

  const finalizeAssistant = useCallback(() => {
    const id = pendingAssistantId.current;
    if (!id) return;
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, pending: false } : m)));
    pendingAssistantId.current = null;
  }, []);

  const send = useCallback(
    async (text: string, opts?: SendOptions) => {
      setError(undefined);
      setStatus('sending');
      lastPayload.current = { text };

      const userId = `u_${Date.now()}`;
      lastUserId.current = userId;
      addMessage({
        id: userId,
        threadId,
        role: 'user',
        text,
        ts: Date.now(),
        metadata: { artifactIds: opts?.artifactIds ?? [] },
      });

      const controller = new AbortController();
      abortRef.current = controller;

      let stream: AsyncGenerator<string, void, void> | null = null;
      let metaFromServer: MessageProvenance | null = null;
      const startedAt = Date.now();
      try {
        // Try real endpoint using fetch + ReadableStream of SSE
        const res = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadId,
            text,
            capability,
            artifactIds: opts?.artifactIds ?? [],
            rag: opts?.rag ?? null,
          }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

        setStatus('streaming');
        const reader = res.body.getReader();
        let buffer = '';
        stream = (async function* () {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += new TextDecoder().decode(value);
            // naive SSE parse: lines starting with 'data: ' under event: token
            const parts = buffer.split('\n\n');
            buffer = parts.pop() || '';
            for (const part of parts) {
              const lines = part.split('\n');
              let event: string | null = null;
              let data = '';
              for (const ln of lines) {
                if (ln.startsWith('event:')) event = ln.slice(6).trim();
                else if (ln.startsWith('data:')) data += ln.slice(5).trim();
              }
              if (event === 'token') yield data;
              if (event === 'meta') {
                try {
                  const obj = JSON.parse(data);
                  const p = obj && obj.provenance ? obj.provenance : obj;
                  metaFromServer = { capability, ...p } as MessageProvenance;
                } catch {
                  // ignore malformed meta
                }
              }
              if (event === 'error') throw new Error(data || 'stream error');
              if (event === 'done') return;
            }
          }
        })();
      } catch {
        // fallback
        setStatus('streaming');
        const mod = await import('../devapi/mockStream');
        const { stream: mock, meta } = await mod.mockStream(text, capability);
        stream = mock;
        metaFromServer = meta;
      }

      const aId = startAssistant();
      // Attach same artifactIds to assistant for display grouping
      if (opts?.artifactIds && opts.artifactIds.length > 0) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aId
              ? { ...m, metadata: { ...(m.metadata || {}), artifactIds: opts.artifactIds } }
              : m,
          ),
        );
      }
      if (metaFromServer) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aId
              ? { ...m, metadata: { ...(m.metadata || {}), provenance: metaFromServer! } }
              : m,
          ),
        );
      }
      try {
        for await (const chunk of stream!) {
          appendAssistant(aId, chunk);
          opts?.onToken?.(chunk);
        }
        // If we have provenance but no latency, compute roughly
        if (metaFromServer && !metaFromServer.latencyMs) {
          const latency = Date.now() - startedAt;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aId
                ? {
                    ...m,
                    metadata: {
                      ...(m.metadata || {}),
                      provenance: { ...metaFromServer!, latencyMs: latency },
                    },
                  }
                : m,
            ),
          );
        }
        finalizeAssistant();
        setStatus('idle');
      } catch (e: unknown) {
        setStatus('error');
        setMessages((prev) => prev.map((m) => (m.id === aId ? { ...m, pending: false } : m)));
        const msg = e instanceof Error ? e.message : 'Streaming failed';
        setError(msg);
      }
    },
    [addMessage, appendAssistant, capability, finalizeAssistant, startAssistant, threadId],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    const id = pendingAssistantId.current;
    if (id) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, pending: false, stopped: true } : m)),
      );
      pendingAssistantId.current = null;
    }
    setStatus('idle');
  }, []);

  const retry = useCallback(() => {
    if (!lastPayload.current) return;
    setStatus('idle');
    void send(lastPayload.current.text);
  }, [send]);

  const onTokenAppended = useCallback(() => {
    // Reserved for external scroll logic if needed
  }, []);

  return { messages, status, error, send, cancel, retry, onTokenAppended } as const;
}

export default useChatStream;
