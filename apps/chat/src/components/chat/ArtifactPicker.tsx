import type React from 'react';
import { useMemo, useState } from 'react';
import { MOCK_ARTIFACTS } from '@/devapi/mockArtifacts';

interface ArtifactPickerProps {
  initialSelected?: string[];
  onConfirm: (ids: string[]) => void;
  onCancel: () => void;
}

export const ArtifactPicker: React.FC<ArtifactPickerProps> = ({
  initialSelected = [],
  onConfirm,
  onCancel,
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const list = useMemo(() => MOCK_ARTIFACTS, []);
  return (
    <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg w-80">
      <div className="text-sm font-medium mb-2 text-zinc-800 dark:text-zinc-100">
        Attach artifacts
      </div>
      <div
        className="max-h-56 overflow-auto divide-y divide-zinc-200 dark:divide-zinc-800"
        role="listbox"
        aria-label="Artifacts"
      >
        {list.map((a) => (
          <label key={a.id} className="flex items-center gap-2 py-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={selected.has(a.id)}
              onChange={() => toggle(a.id)}
              aria-label={`Select ${a.name}`}
            />
            <span className="w-5 text-center" aria-hidden>
              {a.type === 'doc' ? '📄' : a.type === 'code' ? '💻' : a.type === 'img' ? '🖼️' : '📊'}
            </span>
            <span className="truncate text-zinc-800 dark:text-zinc-200">{a.name}</span>
          </label>
        ))}
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm rounded border border-zinc-300 dark:border-zinc-700"
        >
          Cancel
        </button>
        <button
          onClick={() => onConfirm(Array.from(selected))}
          className="px-3 py-1.5 text-sm rounded bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900"
        >
          Attach
        </button>
      </div>
    </div>
  );
};

export default ArtifactPicker;
