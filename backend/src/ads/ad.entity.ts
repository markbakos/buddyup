import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    JoinTable, OneToMany, ManyToOne, JoinColumn,
} from "typeorm";
import { Tag } from './tag.entity'
import {AdRole} from "./ad-role.entity";
import {User} from "../users/user.entity";

@Entity('ads')
export class Ad {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    title: string

    @Column()
    summary: string

    @Column()
    description: string

    @Column({type: 'jsonb', nullable: true})
    metadata: Record<string, any>

    @ManyToOne(() => User, user => user.ads, { nullable: false })
    @JoinColumn({ name: 'user_id' })
    user: User

    @Column({ name: 'user_id' })
    userId: string

    @ManyToMany(() => Tag, (tag) => tag.ads, { cascade: true, eager: true})
    @JoinTable()
    tags: Tag[]

    @OneToMany(() => AdRole, (adRole) => adRole.ad, {cascade: true} )
    adRoles: AdRole[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

