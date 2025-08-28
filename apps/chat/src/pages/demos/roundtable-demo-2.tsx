import React from 'react';
import { useDemoControls, useDemoNavigation } from '@/lib/demo-system/demo-hooks';
import RoundtableInterface2 from '@/components/roundtable/RoundtableInterface2';

/**
 * Alternative Roundtable Demo Page - Exploring different UI patterns
 * This page will host a fresh take on the multi-agent roundtable interface
 */
export default function RoundtableDemo2() {
  const {
    currentState,
    currentStep,
    script,
    nextStep,
    prevStep,
    jumpToStep: _jumpToStep,
    resetDemo,
    handleAgentModalOpen,
    handleAgentModalClose,
    handleAgentFocusedChatOpen,
    handleAgentFocusedChatClose,
  } = useDemoControls('character-development');

  const navigation = useDemoNavigation(script.id, currentStep);

  const handleNavigateAgent = (agentId: string) => {
    handleAgentFocusedChatOpen(agentId);
  };

  // Use currentState directly - it already contains the calculated state
  const demoState = currentState;

  // Convert demo system data to RoundtableInterface2 format
  const messages =
    demoState?.conversationHistory?.map((msg) => ({
      id: `${msg.author || 'user'}-${msg.timestamp}`,
      content: msg.content,
      timestamp: new Date(msg.timestamp).toLocaleTimeString(),
      isUser: msg.type === 'user_input',
      agentId: msg.type === 'agent_response' ? msg.author : undefined,
    })) || [];

  const handleUserInputChange = () => {
    // Demo system controls the input, not user typing
  };

  const handleSendMessage = () => {
    nextStep();
  };

  const handleMentionAgent = () => {
    // Demo system handles mentions
  };

  const handleAgentClick = () => {
    // Could implement focused chat modal here
  };

  return (
    <div className="min-h-screen bg-black p-4">
      {/* Background gradients for v0:large aesthetic */}
      <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-br from-black via-gray-900/50 to-black" />
      <div className="absolute inset-0 z-10 h-full w-full bg-[radial-gradient(circle_800px_at_50%_200px,#1e293b,transparent)]" />

      <div className="relative z-20 max-w-7xl mx-auto">
        {/* Controls Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Demo Script Selection */}
          <div className="text-lg font-medium text-white">{script.title}</div>

          {/* Step Controls */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-white/60">
              Step {currentStep + 1} of {script.steps.length}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={prevStep}
                disabled={!navigation.canGoPrevious}
                className="px-4 py-2 bg-gray-800/50 text-white rounded-md hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 backdrop-blur-sm"
              >
                ← Previous
              </button>
              <button
                onClick={nextStep}
                disabled={!navigation.canGoNext}
                className="px-4 py-2 bg-blue-600/50 text-white rounded-md hover:bg-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/20 backdrop-blur-sm"
              >
                Next →
              </button>
              <button
                onClick={resetDemo}
                className="px-4 py-2 bg-red-600/50 text-white rounded-md hover:bg-red-500/50 border border-red-500/20 backdrop-blur-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Current Step Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-medium text-white/90">
            {script.steps[currentStep]?.title || 'Loading...'}
          </h2>
        </div>

        {/* v0:large Roundtable Interface */}
        <RoundtableInterface2
          agents={script.agents}
          messages={messages}
          currentUserInput={demoState.currentUserInput || ''}
          onUserInputChange={handleUserInputChange}
          onSendMessage={handleSendMessage}
          onMentionAgent={handleMentionAgent}
          onAgentClick={handleAgentClick}
          isInputDisabled={true} // Demo system controls progression
          demoState={demoState}
          openAgentModal={demoState.openAgentModal}
          openFocusedChat={demoState.openFocusedChat}
          onAgentModalOpen={handleAgentModalOpen}
          onAgentModalClose={handleAgentModalClose}
          onAgentFocusedChatOpen={handleAgentFocusedChatOpen}
          onAgentFocusedChatClose={handleAgentFocusedChatClose}
          onNavigateAgent={handleNavigateAgent}
        />
      </div>
    </div>
  );
}
