import api from '@/lib/api';
import { CreateFeedPostDto, FeedPost, FeedPostResponse } from '@/types/feed-post';

export const feedPostApi = {
  create: async (data: CreateFeedPostDto): Promise<FeedPost> => {
    const response = await api.post<FeedPost>('/feed-posts', data)
    return response.data
  },

  getAll: async (limit: number = 20, offset: number = 0): Promise<FeedPostResponse> => {
    const response = await api.get<FeedPostResponse>('/feed-posts', {
      params: { limit, offset }
    })
    return response.data
  },

  getByUser: async (userId: string, limit: number = 20, offset: number = 0): Promise<FeedPostResponse> => {
    const response = await api.get<FeedPostResponse>(`/feed-posts/user/${userId}`, {
      params: { limit, offset }
    })
    return response.data
  },

  getOne: async (id: string): Promise<FeedPost> => {
    const response = await api.get<FeedPost>(`/feed-posts/${id}`)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/feed-posts/${id}`)
  },

  like: async (id: string): Promise<FeedPost> => {
    const response = await api.post<FeedPost>(`/feed-posts/${id}/like`)
    return response.data
  },

  unlike: async (id: string): Promise<FeedPost> => {
    const response = await api.delete<FeedPost>(`/feed-posts/${id}/like`)
    return response.data
  },

  hasLiked: async (id: string): Promise<boolean> => {
    const response = await api.get<boolean>(`/feed-posts/${id}/liked`)
    return response.data
  }
}
