import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { FeedPostService } from './feed-post.service';
import { CreateFeedPostDto } from './dto/create-feed-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('feed-posts')
export class FeedPostController {
  constructor(private readonly feedPostService: FeedPostService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req, @Body() createFeedPostDto: CreateFeedPostDto) {
    return this.feedPostService.create(req.user.userId, createFeedPostDto);
  }

  @Get()
  findAll(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Req() req,
  ) {
    const userId = req.user?.userId;
    return this.feedPostService.findAll(limit, offset, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  findByUser(
    @Param('userId') userId: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Req() req,
  ) {
    const currentUserId = req.user.userId;
    return this.feedPostService.findByUserId(userId, limit, offset, currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId;
    return this.feedPostService.findOne(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.feedPostService.remove(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  like(@Param('id') id: string, @Req() req) {
    return this.feedPostService.like(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/like')
  unlike(@Param('id') id: string, @Req() req) {
    return this.feedPostService.unlike(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/liked')
  hasLiked(@Param('id') id: string, @Req() req) {
    return this.feedPostService.hasUserLiked(id, req.user.userId);
  }
} 