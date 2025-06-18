'use client'

export default function TypingIndicator() {
  return (
    <div className="flex items-center justify-start p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 backdrop-blur-sm">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        
        <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-background/60 border border-border/40 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
            </div>
            <span className="text-sm text-muted-foreground">Assistant is thinking...</span>
          </div>
        </div>
      </div>
    </div>
  )
}