import React, { useRef, useEffect } from 'react';
import { useDemoControls, useDemoNavigation } from '@/lib/demo-system/demo-hooks';
import type { Agent, RoundtableState } from '@/lib/types/roundtable';

export default function RoundtableDemoStudioChat() {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-900/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 grid gap-4 md:grid-cols-[1fr_auto] items-center">
          <div>
            <div className="text-lg font-semibold tracking-tight">
              Roundtable Studio — Group Chat
            </div>
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
              onChange={(e) => jumpToStep(Number(e.currentTarget.value))}
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

      {/* Main layout: chat + side rail */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Group Chat */}
        <div>
          <GroupChatFeed
            state={currentState}
            agents={script.agents}
            onOpenConfig={handleAgentModalOpen}
            onOpenFocused={handleAgentFocusedChatOpen}
          />
        </div>

        {/* Sidebar: agents + steps */}
        <div className="space-y-6">
          {/* Agents */}
          <div className="rounded-2xl border border-white/10 bg-white/5">
            <div className="px-4 py-3 border-b border-white/10 text-sm font-medium">Agents</div>
            <div className="p-3 space-y-2">
              {script.agents.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleAgentFocusedChatOpen(a.id)}
                      className="h-8 w-8 rounded-full grid place-items-center text-xs font-semibold text-white ring-2 ring-white/15"
                      style={{ backgroundColor: a.color || '#64748b' }}
                      title={`Focus ${a.name}`}
                    >
                      {a.name.charAt(0)}
                    </button>
                    <div>
                      <div className="text-sm font-medium">{a.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase">{a.id}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAgentModalOpen(a.id)}
                    className="text-xs px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10"
                  >
                    Config
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="rounded-2xl border border-white/10 bg-white/5">
            <div className="px-4 py-3 border-b border-white/10 text-sm font-medium">Steps</div>
            <div className="p-2 max-h-[45vh] overflow-y-auto">
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

      {/* Composer */}
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

function GroupChatFeed({
  state,
  agents,
  onOpenConfig,
  onOpenFocused,
}: {
  state: RoundtableState;
  agents: Agent[];
  onOpenConfig: (agentId: string) => void;
  onOpenFocused: (agentId: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [state.conversationHistory]);

  const getAgent = (id?: string) => agents.find((a) => a.id === id);

  return (
    <div
      ref={ref}
      className="h-[70vh] rounded-2xl border border-white/10 bg-white/5 p-4 overflow-y-auto"
    >
      {state.conversationHistory.length === 0 ? (
        <div className="h-full grid place-items-center text-sm text-slate-300">
          No messages yet. Compose below.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {state.conversationHistory.map((t) => {
            const isUser = t.author === 'user';
            const a = !isUser ? getAgent(t.author) : undefined;
            return (
              <div key={t.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser ? (
                  <button
                    onClick={() => onOpenFocused(a!.id)}
                    className="mt-1 h-8 w-8 rounded-full grid place-items-center text-xs font-semibold text-white ring-2 ring-white/15 mr-2"
                    style={{ backgroundColor: a?.color || '#64748b' }}
                    title={`Focus ${a?.name}`}
                  >
                    {a?.name?.charAt(0)}
                  </button>
                ) : null}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${isUser ? 'bg-slate-800 text-slate-100' : 'text-white'}`}
                  style={!isUser ? { backgroundColor: a?.color || '#64748b' } : {}}
                >
                  {!isUser ? (
                    <div className="mb-1 flex items-center gap-2">
                      <button
                        onClick={() => onOpenConfig(a!.id)}
                        className="text-xs font-semibold underline decoration-white/40"
                      >
                        {a?.name || 'Agent'}
                      </button>
                      <span className="text-[10px] opacity-70">
                        {new Date(t.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ) : (
                    <div className="mb-1 text-[10px] text-slate-400 text-right">
                      {new Date(t.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{t.content}</div>
                </div>
              </div>
            );
          })}
        </div>
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
          placeholder="Type in the group chat…"
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
