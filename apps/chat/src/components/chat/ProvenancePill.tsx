import type React from 'react';
import type { MessageProvenance } from '@/types/chat';

const CAP_LABEL: Record<MessageProvenance['capability'], string> = {
  fast: 'Fast',
  smart: 'Smart',
  deep: 'Deep',
  'deep-thinking': 'Deep+T',
};

export const ProvenancePill: React.FC<{ provenance: MessageProvenance }> = ({ provenance }) => {
  const parts: string[] = [];
  parts.push(CAP_LABEL[provenance.capability]);
  if (provenance.brandHint) parts.push(provenance.brandHint);

  const metrics: string[] = [];
  if (typeof provenance.latencyMs === 'number') metrics.push(`${provenance.latencyMs}ms`);
  if (typeof provenance.tokensIn === 'number') metrics.push(`${provenance.tokensIn} in`);
  if (typeof provenance.tokensOut === 'number') metrics.push(`${provenance.tokensOut} out`);

  return (
    <div className="inline-flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
        <span className="font-medium">{parts.join(' · ')}</span>
        {metrics.length > 0 && <span className="text-zinc-500">· {metrics.join(' · ')}</span>}
      </span>
      {provenance.whyChosen && <span className="text-zinc-500">— {provenance.whyChosen}</span>}
    </div>
  );
};

export default ProvenancePill;
