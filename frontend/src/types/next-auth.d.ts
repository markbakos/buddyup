import NextAuth, { DefaultSession } from "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        accessToken: string
        user: {
            id: string
            email: string
            name: string
            jobTitle?: string
            shortBio?: string
            connectionCount: number
            projectCount: number
        } & DefaultSession["user"]
    }

    interface User {
        accessToken: string
        id: string
        email: string
        name: string
        jobTitle?: string
        shortBio?: string
        connectionCount: number
        projectCount: number
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken: string
        id: string
        email: string
        name: string
        jobTitle?: string
        shortBio?: string
        connectionCount: number
        projectCount: number
    }
}