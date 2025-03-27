import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request, 
  Query 
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessageResponseDto } from './dto/message.response.dto';
import { MessageType } from './entity/message.entity';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(
    @Request() req,
    @Body() createMessageDto: CreateMessageDto
  ): Promise<MessageResponseDto> {
    return this.messagesService.create(req.user.userId, createMessageDto);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('type') type?: MessageType
  ): Promise<MessageResponseDto[]> {
    const messages = this.messagesService.findAll(req.user.userId);
    
    if (type) {
      return messages.then(msgs => msgs.filter(msg => msg.type === type));
    }
    
    return messages;
  }

  @Get('sent')
  findSent(@Request() req): Promise<MessageResponseDto[]> {
    return this.messagesService.findBySender(req.user.userId);
  }

  @Get('received')
  findReceived(@Request() req): Promise<MessageResponseDto[]> {
    return this.messagesService.findByReceiver(req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req
  ): Promise<MessageResponseDto> {
    return this.messagesService.findOne(id, req.user.userId);
  }

  @Post(':id')
  update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @Request() req
  ): Promise<MessageResponseDto> {
    return this.messagesService.update(id, req.user.userId, updateMessageDto);
  }

  @Post(':id/seen')
  markAsSeen(
    @Param('id') id: string,
    @Request() req
  ): Promise<MessageResponseDto> {
    const updateDto: UpdateMessageDto = { seen: true };
    return this.messagesService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req
  ): Promise<void> {
    return this.messagesService.remove(id, req.user.userId);
  }
} 