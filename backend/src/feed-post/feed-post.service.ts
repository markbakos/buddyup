import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedPost } from './entities/feed-post.entity';
import { CreateFeedPostDto } from './dto/create-feed-post.dto';
import { plainToInstance } from 'class-transformer';
import { FeedPostDto } from './dto/feed-post.dto';
import { FeedPostLike } from './entities/feed-post-like.entity';
import { In } from 'typeorm';

@Injectable()
export class FeedPostService {
  constructor(
    @InjectRepository(FeedPost)
    private feedPostRepository: Repository<FeedPost>,
    @InjectRepository(FeedPostLike)
    private feedPostLikeRepository: Repository<FeedPostLike>,
  ) {}

  async create(userId: string, createFeedPostDto: CreateFeedPostDto): Promise<FeedPostDto> {
    const feedPost = this.feedPostRepository.create({
      ...createFeedPostDto,
      userId,
    });

    const savedUpdate = await this.feedPostRepository.save(feedPost);
    
    const feedPostWithUser = await this.feedPostRepository.findOne({
      where: { id: savedUpdate.id },
      relations: ['user'],
    });

    const result = plainToInstance(FeedPostDto, feedPostWithUser, { 
      excludeExtraneousValues: true 
    });
    
    result.currentUserLiked = false;
    
    return result;
  }

  async findAll(limit: number = 20, offset: number = 0, currentUserId?: string): Promise<{ feedPosts: FeedPostDto[], total: number }> {
    const [feedPosts, total] = await this.feedPostRepository.findAndCount({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    const feedPostDtos = plainToInstance(FeedPostDto, feedPosts, { 
      excludeExtraneousValues: true 
    });

    if (currentUserId) {
      await this.populateLikeStatus(feedPostDtos, currentUserId);
    }

    return {
      feedPosts: feedPostDtos,
      total,
    };
  }

  async findByUserId(userId: string, limit: number = 20, offset: number = 0, currentUserId?: string): Promise<{ feedPosts: FeedPostDto[], total: number }> {
    const [feedPosts, total] = await this.feedPostRepository.findAndCount({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    const feedPostDtos = plainToInstance(FeedPostDto, feedPosts, { 
      excludeExtraneousValues: true 
    });
    
    if (currentUserId) {
      await this.populateLikeStatus(feedPostDtos, currentUserId);
    }

    return {
      feedPosts: feedPostDtos,
      total,
    };
  }

  async findOne(id: string, currentUserId?: string): Promise<FeedPostDto> {
    const feedPost = await this.feedPostRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!feedPost) {
      throw new NotFoundException(`Feed post with ID ${id} not found`);
    }

    const result = plainToInstance(FeedPostDto, feedPost, { 
      excludeExtraneousValues: true 
    });
    
    if (currentUserId) {
      result.currentUserLiked = await this.hasUserLiked(id, currentUserId);
    }

    return result;
  }

  async remove(id: string, userId: string): Promise<void> {
    const feedPost = await this.feedPostRepository.findOne({
      where: { id },
    });

    if (!feedPost) {
      throw new NotFoundException(`Feed post with ID ${id} not found`);
    }

    if (feedPost.userId !== userId) {
      throw new NotFoundException(`You cannot delete this feed post`);
    }

    await this.feedPostRepository.remove(feedPost);
  }

  async like(id: string, userId: string): Promise<FeedPostDto> {
    const feedPost = await this.feedPostRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!feedPost) {
      throw new NotFoundException(`Feed post with ID ${id} not found`);
    }

    const existingLike = await this.feedPostLikeRepository.findOne({
      where: { userId, postId: id }
    });

    if (existingLike) {
      throw new ConflictException('You have already liked this post');
    }

    const like = this.feedPostLikeRepository.create({
      userId,
      postId: id
    });
    
    await this.feedPostLikeRepository.manager.transaction(async (manager) => {
      await manager.save(like);
      
      feedPost.likesCount += 1;
      await manager.save(feedPost);
    });

    const result = plainToInstance(FeedPostDto, feedPost, { 
      excludeExtraneousValues: true 
    });
    
    result.currentUserLiked = true;
    
    return result;
  }

  async unlike(id: string, userId: string): Promise<FeedPostDto> {
    const feedPost = await this.feedPostRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!feedPost) {
      throw new NotFoundException(`Feed post with ID ${id} not found`);
    }

    const existingLike = await this.feedPostLikeRepository.findOne({
      where: { userId, postId: id }
    });

    if (!existingLike) {
      throw new NotFoundException('You have not liked this post');
    }

    await this.feedPostLikeRepository.manager.transaction(async (manager) => {
      await manager.remove(existingLike);
      
      feedPost.likesCount = Math.max(0, feedPost.likesCount - 1);
      await manager.save(feedPost);
    });

    const result = plainToInstance(FeedPostDto, feedPost, { 
      excludeExtraneousValues: true 
    });
    
    result.currentUserLiked = false;
    
    return result;
  }

  async hasUserLiked(postId: string, userId: string): Promise<boolean> {
    const like = await this.feedPostLikeRepository.findOne({
      where: { userId, postId }
    });
    
    return !!like;
  }
  
  private async populateLikeStatus(posts: FeedPostDto[], userId: string): Promise<void> {
    if (posts.length === 0) return;
    
    const postIds = posts.map(post => post.id);
    
    const likes = await this.feedPostLikeRepository.find({
      where: { 
        userId,
        postId: In(postIds)
      }
    });
    
    const likedPostIds = new Set(likes.map(like => like.postId));
    
    posts.forEach(post => {
      post.currentUserLiked = likedPostIds.has(post.id);
    });
  }
} 