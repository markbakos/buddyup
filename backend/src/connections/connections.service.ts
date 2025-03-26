import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Connection } from './entities/connection.entity';
import { User } from '../users/user.entity';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { RespondConnectionDto } from './dto/respond-connection.dto';
import { ConnectionStatus } from './enum/connection-status.enum';

@Injectable()
export class ConnectionsService {
  constructor(
    @InjectRepository(Connection)
    private readonly connectionsRepository: Repository<Connection>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createConnectionRequest(userId: string, createConnectionDto: CreateConnectionDto): Promise<Connection> {
    const receiver = await this.usersRepository.findOne({ where: { id: createConnectionDto.receiverId } });
    if (!receiver) {
      throw new NotFoundException('User not found');
    }

    const existingConnection = await this.connectionsRepository.findOne({
      where: [
        { senderId: userId, receiverId: createConnectionDto.receiverId },
        { senderId: createConnectionDto.receiverId, receiverId: userId }
      ]
    });

    if (existingConnection) {
      throw new BadRequestException('Connection already exists or is pending');
    }

    const connection = this.connectionsRepository.create({
      senderId: userId,
      receiverId: createConnectionDto.receiverId,
      status: ConnectionStatus.PENDING
    });

    return await this.connectionsRepository.save(connection);
  }

  async respondToConnection(userId: string, connectionId: string, respondDto: RespondConnectionDto): Promise<Connection> {
    const connection = await this.connectionsRepository.findOne({
      where: { id: connectionId }
    });

    if (!connection) {
      throw new NotFoundException('Connection request not found');
    }

    if (connection.receiverId !== userId) {
      throw new ForbiddenException('You can only respond to connection requests sent to you');
    }

    if (connection.status !== ConnectionStatus.PENDING) {
      throw new BadRequestException('Connection request has already been responded to');
    }

    connection.status = respondDto.status;
    connection.respondedAt = new Date();

    return await this.connectionsRepository.save(connection);
  }

  async getConnectionRequests(userId: string): Promise<Connection[]> {
    return await this.connectionsRepository.find({
      where: { receiverId: userId },
      relations: ['sender'],
      order: { createdAt: 'DESC' }
    });
  }

  async getSentRequests(userId: string): Promise<Connection[]> {
    return await this.connectionsRepository.find({
      where: { senderId: userId },
      relations: ['receiver'],
      order: { createdAt: 'DESC' }
    });
  }

  async getConnectionStatus(userId: string, targetUserId: string): Promise<ConnectionStatus | null> {
    const connection = await this.connectionsRepository.findOne({
      where: [
        { senderId: userId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: userId }
      ]
    });

    return connection?.status || null;
  }

  async getConnectionStats(userId: string): Promise<{
    totalConnections: number;
    pendingRequests: number;
    sentRequests: number;
  }> {
    const [totalConnections, pendingRequests, sentRequests] = await Promise.all([
      this.connectionsRepository.count({
        where: [
          { senderId: userId, status: ConnectionStatus.ACCEPTED },
          { receiverId: userId, status: ConnectionStatus.ACCEPTED }
        ]
      }),
      this.connectionsRepository.count({
        where: { receiverId: userId, status: ConnectionStatus.PENDING }
      }),
      this.connectionsRepository.count({
        where: { senderId: userId, status: ConnectionStatus.PENDING }
      })
    ]);

    return {
      totalConnections,
      pendingRequests,
      sentRequests
    };
  }

  async getAllConnections(userId: string): Promise<Connection[]> {
    return await this.connectionsRepository.find({
      where: [
        { senderId: userId, status: ConnectionStatus.ACCEPTED },
        { receiverId: userId, status: ConnectionStatus.ACCEPTED }
      ],
      relations: ['sender', 'receiver'],
      order: { updatedAt: 'DESC' }
    });
  }

  async deleteConnection(userId: string, connectionId: string): Promise<void> {
    const connection = await this.connectionsRepository.findOne({
      where: { id: connectionId }
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    if (connection.senderId !== userId && connection.receiverId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this connection');
    }

    await this.connectionsRepository.remove(connection);
  }
} 