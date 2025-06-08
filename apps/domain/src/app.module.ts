import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DomainModule } from "./domain/domain.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    DomainModule,
  ],
})
export class AppModule {}
