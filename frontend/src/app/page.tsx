"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Header from "@/app/components/Header"
import { CreatePostForm } from "@/app/components/feed/create-post-form"
import { FeedPostList } from "@/app/components/feed/feed-post-list"
import { FeedSidebar } from "@/app/components/feed/feed-sidebar"    
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { feedPostApi } from "@/lib/api/feed-post"
import type { FeedPost } from "@/types/feed-post"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    const fetchFeedPosts = async () => {
      try {
        setLoading(true)
        const response = await feedPostApi.getAll(20, 0)
        setFeedPosts(response.feedPosts)
      } catch (err) {
        console.error("Error fetching feed posts:", err)
        setError("Failed to load feed posts. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchFeedPosts()
  }, [session, status, router, refreshTrigger])

  const handlePostCreated = (newPost: FeedPost) => {
    setFeedPosts((prevPosts) => [newPost, ...prevPosts])
  }

  const handlePostLiked = (postId: string, liked: boolean) => {
    setFeedPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likesCount: liked ? post.likesCount + 1 : post.likesCount - 1,
              currentUserLiked: liked,
            }
          : post,
      ),
    )
  }

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <FeedSidebar />
          </div>

          {/* Main Content */}
          <div className="col-span-1 lg:col-span-6 space-y-6">
            <CreatePostForm onPostCreated={handlePostCreated} />

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between mb-2">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="all">All Posts</TabsTrigger>
                  <TabsTrigger value="following">Following</TabsTrigger>
                  <TabsTrigger value="trending">Trending</TabsTrigger>
                </TabsList>
                <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                </Button>
              </div>

              <Separator className="my-2" />

              <TabsContent value="all" className="mt-4 space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">{error}</div>
                ) : (
                  <FeedPostList posts={feedPosts} onPostLiked={handlePostLiked} />
                )}
              </TabsContent>

              <TabsContent value="following" className="mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  Posts from people you follow will appear here.
                </div>
              </TabsContent>

              <TabsContent value="trending" className="mt-4">
                <div className="text-center py-8 text-muted-foreground">Trending posts will appear here.</div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            {/* add right sidebar here */}
          </div>
        </div>
      </main>
    </div>
  )
}