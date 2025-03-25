import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateConnectionDto {
  @IsNotEmpty()
  @IsUUID()
  receiverId: string;
} 