import React, { useRef } from 'react';
import { useDemoControls, useDemoNavigation } from '@/lib/demo-system/demo-hooks';
import type { Agent, RoundtableState } from '@/lib/types/roundtable';

export default function RoundtableDemoStudio() {
  const {
    currentState,
    currentStep,
    script,
    nextStep,
    jumpToStep,
    resetDemo,
    handleUserInput,
    handleAgentMention,
    handleAgentModalOpen,
    handleAgentModalClose,
    handleAgentFocusedChatOpen,
    handleAgentFocusedChatClose,
  } = useDemoControls('character-development');

  const _navigation = useDemoNavigation(script.id, currentStep);
  const canSend =
    Boolean(currentState?.awaitingUserInput) && Boolean(currentState?.currentUserInput?.trim());

  const onSend = () => {
    if (canSend) nextStep();
  };

  const onScrub = (v: number) => {
    jumpToStep(v);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Header with scrubber */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-900/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 grid gap-4 md:grid-cols-[1fr_auto] items-center">
          <div>
            <div className="text-lg font-semibold tracking-tight">Roundtable Studio</div>
            <div className="text-xs text-slate-400">
              {script.title} — Step {currentStep + 1} / {script.steps.length}:{' '}
              {script.steps[currentStep]?.title}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={script.steps.length - 1}
              value={currentStep}
              onChange={(e) => onScrub(Number(e.currentTarget.value))}
              className="w-48 accent-sky-400"
            />
            <button
              onClick={resetDemo}
              className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main composition: rail + canvas */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[88px_1fr_300px] gap-6">
        {/* Agent vertical rail */}
        <div className="hidden lg:flex flex-col items-center gap-4">
          {script.agents.map((a) => (
            <button
              key={a.id}
              title={`Focus ${a.name}`}
              onClick={() => handleAgentFocusedChatOpen(a.id)}
              className="relative h-14 w-14 rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.06)] ring-2 ring-white/10 hover:ring-white/20 transition"
              style={{
                background: `radial-gradient(60% 60% at 50% 50%, ${a.color || '#64748b'}66 0%, #0b1220 100%)`,
              }}
            >
              <span className="absolute inset-0 rounded-full grid place-items-center text-white font-semibold">
                {a.name.charAt(0)}
              </span>
            </button>
          ))}
        </div>

        {/* Conversation canvas */}
        <div>
          <CanvasFeed
            state={currentState}
            agents={script.agents}
            onOpenConfig={handleAgentModalOpen}
          />
        </div>

        {/* Sidebar: step cards */}
        <div className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5">
              <div className="px-4 py-3 border-b border-white/10 text-sm font-medium">Steps</div>
              <div className="p-2 max-h-[60vh] overflow-y-auto">
                <div className="space-y-1">
                  {script.steps.map((step, idx) => (
                    <button
                      key={step.id}
                      onClick={() => jumpToStep(idx)}
                      className={`w-full text-left px-3 py-2 text-xs rounded-md transition ${
                        idx === currentStep
                          ? 'bg-sky-500/10 text-sky-200 border border-sky-500/30'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="font-medium">
                        {idx + 1}. {step.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Composer dock */}
      <div className="sticky bottom-0 z-30 border-t border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="max-w-4xl mx-auto p-4">
          <Composer
            state={currentState}
            onUserInput={handleUserInput}
            onMentionAgent={handleAgentMention}
            onSend={onSend}
            canSend={canSend}
          />
        </div>
      </div>

      {/* Modals */}
      {currentState?.openAgentModal && (
        <AgentModal
          agent={script.agents.find((a) => a.id === currentState.openAgentModal)}
          onClose={handleAgentModalClose}
        />
      )}
      {currentState?.openFocusedChat && (
        <FocusedAgentChatModal
          agents={script.agents}
          currentAgentId={currentState.openFocusedChat}
          conversationHistory={currentState.conversationHistory || []}
          onClose={handleAgentFocusedChatClose}
          onNavigateAgent={handleAgentFocusedChatOpen}
        />
      )}
    </div>
  );
}

function CanvasFeed({
  state,
  agents,
  onOpenConfig,
}: {
  state: RoundtableState;
  agents: Agent[];
  onOpenConfig: (agentId: string) => void;
}) {
  const items = state.conversationHistory;
  const getAgent = (id?: string) => agents.find((a) => a.id === id);

  return (
    <div className="grid gap-4">
      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-300">
          No messages yet. Type your first message below.
        </div>
      ) : (
        items.map((t, _i) => {
          const isUser = t.author === 'user';
          const a = getAgent(!isUser ? t.author : undefined);
          const stripe = !isUser && a?.color ? a.color : '#334155';
          const offset = isUser ? 'ml-auto' : 'mr-auto';
          const skew = isUser ? '-skew-y-1' : 'skew-y-1';
          return (
            <div key={t.id} className={`max-w-2xl ${offset}`}>
              <div className="relative">
                <div
                  className="absolute -left-2 -right-2 top-2 h-2 rounded-full blur-lg opacity-40"
                  style={{ background: `linear-gradient(90deg, ${stripe}33, transparent)` }}
                />
                <div
                  className={`rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl ${skew}`}
                >
                  <div className="flex items-start gap-3">
                    {!isUser ? (
                      <button
                        onClick={() => a && onOpenConfig(a.id)}
                        className="h-8 w-8 rounded-full grid place-items-center text-xs font-semibold text-white shadow ring-2 ring-white/20"
                        style={{ backgroundColor: a?.color || '#64748b' }}
                        title={a?.name}
                      >
                        {a?.name?.charAt(0)}
                      </button>
                    ) : (
                      <div className="h-8 w-8 rounded-full grid place-items-center text-xs font-semibold text-slate-900 bg-slate-100">
                        U
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-medium text-slate-200">
                          {isUser ? 'You' : a?.name || 'Agent'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(t.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-slate-100 whitespace-pre-wrap">
                        {t.content}
                      </div>
                      {t.mentionedAgents && t.mentionedAgents.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {t.mentionedAgents.map((id) => {
                            const ma = getAgent(id);
                            return (
                              <span
                                key={id}
                                className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium border border-white/10"
                                style={{
                                  background: `${ma?.color || '#64748b'}22`,
                                  color: '#e2e8f0',
                                }}
                              >
                                @{ma?.name?.toLowerCase().replace(/\s+/g, '') || id}
                              </span>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function Composer({
  state,
  onUserInput,
  onMentionAgent,
  onSend,
  canSend,
}: {
  state: RoundtableState;
  onUserInput: (v: string) => void;
  onMentionAgent: (id: string) => void;
  onSend: () => void;
  canSend: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex flex-wrap gap-2 mb-3">
        {state.availableAgentMentions.map((m) => (
          <button
            key={m.agentId}
            onClick={() => onMentionAgent(m.agentId)}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-slate-100 bg-white/10 hover:bg-white/15 border border-white/10"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            {m.insertText}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <textarea
          ref={ref}
          value={state.currentUserInput}
          onChange={(e) => onUserInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Compose your message…"
          className="flex-1 resize-none rounded-xl bg-slate-900/60 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 border border-white/10"
          rows={3}
        />
        <button
          onClick={onSend}
          disabled={!canSend}
          className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function AgentModal({ agent, onClose }: { agent?: Agent; onClose: () => void }) {
  if (!agent) return null;
  const color = agent.color || '#6b7280';
  return (
    <div className="fixed inset-0 bg-black/60 grid place-items-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-14 h-14 rounded-full grid place-items-center text-white text-lg font-bold"
              style={{ backgroundColor: color }}
            >
              {agent.name.charAt(0)}
            </div>
            <div>
              <div className="text-lg font-semibold">{agent.name}</div>
              <div className="text-xs text-slate-400">Agent Details</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-slate-400 mb-1">Agent ID</div>
              <div className="text-sm text-slate-200 bg-slate-800 rounded p-2 font-mono">
                {agent.id}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">System Prompt</div>
              <div className="text-sm text-slate-200 bg-slate-800 rounded p-3 leading-relaxed whitespace-pre-wrap">
                {agent.systemPrompt}
              </div>
            </div>
          </div>
          <div className="mt-6 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FocusedAgentChatModal({
  agents,
  currentAgentId,
  conversationHistory,
  onClose,
  onNavigateAgent,
}: {
  agents: Agent[];
  currentAgentId: string;
  conversationHistory: Array<{
    id: string;
    type: string;
    author: string;
    content: string;
    timestamp: number;
    mentionedAgents?: string[];
  }>;
  onClose: () => void;
  onNavigateAgent: (agentId: string) => void;
}) {
  const current = agents.find((a) => a.id === currentAgentId);
  if (!current) return null;
  const idx = agents.findIndex((a) => a.id === currentAgentId);
  const prev = idx > 0 ? agents[idx - 1] : undefined;
  const next = idx < agents.length - 1 ? agents[idx + 1] : undefined;
  const color = current.color || '#6b7280';
  const convo = conversationHistory.filter(
    (t) =>
      t.author === currentAgentId ||
      (t.author === 'user' && t.mentionedAgents?.includes(currentAgentId)),
  );

  return (
    <div className="fixed inset-0 bg-black/60 grid place-items-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <button
            onClick={() => prev && onNavigateAgent(prev.id)}
            disabled={!prev}
            className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 border border-white/10 text-sm disabled:opacity-50"
          >
            ← {prev ? prev.name : 'Previous'}
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full grid place-items-center text-white text-sm font-bold"
              style={{ backgroundColor: color }}
            >
              {current.name.charAt(0)}
            </div>
            <div className="text-base font-semibold">{current.name}</div>
          </div>
          <button
            onClick={() => next && onNavigateAgent(next.id)}
            disabled={!next}
            className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 border border-white/10 text-sm disabled:opacity-50"
          >
            {next ? next.name : 'Next'} →
          </button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {convo.length === 0 ? (
            <div className="text-center text-slate-400 py-10">
              No messages yet with {current.name}
            </div>
          ) : (
            convo.map((t) => (
              <div
                key={t.id}
                className={`flex ${t.author === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-xl p-3 text-sm ${t.author === 'user' ? 'bg-slate-800 text-slate-100' : 'text-white'}`}
                  style={t.author === 'user' ? {} : { backgroundColor: color }}
                >
                  {t.content}
                  <div className="mt-1 text-[10px] opacity-70">
                    {new Date(t.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 grid place-items-center bg-white/10 hover:bg-white/15 border border-white/10 rounded-full"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
