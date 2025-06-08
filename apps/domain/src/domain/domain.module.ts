import { Module } from "@nestjs/common";
import { DomainController } from "./domain.controller";
import { DomainService } from "./domain.service";
import { HealthModule } from "../health/health.module";
import { LlmModule } from "../llm/llm.module";

@Module({
  imports: [HealthModule, LlmModule],
  controllers: [DomainController],
  providers: [DomainService],
})
export class DomainModule {}
