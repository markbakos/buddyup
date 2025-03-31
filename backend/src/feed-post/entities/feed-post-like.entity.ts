import { Entity, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { FeedPost } from './feed-post.entity';

@Entity('feed_post_likes')
export class FeedPostLike {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  postId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => FeedPost, post => post.likes)
  @JoinColumn({ name: 'postId' })
  post: FeedPost;

  @CreateDateColumn()
  createdAt: Date;
} 