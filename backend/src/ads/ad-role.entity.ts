import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Ad} from "./ad.entity";
import {Role} from "./role.entity";

@Entity('ad_roles')
export class AdRole {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ManyToOne(() => Ad, (ad) => ad.adRoles, {onDelete: 'CASCADE'})
    ad: Ad

    @ManyToOne(() => Role, (role) => role.adRoles)
    role: Role

    @Column({ default: true})
    isOpen: boolean

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}