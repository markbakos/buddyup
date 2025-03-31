import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { FeedPostLike } from './feed-post-like.entity';

@Entity('feed_posts')
export class FeedPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.feedPosts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: 0 })
  likesCount: number;

  @OneToMany(() => FeedPostLike, like => like.post)
  likes: FeedPostLike[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 