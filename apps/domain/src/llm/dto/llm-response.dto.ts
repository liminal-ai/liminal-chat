import { ApiProperty } from "@nestjs/swagger";

export class TokenUsage {
  @ApiProperty({ example: 10 })
  promptTokens: number;

  @ApiProperty({ example: 15 })
  completionTokens: number;

  @ApiProperty({ example: 25 })
  totalTokens: number;
}

export class LlmResponse {
  @ApiProperty({ example: "Echo: Hello, world!" })
  content: string;

  @ApiProperty({ example: "echo-1.0" })
  model: string;

  @ApiProperty({ type: TokenUsage })
  usage: TokenUsage;
}
