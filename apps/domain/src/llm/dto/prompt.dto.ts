import { IsString, IsNotEmpty, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PromptDto {
  @ApiProperty({
    description: "The prompt to send to the LLM",
    example: "Hello, world!",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  prompt: string;
}
