"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Send, Loader2 } from "lucide-react"
import { feedPostApi } from "@/lib/api/feed-post"
import type { FeedPost } from "@/types/feed-post"

interface CreatePostFormProps {
  onPostCreated: (post: FeedPost) => void
}

export function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return

    try {
      setIsSubmitting(true)
      setError(null)

      const newPost = await feedPostApi.create({ content })
      onPostCreated(newPost)
      setContent("")

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    } catch (err) {
      console.error("Error creating post:", err)
      setError("Failed to create post. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  return (
    <Card className="overflow-hidden">
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {session?.user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                placeholder={`What's on your mind, ${session?.user?.name?.split(" ")[0] || "there"}?`}
                className="min-h-[80px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                value={content}
                onChange={handleTextareaChange}
                disabled={isSubmitting}
              />
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="flex justify-between p-3">
            <div>

            </div>
          <Button type="submit" size="sm" disabled={!content.trim() || isSubmitting} className="gap-1">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Post
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

