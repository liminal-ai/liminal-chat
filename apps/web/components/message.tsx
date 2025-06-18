import { type Message as AIMessage } from "ai"
import { cn } from "@/lib/utils"

interface MessageProps {
  message: AIMessage
}

export function Message({ message }: MessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg px-4 py-3",
        message.role === "user" 
          ? "ml-auto bg-primary text-primary-foreground max-w-[80%]" 
          : "mr-auto bg-muted max-w-[80%]"
      )}
    >
      <div className="text-sm font-medium">
        {message.role === "user" ? "You" : "Assistant"}
      </div>
      <div className="text-sm whitespace-pre-wrap">
        {message.content}
      </div>
    </div>
  )
}