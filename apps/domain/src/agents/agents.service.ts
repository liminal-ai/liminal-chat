import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { fsPersistence } from "../providers/fs-persistence";
import type {
  AgentType,
  CreateAgentTypeDto,
  UpdateAgentTypeDto,
} from "./dto/agent-type.dto";
import type {
  AgentInstance,
  CreateAgentInstanceDto,
  UpdateAgentInstanceDto,
  ExecuteAgentDto,
} from "./dto/agent-instance.dto";
import { AgentTypeSchema } from "./dto/agent-type.dto";
import { AgentInstanceSchema } from "./dto/agent-instance.dto";
import { ToolRegistryService } from "./tools/tool-registry.service";

@Injectable()
export class AgentsService {
  constructor(private readonly toolRegistry: ToolRegistryService) {}

  private validateTypeName(typeName: string): void {
    if (!/^[\w-]+$/.test(typeName)) {
      throw new BadRequestException(
        "typeName contains illegal characters. Only alphanumeric characters, underscores, and hyphens are allowed.",
      );
    }
  }

  // Agent Type CRUD Operations

  async createAgentType(dto: CreateAgentTypeDto): Promise<AgentType> {
    const validatedDto = AgentTypeSchema.parse(dto);

    // Validate typeName for path safety - prevent path traversal
    this.validateTypeName(validatedDto.typeName);

    // Validate tool access
    const invalidTools = this.toolRegistry.validateToolAccess(
      validatedDto.toolAccess,
    );
    if (invalidTools.length > 0) {
      throw new BadRequestException(
        `Invalid tools: ${invalidTools.join(", ")}`,
      );
    }

    // Check if type already exists
    const existing = await fsPersistence.agentType.read(validatedDto.typeName);
    if (existing) {
      throw new ConflictException(
        `Agent type '${validatedDto.typeName}' already exists`,
      );
    }

    // Use typeName as the id for agent types
    const created = await fsPersistence.agentType.write(
      validatedDto.typeName,
      validatedDto,
    );

    // Just return what we stored - fs-persistence fields don't hurt
    return created;
  }

  async getAgentType(typeName: string): Promise<AgentType> {
    // Validate typeName for path safety - prevent path traversal
    this.validateTypeName(typeName);

    const data = await fsPersistence.agentType.read(typeName);

    if (!data) {
      throw new NotFoundException(`Agent type '${typeName}' not found`);
    }

    // Just return what's stored
    return data;
  }

  async listAgentTypes(): Promise<AgentType[]> {
    const allTypes = await fsPersistence.agentType.list();
    // Just return the list - fs-persistence fields don't hurt
    return allTypes;
  }

  async updateAgentType(
    typeName: string,
    dto: UpdateAgentTypeDto,
  ): Promise<AgentType> {
    // Validate typeName for path safety - prevent path traversal
    this.validateTypeName(typeName);

    const existing = await this.getAgentType(typeName);
    const updated = { ...existing, ...dto };
    const validatedDto = AgentTypeSchema.parse(updated);

    const updatedData = await fsPersistence.agentType.update(
      typeName,
      validatedDto,
    );

    if (!updatedData) {
      throw new NotFoundException(`Agent type '${typeName}' not found`);
    }

    // Just return the updated data
    return updatedData;
  }

  async deleteAgentType(typeName: string): Promise<void> {
    // Validate typeName for path safety - prevent path traversal
    this.validateTypeName(typeName);

    // Check if any instances use this type
    const instances = await this.listAgentInstances();
    const dependentInstances = instances.filter(
      (instance) => instance.typeName === typeName,
    );

    if (dependentInstances.length > 0) {
      throw new ConflictException(
        `Cannot delete agent type '${typeName}': ${dependentInstances.length} instances depend on it`,
      );
    }

    const deleted = await fsPersistence.agentType.delete(typeName);

    if (!deleted) {
      throw new NotFoundException(`Agent type '${typeName}' not found`);
    }
  }

  // Agent Instance CRUD Operations

  async createAgentInstance(
    dto: CreateAgentInstanceDto,
  ): Promise<AgentInstance> {
    // Verify the agent type exists
    await this.getAgentType(dto.typeName);

    const agentId = `${dto.agentName}-${dto.typeName}`;
    const now = new Date();

    const instance: AgentInstance = {
      agentId,
      agentName: dto.agentName,
      typeName: dto.typeName,
      prompt: dto.prompt,
      context: {
        conversationHistory: [],
        workingMemory: {},
        currentTask: undefined,
      },
      persistentData: dto.persistentData || {},
      createdAt: now,
      updatedAt: now,
    };

    const validatedInstance = AgentInstanceSchema.parse(instance);

    // Write using the agentId as the file identifier
    const created = await fsPersistence.agent.write(agentId, validatedInstance);

    // Return what fs-persistence gives us, ensuring dates are Date objects
    return {
      ...created,
      createdAt: new Date(created.createdAt),
      updatedAt: new Date(created.updatedAt),
    };
  }

