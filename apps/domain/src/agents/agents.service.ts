import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { promises as fs } from "fs";
import { join } from "path";
import { nanoid } from "nanoid";

// Type for Node.js file system errors
interface NodeError extends Error {
  code?: string;
}
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
  private readonly dataPath = join(
    process.cwd(),
    "..",
    "domain-data",
    "agents",
  );
  private readonly typesPath = join(this.dataPath, "types");
  private readonly instancesPath = join(this.dataPath, "instances");

  constructor(private readonly toolRegistry: ToolRegistryService) {}

  async onModuleInit() {
    // Ensure directories exist
    await this.ensureDirectoriesExist();
  }

  private async ensureDirectoriesExist() {
    try {
      await fs.access(this.typesPath);
    } catch {
      await fs.mkdir(this.typesPath, { recursive: true });
    }

    try {
      await fs.access(this.instancesPath);
    } catch {
      await fs.mkdir(this.instancesPath, { recursive: true });
    }
  }

  private validateTypeName(typeName: string): void {
    if (!/^[\w-]+$/.test(typeName)) {
      throw new BadRequestException(
        'typeName contains illegal characters. Only alphanumeric characters, underscores, and hyphens are allowed.',
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

    const typePath = join(this.typesPath, `${validatedDto.typeName}.json`);

    // Check if type already exists
    try {
      await fs.access(typePath);
      throw new ConflictException(
        `Agent type '${validatedDto.typeName}' already exists`,
      );
    } catch (error: unknown) {
      if (error instanceof ConflictException) throw error;
      // File doesn't exist, continue
    }

    await fs.writeFile(typePath, JSON.stringify(validatedDto, null, 2));
    return validatedDto;
  }

  async getAgentType(typeName: string): Promise<AgentType> {
    // Validate typeName for path safety - prevent path traversal
    this.validateTypeName(typeName);
    
    const typePath = join(this.typesPath, `${typeName}.json`);

    try {
      const content = await fs.readFile(typePath, "utf-8");
      const data = JSON.parse(content) as unknown;
      return AgentTypeSchema.parse(data);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as NodeError).code === "ENOENT"
      ) {
        throw new NotFoundException(`Agent type '${typeName}' not found`);
      }
      throw new BadRequestException(
        `Failed to read agent type: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async listAgentTypes(): Promise<AgentType[]> {
    try {
      const files = await fs.readdir(this.typesPath);
      const jsonFiles = files.filter((file) => file.endsWith(".json"));

      const types = await Promise.all(
        jsonFiles.map(async (file) => {
          const typeName = file.replace(".json", "");
          return this.getAgentType(typeName);
        }),
      );

      return types;
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as NodeError).code === "ENOENT"
      ) {
        return [];
      }
      throw error;
    }
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

    const typePath = join(this.typesPath, `${typeName}.json`);
    await fs.writeFile(typePath, JSON.stringify(validatedDto, null, 2));

    return validatedDto;
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

    const typePath = join(this.typesPath, `${typeName}.json`);

    try {
      await fs.unlink(typePath);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as NodeError).code === "ENOENT"
      ) {
        throw new NotFoundException(`Agent type '${typeName}' not found`);
      }
      throw error;
    }
  }

  // Agent Instance CRUD Operations

  async createAgentInstance(
    dto: CreateAgentInstanceDto,
  ): Promise<AgentInstance> {
    // Verify the agent type exists
    await this.getAgentType(dto.typeName);

    const agentId = nanoid();
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
    const instancePath = join(this.instancesPath, `${agentId}.json`);

    await fs.writeFile(
      instancePath,
      JSON.stringify(validatedInstance, null, 2),
    );
    return validatedInstance;
  }

  async getAgentInstance(agentId: string): Promise<AgentInstance> {
    const instancePath = join(this.instancesPath, `${agentId}.json`);

    try {
      const content = await fs.readFile(instancePath, "utf-8");
      const data = JSON.parse(content) as Record<string, unknown>;
      // Parse dates from JSON
      data.createdAt = new Date(data.createdAt as string);
      data.updatedAt = new Date(data.updatedAt as string);
      return AgentInstanceSchema.parse(data);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as NodeError).code === "ENOENT"
      ) {
        throw new NotFoundException(`Agent instance '${agentId}' not found`);
      }
      throw new BadRequestException(
        `Failed to read agent instance: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async listAgentInstances(): Promise<AgentInstance[]> {
    try {
      const files = await fs.readdir(this.instancesPath);
      const jsonFiles = files.filter((file) => file.endsWith(".json"));

      const instances = await Promise.all(
        jsonFiles.map(async (file) => {
          const agentId = file.replace(".json", "");
          return this.getAgentInstance(agentId);
        }),
      );

      return instances.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      );
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as NodeError).code === "ENOENT"
      ) {
        return [];
      }
      throw error;
    }
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
    const instancePath = join(this.instancesPath, `${agentId}.json`);

    await fs.writeFile(
      instancePath,
      JSON.stringify(validatedInstance, null, 2),
    );
    return validatedInstance;
  }

  async deleteAgentInstance(agentId: string): Promise<void> {
    const instancePath = join(this.instancesPath, `${agentId}.json`);

    try {
      await fs.unlink(instancePath);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as NodeError).code === "ENOENT"
      ) {
        throw new NotFoundException(`Agent instance '${agentId}' not found`);
      }
      throw error;
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
