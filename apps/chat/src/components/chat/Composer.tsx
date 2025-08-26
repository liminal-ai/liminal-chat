import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { StreamStatus } from '../../types/chat';

interface ComposerProps {
  onSend: (text: string) => void;
  onCancel: () => void;
  status: StreamStatus;
}

export const Composer: React.FC<ComposerProps> = ({ onSend, onCancel, status }) => {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = Math.min(200, el.scrollHeight) + 'px';
  }, [value]);

  const disabled = status === 'sending' || status === 'streaming';

  const doSend = () => {
    const text = value.trim();
    if (!text || text.length > 8000) return;
    onSend(text);
    setValue('');
    // return focus to textarea
    requestAnimationFrame(() => ref.current?.focus());
  };

  return (
    <div className="flex gap-3">
      <button
        className="px-3 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 text-zinc-400"
        title="Attach (coming soon)"
        disabled
        aria-disabled
      >
        +
      </button>
      <textarea
        ref={ref}
        aria-label="Message"
        data-testid="composer-input"
        className="flex-1 resize-none rounded-lg border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none"
        placeholder="Type your message..."
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!disabled) doSend();
          }
        }}
        disabled={disabled}
      />
      {disabled ? (
        <button
          data-testid="composer-stop"
          aria-pressed
          onClick={onCancel}
          className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Stop
        </button>
      ) : (
        <button
          data-testid="composer-send"
          onClick={doSend}
          className="px-4 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white"
        >
          Send
        </button>
      )}
    </div>
  );
};

export default Composer;
