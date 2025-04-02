import axios from "axios";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const loginRes = await axios.post("http://localhost:4000/auth/login", {
                    email: credentials?.email,
                    password: credentials?.password,
                })

                const loginData = loginRes.data

                if (!loginData.access_token) {
                    return null
                }

                try {
                    const userRes = await axios.get("http://localhost:4000/users/current", {
                        headers: {
                            Authorization: `Bearer ${loginData.access_token}`
                        }
                    })
                    
                    const userData = userRes.data
                    
                    const connectionsRes = await axios.get("http://localhost:4000/connections/count", {
                        headers: {
                            Authorization: `Bearer ${loginData.access_token}`
                        }
                    })
                    
                    const connectionsData = connectionsRes.data
                    const connectionCount = connectionsData.count || 0
                    
                    const projectCount = 0

                    return {
                        id: userData.id,
                        email: userData.email,
                        name: userData.name,
                        jobTitle: userData.jobTitle || undefined,
                        shortBio: userData.shortBio || undefined,
                        connectionCount,
                        projectCount,
                        accessToken: loginData.access_token,
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error)
                    return {
                        id: loginData.userId || "1",
                        email: credentials?.email || "",
                        name: "User",
                        connectionCount: 0,
                        projectCount: 0,
                        accessToken: loginData.access_token,
                    }
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.accessToken
                token.id = user.id
                token.name = user.name
                token.email = user.email
                token.jobTitle = user.jobTitle
                token.shortBio = user.shortBio
                token.connectionCount = user.connectionCount
                token.projectCount = user.projectCount
            }
            return token
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken
            session.user.id = token.id
            session.user.name = token.name
            session.user.email = token.email
            session.user.jobTitle = token.jobTitle
            session.user.shortBio = token.shortBio
            session.user.connectionCount = token.connectionCount
            session.user.projectCount = token.projectCount
            return session
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
    secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }