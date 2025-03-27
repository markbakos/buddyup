import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  CreateDateColumn,
  UpdateDateColumn 
} from 'typeorm';
import { User } from '../../users/user.entity';

export enum MessageType {
  APPLYING = 'applying',
  MESSAGE = 'message',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.sentMessages)
  sender: User;

  @ManyToOne(() => User, user => user.receivedMessages)
  receiver: User;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.MESSAGE
  })
  type: MessageType;

  @Column({ nullable: true })
  jobTitle: string;

  @Column('text')
  content: string;

  @Column({ default: false })
  seen: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 