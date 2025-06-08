import { IsString, IsEnum, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class MessageDto {
  @ApiProperty({
    enum: ["system", "user", "assistant"],
    description: "The role of the message sender",
  })
  @IsEnum(["system", "user", "assistant"])
  role: "system" | "user" | "assistant";

  @ApiProperty({
    description: "The content of the message",
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
