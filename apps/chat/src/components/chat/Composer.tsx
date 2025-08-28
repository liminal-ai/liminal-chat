import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { StreamStatus } from '../../types/chat';
import { ArtifactPicker } from './ArtifactPicker';
import { ArtifactChip } from './ArtifactChip';
import { MOCK_ARTIFACTS_MAP } from '@/devapi/mockArtifacts';

interface ComposerProps {
  onSend: (text: string, opts?: { artifactIds?: string[] }) => void;
  onCancel: () => void;
  status: StreamStatus;
}

export const Composer: React.FC<ComposerProps> = ({ onSend, onCancel, status }) => {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [artifactIds, setArtifactIds] = useState<string[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = '0px';
    // Cap height to ~8-9 lines to avoid pushing layout too much
    el.style.height = Math.min(160, el.scrollHeight) + 'px';
  }, [value]);

  const disabled = status === 'sending' || status === 'streaming';

  const doSend = () => {
    const text = value.trim();
    if (!text || text.length > 8000) return;
    onSend(text, { artifactIds });
    setValue('');
    setArtifactIds([]);
    // return focus to textarea
    requestAnimationFrame(() => ref.current?.focus());
  };

  return (
    <div className="flex gap-2 items-end relative">
      <button
        className="h-9 w-9 shrink-0 self-end rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        title="Attach artifacts"
        aria-label="Attach"
        onClick={() => setShowPicker((s) => !s)}
        disabled={disabled}
      >
        +
      </button>
      <div className="flex-1 min-w-0">
        <textarea
          ref={ref}
          aria-label="Message"
          data-testid="composer-input"
          className="w-full bg-transparent outline-none text-sm leading-6 resize-none max-h-40 overflow-y-auto placeholder:text-zinc-400"
          placeholder="Type a message…"
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onInput={() => {
            const el = ref.current;
            if (!el) return;
            el.style.height = '0px';
            el.style.height = Math.min(160, el.scrollHeight) + 'px';
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!disabled) doSend();
            }
          }}
          disabled={disabled}
        />
      </div>
      {showPicker && (
        <div className="absolute bottom-14 left-0 z-10">
          <ArtifactPicker
            initialSelected={artifactIds}
            onCancel={() => setShowPicker(false)}
            onConfirm={(ids) => {
              setArtifactIds(ids);
              setShowPicker(false);
            }}
          />
        </div>
      )}
      {disabled ? (
        <button
          data-testid="composer-stop"
          aria-pressed
          onClick={onCancel}
          aria-label="Stop"
          title="Stop"
          className="h-9 w-9 shrink-0 self-end rounded-lg bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900"
        >
          ■
        </button>
      ) : (
        <button
          data-testid="composer-send"
          onClick={doSend}
          aria-label="Send"
          title="Send"
          disabled={!value.trim()}
          className="h-9 w-9 shrink-0 self-end rounded-lg bg-zinc-900 text-white disabled:opacity-40 dark:bg-zinc-200 dark:text-zinc-900"
        >
          ➤
        </button>
      )}
      {/* Selected chips */}
      {artifactIds.length > 0 && (
        <div className="absolute -top-8 left-12 right-0 flex flex-wrap gap-2">
          {artifactIds.map((id) => {
            const a = MOCK_ARTIFACTS_MAP[id];
            if (!a) return null;
            return (
              <ArtifactChip
                key={id}
                artifact={a}
                onRemove={() => setArtifactIds((arr) => arr.filter((x) => x !== id))}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Composer;
