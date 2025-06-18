"use client"

import { useChat } from "@ai-sdk/react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Message } from "./message"
import { useState } from "react"

export function Chat() {
  const [provider, setProvider] = useState<string>("openai")
  const [model, setModel] = useState<string>("gpt-4.1")
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: `${process.env.NEXT_PUBLIC_DOMAIN_URL || 'http://localhost:8766'}/api/chat`,
    body: {
      provider,
      model,
    },
  })

  const providers = [
    { value: "openai", label: "OpenAI", defaultModel: "gpt-4.1" },
    { value: "anthropic", label: "Anthropic", defaultModel: "claude-4-sonnet-20250514" },
    { value: "google", label: "Google", defaultModel: "gemini-2.5-pro-preview-06-05" },
    { value: "openrouter", label: "OpenRouter", defaultModel: "openai/gpt-4.1" },
  ]

  const handleProviderChange = (newProvider: string) => {
    const providerConfig = providers.find(p => p.value === newProvider)
    setProvider(newProvider)
    if (providerConfig) {
      setModel(providerConfig.defaultModel)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto h-[80vh] flex flex-col">
      <CardHeader>
        <CardTitle>Liminal Chat</CardTitle>
        <div className="flex gap-2 mt-2">
          <select 
            value={provider} 
            onChange={(e) => handleProviderChange(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {providers.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <Input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Model"
            className="max-w-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6">
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}