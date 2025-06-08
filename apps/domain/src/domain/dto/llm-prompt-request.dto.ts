import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsArray,
  ValidateNested,
  ValidateIf,
  ArrayMinSize,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
  ValidationArguments,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { MessageDto } from "./message.dto";

@ValidatorConstraint({ name: "oneOfPromptOrMessages", async: false })
export class OneOfPromptOrMessagesConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args?: ValidationArguments): boolean {
    const object = args?.object as LlmPromptRequestDto;
    const hasPrompt = object.prompt !== undefined && object.prompt !== null;
    const hasMessages =
      object.messages !== undefined && object.messages !== null;

    // Exactly one should be provided
    return (hasPrompt && !hasMessages) || (!hasPrompt && hasMessages);
  }

  defaultMessage(): string {
    return "Either prompt or messages must be provided, but not both";
  }
}

export class LlmPromptRequestDto {
  @Validate(OneOfPromptOrMessagesConstraint)
  private readonly _validator?: any;
  @ApiPropertyOptional({
    description: "Simple prompt string",
    minLength: 1,
    maxLength: 4000,
  })
  @ValidateIf((o: LlmPromptRequestDto) => o.prompt !== undefined)
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  prompt?: string;

  @ApiPropertyOptional({
    description: "Array of messages for conversation",
    type: [MessageDto],
  })
  @ValidateIf((o: LlmPromptRequestDto) => o.messages !== undefined)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages?: MessageDto[];

  @ApiPropertyOptional({
    description: "LLM provider to use",
    default: "echo",
  })
  @IsOptional()
  @IsString()
  provider?: string;
}
