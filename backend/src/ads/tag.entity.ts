import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Index } from "typeorm";
import { Ad } from './ad.entity'

@Entity('tags')
export class Tag {
    @PrimaryGeneratedColumn('uuid')
    id:string

    @Column({ unique: true })
    @Index()
    name: string

    @ManyToMany(() => Ad, (ad) => ad.tags)
    ads: Ad[]
}