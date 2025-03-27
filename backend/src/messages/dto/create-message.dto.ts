import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { MessageType } from '../entity/message.entity';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsUUID()
  receiverId: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsEnum(MessageType)
  type: MessageType;

  @IsOptional()
  @IsString()
  jobTitle?: string;
} 