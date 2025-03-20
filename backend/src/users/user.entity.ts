import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne} from "typeorm";
import {Ad} from "../ads/ad.entity";
import {UserProfile} from "./user-profile.entity";

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
}