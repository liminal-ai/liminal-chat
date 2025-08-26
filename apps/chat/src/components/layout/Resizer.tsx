'use client';

import type React from 'react';
import { useCallback, useEffect, useRef } from 'react';

interface ResizerProps {
  side: 'left' | 'right';
  onResize: (width: number) => void;
  'data-testid'?: string;
}

export const Resizer: React.FC<ResizerProps> = ({ side, onResize, 'data-testid': testId }) => {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - startX.current;
      const newWidth = side === 'left' ? startWidth.current + deltaX : startWidth.current - deltaX;

      // Clamp width between 240px and 420px
      const clampedWidth = Math.min(Math.max(newWidth, 240), 420);
      onResize(clampedWidth);
    },
    [side, onResize],
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;

    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    // Remove listeners when drag ends
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      startX.current = e.clientX;

      // Get current panel width
      const panel = e.currentTarget.previousElementSibling || e.currentTarget.nextElementSibling;
      if (panel) {
        startWidth.current = (panel as HTMLElement).getBoundingClientRect().width;
      }

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      // Attach listeners on drag start
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [handleMouseMove, handleMouseUp],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      className="w-1 bg-transparent hover:bg-zinc-300/40 dark:hover:bg-zinc-600/40 cursor-col-resize flex-shrink-0 group"
      onMouseDown={handleMouseDown}
      tabIndex={0}
      role="separator"
      aria-label={`Resize ${side} panel`}
      data-testid={testId}
      onKeyDown={(e) => {
        const key = e.key;
        if (key === 'Enter' || key === ' ') {
          e.preventDefault();
          return;
        }
        if (key !== 'ArrowLeft' && key !== 'ArrowRight') return;
        e.preventDefault();
        const panel = (e.currentTarget.previousElementSibling ||
          e.currentTarget.nextElementSibling) as HTMLElement | null;
        if (!panel) return;
        const current = panel.getBoundingClientRect().width;
        const delta = 16;
        let newWidth = current;
        if (side === 'left') {
          newWidth = key === 'ArrowLeft' ? current - delta : current + delta;
        } else {
          // Right panel grows when moving left
          newWidth = key === 'ArrowLeft' ? current + delta : current - delta;
        }
        const clampedWidth = Math.min(Math.max(newWidth, 240), 420);
        onResize(clampedWidth);
      }}
    >
      <div className="w-full h-full group-hover:bg-blue-500/20 group-focus:bg-blue-500/20 transition-colors" />
    </div>
  );
};
