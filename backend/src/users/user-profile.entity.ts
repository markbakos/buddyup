import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn} from "typeorm";
import {User} from "./user.entity";

@Entity('user_profiles')
export class UserProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, user => user.profile)
    @JoinColumn()
    user: User;

    @Column({ type: 'text', nullable: true })
    aboutMe: string;

    @Column({ type: 'simple-array', nullable: true })
    skills: string[];

    @Column({ nullable: true })
    location: string;

    @Column({ nullable: true })
    profession: string;

    @Column({ type: 'jsonb', nullable: true })
    experience: {
        company: string;
        position: string;
        startDate: Date;
        endDate?: Date;
        current: boolean;
        description: string;
    }[];

    @Column({ type: 'jsonb', nullable: true })
    education: {
        institution: string;
        degree: string;
        field: string;
        startDate: Date;
        endDate?: Date;
        current: boolean;
    }[];

    @Column({ type: 'jsonb', nullable: true })
    socialLinks: {
        platform: string;
        url: string;
    }[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 