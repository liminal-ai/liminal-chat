# Domain Server NestJS Migration Prompt

## Context
We're migrating ONLY the Domain server (port 8766) from Express to NestJS with Fastify. The Domain server currently has just 2 endpoints:
- GET `/domain/health` - Returns health status
- POST `/domain/llm/prompt` - Echo provider that returns "Echo: {prompt}"

The Edge server (port 8765) and CLI will remain unchanged. The HTTP contract must stay exactly the same.

## Your Task

### 1. Create New Domain Server Structure
Create a new directory `domain-server-nest` (we'll keep the old one for now):

```bash
mkdir domain-server-nest
cd domain-server-nest
```

### 2. Initialize NestJS Project
```bash
npx @nestjs/cli@latest new . --skip-git --package-manager npm
# Choose "domain-server-nest" as the name
# This creates the basic structure
```

### 3. Install Dependencies
```bash
# Remove Express platform (we're using Fastify)
npm uninstall @nestjs/platform-express

# Install Fastify platform and other dependencies
npm install @nestjs/platform-fastify fastify
npm install @nestjs/config @nestjs/swagger
npm install class-validator class-transformer
npm install --save-dev @types/node
```

### 4. Update main.ts for Fastify
Replace `src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true })
  );

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // CORS
  app.enableCors({
    origin: 'http://localhost:8765', // Edge server
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Domain API')
    .setDescription('Liminal Type Chat Domain Server')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 8766;
  await app.listen(port, '0.0.0.0');
  console.log(`Domain server running on port ${port}`);
}
bootstrap();
```

### 5. Create Domain Module Structure
Create the following files:

**src/domain/domain.module.ts**:
```typescript
import { Module } from '@nestjs/common';
import { DomainController } from './domain.controller';
import { HealthModule } from '../health/health.module';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [HealthModule, LlmModule],
  controllers: [DomainController],
})
export class DomainModule {}
```

**src/domain/domain.controller.ts**:
```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from '../health/health.service';
import { LlmService } from '../llm/llm.service';
import { PromptDto } from '../llm/dto/prompt.dto';
import { LlmResponse } from '../llm/dto/llm-response.dto';

@ApiTags('domain')
@Controller('domain')
export class DomainController {
  constructor(
    private readonly healthService: HealthService,
    private readonly llmService: LlmService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Get domain server health status' })
  @ApiResponse({ status: 200, description: 'Health status' })
  async getHealth() {
    return this.healthService.getHealth();
  }

  @Post('llm/prompt')
  @ApiOperation({ summary: 'Send prompt to LLM provider' })
  @ApiResponse({ status: 200, type: LlmResponse })
  async prompt(@Body() dto: PromptDto): Promise<LlmResponse> {
    return this.llmService.prompt(dto);
  }
}
```

### 6. Create Health Module
**src/health/health.module.ts**:
```typescript
import { Module } from '@nestjs/common';
import { HealthService } from './health.service';

@Module({
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
```

**src/health/health.service.ts**:
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: 'healthy',
      service: 'domain',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
```

### 7. Create LLM Module
**src/llm/llm.module.ts**:
```typescript
import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { EchoProvider } from './providers/echo.provider';

@Module({
  providers: [
    LlmService,
    EchoProvider,
    {
      provide: 'LLM_PROVIDERS',
      useFactory: (echoProvider: EchoProvider) => {
        const providers = new Map();
        providers.set('echo', echoProvider);
        return providers;
      },
      inject: [EchoProvider],
    },
  ],
  exports: [LlmService],
})
export class LlmModule {}
```

**src/llm/llm.service.ts**:
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { PromptDto } from './dto/prompt.dto';
import { LlmResponse } from './dto/llm-response.dto';

@Injectable()
export class LlmService {
  constructor(
    @Inject('LLM_PROVIDERS') private providers: Map<string, any>,
  ) {}

  async prompt(dto: PromptDto): Promise<LlmResponse> {
    const provider = this.providers.get('echo');
    return provider.generateResponse(dto.prompt);
  }
}
```

**src/llm/providers/echo.provider.ts**:
```typescript
import { Injectable } from '@nestjs/common';
import { LlmResponse } from '../dto/llm-response.dto';

@Injectable()
export class EchoProvider {
  async generateResponse(prompt: string): Promise<LlmResponse> {
    const content = `Echo: ${prompt}`;
    const promptTokens = Math.ceil(prompt.length / 4);
    const completionTokens = Math.ceil(content.length / 4);

    return {
      content,
      model: 'echo-1.0',
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
    };
  }
}
```

### 8. Create DTOs
**src/llm/dto/prompt.dto.ts**:
```typescript
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PromptDto {
  @ApiProperty({
    description: 'The prompt to send to the LLM',
    example: 'Hello, world!',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  prompt: string;
}
```

**src/llm/dto/llm-response.dto.ts**:
```typescript
import { ApiProperty } from '@nestjs/swagger';

export class TokenUsage {
  @ApiProperty({ example: 10 })
  promptTokens: number;

  @ApiProperty({ example: 15 })
  completionTokens: number;

  @ApiProperty({ example: 25 })
  totalTokens: number;
}

export class LlmResponse {
  @ApiProperty({ example: 'Echo: Hello, world!' })
  content: string;

  @ApiProperty({ example: 'echo-1.0' })
  model: string;

  @ApiProperty({ type: TokenUsage })
  usage: TokenUsage;
}
```

### 9. Update app.module.ts
Replace `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DomainModule } from './domain/domain.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DomainModule,
  ],
})
export class AppModule {}
```

### 10. Create Test File
**src/llm/llm.service.spec.ts**:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { LlmService } from './llm.service';
import { EchoProvider } from './providers/echo.provider';

describe('LlmService', () => {
  let service: LlmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmService,
        EchoProvider,
        {
          provide: 'LLM_PROVIDERS',
          useFactory: (echoProvider: EchoProvider) => {
            const providers = new Map();
            providers.set('echo', echoProvider);
            return providers;
          },
          inject: [EchoProvider],
        },
      ],
    }).compile();

    service = module.get<LlmService>(LlmService);
  });

  it('should echo the prompt', async () => {
    const result = await service.prompt({ prompt: 'Hello' });
    expect(result.content).toBe('Echo: Hello');
    expect(result.model).toBe('echo-1.0');
    expect(result.usage.totalTokens).toBeGreaterThan(0);
  });
});
```

### 11. Update package.json scripts
Add these scripts to package.json:

```json
{
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  }
}
```

### 12. Testing

1. **Start the new Domain server**:
   ```bash
   npm run start:dev
   ```
   Should start on port 8766

2. **Test the endpoints**:
   ```bash
   # Health check
   curl http://localhost:8766/domain/health

   # Prompt endpoint
   curl -X POST http://localhost:8766/domain/llm/prompt \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Hello NestJS"}'
   ```

3. **Check Swagger docs**:
   Open http://localhost:8766/api-docs

4. **Test with existing Edge server**:
   The Edge server should continue working without any changes

### 13. Verify Integration
With both servers running:
1. Domain on 8766 (new NestJS)
2. Edge on 8765 (existing Express)
3. Run the CLI and verify it still works

## Expected Results
- Same HTTP endpoints with same request/response format
- Swagger documentation available
- Better TypeScript support and validation
- Clean, modular architecture
- All existing Edge/CLI functionality working unchanged

## Definition of Done
- [ ] Domain server runs on port 8766
- [ ] GET `/domain/health` returns health status
- [ ] POST `/domain/llm/prompt` echoes the prompt
- [ ] Swagger docs available at `/api-docs`
- [ ] All tests pass
- [ ] Edge server can communicate with new Domain server
- [ ] CLI works end-to-end without changes