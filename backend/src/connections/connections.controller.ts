import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { RespondConnectionDto } from './dto/respond-connection.dto';

@Controller('connections')
@UseGuards(JwtAuthGuard)
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Post()
  create(@Request() req, @Body() createConnectionDto: CreateConnectionDto) {
    return this.connectionsService.createConnectionRequest(req.user.userId, createConnectionDto);
  }

  @Get('requests')
  getConnectionRequests(@Request() req) {
    return this.connectionsService.getConnectionRequests(req.user.userId);
  }

  @Get('sent')
  getSentRequests(@Request() req) {
    return this.connectionsService.getSentRequests(req.user.userId);
  }

  @Get('all')
  getAllConnections(@Request() req) {
    return this.connectionsService.getAllConnections(req.user.userId);
  }

  @Get('stats')
  getConnectionStats(@Request() req) {
    return this.connectionsService.getConnectionStats(req.user.userId);
  }

  @Get('status/:userId')
  getConnectionStatus(@Request() req, @Param('userId') userId: string) {
    return this.connectionsService.getConnectionStatus(req.user.userId, userId);
  }

  @Post(':id/respond')
  respondToConnection(
    @Request() req,
    @Param('id') id: string,
    @Body() respondConnectionDto: RespondConnectionDto,
  ) {
    return this.connectionsService.respondToConnection(
      req.user.userId,
      id,
      respondConnectionDto,
    );
  }

  @Delete(':id')
  removeConnection(@Request() req, @Param('id') id: string) {
    return this.connectionsService.deleteConnection(req.user.userId, id);
  }
} 