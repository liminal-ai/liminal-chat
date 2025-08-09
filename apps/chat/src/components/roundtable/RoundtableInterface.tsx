// Roundtable Interface Component
// Multi-agent chat interface with 3 agent boxes and user input

import React from 'react';
import type { RoundtableInterfaceProps } from './types';

export function RoundtableInterface({
  state,
  onUserInput,
  onAgentMention,
  onAgentModalOpen,
  onAgentModalClose,
  onAgentFocusedChatOpen,
  onAgentFocusedChatClose,
  onSend,
}: RoundtableInterfaceProps) {
  // Filter conversation history for each agent
  const getAgentConversation = (agentId: string) => {
    return state.conversationHistory.filter(
      (turn) =>
        // Show agent's own messages
        turn.author === agentId ||
        // Show user messages that mention this agent
        (turn.author === 'user' && turn.mentionedAgents?.includes(agentId)),
    );
  };

  const handleMentionClick = (agentId: string) => {
    onAgentMention?.(agentId);
  };

  return (
    <div className="flex flex-col h-full max-h-full w-full space-y-2">
      {/* User Input Section - at the top with mention buttons inside */}
      <UserInputSection
        state={state}
        onUserInput={onUserInput}
        onMentionClick={handleMentionClick}
        onSend={onSend}
      />

      {/* Agent Chatboxes - 3 across the bottom, maximizing vertical space */}
      <div className="flex flex-row gap-2 flex-1 min-h-0 w-full">
        {state.agents.map((agent) => (
          <AgentChatBox
            key={agent.id}
            agent={agent}
            conversation={getAgentConversation(agent.id)}
            onAgentNameClick={() => onAgentModalOpen?.(agent.id)}
            onAgentAvatarClick={() => onAgentFocusedChatOpen?.(agent.id)}
          />
        ))}
      </div>

      {/* Agent Modal */}
      {state.openAgentModal && (
        <AgentModal
          agent={state.agents.find((a) => a.id === state.openAgentModal)}
          onClose={() => onAgentModalClose?.()}
        />
      )}

      {/* Focused Agent Chat Modal */}
      {state.openFocusedChat && (
        <FocusedAgentChatModal
          agents={state.agents}
          currentAgentId={state.openFocusedChat}
          conversationHistory={state.conversationHistory}
          onClose={() => onAgentFocusedChatClose?.()}
          onNavigateAgent={(agentId: string) => onAgentFocusedChatOpen?.(agentId)}
        />
      )}
    </div>
  );
}

// Focused Agent Chat Modal Component
interface FocusedAgentChatModalProps {
  agents: Array<{ id: string; name: string; color?: string }>;
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
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Individual Agent Chat Box Component
interface AgentChatBoxProps {
  agent: { id: string; name: string; color?: string };
  conversation: Array<{
    id: string;
    type: string;
    author: string;
    content: string;
    timestamp: number;
  }>;
  onAgentNameClick: () => void;
  onAgentAvatarClick: () => void;
}

function AgentChatBox({
  agent,
  conversation,
  onAgentNameClick,
  onAgentAvatarClick,
}: AgentChatBoxProps) {
  const agentColor = agent.color || '#6b7280';
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  React.useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        const element = scrollRef.current;
        element.scrollTop = element.scrollHeight - element.clientHeight;
      }
    };

    // Small delay to ensure DOM is updated
    const timer = setTimeout(scrollToBottom, 10);
    return () => clearTimeout(timer);
  }, [conversation.length, agent.id]);

  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm flex flex-col h-full min-w-0 flex-1">
      {/* Agent Header - reduced size */}
      <div className="p-1 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
        {/* Avatar - click for focused chat */}
        <button
          onClick={onAgentAvatarClick}
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold hover:ring-2 hover:ring-blue-300 transition-all"
          style={{ backgroundColor: agentColor }}
          title="Open focused chat"
        >
          {agent.name.charAt(0)}
        </button>

        {/* Name area - click for agent config */}
        <button
          onClick={onAgentNameClick}
          className="flex-1 hover:bg-gray-100 p-1 rounded transition-colors text-left"
          title="View agent details"
        >
          <h3 className="text-xs font-semibold text-gray-900">{agent.name}</h3>
          <p className="text-xs text-gray-500">{conversation.length} messages</p>
        </button>
      </div>

      {/* Conversation Area - maximized vertical space */}
      <div ref={scrollRef} className="flex-1 p-2 overflow-y-auto space-y-1 min-h-0">
        {conversation.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto mb-2"
              style={{ backgroundColor: agentColor }}
            >
              {agent.name.charAt(0)}
            </div>
            <p className="text-xs">No messages yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Mention @{agent.name.toLowerCase().replace(/\s+/g, '')} to start
            </p>
          </div>
        ) : (
          conversation.map((turn) => (
            <MessageBubble key={turn.id} turn={turn} agent={agent} agentColor={agentColor} />
          ))
        )}
      </div>
    </div>
  );
}

// Message Bubble Component
interface MessageBubbleProps {
  turn: { type: string; author: string; content: string; timestamp: number };
  agent: { id: string; name: string };
  agentColor: string;
}

function MessageBubble({ turn, agent, agentColor }: MessageBubbleProps) {
  const isUser = turn.author === 'user';
  const isThisAgent = turn.author === agent.id;

  return (
    <div className={`flex gap-1 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Removed colored initials - messages now take full horizontal space */}
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block p-2 rounded text-xs ${
            isUser
              ? 'bg-gray-600 text-white'
              : isThisAgent
                ? 'text-white'
                : 'bg-gray-100 text-gray-900'
          }`}
          style={!isUser && isThisAgent ? { backgroundColor: agentColor } : {}}
        >
          {turn.content}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(turn.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

// User Input Section Component
interface UserInputSectionProps {
  state: {
    currentUserInput: string;
    availableAgentMentions: Array<{ agentId: string; agentName: string; insertText: string }>;
    awaitingUserInput?: boolean;
  };
  onUserInput?: (input: string) => void;
  onMentionClick: (agentId: string) => void;
  onSend?: () => void;
}

function UserInputSection({ state, onUserInput, onMentionClick, onSend }: UserInputSectionProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUserInput?.(e.target.value);
  };
  const canSend = Boolean(state.awaitingUserInput) && Boolean(state.currentUserInput?.trim());

  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm p-2">
      {/* Input Area with mention buttons at bottom */}
      <div className="relative">
        <textarea
          value={state.currentUserInput}
          onChange={handleInputChange}
          placeholder="Type your message to the roundtable..."
          className="w-full h-16 p-2 pr-20 pb-8 border border-gray-300 rounded resize-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
        />

        {/* Mention Buttons - positioned at bottom of textarea */}
        <div className="absolute bottom-1 left-1 flex gap-1">
          {state.availableAgentMentions.map((mention) => (
            <button
              key={mention.agentId}
              onClick={() => onMentionClick(mention.agentId)}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              {mention.insertText}
            </button>
          ))}
        </div>

        {/* Send Button */}
        <div className="absolute bottom-1 right-1">
          <button
            onClick={() => {
              if (canSend) onSend?.();
            }}
            disabled={!canSend}
            className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// Agent Modal Component
interface AgentModalProps {
  agent?: { id: string; name: string; systemPrompt: string; color?: string };
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
