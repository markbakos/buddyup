import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Column } from 'typeorm';
import { User } from '../../users/user.entity';

export enum ConnectionStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected'
}

@Entity('connections')
export class Connection {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.sentConnections)
    sender: User;

    @Column()
    senderId: string;

    @ManyToOne(() => User, user => user.receivedConnections)
    receiver: User;

    @Column()
    receiverId: string;

    @Column({
        type: 'enum',
        enum: ConnectionStatus,
        default: ConnectionStatus.PENDING
    })
    status: ConnectionStatus;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    respondedAt: Date;
} 