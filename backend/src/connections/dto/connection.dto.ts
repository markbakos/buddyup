import { Exclude, Expose, Type } from 'class-transformer';
import { ConnectionStatus } from '../entities/connection.entity';
import { UserDto } from '../../users/dto/user.dto';

@Exclude()
export class ConnectionDto {
    @Expose()
    id: string;

    @Expose()
    senderId: string;

    @Expose()
    receiverId: string;

    @Expose()
    status: ConnectionStatus;

    @Expose()
    createdAt: Date;

    @Expose()
    respondedAt: Date;

    @Expose()
    @Type(() => UserDto)
    sender: UserDto;

    @Expose()
    @Type(() => UserDto)
    receiver: UserDto;
} 