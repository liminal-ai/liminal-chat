import { Module } from "@nestjs/common";
import { AgentsController } from "./agents.controller";
import { AgentsService } from "./agents.service";
import { ToolRegistryService } from "./tools/tool-registry.service";

@Module({
  controllers: [AgentsController],
  providers: [AgentsService, ToolRegistryService],
  exports: [AgentsService, ToolRegistryService],
})
export class AgentsModule {}
