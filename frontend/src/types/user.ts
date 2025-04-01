import { Ad } from "./ads"

export interface User {
    id: number
    name: string
    email: string
    jobTitle?: string
    shortBio?: string
    createdAt: Date
    updatedAt: Date
}

export interface ShortUser {
    id: string
    name: string
    email?: string
    jobTitle?: string
}


export interface UserProfile {
    id: string
    user: User
    aboutMe?: string
    skills?: string[]
    location?: string
    profession?: string
    experience?: Experience[]
    education?: Education[]
    socialLinks?: SocialLinks[]
    createdAt: Date
    updatedAt: Date
}

export interface Experience {
    company: string
    current: boolean
    position: string
    startDate: Date
    endDate?: Date
    description?: string
}

export interface Education {
    field: string
    degree: string
    current: boolean
    startDate: Date
    endDate?: Date
    institution: string
}

export interface SocialLinks {
    url: string
    platform: string
}

export interface UserStats {
    id: string
    email: string
    name: string
    jobTitle?: string
    shortBio?: string
    ads?: Ad[]
    profile: UserProfile
    createdAt: Date
    updatedAt: Date
}
