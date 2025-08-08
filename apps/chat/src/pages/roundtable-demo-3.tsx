import React, { useMemo } from 'react';
import { useDemoControls, useDemoNavigation } from '@/lib/demo-system/demo-hooks';
import { Agent, ConversationTurn } from '@/lib/types/roundtable';

/**
 * Roundtable Demo 3 - Timeline View
 * Same orchestration & providers as other demos, different UI take:
 * - Horizontal timeline of messages with avatars and compact bubbles
 * - Sticky controls header
 * - Tailwind-only styles
 * - Reuses demo system, adds small presentational components inline
 */

export default function RoundtableDemo3() {
  const {
    currentState,
    currentStep,
    script,
    nextStep,
    prevStep,
    jumpToStep,
    resetDemo,
    handleAgentModalOpen,
    handleAgentModalClose,
    handleAgentFocusedChatOpen,
    handleAgentFocusedChatClose,
  } = useDemoControls('character-development');

  const navigation = useDemoNavigation(script.id, currentStep);

  const messages = useMemo(() => {
    const history = currentState?.conversationHistory ?? [];
    return history.map((msg, idx) => ({
      id: `${msg.author || 'user'}-${msg.timestamp}-${idx}`,
      content: msg.content,
      timestamp: msg.timestamp,
      author: msg.author,
      type: msg.type, // 'user_input' | 'agent_response'
      isUser: msg.type === 'user_input',
      agentId: msg.type === 'agent_response' ? msg.author : undefined,
    }));
  }, [currentState]);

  const getAgent = (agentId?: string) => script.agents.find((a) => a.id === agentId);

  const onNavigateAgent = (agentId: string) => {
    handleAgentFocusedChatOpen(agentId);
  };

  const onSendStep = () => nextStep();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Controls Header */}
      <div className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="text-base font-semibold text-slate-900">{script.title}</div>
            <div className="text-xs text-slate-500 hidden md:block">
              Step {currentStep + 1} / {script.steps.length}: {script.steps[currentStep]?.title}
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
              onClick={onSendStep}
              disabled={!navigation.canGoNext}
              className="px-3 py-1.5 text-sm rounded-md border border-blue-600 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
            <button
              onClick={resetDemo}
              className="px-3 py-1.5 text-sm rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Timeline Panel */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-4 py-3 border-b border-slate-200">
              <div className="text-sm font-medium text-slate-900">Timeline</div>
              <div className="text-xs text-slate-500">
                Chronological view of turns across all three agents
              </div>
            </div>

            {/* Horizontal scroll timeline */}
            <div className="p-4 overflow-x-auto">
              <div className="relative">
                {/* Axis line */}
                <div className="absolute left-0 right-0 top-16 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent pointer-events-none" />

                <div className="flex gap-4 min-w-max pr-2">
                  {messages.length === 0 ? (
                    <EmptyTimeline />
                  ) : (
                    messages.map((m, _i) => {
                      const agent = getAgent(m.agentId);
                      const roleColor = m.isUser
                        ? 'bg-emerald-50 border-emerald-200'
                        : agent
                          ? agentColorClass(agent.id).bg + ' ' + agentColorClass(agent.id).border
                          : 'bg-slate-50 border-slate-200';

                      return (
                        <div key={m.id} className="flex flex-col items-center w-72">
                          {/* Tick + avatar */}
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-slate-300" />
                            <Avatar
                              label={m.isUser ? 'User' : agent?.name || (m.author ?? 'Agent')}
                              colorClass={
                                m.isUser ? 'bg-emerald-600' : agentColorClass(agent?.id).dot
                              }
                              onClick={() => {
                                if (!m.isUser && agent?.id) onNavigateAgent(agent.id);
                              }}
                              clickable={!m.isUser && !!agent?.id}
                            />
                          </div>

                          {/* Message card */}
                          <div className={`mt-4 w-full border ${roleColor} rounded-lg shadow-xs`}>
                            <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                              <div className="text-xs font-medium text-slate-700">
                                {m.isUser ? 'User' : agent?.name || (m.author ?? 'Agent')}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {formatClock(m.timestamp)}
                              </div>
                            </div>
                            <div className="p-3">
                              <p className="text-sm text-slate-800 whitespace-pre-wrap">
                                {m.content}
                              </p>
                            </div>
                            {!m.isUser && agent ? (
                              <div className="px-3 py-2 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-block h-2 w-2 rounded-full ${agentColorClass(agent.id).dot}`}
                                  />
                                  <span className="text-[10px] uppercase tracking-wide text-slate-500">
                                    {agent.id}
                                  </span>
                                </div>
                                <button
                                  onClick={() => onNavigateAgent(agent.id)}
                                  className="text-xs text-blue-600 hover:text-blue-700"
                                >
                                  Focus
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Steps + Agents */}
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
                          className={`inline-block h-2.5 w-2.5 rounded-full ${agentColorClass(agent.id).dot}`}
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

          {/* User Input Section - below agents */}
          <div className="mt-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-4 py-3 border-b border-slate-200">
              <div className="text-sm font-medium text-slate-900">Your Message</div>
              <div className="text-xs text-slate-500">Next message to send</div>
            </div>
            <div className="p-4">
              <UserInputArea
                currentInput={currentState?.currentUserInput || ''}
                onSendMessage={onSendStep}
                agents={script.agents}
                disabled={!navigation.canGoNext}
              />
            </div>
          </div>

          {/* Open Modals/Focussed Chat indicators */}
          <ModalIndicators
            state={currentState}
            onCloseModal={handleAgentModalClose}
            onCloseFocused={handleAgentFocusedChatClose}
          />
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
   Presentational Components
----------------------------*/

function UserInputArea({
  currentInput,
  onSendMessage,
  agents,
  disabled,
}: {
  currentInput: string;
  onSendMessage: () => void;
  agents: Agent[];
  disabled: boolean;
}) {
  return (
    <div className="space-y-3">
      {/* Agent mention buttons */}
      <div className="flex flex-wrap gap-2">
        {agents.map((agent) => (
          <button
            key={agent.id}
            disabled={disabled}
            className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            @{agent.name.toLowerCase().replace(/\s+/g, '')}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="flex space-x-3">
        <textarea
          value={currentInput}
          placeholder="Next message will appear here..."
          className="flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm bg-slate-50 text-slate-600"
          rows={3}
          onChange={() => {}}
        />
        <button
          onClick={onSendMessage}
          disabled={disabled || !currentInput.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function Avatar({
  label,
  colorClass,
  onClick,
  clickable,
}: {
  label: string;
  colorClass: string;
  onClick?: () => void;
  clickable?: boolean;
}) {
  const initials = (label || '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'h-9 w-9 rounded-full grid place-items-center text-xs font-semibold text-white shadow',
        colorClass,
        clickable
          ? 'hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          : '',
        clickable ? '' : 'cursor-default',
      ].join(' ')}
    >
      {initials}
    </button>
  );
}

function EmptyTimeline() {
  return (
    <div className="w-full p-8 text-center">
      <div className="text-sm text-slate-500">
        No messages yet. Use Next → to progress the demo.
      </div>
    </div>
  );
}

function ModalIndicators({
  state,
  onCloseModal,
  onCloseFocused,
}: {
  state: { openAgentModal?: string; openFocusedChat?: string } | null;
  onCloseModal: () => void;
  onCloseFocused: () => void;
}) {
  if (!state) return null;
  const { openAgentModal, openFocusedChat } = state;

  if (!openAgentModal && !openFocusedChat) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="text-sm text-slate-700">No modals open.</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-2">
      {openAgentModal ? (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-700">
            Agent modal open: <span className="font-medium">{openAgentModal}</span>
          </div>
          <button onClick={onCloseModal} className="text-xs text-blue-600 hover:text-blue-700">
            Close
          </button>
        </div>
      ) : null}
      {openFocusedChat ? (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-700">
            Focused chat: <span className="font-medium">{openFocusedChat}</span>
          </div>
          <button onClick={onCloseFocused} className="text-xs text-blue-600 hover:text-blue-700">
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------------------
   Modal Components  
----------------------------*/

// Agent Configuration Modal Component
interface AgentModalProps {
  agent?: Agent;
  onClose: () => void;
}

function AgentModal({ agent, onClose }: AgentModalProps) {
  if (!agent) return null;
  const agentColor = agent.color || '#6b7280';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* Agent Header */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: agentColor }}
            >
              {agent.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{agent.name}</h2>
              <p className="text-sm text-gray-500">Agent Details</p>
            </div>
          </div>
          {/* Agent Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Agent ID</h3>
              <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">{agent.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">System Prompt</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded leading-relaxed">
                {agent.systemPrompt}
              </p>
            </div>
          </div>
          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Focused Agent Chat Modal Component
interface FocusedAgentChatModalProps {
  agents: Agent[];
  currentAgentId: string;
  conversationHistory: ConversationTurn[];
  onClose: () => void;
  onNavigateAgent: (agentId: string) => void;
}

function FocusedAgentChatModal({
  agents,
  currentAgentId,
  conversationHistory,
  onClose,
  onNavigateAgent,
}: FocusedAgentChatModalProps) {
  const currentAgent = agents.find((a) => a.id === currentAgentId);
  if (!currentAgent) return null;

  const currentAgentIndex = agents.findIndex((a) => a.id === currentAgentId);
  const canGoPrevious = currentAgentIndex > 0;
  const canGoNext = currentAgentIndex < agents.length - 1;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onNavigateAgent(agents[currentAgentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onNavigateAgent(agents[currentAgentIndex + 1].id);
    }
  };

  // Get conversation from this agent's perspective (only messages involving them)
  const agentConversation = conversationHistory.filter(
    (turn) =>
      // Show agent's own messages
      turn.author === currentAgentId ||
      // Show user messages that mention this agent
      (turn.author === 'user' && turn.mentionedAgents?.includes(currentAgentId)),
  );

  const agentColor = currentAgent.color || '#6b7280';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] h-[90vh] flex flex-col">
        {/* Header with navigation */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous Agent
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: agentColor }}
            >
              {currentAgent.name.charAt(0)}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{currentAgent.name}</h2>
          </div>
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Agent →
          </button>
        </div>
        {/* Conversation Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0">
          {agentConversation.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto mb-3"
                style={{ backgroundColor: agentColor }}
              >
                {currentAgent.name.charAt(0)}
              </div>
              <p className="text-sm">No messages yet with {currentAgent.name}</p>
              <p className="text-xs text-gray-400 mt-1">
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
                        turn.author === 'user' ? 'bg-gray-600 text-white ml-auto' : 'text-white'
                      }`}
                      style={turn.author !== 'user' ? { backgroundColor: agentColor } : {}}
                    >
                      {turn.content}
                    </div>
                    <p
                      className={`text-xs text-gray-500 mt-1 ${turn.author === 'user' ? 'text-right' : ''}`}
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
        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder={`Send a message to ${currentAgent.name}...`}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Send
            </button>
          </div>
        </div>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/* ---------------------------
   Utilities
----------------------------*/

function formatClock(ts?: number) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function agentColorClass(agentId?: string) {
  // Map to actual agent IDs in demo system
  switch (agentId) {
    case 'supportive':
      return { bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-600' };
    case 'critical':
      return { bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-600' };
    case 'creative':
      return { bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-600' };
    default:
      return { bg: 'bg-slate-50', border: 'border-slate-200', dot: 'bg-slate-600' };
  }
}
