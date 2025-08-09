// Roundtable Demo Page
// Main interface for testing the roundtable primitive with scripted interactions

import { useState } from 'react';
import { useDemoControls, useDemoNavigation, useDemoDebug } from '../lib/demo-system/demo-hooks';
import { getAvailableScripts } from '../lib/demo-system/demo-scripts';
import { RoundtableInterface } from '../components/roundtable/RoundtableInterface';

export default function RoundtableDemo() {
  const [selectedScriptId, setSelectedScriptId] = useState('character-development');
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  const controls = useDemoControls(selectedScriptId);
  const navigation = useDemoNavigation(selectedScriptId, controls.currentStep);
  const debug = useDemoDebug(selectedScriptId, controls.currentStep);

  const availableScripts = getAvailableScripts();

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-xl font-bold text-gray-900">Roundtable Demo</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* Main Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">{controls.script.title}</h2>
                <p className="text-xs text-gray-600 mt-1">{controls.script.description}</p>
              </div>

              {/* Roundtable Interface Container */}
              <div className="p-2 h-[calc(100vh-120px)] max-h-[calc(100vh-120px)]">
                <RoundtableInterface
                  state={controls.currentState}
                  onUserInput={controls.handleUserInput}
                  onAgentMention={controls.handleAgentMention}
                  onAgentModalOpen={controls.handleAgentModalOpen}
                  onAgentModalClose={controls.handleAgentModalClose}
                  onAgentFocusedChatOpen={controls.handleAgentFocusedChatOpen}
                  onAgentFocusedChatClose={controls.handleAgentFocusedChatClose}
                  onSend={controls.nextStep}
                />
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Script Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Demo Script</h3>
              <select
                value={selectedScriptId}
                onChange={(e) => setSelectedScriptId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                {availableScripts.map((script) => (
                  <option key={script.id} value={script.id}>
                    {script.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Step Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Step Controls</h3>

              {/* Current Step Info */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Step {navigation.stepProgress}</div>
                <div className="text-sm font-medium text-gray-900">{navigation.stepTitle}</div>
              </div>

              {/* Navigation Buttons */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={controls.prevStep}
                    disabled={!navigation.canGoPrevious}
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={controls.nextStep}
                    disabled={!navigation.canGoNext}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                  >
                    Next →
                  </button>
                </div>

                <button
                  onClick={controls.resetDemo}
                  className="w-full px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Reset Demo
                </button>
              </div>
            </div>

            {/* Step List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">All Steps</h3>
              <div className="space-y-1">
                {controls.script.steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => controls.jumpToStep(index)}
                    className={`w-full text-left px-2 py-2 text-sm rounded-md transition-colors ${
                      index === controls.currentStep
                        ? 'bg-blue-100 text-blue-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">
                      {index + 1}. {step.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Debug Panel Toggle */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <button
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                {showDebugPanel ? 'Hide Debug' : 'Show Debug'}
              </button>
            </div>
          </div>
        </div>

        {/* Debug Panel */}
        {showDebugPanel && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Debug Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-600">Current Step</div>
                <div className="text-gray-900">{debug.currentStep + 1}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Conversation Length</div>
                <div className="text-gray-900">{debug.conversationLength} turns</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Available Mentions</div>
                <div className="text-gray-900">{debug.availableMentions} agents</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Open Modal</div>
                <div className="text-gray-900">
                  {controls.currentState.openAgentModal || 'None'}
                </div>
              </div>
            </div>

            {/* Step Data */}
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <div className="font-medium text-gray-600 mb-2">Current Step Data:</div>
              <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(debug.stepData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
