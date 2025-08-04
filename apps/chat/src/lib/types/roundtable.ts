// Core types for the Roundtable Demo System
// These types define the foundational data structures for the demo interface

export interface Agent {
  id: string;
  name: string;
  systemPrompt: string;
  avatar?: string;
  color?: string; // For UI theming
}

export interface ConversationTurn {
  id: string;
  type: 'user_input' | 'agent_response';
  timestamp: number;
  author: string; // user ID or agent ID
  content: string;
  mentionedAgents?: string[]; // For user inputs that @mention agents
}

export interface AgentMention {
  agentId: string;
  agentName: string;
  insertText: string; // e.g., "@supportive"
}

export interface AgentResponse {
  agentId: string;
  content: string;
  delay?: number; // Simulate streaming delay in milliseconds
  isComplete?: boolean; // For partial responses during "streaming"
}

export interface DemoStep {
  id: string;
  title: string; // Human-readable description
  userInput?: string; // What the user types (if this is a user turn)
  expectedAgentResponses: AgentResponse[]; // What agents should respond
  uiNotes?: string; // Instructions for UI state (e.g., "Agent1 modal should be open")
  state: 'composing-message' | 'message-sent' | 'agents-complete';
}

export interface DemoScript {
  id: string;
  title: string;
  description: string;
  agents: Agent[];
  steps: DemoStep[];
}

// This is the state that drives the visual component
export interface RoundtableState {
  // The agents participating in this roundtable
  agents: Agent[];

  // Full conversation history up to current step
  conversationHistory: ConversationTurn[];

  // Current user input box content
  currentUserInput: string;

  // Whether we're waiting for user input or showing agent responses
  awaitingUserInput: boolean;

  // Agent mentions available for insertion (@agent clicking)
  availableAgentMentions: AgentMention[];

  // Which agent modal is open (if any)
  openAgentModal?: string;

  // Current step metadata
  currentStepTitle?: string;
  currentStepIndex?: number;
  totalSteps?: number;
}

// Demo control interface
export interface DemoControls {
  currentState: RoundtableState;
  currentStep: number;
  totalSteps: number;
  script: DemoScript;

  // Navigation functions
  nextStep: () => void;
  prevStep: () => void;
  jumpToStep: (stepIndex: number) => void;
  resetDemo: () => void;

  // UI interaction handlers
  handleUserInput: (input: string) => void;
  handleAgentMention: (agentId: string) => void;
  handleAgentModalOpen: (agentId: string) => void;
  handleAgentModalClose: () => void;
}

// For the component that v0 will generate
export interface RoundtableInterfaceProps {
  state: RoundtableState;
  onUserInput?: (input: string) => void;
  onAgentMention?: (agentId: string) => void;
  onAgentModalOpen?: (agentId: string) => void;
  onAgentModalClose?: () => void;
}
