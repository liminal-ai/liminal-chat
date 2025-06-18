import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./health/health.module";
import { AgentsModule } from "./agents/agents.module";
import { VercelController } from "./vercel/vercel.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    HealthModule,
    AgentsModule,
  ],
  controllers: [VercelController],
})
export class AppModule {}
