# Agent Design Architecture

## Overview
Building agent primitives as composable building blocks for Liminal Chat workflows. Agents are configured entities (not coded) that can orchestrate complex multi-step processes.

## Core Concepts

### Agent Type vs Agent Instance
- **Agent Type**: Template/blueprint defining behavior
- **Agent Instance**: Runtime entity with identity and state

### Agent Type Structure
```json
{
  "typeName": "code-reviewer",
  "systemPrompt": "You are an expert code reviewer...",
  "toolAccess": ["readFile", "runTests", "gitDiff"],
  "persistenceSchema": {
    "type": "object", 
    "properties": {
      "reviewItems": {"type": "array"},
      "standards": {"type": "object"}
    }
  }
}
```

### Agent Instance Structure  
```json
{
  "agentId": "agent-123",
  "agentName": "PR Reviewer Bot",
  "typeName": "code-reviewer", 
  "prompt": "You are an expert code reviewer focused on TypeScript...",
  "context": {
    "conversationHistory": [],
    "workingMemory": {},
    "currentTask": "reviewing PR #456"
  },
  "persistentData": {
    // Structured data based on type's schema
    "reviewItems": [...],
    "standards": {...}
  }
}
```

## Tool System

### Available Tools Registry
```json
{
  "readFile": {
    "description": "Read contents of a file",
    "parameters": ["filepath"],
    "persistence": false
  },
  "workingMemory": {
    "description": "Store and retrieve working notes", 
    "parameters": ["key", "value"],
    "persistence": true,
    "scope": "agent-instance"
  }
}
```

## Persistence Strategy
- **File system storage** with flat JSON (1-2 levels max)
- **Standard context**: conversation history, working memory
- **Custom persistence**: structured data via JSON schema/Zod validation
- **Tool persistence**: per-agent-instance scoped data

## API Endpoints

### Agent Type CRUD
- `GET /agent-types` - list available types
- `POST /agent-types` - create new type
- `PUT /agent-types/{typeName}` - edit existing type
- `DELETE /agent-types/{typeName}` - delete type

### Agent Instance CRUD  
- `GET /agents` - list agent instances
- `GET /agents/{agentId}` - get specific agent
- `POST /agents` - create new agent from type
- `PUT /agents/{agentId}` - edit agent
- `DELETE /agents/{agentId}` - delete agent

### Agent Execution
- `POST /agents/{agentId}/execute` - execute agent with prompt/context

## Use Cases

### UI Builder Agent
Orchestrates: v0 prompting → implementation → Playwright testing → refinement
```json
{
  "persistentData": {
    "componentRequest": "modern chat interface",
    "v0Response": {...},
    "integrationState": {...},
    "playwrightResults": [...]
  }
}
```

### Code Orchestrator Agent
Manages: feature planning → sub-agent delegation → progress tracking
```json
{
  "persistentData": {
    "featurePlan": {...},
    "subAgents": [...],
    "workflowState": {...}
  }
}
```

## Architecture Integration
- **Domain Layer**: Agent definitions, orchestration, state management
- **Vercel AI SDK**: LLM execution, tool calling, streaming
- **File System**: Simple JSON persistence for rapid iteration
- **MCP Servers**: Custom tool extensibility