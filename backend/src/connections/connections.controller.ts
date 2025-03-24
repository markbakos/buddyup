import { Controller, Post, Get, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { RespondConnectionDto } from './dto/respond-connection.dto';

@Controller('connections')
@UseGuards(JwtAuthGuard)
export class ConnectionsController {
    constructor(private readonly connectionsService: ConnectionsService) {}

    @Post()
    async sendConnectionRequest(
        @GetUser('id') userId: string,
        @Body() createConnectionDto: CreateConnectionDto
    ) {
        return this.connectionsService.sendConnectionRequest(userId, createConnectionDto);
    }

    @Post(':id/respond')
    async respondToConnection(
        @GetUser('id') userId: string,
        @Param('id') connectionId: string,
        @Body() respondConnectionDto: RespondConnectionDto
    ) {
        return this.connectionsService.respondToConnection(userId, connectionId, respondConnectionDto);
    }

    @Get('requests')
    async getConnectionRequests(@GetUser('id') userId: string) {
        return this.connectionsService.getConnectionRequests(userId);
    }

    @Get()
    async getConnections(@GetUser('id') userId: string) {
        return this.connectionsService.getConnections(userId);
    }

    @Delete(':id')
    async removeConnection(
        @GetUser('id') userId: string,
        @Param('id') connectionId: string
    ) {
        return this.connectionsService.removeConnection(userId, connectionId);
    }

    @Get('stats')
    async getConnectionStats(@GetUser('id') userId: string) {
        return this.connectionsService.getConnectionStats(userId);
    }

    @Get(':userId/status')
    async getConnectionStatus(
        @GetUser('id') userId: string,
        @Param('userId') otherUserId: string
    ) {
        return this.connectionsService.getConnectionStatus(userId, otherUserId);
    }
} 