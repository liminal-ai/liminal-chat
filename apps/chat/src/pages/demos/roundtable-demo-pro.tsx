import React, { useMemo, useRef, useEffect } from 'react';
import { useDemoControls, useDemoNavigation } from '@/lib/demo-system/demo-hooks';
import type { RoundtableState, Agent } from '@/lib/types/roundtable';

/**
 * Roundtable Demo (Pro) — A refined swim-lane UI
 * - Top header: title, step progress, navigation
 * - Middle: three agent lanes with color-coded messages
 * - Right: steps + agents sidebar
 * - Bottom: sticky input with @mention chips and Send wired to nextStep
 * - Modals: agent configuration and focused agent chat
 */
export default function RoundtableDemoPro() {
  const {
    currentState,
    currentStep,
    script,
    nextStep,
    prevStep,
    jumpToStep,
    resetDemo,
    handleUserInput,
    handleAgentMention,
    handleAgentModalOpen,
    handleAgentModalClose,
    handleAgentFocusedChatOpen,
    handleAgentFocusedChatClose,
  } = useDemoControls('character-development');

  const navigation = useDemoNavigation(script.id, currentStep);

  const canSend =
    Boolean(currentState?.awaitingUserInput) && Boolean(currentState?.currentUserInput?.trim());

  const onSend = () => {
    if (canSend) nextStep();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-base font-semibold text-slate-900">{script.title}</div>
              <div className="text-xs text-slate-500">
                Step {currentStep + 1} / {script.steps.length}: {script.steps[currentStep]?.title}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevStep}
              disabled={!navigation.canGoPrevious}
              className="px-3 py-1.5 text-sm rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={onSend}
              disabled={!canSend && !navigation.canGoNext}
              className="px-3 py-1.5 text-sm rounded-md border border-blue-600 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!canSend && navigation.canGoNext ? 'Advance using Next →' : 'Send message'}
            >
              {canSend ? 'Send' : 'Next →'}
            </button>
            <button
              onClick={nextStep}
              disabled={!navigation.canGoNext}
              className="px-3 py-1.5 text-sm rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <button
              onClick={resetDemo}
              className="px-3 py-1.5 text-sm rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1 bg-slate-100">
          <div
            className="h-1 bg-blue-600 transition-all"
            style={{ width: `${((currentStep + 1) / script.steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Swim Lanes */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {script.agents.map((agent) => (
                <AgentLane
                  key={agent.id}
                  agent={agent}
                  state={currentState}
                  onOpenConfig={() => handleAgentModalOpen(agent.id)}
                  onOpenFocused={() => handleAgentFocusedChatOpen(agent.id)}
                />
              ))}
            </div>

            {/* Sticky Input */}
            <div className="border-t border-slate-200 p-4 bg-slate-50">
              <UserInputDock
                state={currentState}
                onUserInput={handleUserInput}
                onMention={handleAgentMention}
                onSend={onSend}
                canSend={canSend}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Steps */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-4 py-3 border-b border-slate-200">
              <div className="text-sm font-medium text-slate-900">Steps</div>
              <div className="text-xs text-slate-500">Jump to any step</div>
            </div>
            <div className="p-2">
              <div className="space-y-1">
                {script.steps.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => jumpToStep(idx)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      idx === currentStep
                        ? 'bg-blue-50 text-blue-900 font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
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

          {/* Agents */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-4 py-3 border-b border-slate-200">
              <div className="text-sm font-medium text-slate-900">Agents</div>
              <div className="text-xs text-slate-500">Tap to open details</div>
            </div>
            <div className="p-2">
              <div className="space-y-2">
                {script.agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentModalOpen(agent.id)}
                    className="w-full text-left px-3 py-2 rounded-md border border-slate-200 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: agent.color || '#6b7280' }}
                        />
                        <div className="text-sm font-medium text-slate-800">{agent.name}</div>
                      </div>
                      <span className="text-xs text-slate-500 uppercase">{agent.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Configuration Modal */}
      {currentState?.openAgentModal && (
        <AgentModal
          agent={script.agents.find((a) => a.id === currentState.openAgentModal)}
          onClose={handleAgentModalClose}
        />
      )}

      {/* Focused Agent Chat Modal */}
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

/* ---------------------------
   Agent Lane
----------------------------*/
function AgentLane({
  agent,
  state,
  onOpenConfig,
  onOpenFocused,
}: {
  agent: Agent;
  state: RoundtableState;
  onOpenConfig: () => void;
  onOpenFocused: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [state.conversationHistory]);

  const conversation = useMemo(() => {
    return state.conversationHistory.filter(
      (turn) =>
        turn.author === agent.id ||
        (turn.author === 'user' && turn.mentionedAgents?.includes(agent.id)),
    );
  }, [state.conversationHistory, agent.id]);

  const color = agent.color || '#6b7280';

  return (
    <div
      className="flex flex-col min-w-0"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fcfcff 100%)' }}
    >
      {/* Lane header */}
      <div className="px-3 py-2 border-b border-slate-200 bg-white flex items-center gap-3">
        <button
          onClick={onOpenFocused}
          className="h-7 w-7 rounded-full grid place-items-center text-white text-xs font-semibold hover:opacity-90"
          style={{ backgroundColor: color }}
          title="Open focused chat"
        >
          {agent.name.charAt(0)}
        </button>
        <div className="flex-1">
          <button
            onClick={onOpenConfig}
            className="text-xs font-semibold text-slate-900 hover:underline"
          >
            {agent.name}
          </button>
          <div className="text-[10px] text-slate-500">{conversation.length} messages</div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 p-3 overflow-y-auto space-y-1 min-h-[280px]">
        {conversation.length === 0 ? (
          <div className="text-center text-slate-500 py-6">
            <div
              className="w-8 h-8 rounded-full grid place-items-center text-white text-xs font-bold mx-auto mb-2"
              style={{ backgroundColor: color }}
            >
              {agent.name.charAt(0)}
            </div>
            <p className="text-xs">No messages yet</p>
            <p className="text-[10px] text-slate-400 mt-1">
              Mention @{agent.name.toLowerCase().replace(/\s+/g, '')} to start
            </p>
          </div>
        ) : (
          conversation.map((turn) => {
            const isUser = turn.author === 'user';
            const isAgent = turn.author === agent.id;
            return (
              <div key={turn.id} className={`flex gap-1 ${isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
                  <div
                    className={`inline-block rounded-lg px-3 py-2 text-xs shadow-sm ${
                      isUser
                        ? 'bg-slate-800 text-white'
                        : isAgent
                          ? 'text-white'
                          : 'bg-slate-100 text-slate-900'
                    }`}
                    style={!isUser && isAgent ? { backgroundColor: color } : {}}
                  >
                    {turn.content}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {new Date(turn.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ---------------------------
   Input Dock
----------------------------*/
function UserInputDock({
  state,
  onUserInput,
  onMention,
  onSend,
  canSend,
}: {
  state: RoundtableState;
  onUserInput: (input: string) => void;
  onMention: (agentId: string) => void;
  onSend: () => void;
  canSend: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {state.availableAgentMentions.map((m) => (
          <button
            key={m.agentId}
            onClick={() => onMention(m.agentId)}
            className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-300 hover:bg-slate-50"
          >
            {m.insertText}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <textarea
          ref={textareaRef}
          value={state.currentUserInput}
          onChange={(e) => onUserInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type your message to the roundtable..."
          className="flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <button
          onClick={onSend}
          disabled={!canSend}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}

/* ---------------------------
   Modals
----------------------------*/
function AgentModal({ agent, onClose }: { agent?: Agent; onClose: () => void }) {
  if (!agent) return null;
  const color = agent.color || '#6b7280';
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-14 h-14 rounded-full grid place-items-center text-white text-lg font-bold"
              style={{ backgroundColor: color }}
            >
              {agent.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{agent.name}</h2>
              <p className="text-xs text-slate-500">Agent Details</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs font-medium text-slate-600 mb-1">Agent ID</div>
              <div className="text-sm text-slate-700 font-mono bg-slate-50 p-2 rounded">
                {agent.id}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-600 mb-1">System Prompt</div>
              <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded leading-relaxed whitespace-pre-wrap">
                {agent.systemPrompt}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-900"
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
  const currentAgent = agents.find((a) => a.id === currentAgentId);
  if (!currentAgent) return null;

  const idx = agents.findIndex((a) => a.id === currentAgentId);
  const canPrev = idx > 0;
  const canNext = idx < agents.length - 1;

  const agentConversation = conversationHistory.filter(
    (turn) =>
      turn.author === currentAgentId ||
      (turn.author === 'user' && turn.mentionedAgents?.includes(currentAgentId)),
  );

  const color = currentAgent.color || '#6b7280';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <button
            onClick={() => canPrev && onNavigateAgent(agents[idx - 1].id)}
            disabled={!canPrev}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous Agent
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full grid place-items-center text-white text-sm font-bold"
              style={{ backgroundColor: color }}
            >
              {currentAgent.name.charAt(0)}
            </div>
            <div className="text-lg font-semibold text-slate-900">{currentAgent.name}</div>
          </div>
          <button
            onClick={() => canNext && onNavigateAgent(agents[idx + 1].id)}
            disabled={!canNext}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Agent →
          </button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {agentConversation.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <div
                className="w-12 h-12 rounded-full grid place-items-center text-white text-lg font-bold mx-auto mb-3"
                style={{ backgroundColor: color }}
              >
                {currentAgent.name.charAt(0)}
              </div>
              <p className="text-sm">No messages yet with {currentAgent.name}</p>
              <p className="text-xs text-slate-400 mt-1">
                Mention @{currentAgent.name.toLowerCase().replace(/\s+/g, '')} to start a
                conversation
              </p>
            </div>
          ) : (
            agentConversation.map((turn) => (
              <div key={turn.id} className="space-y-2">
                <div className={`flex gap-3 ${turn.author === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    <div
                      className={`inline-block p-3 rounded-lg max-w-[80%] ${
                        turn.author === 'user' ? 'bg-slate-800 text-white ml-auto' : 'text-white'
                      }`}
                      style={turn.author !== 'user' ? { backgroundColor: color } : {}}
                    >
                      {turn.content}
                    </div>
                    <p
                      className={`text-xs text-slate-500 mt-1 ${turn.author === 'user' ? 'text-right' : ''}`}
                    >
                      {new Date(turn.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 grid place-items-center text-slate-500 hover:text-slate-700 bg-white rounded-full shadow-md"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
