"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Bell, CheckCircle, XCircle, Clock, UserPlus, MessageSquare, ExternalLink, Loader2 } from 'lucide-react'
import Header from '@/app/components/Header'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Connection, ConnectionStatus } from '@/types/connections'
import { connectionsApi } from '@/lib/api/connections'

export default function ConnectionRequestsPage() {
  const [connectionRequests, setConnectionRequests] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("pending")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
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

    const fetchConnectionRequests = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await connectionsApi.getConnectionRequests()
        setConnectionRequests(response)
      } catch (e) {
        console.error("Error fetching connection requests: ", e)
        setError(e instanceof Error ? e.message : "Failed to fetch connection requests")
      } finally {
        setLoading(false)
      }
    }

    fetchConnectionRequests()
  }, [session, status, router])

  const handleAccept = async (requestId: string) => {
    try {
      setActionLoading(requestId)
      console.log("Accepting request with ID:", requestId)

      const connectionRequest = connectionRequests.find(request => request.id === requestId)
      if (!connectionRequest) {
        throw new Error("Connection request not found")
      }

      const response = await connectionsApi.respondToConnection(requestId, ConnectionStatus.ACCEPTED);
      console.log("Response from API:", response)

      setConnectionRequests(prevRequests =>
          prevRequests.map(request =>
              request.id === requestId
                  ? { ...request, status: ConnectionStatus.ACCEPTED }
                  : request
          )
      )
    } catch (e) {
      console.error("Error accepting connection request: ", e)
      setError(e instanceof Error ? e.message : "Failed to accept connection request")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDecline = async (requestId: string) => {
    try {
      setActionLoading(requestId)
      await connectionsApi.respondToConnection(requestId, ConnectionStatus.REJECTED)
      
      setConnectionRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === requestId  
            ? { ...request, status: ConnectionStatus.REJECTED } 
            : request
        )
      )
    } catch (e) {
      console.error("Error declining connection request: ", e)
      setError(e instanceof Error ? e.message : "Failed to decline connection request")
    } finally {
      setActionLoading(null)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`
    } else {
      return `${Math.floor(diffInSeconds / 86400)} days ago`
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1 border-amber-200 bg-amber-50 text-amber-700"><Clock className="h-3 w-3" /> Pending</Badge>
      case 'accepted':
        return <Badge variant="outline" className="flex items-center gap-1 border-green-200 bg-green-50 text-green-700"><CheckCircle className="h-3 w-3" /> Accepted</Badge>
      case 'rejected':
        return <Badge variant="outline" className="flex items-center gap-1 border-red-200 bg-red-50 text-red-700"><XCircle className="h-3 w-3" /> Declined</Badge>
      default:
        return null
    }
  }

  const pendingCount = connectionRequests.filter(request => request.status === ConnectionStatus.PENDING).length
  const acceptedCount = connectionRequests.filter(request => request.status === ConnectionStatus.ACCEPTED).length
  const declinedCount = connectionRequests.filter(request => request.status === ConnectionStatus.REJECTED).length

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16">
        <Header />
        <main className="container mx-auto px-4 py-8 mt-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Connection Requests</h1>
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
                    <div className="flex justify-between w-full">
                      <Skeleton className="h-4 w-24" />
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </div>
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
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Connection Requests
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your network connection requests
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <Badge variant="default" className="rounded-md">
                  {pendingCount} new {pendingCount === 1 ? 'request' : 'requests'}
                </Badge>
              )}
            </div>
          </div>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="relative">
                Pending
                {pendingCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="accepted">
                Accepted
                {acceptedCount > 0 && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    ({acceptedCount})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="declined">
                Declined
                {declinedCount > 0 && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    ({declinedCount})
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="mt-4">
              <div className="space-y-4">
                {connectionRequests.filter(request => request.status === ConnectionStatus.PENDING).length > 0 ? (
                  connectionRequests
                    .filter(request => request.status === ConnectionStatus.PENDING)
                    .map(request => (
                      <ConnectionRequestCard
                        key={request.id}
                        request={request}
                        onAccept={handleAccept}
                        onDecline={handleDecline}
                        formatTimeAgo={formatTimeAgo}
                        getStatusBadge={getStatusBadge}
                        actionLoading={actionLoading === request.id}
                      />
                    ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">No pending requests</h3>
                    <p className="text-muted-foreground mt-1">
                      You don't have any pending connection requests at the moment.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="accepted" className="mt-4">
              <div className="space-y-4">
                {connectionRequests.filter(request => request.status === ConnectionStatus.ACCEPTED).length > 0 ? (
                  connectionRequests
                    .filter(request => request.status === ConnectionStatus.ACCEPTED)
                    .map(request => (
                      <ConnectionRequestCard
                        key={request.id}
                        request={request}
                        onAccept={handleAccept}
                        onDecline={handleDecline}
                        formatTimeAgo={formatTimeAgo}
                        getStatusBadge={getStatusBadge}
                        actionLoading={actionLoading === request.id}
                      />
                    ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">No accepted requests</h3>
                    <p className="text-muted-foreground mt-1">
                      You haven't accepted any connection requests yet.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="declined" className="mt-4">
              <div className="space-y-4">
                {connectionRequests.filter(request => request.status === ConnectionStatus.REJECTED).length > 0 ? (
                  connectionRequests
                    .filter(request => request.status === ConnectionStatus.REJECTED)
                    .map(request => (
                      <ConnectionRequestCard
                        key={request.id}
                        request={request}
                        onAccept={handleAccept}
                        onDecline={handleDecline}
                        formatTimeAgo={formatTimeAgo}
                        getStatusBadge={getStatusBadge}
                        actionLoading={actionLoading === request.id}
                      />
                    ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">No declined requests</h3>
                    <p className="text-muted-foreground mt-1">
                      You haven't declined any connection requests.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

interface ConnectionRequestCardProps {
  request: Connection
  onAccept: (id: string) => void
  onDecline: (id: string) => void
  formatTimeAgo: (date: string) => string
  getStatusBadge: (status: string) => React.ReactNode
  actionLoading: boolean
}

function ConnectionRequestCard({ 
  request, 
  onAccept, 
  onDecline, 
  formatTimeAgo, 
  getStatusBadge,
  actionLoading
}: ConnectionRequestCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-white shadow">
              <AvatarFallback className="bg-primary text-white">
                {request.sender.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                <Link href={`/profile/${request.sender.id}`}>
                  {request.sender.name}
                </Link>
              </CardTitle>
              <CardDescription>
                {request.sender.jobTitle}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(request.status)}
        </div>
      </CardHeader>
      <CardContent>
        {request.sender.shortBio && (
          <div className="bg-muted/30 p-3 rounded-md text-sm italic">
            "{request.sender.shortBio}"
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-muted-foreground">
          Requested {formatTimeAgo(new Date(request.createdAt).toISOString())}
        </div>
        <div className="flex gap-2">
          {request.status === ConnectionStatus.PENDING ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDecline(request.id)}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Declining...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-1" />
                    Decline
                  </>
                )}
              </Button>
              <Button 
                size="sm" 
                onClick={() => onAccept(request.id)}
                className="bg-primary hover:bg-primary/90"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                asChild
              >
                <Link href={`/profile/${request.sender.id}`}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Profile
                </Link>
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                asChild
              >
                <Link href={`/messages/${request.sender.id}`}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Message
                </Link>
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
