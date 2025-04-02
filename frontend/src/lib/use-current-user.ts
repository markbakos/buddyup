import { useSession } from "next-auth/react";

export type CurrentUser = {
  id: string
  name: string
  email: string
  jobTitle?: string
  shortBio?: string
  connectionCount: number
  projectCount: number
  isAuthenticated: boolean
}

export function useCurrentUser(): CurrentUser {
  const { data: session, status } = useSession()
  
  if (status === "authenticated" && session?.user) {
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      jobTitle: session.user.jobTitle,
      shortBio: session.user.shortBio,
      connectionCount: session.user.connectionCount || 0,
      projectCount: session.user.projectCount || 0,
      isAuthenticated: true,
    }
  }
  
  return {
    id: "",
    name: "",
    email: "",
    connectionCount: 0,
    projectCount: 0,
    isAuthenticated: false,
  };
} 