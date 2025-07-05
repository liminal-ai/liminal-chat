'use client';

import { useQuery, useAction } from 'convex/react';
import { api } from '@liminal-api/convex/_generated/api';
import { Id } from '@liminal-api/convex/_generated/dataModel';
import { ErrorBoundary } from '@/components/error-boundary';
import { useState, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

function ChatContent({ conversationId }: { conversationId: string }) {
  const [message, setMessage] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('openai');

  // Fetch conversation and messages
  const conversation = useQuery(api.conversations.get, {
    conversationId: conversationId as Id<'conversations'>,
  });
  const messagesResult = useQuery(api.messages.list, {
    conversationId: conversationId as Id<'conversations'>,
    paginationOpts: { numItems: 50 },
  });
  const messages = messagesResult?.page || [];

  // Send message action
  const sendMessage = useAction(api.chat.simpleChatAction);

  const isLoading = conversation === undefined || messagesResult === undefined;

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const result = await sendMessage({
        prompt: message,
        provider: selectedProvider as any,
        conversationId: conversationId as Id<'conversations'>,
      });
      setMessage('');

      // Note: Convex useQuery should automatically update
      // when new messages are added to the database
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-blue-600">Loading conversation...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600">Conversation not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{conversation.title}</CardTitle>
            <div className="text-sm text-gray-600">
              Created: {new Date(conversation._creationTime).toLocaleString()}
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages && messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg._id} className="p-4 border rounded-lg">
                    <div className="text-sm text-gray-500 mb-2">
                      {msg.authorType} ({msg.authorId}) •{' '}
                      {new Date(msg._creationTime).toLocaleString()}
                    </div>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-8">
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Input */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Provider Selection */}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Provider:</label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                  <option value="perplexity">Perplexity</option>
                  <option value="vercel">Vercel</option>
                  <option value="openrouter">OpenRouter</option>
                </select>
              </div>

              {/* Message Input */}
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={!message.trim()}>
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ChatPage({ params }: ChatPageProps) {
  const { id } = use(params);

  return (
    <ErrorBoundary>
      <ChatContent conversationId={id} />
    </ErrorBoundary>
  );
}