  async getAgentInstance(agentId: string): Promise<AgentInstance> {
    const data = await fsPersistence.agent.read(agentId);

    if (!data) {
      throw new NotFoundException(`Agent instance '${agentId}' not found`);
    }

    // Return with dates converted
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  async listAgentInstances(): Promise<AgentInstance[]> {
    const allInstances = await fsPersistence.agent.list();

    // Convert dates and sort
    const instances = allInstances.map((instance) => ({
      ...instance,
      createdAt: new Date(instance.createdAt),
      updatedAt: new Date(instance.updatedAt),
    }));

    // Sort by updatedAt descending
    return instances.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
  }

  async updateAgentInstance(
    agentId: string,
    dto: UpdateAgentInstanceDto,
  ): Promise<AgentInstance> {
    const existing = await this.getAgentInstance(agentId);

    // If typeName is being changed, verify the new type exists
    if (dto.typeName && dto.typeName !== existing.typeName) {
      await this.getAgentType(dto.typeName);
    }

    const updated = {
      ...existing,
      ...dto,
      updatedAt: new Date(),
    };

    const validatedInstance = AgentInstanceSchema.parse(updated);

    const updatedData = await fsPersistence.agent.update(
      agentId,
      validatedInstance,
    );

    if (!updatedData) {
      throw new NotFoundException(`Agent instance '${agentId}' not found`);
    }

    // Return with dates converted
    return {
      ...updatedData,
      createdAt: new Date(updatedData.createdAt),
      updatedAt: new Date(updatedData.updatedAt),
    };
  }

  async deleteAgentInstance(agentId: string): Promise<void> {
    const deleted = await fsPersistence.agent.delete(agentId);

    if (!deleted) {
      throw new NotFoundException(`Agent instance '${agentId}' not found`);
    }
  }

  // Agent Execution with Vercel AI SDK integration

  async executeAgent(
    agentId: string,
    dto: ExecuteAgentDto,
  ): Promise<{ response: string; usage?: any }> {
    const instance = await this.getAgentInstance(agentId);
    const agentType = await this.getAgentType(instance.typeName);

    // Import generateText here to avoid circular dependency issues
    const { generateText } = await import("ai");
    const { openai } = await import("@ai-sdk/openai");

    // Prepare execution context
    const context = {
      agentId: instance.agentId,
      agentName: instance.agentName,
      typeName: instance.typeName,
    };

    // Get tools for this agent
    const tools = this.toolRegistry.createVercelTools(
      agentType.toolAccess,
      context,
    );

    // Construct system prompt
    const systemPrompt =
      agentType.systemPrompt +
      (instance.prompt
        ? `\n\nAdditional instructions: ${instance.prompt}`
        : "");

    // Add context to the prompt if available
    let contextualPrompt = dto.prompt;
    if (dto.context && Object.keys(dto.context).length > 0) {
      contextualPrompt = `Context: ${JSON.stringify(dto.context, null, 2)}\n\nTask: ${dto.prompt}`;
    }

    try {
      const result = await generateText({
        model: openai("gpt-4o-mini"), // Testing GPT-4o-mini with proper prompt
        system: systemPrompt,
        prompt: contextualPrompt,
        tools: Object.keys(tools).length > 0 ? tools : undefined,
        maxSteps: agentType.toolAccess.length > 0 ? 5 : 1, // Enable multi-step for agents with tools
      });

      // Update agent's working memory with this interaction
      await this.updateAgentContext(agentId, {
        prompt: dto.prompt,
        response: result.text,
        timestamp: new Date().toISOString(),
      });

      return {
        response: result.text,
        usage: result.usage,
      };
    } catch (error: unknown) {
      throw new BadRequestException(
        `Agent execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async updateAgentContext(
    agentId: string,
    interaction: any,
  ): Promise<void> {
    const instance = await this.getAgentInstance(agentId);

    // Add to conversation history
    const updatedContext = {
      ...instance.context,
      conversationHistory: [
        ...instance.context.conversationHistory,
        interaction,
      ].slice(-10), // Keep last 10 interactions
    };

    await this.updateAgentInstance(agentId, { context: updatedContext });
  }
}
