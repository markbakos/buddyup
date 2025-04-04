import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne} from "typeorm";
import {Ad} from "../ads/ad.entity";
import {UserProfile} from "./user-profile.entity";
import { Connection } from '../connections/entities/connection.entity';
import { Message } from '../messages/entity/message.entity';
import { FeedPost } from '../feed-post/entities/feed-post.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    email: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    jobTitle: string;

    @Column({ type: 'text', nullable: true })
    shortBio: string;

    @OneToMany(() => Ad, ad => ad.user)
    ads: Ad[];

    @OneToOne(() => UserProfile, profile => profile.user)
    profile: UserProfile;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Connection, connection => connection.sender)
    sentConnections: Connection[];

    @OneToMany(() => Connection, connection => connection.receiver)
    receivedConnections: Connection[];

    @OneToMany(() => Message, message => message.sender)
    sentMessages: Message[];

    @OneToMany(() => Message, message => message.receiver)
    receivedMessages: Message[];
    
    @OneToMany(() => FeedPost, feedPost => feedPost.user)
    feedPosts: FeedPost[];
}