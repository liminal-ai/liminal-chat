import React, { useRef, useEffect } from 'react';
import { Agent as DemoAgent, RoundtableState, ConversationTurn } from '@/lib/types/roundtable';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isUser: boolean;
  agentId?: string;
}

interface Props {
  agents: DemoAgent[];
  messages: Message[];
  currentUserInput: string;
  onUserInputChange: (input: string) => void;
  onSendMessage: () => void;
  onMentionAgent: (agentId: string) => void;
  onAgentClick: (agentId: string) => void;
  isInputDisabled: boolean;
  demoState?: RoundtableState;
  openAgentModal?: string;
  openFocusedChat?: string;
  onAgentModalOpen?: (agentId: string) => void;
  onAgentModalClose?: () => void;
  onAgentFocusedChatOpen?: (agentId: string) => void;
  onAgentFocusedChatClose?: () => void;
  onNavigateAgent?: (agentId: string) => void;
}

// Agent Avatar Component
interface AgentAvatarProps {
  agent: DemoAgent;
  isActive: boolean;
  position?: number;
  isThinking?: boolean;
  onAvatarClick: (agentId: string) => void;
  onNameClick: (agentId: string) => void;
}

const positions = [
  { x: '-140px', y: '20px', rotate: '-15deg' },
  { x: '0px', y: '0px', rotate: '0deg' },
  { x: '140px', y: '20px', rotate: '15deg' },
];

function AgentAvatar({
  agent,
  isActive,
  position,
  isThinking = false,
  onAvatarClick,
  onNameClick,
}: AgentAvatarProps) {
  const pos = position !== undefined ? positions[position] : { x: '0px', y: '0px', rotate: '0deg' };

  const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() || '?';

  if (isThinking) {
    return (
      <div
        className="relative h-12 w-12 rounded-full transition-all duration-300"
        style={{ backgroundColor: agent.color || '#6b7280' }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-white/50 text-xl font-bold text-white">
          {getInitial(agent.name)}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex flex-col items-center transition-all duration-300 hover:scale-105"
      style={{
        transform: `translateX(${pos.x}) translateY(${pos.y}) rotate(${pos.rotate})`,
        transformOrigin: 'center',
      }}
    >
      <div
        className={`relative h-14 w-14 rounded-full transition-all duration-300 cursor-pointer ${
          isActive ? 'scale-110 shadow-lg -translate-y-1' : 'scale-100'
        }`}
        style={{
          backgroundColor: agent.color || '#6b7280',
          boxShadow: isActive ? `0 0 20px 4px ${agent.color || '#6b7280'}40` : 'none',
        }}
        onClick={() => onAvatarClick(agent.id)}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-white/20 text-2xl font-bold text-white">
          {getInitial(agent.name)}
        </div>
      </div>
      <span
        className="mt-2 text-sm font-medium text-white/80 cursor-pointer hover:text-white"
        onClick={() => onNameClick(agent.id)}
      >
        {agent.name}
      </span>
    </div>
  );
}

// Chat Message Component
interface ChatMessageProps {
  message: Message;
  agents: DemoAgent[];
}

function ChatMessage({ message, agents }: ChatMessageProps) {
  const agent = agents?.find((a) => a?.id === message.agentId);

  if (message.isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] rounded-2xl bg-blue-600 px-4 py-3 text-white">
          <p className="text-sm">{message.content}</p>
          <span className="text-xs text-blue-200">{message.timestamp}</span>
        </div>
      </div>
    );
  }

  if (agent) {
    return (
      <div className="flex items-start space-x-3">
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
          style={{ backgroundColor: agent.color || '#6b7280' }}
        >
          {agent?.name?.charAt(0) || '?'}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-white">{agent?.name || 'Unknown Agent'}</span>
            <span className="text-xs text-gray-400">{message.timestamp}</span>
          </div>
          <div
            className="mt-1 rounded-2xl px-4 py-3 text-white border"
            style={{
              backgroundColor: `${agent.color || '#6b7280'}20`,
              borderColor: `${agent.color || '#6b7280'}40`,
            }}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// User Input Component
interface UserInputProps {
  currentInput: string;
  onInputChange: (input: string) => void;
  onSendMessage: () => void;
  onMentionAgent: (agentId: string) => void;
  agents: DemoAgent[];
  isDisabled: boolean;
}

function UserInput({
  currentInput,
  onInputChange,
  onSendMessage,
  onMentionAgent,
  agents,
  isDisabled,
}: UserInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => onMentionAgent(agent.id)}
            disabled={isDisabled}
            className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            style={{ borderColor: agent.color, borderWidth: 1 }}
          >
            @{agent.name.toLowerCase().replace(/\s+/g, '')}
          </button>
        ))}
      </div>
      <div className="flex space-x-3">
        <textarea
          value={currentInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message to the roundtable..."
          disabled={isDisabled}
          className="flex-1 resize-none rounded-xl bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          rows={3}
        />
        <button
          onClick={onSendMessage}
          disabled={isDisabled || !currentInput.trim()}
          className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// Main Component
export default function RoundtableInterface2(props: Props) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const activeAgentId = undefined; // TODO: Add logic to determine active agent from demo step

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [props.messages]);

  return (
    <div className="relative flex h-[85vh] w-full max-w-4xl mx-auto flex-col rounded-2xl border border-white/10 bg-gray-900/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
      {/* Header with Agent Circle */}
      <header className="relative flex flex-shrink-0 items-center justify-center p-6">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-gray-800/50">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
          </div>
        </div>
        <div className="flex w-full items-center justify-center">
          {props.agents.map((agent, index) => (
            <AgentAvatar
              key={agent.id}
              agent={agent}
              isActive={activeAgentId === agent.id}
              position={index}
              onAvatarClick={props.onAgentFocusedChatOpen || (() => {})}
              onNameClick={props.onAgentModalOpen || (() => {})}
            />
          ))}
        </div>
      </header>

      {/* Messages Area */}
      <div ref={scrollAreaRef} className="flex-grow overflow-y-auto p-6 scroll-smooth">
        <div className="flex flex-col space-y-6">
          {props.messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} agents={props.agents} />
          ))}
          {activeAgentId && (
            <div className="flex items-center space-x-3">
              <AgentAvatar
                agent={props.agents.find((a) => a.id === activeAgentId)!}
                isActive={true}
                isThinking={true}
                onAvatarClick={() => {}}
                onNameClick={() => {}}
              />
              <div className="flex items-center space-x-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50 [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50 [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50"></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Input Footer */}
      <footer className="flex-shrink-0 p-4">
        <UserInput
          currentInput={props.currentUserInput}
          onInputChange={props.onUserInputChange}
          onSendMessage={props.onSendMessage}
          onMentionAgent={props.onMentionAgent}
          agents={props.agents}
          isDisabled={props.isInputDisabled}
        />
      </footer>

      {/* Agent Configuration Modal */}
      {props.openAgentModal && (
        <AgentModal
          agent={props.agents.find((a) => a.id === props.openAgentModal)}
          onClose={props.onAgentModalClose || (() => {})}
        />
      )}

      {/* Focused Agent Chat Modal */}
      {props.openFocusedChat && (
        <FocusedAgentChatModal
          agents={props.agents}
          currentAgentId={props.openFocusedChat}
          conversationHistory={props.demoState?.conversationHistory || []}
          onClose={props.onAgentFocusedChatClose || (() => {})}
          onNavigateAgent={props.onNavigateAgent || (() => {})}
        />
      )}
    </div>
  );
}

// Agent Configuration Modal Component
interface AgentModalProps {
  agent?: DemoAgent;
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
  agents: DemoAgent[];
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
