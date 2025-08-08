import React, { useState, useRef, useEffect } from 'react';

// Type definitions
interface Agent {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

interface Message {
  id: string;
  content: string;
  author: 'user' | string;
  timestamp: Date;
  mentionedAgents?: string[];
  isThinking?: boolean;
}

// Mock agents data
const agents: Agent[] = [
  { id: 'creative', name: 'Creative', color: '#8b5cf6' },
  { id: 'analytical', name: 'Analytical', color: '#3b82f6' },
  { id: 'supportive', name: 'Supportive', color: '#10b981' },
];

// Mock conversation data
const initialMessages: Message[] = [
  {
    id: '1',
    content: '@creative @analytical How can we improve user engagement on our platform?',
    author: 'user',
    timestamp: new Date('2024-01-20T10:00:00'),
    mentionedAgents: ['creative', 'analytical'],
  },
  {
    id: '2',
    content:
      'What if we add gamification elements? Points, badges, and leaderboards could make the experience more fun and competitive. We could also introduce daily challenges!',
    author: 'creative',
    timestamp: new Date('2024-01-20T10:00:30'),
  },
  {
    id: '3',
    content:
      'Based on our user data, engagement drops 40% after the first week. We should focus on retention features like personalized recommendations and milestone celebrations. The data suggests users value progress tracking.',
    author: 'analytical',
    timestamp: new Date('2024-01-20T10:00:45'),
  },
  {
    id: '4',
    content: '@supportive What do you think about the user experience aspect?',
    author: 'user',
    timestamp: new Date('2024-01-20T10:01:00'),
    mentionedAgents: ['supportive'],
  },
  {
    id: '5',
    content:
      "I love both ideas! The key is making users feel valued and understood. Combining gamification with personalized experiences could create a supportive environment where users celebrate each other's achievements. We should ensure it feels encouraging, not competitive.",
    author: 'supportive',
    timestamp: new Date('2024-01-20T10:01:15'),
  },
];

// Agent Avatar Component
function AgentAvatar({
  agent,
  isLarge = false,
  onClick,
  isActive = false,
}: {
  agent: Agent;
  isLarge?: boolean;
  onClick?: () => void;
  isActive?: boolean;
}) {
  const size = isLarge ? 'h-16 w-16 text-2xl' : 'h-8 w-8 text-sm';

  return (
    <div
      className={`${size} rounded-full flex items-center justify-center text-white font-bold cursor-pointer transition-all duration-200 ${
        isActive ? 'ring-4 ring-opacity-50 scale-110' : 'hover:scale-105'
      }`}
      style={{
        backgroundColor: agent.color,
        boxShadow: isActive ? `0 0 20px ${agent.color}40` : '0 2px 4px rgba(0,0,0,0.1)',
        ...(isActive && { ringColor: agent.color }),
      }}
      onClick={onClick}
    >
      {agent.name.charAt(0)}
    </div>
  );
}

// Message Component
function ChatMessage({ message, agents }: { message: Message; agents: Agent[] }) {
  const isUser = message.author === 'user';
  const agent = agents.find((a) => a.id === message.author);

  if (message.isThinking && agent) {
    return (
      <div className="flex items-start space-x-3 animate-fadeIn">
        <AgentAvatar agent={agent} />
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-sm text-gray-500">{agent.name} is thinking</span>
          <div className="flex space-x-1">
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="flex justify-end animate-fadeIn">
        <div className="max-w-[70%] space-y-1">
          <div className="bg-blue-600 text-white rounded-2xl px-4 py-3 shadow-md">
            <p className="text-sm">{message.content}</p>
          </div>
          <p className="text-xs text-gray-500 text-right">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    );
  }

  if (agent) {
    return (
      <div className="flex items-start space-x-3 animate-fadeIn">
        <AgentAvatar agent={agent} />
        <div className="flex-1 max-w-[70%] space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium" style={{ color: agent.color }}>
              {agent.name}
            </span>
            <span className="text-xs text-gray-500">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div
            className="rounded-2xl px-4 py-3 shadow-sm"
            style={{
              backgroundColor: `${agent.color}10`,
              border: `1px solid ${agent.color}20`,
            }}
          >
            <p className="text-sm text-gray-800">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Main Component
export default function RoundtableDemo4() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [_isThinking, setIsThinking] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle @mention toggle
  const toggleAgentMention = (agentId: string) => {
    setSelectedAgents((prev) => {
      const isSelected = prev.includes(agentId);
      const newSelected = isSelected ? prev.filter((id) => id !== agentId) : [...prev, agentId];

      // Update input value
      const mentions = newSelected
        .map((id) => {
          const agent = agents.find((a) => a.id === id);
          return `@${agent?.name.toLowerCase()}`;
        })
        .join(' ');

      setInputValue(mentions + (mentions ? ' ' : ''));

      return newSelected;
    });
  };

  // Handle send message (mock)
  const handleSendMessage = () => {
    if (!inputValue.trim() || selectedAgents.length === 0) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      author: 'user',
      timestamp: new Date(),
      mentionedAgents: selectedAgents,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Show thinking indicators
    setIsThinking(selectedAgents);

    // Add thinking messages
    const thinkingMessages = selectedAgents.map((agentId) => ({
      id: `thinking-${agentId}`,
      content: '',
      author: agentId,
      timestamp: new Date(),
      isThinking: true,
    }));

    setMessages((prev) => [...prev, ...thinkingMessages]);

    // Simulate agent responses
    setTimeout(() => {
      const responses = selectedAgents.map((agentId, index) => {
        const _agent = agents.find((a) => a.id === agentId);
        const responseTexts = {
          creative:
            "That's an interesting challenge! What if we created an interactive tutorial that adapts to each user's learning style? We could use storytelling elements to make it more engaging.",
          analytical:
            'Looking at the metrics, successful onboarding correlates with users who complete at least 3 key actions in their first session. We should optimize for those specific behaviors.',
          supportive:
            "Great question! The most important thing is helping users feel confident and capable. Let's make sure every interaction reinforces their progress and celebrates small wins.",
        };

        return {
          id: Date.now().toString() + index,
          content:
            responseTexts[agentId as keyof typeof responseTexts] ||
            'Thank you for asking! Let me think about that...',
          author: agentId,
          timestamp: new Date(),
        };
      });

      // Remove thinking messages and add real responses
      setMessages((prev) => {
        const withoutThinking = prev.filter((m) => !m.isThinking);
        return [...withoutThinking, ...responses];
      });
      setIsThinking([]);
      setSelectedAgents([]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <h1 className="text-2xl font-bold text-center mb-6">AI Roundtable Discussion</h1>

            {/* Agent Avatars */}
            <div className="flex justify-center items-center space-x-8">
              {agents.map((agent) => (
                <div key={agent.id} className="flex flex-col items-center space-y-2">
                  <AgentAvatar
                    agent={agent}
                    isLarge
                    isActive={selectedAgents.includes(agent.id)}
                    onClick={() => toggleAgentMention(agent.id)}
                  />
                  <span className="text-sm font-medium">{agent.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} agents={agents} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-4">
            {/* @mention buttons */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-sm text-gray-600">Mention:</span>
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => toggleAgentMention(agent.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    selectedAgents.includes(agent.id)
                      ? 'text-white shadow-md scale-105'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={{
                    ...(selectedAgents.includes(agent.id) && {
                      backgroundColor: agent.color,
                      boxShadow: `0 2px 8px ${agent.color}40`,
                    }),
                  }}
                >
                  @{agent.name}
                </button>
              ))}
            </div>

            {/* Input field */}
            <div className="flex space-x-3">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message... (mention agents with @ to get their response)"
                className="flex-1 p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || selectedAgents.length === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Send
              </button>
            </div>

            {selectedAgents.length === 0 && inputValue && (
              <p className="text-xs text-amber-600 mt-2">
                ⚠️ Please mention at least one agent to get a response
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;
document.head.appendChild(style);
