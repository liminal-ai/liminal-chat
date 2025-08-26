import type React from 'react';
import { useEffect, useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { Panel } from '../components/layout/Panel';
import { Resizer } from '../components/layout/Resizer';
import { CenterChatShell } from '../components/chat/CenterChatShell';
import { usePanelState } from '../hooks/usePanelState';
import { registerKeyboardHandlers, unregisterKeyboardHandlers } from '../lib/ui/keyboard';
import '../styles/panel.css';

export const ChatPage: React.FC = () => {
  const { state, onToggleLeft, onToggleRight, onResizeLeft, onResizeRight, onSelectMode } =
    usePanelState();
  const [hasShadow, setHasShadow] = useState(false);
  const threadId = 'dev-thread';

  // Register keyboard shortcuts
  useEffect(() => {
    const handlers = {
      '[': onToggleLeft,
      ']': onToggleRight,
    };

    registerKeyboardHandlers(handlers);

    return () => {
      unregisterKeyboardHandlers(handlers);
    };
  }, [onToggleLeft, onToggleRight]);

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-zinc-950" data-testid="chat-page">
      <TopBar
        leftOpen={state.leftOpen}
        rightOpen={state.rightOpen}
        mode={state.mode}
        onToggleLeft={onToggleLeft}
        onToggleRight={onToggleRight}
        onSelectMode={onSelectMode}
        hasShadow={hasShadow}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Rail */}
        <Panel
          side="left"
          isOpen={state.leftOpen}
          width={state.wL}
          isDesktop={isDesktop}
          onToggle={onToggleLeft}
          data-testid="left-rail"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Projects & Artifacts
              </h2>
              <button
                onClick={onToggleLeft}
                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden"
                aria-label="Close left panel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer">
                <svg className="w-4 h-4 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Project Alpha</span>
                <span className="ml-auto px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                  RAG
                </span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer">
                <svg className="w-4 h-4 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">chat-history.json</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer">
                <svg className="w-4 h-4 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Documents</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* Left Resizer */}
        {isDesktop && state.leftOpen && (
          <Resizer side="left" onResize={onResizeLeft} data-testid="resizer-left" />
        )}

        {/* Center Chat */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {hasShadow && (
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-black/5 to-transparent dark:from-white/5"
            />
          )}
          <CenterChatShell
            threadId={threadId}
            capability={state.mode}
            onScrollChange={setHasShadow}
          />
        </div>

        {/* Right Resizer */}
        {isDesktop && state.rightOpen && (
          <Resizer side="right" onResize={onResizeRight} data-testid="resizer-right" />
        )}

        {/* Right Rail */}
        <Panel
          side="right"
          isOpen={state.rightOpen}
          width={state.wR}
          isDesktop={isDesktop}
          onToggle={onToggleRight}
          data-testid="right-rail"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Thread Navigator
              </h2>
              <button
                onClick={onToggleRight}
                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden"
                aria-label="Close right panel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-1 relative">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700"></div>

              <div className="relative pl-6 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded cursor-pointer">
                <div className="absolute left-1.5 top-3 w-1 h-1 bg-zinc-400 dark:bg-zinc-500 rounded-full"></div>
                Thread 1: API Integration
              </div>

              <div className="relative pl-6 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded cursor-pointer">
                <div className="absolute left-1.5 top-3 w-1 h-1 bg-zinc-400 dark:bg-zinc-500 rounded-full"></div>
                Thread 2: UI Components
              </div>

              <div className="relative pl-6 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded cursor-pointer">
                <div className="absolute left-1.5 top-3 w-1 h-1 bg-zinc-400 dark:bg-zinc-500 rounded-full"></div>
                Thread 3: Database Schema
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default ChatPage;
