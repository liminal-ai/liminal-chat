import { Injectable } from '@nestjs/common';
import { tool } from 'ai';
import { z } from 'zod';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodSchema;
  persistence: boolean;
  scope?: 'global' | 'agent-instance';
  execute: (params: any, context?: ToolExecutionContext) => Promise<any>;
}

export interface ToolExecutionContext {
  agentId?: string;
  agentName?: string;
  typeName?: string;
}

@Injectable()
export class ToolRegistryService {
  private tools = new Map<string, ToolDefinition>();

  constructor() {
    this.registerBuiltInTools();
  }

  private registerBuiltInTools() {
    // Basic tools available to all agents
    
    this.registerTool({
      name: 'workingMemory',
      description: 'Store and retrieve working notes for the current task',
      parameters: z.object({
        action: z.enum(['get', 'set']),
        key: z.string(),
        value: z.any().optional(),
      }),
      persistence: true,
      scope: 'agent-instance',
      execute: async (params, context) => {
        // TODO: Implement working memory persistence
        if (params.action === 'get') {
          return { key: params.key, value: null }; // Placeholder
        } else {
          return { key: params.key, stored: true }; // Placeholder
        }
      },
    });

    this.registerTool({
      name: 'readFile',
      description: 'Read contents of a file from the project',
      parameters: z.object({
        filepath: z.string(),
      }),
      persistence: false,
      execute: async (params) => {
        // TODO: Implement secure file reading with path validation
        return { 
          filepath: params.filepath, 
          content: 'File content would be here',
          error: 'Not yet implemented'
        };
      },
    });

    this.registerTool({
      name: 'echo',
      description: 'Echo back the input for testing purposes',
      parameters: z.object({
        message: z.string(),
      }),
      persistence: false,
      execute: async (params) => {
        return { echo: params.message };
      },
    });
  }

  registerTool(definition: ToolDefinition): void {
    this.tools.set(definition.name, definition);
  }

  unregisterTool(name: string): boolean {
    return this.tools.delete(name);
  }

  getToolDefinition(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  listAvailableTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  getToolsForAgent(toolNames: string[]): ToolDefinition[] {
    return toolNames
      .map(name => this.tools.get(name))
      .filter((tool): tool is ToolDefinition => tool !== undefined);
  }

  // Convert our tool definitions to Vercel AI SDK format
  createVercelTools(toolNames: string[], context?: ToolExecutionContext): Record<string, any> {
    const tools: Record<string, any> = {};
    
    for (const toolName of toolNames) {
      const toolDef = this.tools.get(toolName);
      if (!toolDef) continue;

      tools[toolName] = tool({
        description: toolDef.description,
        parameters: toolDef.parameters,
        execute: async (params) => {
          return toolDef.execute(params, context);
        },
      });
    }
    
    return tools;
  }

  // Validate tool access for an agent type
  validateToolAccess(toolNames: string[]): string[] {
    const invalidTools = toolNames.filter(name => !this.tools.has(name));
    return invalidTools;
  }
}