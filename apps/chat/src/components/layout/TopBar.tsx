'use client';

import type React from 'react';

type Capability = 'fast' | 'smart' | 'deep' | 'deep-thinking';

interface TopBarProps {
  leftOpen: boolean;
  rightOpen: boolean;
  mode: Capability;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onSelectMode: (mode: Capability) => void;
  hasShadow?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  leftOpen,
  rightOpen,
  mode,
  onToggleLeft,
  onToggleRight,
  onSelectMode,
  hasShadow: _hasShadow = false,
}) => {
  const capabilities: { value: Capability; label: string }[] = [
    { value: 'fast', label: 'Fast' },
    { value: 'smart', label: 'Smart' },
    { value: 'deep', label: 'Deep' },
    { value: 'deep-thinking', label: 'Deep+T' },
  ];

  return (
    <div
      className={`h-14 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 sticky top-0 z-50`}
      data-testid="topbar"
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleLeft}
          className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-pressed={leftOpen}
          aria-label="Toggle left panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <button className="px-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Project Alpha
          <svg
            className="w-4 h-4 ml-1 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Center Title */}
      <div className="flex-1 flex justify-center">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Chat App</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Capability Selector */}
        <div
          className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1"
          data-testid="mode-selector"
          role="radiogroup"
          aria-label="Select capability mode"
        >
          {capabilities.map((cap) => (
            <button
              key={cap.value}
              onClick={() => onSelectMode(cap.value)}
              className={`px-3 py-1 text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                mode === cap.value
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
              role="radio"
              aria-checked={mode === cap.value}
            >
              {cap.label}
            </button>
          ))}
        </div>

        <button
          onClick={onToggleRight}
          className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-pressed={rightOpen}
          aria-label="Toggle right panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};
