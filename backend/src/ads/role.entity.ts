import {Column, Entity, Index, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {AdRole} from "./ad-role.entity";

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ unique: true })
    @Index()
    name: string

    @OneToMany(() => AdRole, (adRole) => adRole.role)
    adRoles: AdRole[]
}