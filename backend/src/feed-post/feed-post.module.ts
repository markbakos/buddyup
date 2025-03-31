import { Module } from '@nestjs/common';
import { FeedPostService } from './feed-post.service';
import { FeedPostController } from './feed-post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedPost } from './entities/feed-post.entity';
import { FeedPostLike } from './entities/feed-post-like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FeedPost, FeedPostLike])],
  controllers: [FeedPostController],
  providers: [FeedPostService],
  exports: [FeedPostService],
})
export class FeedPostModule {} 