import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    JoinTable, OneToMany,
} from "typeorm";
import { Tag } from './tag.entity'
import {AdRole} from "./ad-role.entity";

@Entity('ads')
export class Ad {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    title: string

    @Column()
    description: string

    @Column({type: 'jsonb', nullable: true})
    metadata: Record<string, any>

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

