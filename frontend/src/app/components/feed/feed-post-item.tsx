"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Heart, MoreHorizontal, Loader2, Bookmark, Flag, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { feedPostApi } from "@/lib/api/feed-post"
import type { FeedPost } from "@/types/feed-post"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface FeedPostItemProps {
  post: FeedPost
  onPostLiked: (postId: string, liked: boolean) => void
}

export function FeedPostItem({ post, onPostLiked }: FeedPostItemProps) {
  const { data: session } = useSession()
  const [isLiking, setIsLiking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCurrentUserPost = session?.user?.id === post.user.id

  const handleLikeToggle = async () => {
    try {
      setIsLiking(true)
      setError(null)

      if (post.currentUserLiked) {
        await feedPostApi.unlike(post.id)
        onPostLiked(post.id, false)
      } else {
        await feedPostApi.like(post.id)
        onPostLiked(post.id, true)
      }
    } catch (err) {
      console.error("Error toggling like:", err)
      setError("Failed to update like status")
    } finally {
      setIsLiking(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      setIsDeleting(true)
      setError(null)

      await feedPostApi.delete(post.id)
      window.location.reload()
    } catch (err) {
      console.error("Error deleting post:", err)
      setError("Failed to delete post")
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      console.log("Error formatting date:", error)
      return "recently"
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-0 flex flex-row items-start gap-3">
        <Link href={`/profile/${post.user.id}`}>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">{post.user.name[0]}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <Link href={`/profile/${post.user.id}`} className="font-semibold hover:underline">
                {post.user.name}
              </Link>
              <p className="text-xs text-muted-foreground">
                {post.user.jobTitle || "BuddyUp User"} • {formatDate(post.createdAt)}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="cursor-pointer">
                  <Bookmark className="mr-2 h-4 w-4" />
                  <span>Save post</span>
                </DropdownMenuItem>
                {isCurrentUserPost && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete post</span>
                        </>
                      )}
                    </DropdownMenuItem>
                  </>
                )}
                {!isCurrentUserPost && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                      <Flag className="mr-2 h-4 w-4" />
                      <span>Report post</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="whitespace-pre-wrap break-words">{post.content}</div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </CardContent>
      <Separator />
      <CardFooter className="p-2 flex justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <Heart className="h-3.5 w-3.5 mr-1 fill-red-500 text-red-500" />
          <span>
            {post.likesCount} {post.likesCount === 1 ? "like" : "likes"}
          </span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1 ${post.currentUserLiked ? "text-red-500" : ""}`}
            onClick={handleLikeToggle}
            disabled={isLiking}
          >
            {isLiking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className={`h-4 w-4 ${post.currentUserLiked ? "fill-red-500 text-red-500" : ""}`} />
            )}
            Like
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

