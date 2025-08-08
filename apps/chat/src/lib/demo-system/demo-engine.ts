// Demo Engine - Pure client-side state calculation
// No backend dependencies - everything driven from scripted data

import type {
  DemoScript,
  DemoStep,
  RoundtableState,
  ConversationTurn,
  AgentMention,
} from '../types/roundtable';

/**
 * Calculate the current roundtable state from a demo script and step index
 * This is pure state calculation - no side effects, no backend calls
 */
export function calculateRoundtableState(
  script: DemoScript,
  stepIndex: number,
  openAgentModal?: string,
): RoundtableState {
  // Clamp step index to valid range
  const currentStepIndex = Math.max(0, Math.min(stepIndex, script.steps.length - 1));
  const currentStep = script.steps[currentStepIndex];

  // Build conversation history up to current step
  const conversationHistory = buildConversationHistory(script, currentStepIndex);

  // Generate agent mentions for @clicking
  const availableAgentMentions: AgentMention[] = script.agents.map((agent) => ({
    agentId: agent.id,
    agentName: agent.name,
    insertText: `@${agent.name.toLowerCase().replace(/\s+/g, '')}`,
  }));

  // Determine current user input based on step
  const currentUserInput = getCurrentUserInput(currentStep);

  // Determine if we're waiting for user input
  const awaitingUserInput = currentStep.state === 'composing-message';

  return {
    agents: script.agents,
    conversationHistory,
    currentUserInput,
    awaitingUserInput,
    availableAgentMentions,
    openAgentModal,
    currentStepTitle: currentStep.title,
    currentStepIndex,
    totalSteps: script.steps.length,
  };
}

/**
 * Build the full conversation history up to the specified step
 */
function buildConversationHistory(script: DemoScript, upToStepIndex: number): ConversationTurn[] {
  const history: ConversationTurn[] = [];
  let turnId = 1;

  for (let i = 0; i <= upToStepIndex; i++) {
    const step = script.steps[i];
    const timestamp = Date.now() - (script.steps.length - i) * 60000; // Fake timestamps

    // Add user input only when message is first sent (not again when complete)
    if (step.userInput && step.state === 'message-sent') {
      const mentionedAgents = extractMentionedAgents(step.userInput);

      history.push({
        id: `turn-${turnId++}`,
        type: 'user_input',
        timestamp,
        author: 'user',
        content: step.userInput,
        mentionedAgents,
      });
    }

    // Add agent responses only for completed steps
    if (step.state === 'agents-complete') {
      for (const response of step.expectedAgentResponses) {
        if (response.isComplete !== false) {
          history.push({
            id: `turn-${turnId++}`,
            type: 'agent_response',
            timestamp: timestamp + 1000, // Agent responses come after user input
            author: response.agentId,
            content: response.content,
          });
        }
      }
    }
  }

  return history;
}

/**
 * Extract mentioned agent IDs from user input text
 */
function extractMentionedAgents(userInput: string): string[] {
  const mentions = userInput.match(/@\w+/g) || [];
  return mentions.map((mention) => mention.substring(1)); // Remove @ symbol
}

/**
 * Determine current user input based on step state
 */
function getCurrentUserInput(step: DemoStep): string {
  if (step.state === 'composing-message' && step.userInput) {
    return step.userInput; // Show message being composed
  }

  if (step.state === 'message-sent' && step.userInput) {
    return ''; // Message was sent, clear the input box
  }

  if (step.state === 'agents-complete') {
    return ''; // Empty input box, ready for next message
  }

  return ''; // Default empty input box
}

/**
 * Advance to the next step in the demo
 */
export function advanceStep(script: DemoScript, currentStep: number): number {
  return Math.min(currentStep + 1, script.steps.length - 1);
}

/**
 * Go back to the previous step in the demo
 */
export function previousStep(currentStep: number): number {
  return Math.max(currentStep - 1, 0);
}

/**
 * Jump to a specific step (clamped to valid range)
 */
export function jumpToStep(targetStep: number, maxSteps: number): number {
  return Math.max(0, Math.min(targetStep, maxSteps - 1));
}

/**
 * Check if we can advance to next step
 */
export function canAdvanceStep(script: DemoScript, currentStep: number): boolean {
  return currentStep < script.steps.length - 1;
}

/**
 * Check if we can go back to previous step
 */
export function canGoBackStep(currentStep: number): boolean {
  return currentStep > 0;
}

/**
 * Insert an agent mention into user input at cursor position
 * This simulates clicking @agent buttons
 */
export function insertAgentMention(
  currentInput: string,
  cursorPosition: number,
  mention: AgentMention,
): { newInput: string; newCursorPosition: number } {
  const before = currentInput.substring(0, cursorPosition);
  const after = currentInput.substring(cursorPosition);

  // Add space before mention if needed
  const needsSpaceBefore = before.length > 0 && !before.endsWith(' ');
  const prefix = needsSpaceBefore ? ' ' : '';

  // Add space after mention
  const suffix = ' ';

  const insertText = `${prefix}${mention.insertText}${suffix}`;
  const newInput = before + insertText + after;
  const newCursorPosition = cursorPosition + insertText.length;

  return { newInput, newCursorPosition };
}
