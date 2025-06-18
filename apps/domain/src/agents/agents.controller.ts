import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  NotFoundException,
} from "@nestjs/common";
import { AgentsService } from "./agents.service";
import { ToolRegistryService } from "./tools/tool-registry.service";
import type {
  CreateAgentTypeDto,
  UpdateAgentTypeDto,
  CreateAgentInstanceDto,
  UpdateAgentInstanceDto,
  ExecuteAgentDto,
} from "./dto";

@Controller("agents")
@UsePipes(new ValidationPipe({ transform: true }))
export class AgentsController {
  constructor(
    private readonly agentsService: AgentsService,
    private readonly toolRegistry: ToolRegistryService,
  ) {}

  // Agent Type Endpoints

  @Get("types")
  async listAgentTypes() {
    return this.agentsService.listAgentTypes();
  }

  @Get("types/:typeName")
  async getAgentType(@Param("typeName") typeName: string) {
    return this.agentsService.getAgentType(typeName);
  }

  @Post("types")
  async createAgentType(@Body() dto: CreateAgentTypeDto) {
    return this.agentsService.createAgentType(dto);
  }

  @Put("types/:typeName")
  async updateAgentType(
    @Param("typeName") typeName: string,
    @Body() dto: UpdateAgentTypeDto,
  ) {
    return this.agentsService.updateAgentType(typeName, dto);
  }

  @Delete("types/:typeName")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAgentType(@Param("typeName") typeName: string) {
    await this.agentsService.deleteAgentType(typeName);
  }

  // Agent Instance Endpoints

  @Get()
  async listAgentInstances() {
    return this.agentsService.listAgentInstances();
  }

  @Get(":agentId")
  async getAgentInstance(@Param("agentId") agentId: string) {
    return this.agentsService.getAgentInstance(agentId);
  }

  @Post()
  async createAgentInstance(@Body() dto: CreateAgentInstanceDto) {
    return this.agentsService.createAgentInstance(dto);
  }

  @Put(":agentId")
  async updateAgentInstance(
    @Param("agentId") agentId: string,
    @Body() dto: UpdateAgentInstanceDto,
  ) {
    return this.agentsService.updateAgentInstance(agentId, dto);
  }

  @Delete(":agentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAgentInstance(@Param("agentId") agentId: string) {
    await this.agentsService.deleteAgentInstance(agentId);
  }

  // Agent Execution

  @Post(":agentId/execute")
  async executeAgent(
    @Param("agentId") agentId: string,
    @Body() dto: ExecuteAgentDto,
  ) {
    return this.agentsService.executeAgent(agentId, dto);
  }

  // Tool Registry Endpoints

  @Get("tools")
  listAvailableTools() {
    return this.toolRegistry.listAvailableTools();
  }

  @Get("tools/:toolName")
  getToolDefinition(@Param("toolName") toolName: string) {
    const tool = this.toolRegistry.getToolDefinition(toolName);
    if (!tool) {
      throw new NotFoundException(`Tool '${toolName}' not found`);
    }
    return tool;
  }
}
