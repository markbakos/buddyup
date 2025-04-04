import { User } from "./user"

export interface Tag {
    id: string
    name: string
}

export interface Role {
    id: string
    name: string
}

export interface AdRole {
    id: string
    role: Role
    isOpen: boolean
    createdAt: Date
    updatedAt: Date
}

export interface Ad {
    id: string
    title: string
    summary: string
    description: string
    location: string
    userId: string
    user: User
    metadata: Record<string, string>
    tags: Tag[]
    adRoles: AdRole[]
    createdAt: Date
    updatedAt: Date
}

export interface AdsResponse {
    ads: Ad[]
    total: number
    page: number
    limit: number
}