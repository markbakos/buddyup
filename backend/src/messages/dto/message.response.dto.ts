import { MessageType } from '../entity/message.entity';

export class UserInfo {
  id: string;
  name: string;
  email: string;
  jobTitle?: string;
}

export class MessageResponseDto {
  id: string;
  sender: UserInfo;
  receiver: UserInfo;
  type: MessageType;
  jobTitle?: string;
  content: string;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
} 