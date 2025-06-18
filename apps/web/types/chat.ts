export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Provider {
  id: string
  name: string
  model?: string
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  selectedProvider: Provider
}