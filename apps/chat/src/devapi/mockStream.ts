// Tiny mock streaming fallback for local dev.
// Returns a stream plus provenance metadata to simulate server "meta".
import type { Capability, MessageProvenance } from '@/types/chat';

async function* buildStream(
  target: string,
  totalChunks: number,
): AsyncGenerator<string, void, void> {
  const len = target.length;
  const avg = Math.max(1, Math.floor(len / totalChunks));
  let i = 0;
  while (i < len) {
    const jitter = Math.floor(Math.random() * Math.max(1, Math.floor(avg / 2)));
    const size = Math.min(len - i, avg + jitter);
    const chunk = target.slice(i, i + size);
    i += size;
    yield chunk;
    const delay = 1500 + Math.random() * 500;
    const step = delay / totalChunks;
    await new Promise((r) => setTimeout(r, step));
  }
}

export function mockStream(
  text: string,
  capability: Capability,
): { stream: AsyncGenerator<string, void, void>; meta: MessageProvenance } {
  const words = text.split(/\s+/).filter(Boolean);
  const repeat = Math.min(6, Math.max(3, Math.floor(words.length / 5)));
  const totalChunks = Math.max(10, Math.min(20, words.length + repeat));

  const base = `${text}\n\nSure — here's a thought: `;
  const target = (base + ' ' + words.concat(words.slice(0, repeat)).join(' ') + '.').trim();

  const brandByCap: Record<Capability, string> = {
    fast: 'GPT-5 mini',
    smart: 'Claude Sonnet 4',
    deep: 'GPT-5',
    'deep-thinking': 'GPT-5 Thinking',
  };

  const whyByCap: Record<Capability, string> = {
    fast: 'Quick response for low-latency ask',
    smart: 'Balanced cost vs. quality',
    deep: 'Complex reasoning and longer context',
    'deep-thinking': 'Multi-step reasoning prioritized',
  };

  const tokensIn = Math.max(1, Math.round(text.length / 4));
  const tokensOut = Math.max(8, Math.round(target.length / 5));
  const latencyMs = 1500 + Math.round(Math.random() * 500);

  const meta: MessageProvenance = {
    capability,
    brandHint: brandByCap[capability],
    whyChosen: whyByCap[capability],
    tokensIn,
    tokensOut,
    latencyMs,
  };

  const stream = buildStream(target, totalChunks);
  return { stream, meta };
}

export default { mockStream };
