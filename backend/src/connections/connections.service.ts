import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Connection, ConnectionStatus } from './entities/connection.entity';
import { User } from '../users/user.entity';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { RespondConnectionDto } from './dto/respond-connection.dto';

@Injectable()
export class ConnectionsService {
    constructor(
        @InjectRepository(Connection)
        private connectionsRepository: Repository<Connection>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async sendConnectionRequest(senderId: string, createConnectionDto: CreateConnectionDto): Promise<Connection> {
        const { receiverId } = createConnectionDto;

        const [sender, receiver] = await Promise.all([
            this.usersRepository.findOne({ where: { id: senderId } }),
            this.usersRepository.findOne({ where: { id: receiverId } })
        ]);

        if (!sender || !receiver) {
            throw new NotFoundException('User not found');
        }

        if (senderId === receiverId) {
            throw new BadRequestException('Cannot connect with yourself');
        }

        const existingConnection = await this.connectionsRepository.findOne({
            where: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        });

        if (existingConnection) {
            throw new ConflictException('Connection already exists');
        }

        const connection = this.connectionsRepository.create({
            sender,
            receiver,
            status: ConnectionStatus.PENDING
        });

        return this.connectionsRepository.save(connection);
    }

    async respondToConnection(userId: string, connectionId: string, response: RespondConnectionDto): Promise<Connection> {
        const connection = await this.connectionsRepository.findOne({
            where: { id: connectionId, receiverId: userId, status: ConnectionStatus.PENDING },
            relations: ['sender', 'receiver']
        });

        if (!connection) {
            throw new NotFoundException('Connection request not found');
        }

        connection.status = response.status;
        connection.respondedAt = new Date();

        return this.connectionsRepository.save(connection);
    }

    async getConnectionRequests(userId: string): Promise<Connection[]> {
        return this.connectionsRepository.find({
            where: { receiverId: userId, status: ConnectionStatus.PENDING },
            relations: ['sender'],
            order: { createdAt: 'DESC' }
        });
    }

    async getConnections(userId: string): Promise<Connection[]> {
        return this.connectionsRepository.find({
            where: [
                { senderId: userId, status: ConnectionStatus.ACCEPTED },
                { receiverId: userId, status: ConnectionStatus.ACCEPTED }
            ],
            relations: ['sender', 'receiver']
        });
    }

    async removeConnection(userId: string, connectionId: string): Promise<void> {
        const connection = await this.connectionsRepository.findOne({
            where: [
                { id: connectionId, senderId: userId },
                { id: connectionId, receiverId: userId }
            ]
        });

        if (!connection) {
            throw new NotFoundException('Connection not found');
        }

        await this.connectionsRepository.remove(connection);
    }

    async getConnectionStatus(userId: string, otherUserId: string): Promise<ConnectionStatus | null> {
        const connection = await this.connectionsRepository.findOne({
            where: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ]
        });

        return connection ? connection.status : null;
    }

    async getConnectionStats(userId: string): Promise<{
        totalConnections: number;
        pendingRequests: number;
        sentRequests: number;
    }> {
        const [connections, pendingRequests, sentRequests] = await Promise.all([
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
            totalConnections: connections,
            pendingRequests,
            sentRequests
        };
    }
} 