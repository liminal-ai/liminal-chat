'use client'

import { Message } from '@/types/chat'
import { cn } from '@/lib/utils'
import { Copy, User, Bot, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy message:', err)
    }
  }

  return (
    <div className={cn(
      "flex gap-3 group transition-all duration-300 hover:bg-muted/20 rounded-lg p-2",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 backdrop-blur-sm">
          <Bot className="w-5 h-5 text-primary" />
        </div>
      )}
      
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-3 relative backdrop-blur-sm border transition-all duration-200 shadow-sm",
        isUser 
          ? "bg-primary/90 text-primary-foreground border-primary/20 shadow-primary/10" 
          : "bg-background/60 border-border/40 hover:bg-background/80"
      )}>
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content || (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
              <span className="text-xs">Thinking...</span>
            </div>
          )}
        </div>
        
        <div className={cn(
          "flex items-center justify-between mt-2 pt-2 border-t opacity-50 text-xs",
          isUser ? "border-primary-foreground/20" : "border-muted-foreground/20"
        )}>
          <span>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className={cn(
              "h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110",
              isUser ? "hover:bg-primary-foreground/20" : "hover:bg-muted-foreground/20",
              copied && "opacity-100"
            )}
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg border-2 border-primary-foreground/20">
          <User className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
    </div>
  )
}