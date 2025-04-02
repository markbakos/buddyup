import { FeedPostItem } from "./feed-post-item"
import type { FeedPost } from "@/types/feed-post"

interface FeedPostListProps {
  posts: FeedPost[]
  onPostLiked: (postId: string, liked: boolean) => void
}

export function FeedPostList({ posts, onPostLiked }: FeedPostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-medium">No posts yet</h3>
        <p className="text-muted-foreground mt-1">Be the first to share something with the community!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <FeedPostItem key={post.id} post={post} onPostLiked={onPostLiked} />
      ))}
    </div>
  )
}

