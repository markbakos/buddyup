import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entity/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { User } from '../users/user.entity';
import { MessageResponseDto } from './dto/message.response.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private mapToResponseDto(message: Message): MessageResponseDto {
    return {
      id: message.id,
      sender: {
        id: message.sender.id,
        name: message.sender.name,
        email: message.sender.email,
        jobTitle: message.sender.jobTitle,
      },
      receiver: {
        id: message.receiver.id,
        name: message.receiver.name,
        email: message.receiver.email,
        jobTitle: message.receiver.jobTitle,
      },
      type: message.type,
      jobTitle: message.jobTitle,
      content: message.content,
      seen: message.seen,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  async create(userId: string, createMessageDto: CreateMessageDto): Promise<MessageResponseDto> {
    const sender = await this.usersRepository.findOne({ where: { id: userId } });
    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    const receiver = await this.usersRepository.findOne({ 
      where: { id: createMessageDto.receiverId } 
    });
    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    const message = this.messagesRepository.create({
      sender,
      receiver,
      type: createMessageDto.type,
      jobTitle: createMessageDto.jobTitle,
      content: createMessageDto.content,
      seen: false,
    });

    const savedMessage = await this.messagesRepository.save(message);
    
    const messageWithRelations = await this.messagesRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender', 'receiver'],
    });
    
    if (!messageWithRelations) {
      throw new NotFoundException('Message not found after creation');
    }

    return this.mapToResponseDto(messageWithRelations);
  }

  async findAll(userId: string): Promise<MessageResponseDto[]> {
    const messages = await this.messagesRepository.find({
      where: [
        { sender: { id: userId } },
        { receiver: { id: userId } },
      ],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    });

    return messages.map(message => this.mapToResponseDto(message));
  }

  async findBySender(senderId: string): Promise<MessageResponseDto[]> {
    const messages = await this.messagesRepository.find({
      where: { sender: { id: senderId } },
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    });

    return messages.map(message => this.mapToResponseDto(message));
  }

  async findByReceiver(receiverId: string): Promise<MessageResponseDto[]> {
    const messages = await this.messagesRepository.find({
      where: { receiver: { id: receiverId } },
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    });

    return messages.map(message => this.mapToResponseDto(message));
  }

  async findOne(id: string, userId: string): Promise<MessageResponseDto> {
    const message = await this.messagesRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.sender.id !== userId && message.receiver.id !== userId) {
      throw new ForbiddenException('You do not have permission to access this message');
    }

    return this.mapToResponseDto(message);
  }

  async update(id: string, userId: string, updateMessageDto: UpdateMessageDto): Promise<MessageResponseDto> {
    const message = await this.messagesRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (updateMessageDto.seen !== undefined && message.receiver.id !== userId) {
      throw new ForbiddenException('Only the receiver can mark a message as seen');
    }

    if (updateMessageDto.seen !== undefined) {
      message.seen = updateMessageDto.seen;
    }

    const updatedMessage = await this.messagesRepository.save(message);
    return this.mapToResponseDto(updatedMessage);
  }

  async remove(id: string, userId: string): Promise<void> {
    const message = await this.messagesRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.sender.id !== userId && message.receiver.id !== userId) {
      throw new ForbiddenException('You do not have permission to delete this message');
    }

    await this.messagesRepository.remove(message);
  }
} 