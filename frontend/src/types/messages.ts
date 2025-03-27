import { ShortUser } from "./user"

export interface Message {
    id: string
    sender: ShortUser
    receiver: ShortUser
    type: "message" | "applying"
    jobTitle: string | null
    content: string
    seen: boolean
    createdAt: string
    updatedAt: string
  }