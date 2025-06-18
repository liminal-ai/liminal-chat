'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Message, Provider } from '@/types/chat'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import MessageBubble from './message-bubble'
import TypingIndicator from './typing-indicator'
import { Send, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const PROVIDERS: Provider[] = [
  { id: 'openai', name: 'OpenAI GPT-4', model: 'gpt-4o-mini' },
  { id: 'anthropic', name: 'Anthropic Claude', model: 'claude-3-5-sonnet-20241022' },
  { id: 'google', name: 'Google Gemini', model: 'gemini-2.0-flash-exp' },
  { id: 'openrouter', name: 'OpenRouter', model: 'openai/gpt-4o-mini' },
  { id: 'vercel', name: 'Vercel v0', model: 'v0-1.0-md' },
]

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<Provider>(PROVIDERS[0])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      })
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = inputRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px'
    }
  }, [input])

  // Handle streaming response
  const handleStream = async (response: Response, messageId: string) => {
    const reader = response.body?.getReader()
    if (!reader) return

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('0:')) {
            const content = JSON.parse(line.slice(2))
            setMessages(prev => prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, content: msg.content + content }
                : msg
            ))
          }
        }
      }
      // Process any residual data left in the buffer
      if (buffer.startsWith('0:')) {
        const content = JSON.parse(buffer.slice(2))
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId ? { ...msg, content: msg.content + content } : msg
          ),
        )
      }
    } catch (error) {
      console.error('Streaming error:', error)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8766/api/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: input.trim(),
          provider: selectedProvider.id,
          model: selectedProvider.model
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await handleStream(response, assistantMessage.id)
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: 'Sorry, I encountered an error. Please try again.' }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Handle provider change
  const handleProviderChange = (providerId: string) => {
    const provider = PROVIDERS.find(p => p.id === providerId)
    if (provider) {
      setSelectedProvider(provider)
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sparkles className="w-7 h-7 text-primary animate-pulse" />
            <div className="absolute inset-0 w-7 h-7 bg-primary/20 rounded-full animate-ping" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Liminal Chat</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Provider:</span>
            <Select value={selectedProvider.id} onValueChange={handleProviderChange}>
              <SelectTrigger className="w-44 bg-background/50 border-border/60 backdrop-blur-sm hover:bg-background/80 transition-all duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="flex flex-col">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center backdrop-blur-sm border border-primary/20">
                  <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary/10 animate-ping" />
              </div>
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Welcome to Liminal Chat</h2>
              <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
                Start a conversation with your chosen AI provider. Ask questions, get help with coding, 
                or explore ideas together.
              </p>
              <div className="flex gap-2 mt-6">
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {messages.map((message, index) => (
                <div 
                  key={message.id} 
                  className="animate-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <MessageBubble message={message} />
                </div>
              ))}
            </div>
          )}
          
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="min-h-[52px] max-h-32 resize-none bg-background/50 border-border/60 backdrop-blur-sm focus:bg-background/80 transition-all duration-200 rounded-xl px-4 py-3 pr-12"
              disabled={isLoading}
              rows={1}
            />
            {input.length > 0 && (
              <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                {input.length}
              </div>
            )}
          </div>
          <Button 
            onClick={sendMessage} 
            disabled={!input.trim() || isLoading}
            size="icon"
            className={cn(
              "shrink-0 h-[52px] w-12 rounded-xl transition-all duration-200",
              input.trim() && !isLoading 
                ? "bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/25" 
                : "bg-muted"
            )}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px] font-mono">Enter</kbd>
            <span>to send,</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px] font-mono">Shift+Enter</kbd>
            <span>for new line</span>
          </span>
          {messages.length > 0 && (
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-[10px] font-medium">
              {messages.length} message{messages.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}