import type React from 'react';
import type { Artifact } from '@/types/chat';

export const ArtifactChip: React.FC<{
  artifact: Artifact;
  onRemove?: () => void;
}> = ({ artifact, onRemove }) => {
  const icon =
    artifact.type === 'doc'
      ? '📄'
      : artifact.type === 'code'
        ? '💻'
        : artifact.type === 'img'
          ? '🖼️'
          : '📊';
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-700 dark:text-zinc-300">
      <span aria-hidden>{icon}</span>
      <span className="max-w-[180px] truncate">{artifact.name}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 px-1"
          aria-label={`Remove ${artifact.name}`}
        >
          ×
        </button>
      )}
    </span>
  );
};

export default ArtifactChip;
