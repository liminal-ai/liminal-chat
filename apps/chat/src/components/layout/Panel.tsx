import type React from 'react';
import { useEffect, useRef } from 'react';

interface PanelProps {
  side: 'left' | 'right';
  isOpen: boolean;
  width: number;
  isDesktop: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  'data-testid'?: string;
}

export const Panel: React.FC<PanelProps> = ({
  side,
  isOpen,
  width: _width,
  isDesktop,
  onToggle,
  children,
  'data-testid': testId,
}) => {
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Lock body scroll and handle Escape close while open (for mobile)
  useEffect(() => {
    if (isDesktop || !isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onToggle();
      }
    };
    document.addEventListener('keydown', onKey);
    drawerRef.current?.focus();

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [isDesktop, isOpen, onToggle]);

  // Desktop: render static side panel only when open
  if (isDesktop) {
    if (!isOpen) return null;
    return (
      <div
        className={
          side === 'left'
            ? 'hidden lg:block border-r border-zinc-200 dark:border-zinc-800'
            : 'hidden lg:block border-l border-zinc-200 dark:border-zinc-800'
        }
        style={{ width: _width }}
        data-testid={testId}
      >
        {children}
      </div>
    );
  }

  // Mobile: render drawer + backdrop only when open
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onToggle} aria-hidden="true" />
      <div
        ref={drawerRef}
        tabIndex={-1}
        className={`fixed top-14 bottom-0 z-50 w-80 bg-white dark:bg-zinc-950 shadow-xl transition-transform ${
          side === 'left'
            ? 'left-0 border-r border-zinc-200 dark:border-zinc-800'
            : 'right-0 border-l border-zinc-200 dark:border-zinc-800'
        }`}
        data-testid={testId}
      >
        {children}
      </div>
    </>
  );
};
