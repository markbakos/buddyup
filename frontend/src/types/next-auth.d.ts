import NextAuth from "next-auth"
import { DefaultSession } from "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        accessToken?: string
        user: {
            id: string
        } & DefaultSession["user"]
    }

    interface User {
        accessToken?: string
        id: string
        email: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string
    }
}