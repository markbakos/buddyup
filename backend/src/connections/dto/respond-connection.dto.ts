import { IsEnum } from 'class-validator';
import { ConnectionStatus } from '../entities/connection.entity';

export class RespondConnectionDto {
    @IsEnum(ConnectionStatus)
    status: ConnectionStatus;
} 