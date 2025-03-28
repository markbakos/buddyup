"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  MessageSquare,
  Send,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  SortAsc,
  SortDesc,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react"
import Header from "@/app/components/Header"
import api from "@/lib/api"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Message } from "@/types/messages"


export default function MessagesPage() {
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([])
  const [sentMessages, setSentMessages] = useState<Message[]>([])
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [activeTab, setActiveTab] = useState("messages")
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<"all" | "read" | "unread">("all")

  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") {
      return
    }

    if (!session) {
      router.push("/auth/signin")
      return
    }

    const fetchMessages = async () => {
      try {
        setLoading(true)

        const receivedResponse = await api.get("/messages/received")
        setReceivedMessages(receivedResponse.data)

        const sentResponse = await api.get("/messages/sent")
        setSentMessages(sentResponse.data)

        console.log(receivedResponse.data)
        console.log(sentResponse.data)

        setLoading(false)
      } catch (e) {
        console.error("Error fetching messages: ", e)
        setError(e instanceof Error ? e.message : "Failed to fetch messages")
        setLoading(false)
      }
    }

    fetchMessages()
  }, [session, status, router])

  useEffect(() => {
    let filtered: Message[] = []

    if (activeTab === "messages") {
      filtered = receivedMessages.filter((msg) => msg.type === "message")
    } else if (activeTab === "applying") {
      filtered = receivedMessages.filter((msg) => msg.type === "applying")
    } else if (activeTab === "sent") {
      filtered = sentMessages
    }

    if (filterType !== "all") {
      filtered = filtered.filter((msg) => (filterType === "read" ? msg.seen : !msg.seen))
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()

      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })

    setFilteredMessages(filtered)
  }, [receivedMessages, sentMessages, sortOrder, activeTab, filterType])

  const markAsSeen = async (messageId: string) => {
    try {
      await api.post(`/messages/${messageId}/seen`)

      setReceivedMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === messageId ? { ...msg, seen: true } : msg)),
      )
    } catch (e) {
      console.error("Error marking message as seen: ", e)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInDays < 7) {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      return days[date.getDay()]
    } else {
      return date.toLocaleDateString()
    }
  }

  const toggleMessageExpand = (messageId: string) => {
    if (expandedMessageId === messageId) {
      setExpandedMessageId(null)
    } else {
      setExpandedMessageId(messageId)

      const message = receivedMessages.find((msg) => msg.id === messageId)
      if (message && !message.seen) {
        markAsSeen(messageId)
      }
    }
  }

  const getUnreadCount = (type: "messages" | "applying") => {
    return receivedMessages.filter((msg) => !msg.seen && msg.type === (type === "messages" ? "message" : "applying"))
      .length
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16">
        <Header />
        <main className="container mx-auto px-4 py-8 mt-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Messages</h1>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div>
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-24 mt-1" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-4 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16">
      <Header />
      <main className="container mx-auto px-4 py-8 mt-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Messages
              </h1>
              <p className="text-muted-foreground mt-1">Manage your conversations with other users</p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={(value) => setFilterType(value as "all" | "read" | "unread")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    {sortOrder === "newest" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
                    {sortOrder === "newest" ? "Newest" : "Oldest"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                    <SortDesc className="h-4 w-4 mr-2" />
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                    <SortAsc className="h-4 w-4 mr-2" />
                    Oldest First
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="messages" className="relative">
                Messages
                {getUnreadCount("messages") > 0 && (
                  <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {getUnreadCount("messages")}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="applying" className="relative">
                Applying
                {getUnreadCount("applying") > 0 && (
                  <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {getUnreadCount("applying")}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="mt-4">
              <div className="space-y-4">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <MessageCard
                      key={message.id}
                      message={message}
                      isExpanded={expandedMessageId === message.id}
                      toggleExpand={() => toggleMessageExpand(message.id)}
                      formatDate={formatDate}
                      isSent={false}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={<MessageSquare className="h-12 w-12 text-muted-foreground opacity-20" />}
                    title="No messages found"
                    description="You don't have any messages matching your filters."
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="applying" className="mt-4">
              <div className="space-y-4">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <MessageCard
                      key={message.id}
                      message={message}
                      isExpanded={expandedMessageId === message.id}
                      toggleExpand={() => toggleMessageExpand(message.id)}
                      formatDate={formatDate}
                      isSent={false}
                      showJobTitle
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={<Briefcase className="h-12 w-12 text-muted-foreground opacity-20" />}
                    title="No application messages"
                    description="You don't have any messages related to job applications."
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="sent" className="mt-4">
              <div className="space-y-4">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <MessageCard
                      key={message.id}
                      message={message}
                      isExpanded={expandedMessageId === message.id}
                      toggleExpand={() => toggleMessageExpand(message.id)}
                      formatDate={formatDate}
                      isSent={true}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={<Send className="h-12 w-12 text-muted-foreground opacity-20" />}
                    title="No sent messages"
                    description="You haven't sent any messages yet."
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

interface MessageCardProps {
  message: Message
  isExpanded: boolean
  toggleExpand: () => void
  formatDate: (date: string) => string
  isSent: boolean
  showJobTitle?: boolean
}

function MessageCard({
  message,
  isExpanded,
  toggleExpand,
  formatDate,
  isSent,
  showJobTitle = false,
}: MessageCardProps) {
  const person = isSent ? message.receiver : message.sender
  const truncatedContent = message.content.length > 150 ? `${message.content.substring(0, 150)}...` : message.content

  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md ${!message.seen && !isSent ? "border-l-4 border-l-primary" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-white shadow">
              <AvatarFallback className="bg-primary text-white">{person.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {person.name}
                {!message.seen && !isSent && (
                  <Badge variant="default" className="text-xs">
                    New
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {person.email}
                {showJobTitle && message.jobTitle && (
                  <div className="flex items-center gap-1 mt-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>{message.jobTitle}</span>
                  </div>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-xs text-muted-foreground flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {formatDate(message.createdAt)}
            </div>
            {!isSent && (
              <div className="text-xs text-muted-foreground flex items-center">
                {message.seen ? (
                  <>
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Read
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3.5 w-3.5 mr-1" />
                    Unread
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <Collapsible open={isExpanded} onOpenChange={toggleExpand}>
        <CardContent>
          <p className={`text-sm ${!isExpanded ? "line-clamp-2" : ""}`}>
            {isExpanded ? message.content : truncatedContent}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-3">
          <div className="text-xs text-muted-foreground">
            {isSent ? "Sent to" : "Received from"} {isSent ? message.receiver.name : message.sender.name}
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              {isExpanded ? (
                <>
                  Show Less
                  <ChevronLeft className="h-4 w-4" />
                </>
              ) : (
                <>
                  Read More
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </CollapsibleTrigger>
        </CardFooter>
      </Collapsible>
    </Card>
  )
}

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
}

function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
      <div className="mx-auto mb-4">{icon}</div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  )
}

