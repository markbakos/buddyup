import { ShortUser } from '@/types/user'

export interface FeedPost {
  id: string
  content: string
  user: ShortUser
  likesCount: number
  currentUserLiked?: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateFeedPostDto {
  content: string
}

export interface FeedPostResponse {
  feedPosts: FeedPost[]
  total: number
}