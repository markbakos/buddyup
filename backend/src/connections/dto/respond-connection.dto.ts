import { IsEnum, IsNotEmpty } from 'class-validator';
import { ConnectionStatus } from '../enum/connection-status.enum';

export class RespondConnectionDto {
  @IsNotEmpty()
  @IsEnum(ConnectionStatus)
  status: ConnectionStatus;
} 