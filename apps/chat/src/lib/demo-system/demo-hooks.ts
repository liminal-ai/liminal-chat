// React Hooks for Demo State Management
// Provides clean interface for components to interact with demo system

import { useState, useCallback, useMemo } from 'react';
import type { DemoControls, RoundtableState } from '../types/roundtable';
import { getDemoScript } from './demo-scripts';
import {
  calculateRoundtableState,
  advanceStep,
  previousStep,
  jumpToStep,
  canAdvanceStep,
  canGoBackStep,
  insertAgentMention,
} from './demo-engine';

/**
 * Main hook for demo controls
 * Provides complete demo state management with navigation and interaction handlers
 */
export function useDemoControls(scriptId: string): DemoControls {
  const script = getDemoScript(scriptId);
  const [currentStep, setCurrentStep] = useState(0);
  const [openAgentModal, setOpenAgentModal] = useState<string | undefined>();
  const [userInputOverride, setUserInputOverride] = useState<string>('');

  // Calculate current roundtable state
  const currentState = useMemo(() => {
    const state = calculateRoundtableState(script, currentStep, openAgentModal);

    // Apply user input override if present
    if (userInputOverride) {
      return { ...state, currentUserInput: userInputOverride };
    }

    return state;
  }, [script, currentStep, openAgentModal, userInputOverride]);

  // Navigation handlers
  const nextStep = useCallback(() => {
    setCurrentStep((current) => advanceStep(script, current));
    setUserInputOverride(''); // Clear override when navigating
  }, [script]);

  const prevStep = useCallback(() => {
    setCurrentStep((current) => previousStep(current));
    setUserInputOverride(''); // Clear override when navigating
  }, []);

  const jumpToStepHandler = useCallback(
    (stepIndex: number) => {
      setCurrentStep(jumpToStep(stepIndex, script.steps.length));
      setUserInputOverride(''); // Clear override when navigating
    },
    [script.steps.length],
  );

  const resetDemo = useCallback(() => {
    setCurrentStep(0);
    setOpenAgentModal(undefined);
    setUserInputOverride('');
  }, []);

  // UI interaction handlers
  const handleUserInput = useCallback((input: string) => {
    setUserInputOverride(input);
  }, []);

  const handleAgentMention = useCallback(
    (agentId: string) => {
      const agent = script.agents.find((a) => a.id === agentId);
      if (!agent) return;

      const mention = {
        agentId: agent.id,
        agentName: agent.name,
        insertText: `@${agent.name.toLowerCase().replace(/\s+/g, '')}`,
      };

      // Insert mention at end of current input
      // In a real implementation, this would respect cursor position
      const currentInput = userInputOverride || currentState.currentUserInput;
      const result = insertAgentMention(currentInput, currentInput.length, mention);
      setUserInputOverride(result.newInput);
    },
    [script.agents, userInputOverride, currentState.currentUserInput],
  );

  const handleAgentModalOpen = useCallback((agentId: string) => {
    setOpenAgentModal(agentId);
  }, []);

  const handleAgentModalClose = useCallback(() => {
    setOpenAgentModal(undefined);
  }, []);

  return {
    currentState,
    currentStep,
    totalSteps: script.steps.length,
    script,
    nextStep,
    prevStep,
    jumpToStep: jumpToStepHandler,
    resetDemo,
    handleUserInput,
    handleAgentMention,
    handleAgentModalOpen,
    handleAgentModalClose,
  };
}

/**
 * Simple hook that just returns the current roundtable state
 * Useful for components that only need to display state without controls
 */
export function useDemoState(scriptId: string, stepIndex?: number): RoundtableState {
  const script = getDemoScript(scriptId);
  const effectiveStep = stepIndex ?? 0;

  return useMemo(() => {
    return calculateRoundtableState(script, effectiveStep);
  }, [script, effectiveStep]);
}

/**
 * Hook for demo navigation utilities
 * Provides info about navigation state without managing it
 */
export function useDemoNavigation(scriptId: string, currentStep: number) {
  const script = getDemoScript(scriptId);

  return useMemo(
    () => ({
      canGoNext: canAdvanceStep(script, currentStep),
      canGoPrevious: canGoBackStep(currentStep),
      stepTitle: script.steps[currentStep]?.title || 'Unknown Step',
      stepProgress: `${currentStep + 1} / ${script.steps.length}`,
      isFirstStep: currentStep === 0,
      isLastStep: currentStep === script.steps.length - 1,
    }),
    [script, currentStep],
  );
}

/**
 * Hook for script selection and management
 */
export function useScriptSelection() {
  const [selectedScriptId, setSelectedScriptId] = useState('character-development');

  const selectScript = useCallback((scriptId: string) => {
    setSelectedScriptId(scriptId);
  }, []);

  const selectedScript = getDemoScript(selectedScriptId);

  return {
    selectedScriptId,
    selectedScript,
    selectScript,
  };
}

/**
 * Debug hook for development
 * Exposes internal state for debugging components
 */
export function useDemoDebug(scriptId: string, currentStep: number) {
  const script = getDemoScript(scriptId);
  const state = calculateRoundtableState(script, currentStep);

  return {
    script,
    currentStep,
    state,
    stepData: script.steps[currentStep],
    conversationLength: state.conversationHistory.length,
    availableMentions: state.availableAgentMentions.length,
  };
}
