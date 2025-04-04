"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  MessageSquare,
  ExternalLink,
  Clock,
  Github,
  Linkedin,
  Twitter,
  Globe,
  ChevronLeft,
} from "lucide-react"
import Header from "@/app/components/Header"
import api from "@/lib/api"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { UserStats } from "@/types/user"
import { ConnectButton } from "@/app/components/connections/connect-button"
import { MessageButton } from "@/app/components/messaging/message-button"

export default function ViewProfile() {
  const [userProfile, setUserProfile] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(true)

  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  useEffect(() => {
    setIsMounted(true)
    return () => {
      setIsMounted(false)
    }
  }, [])

  useEffect(() => {
    if (status === "loading") {
      return
    }

    if (!session) {
      router.push("/auth/signin")
      return
    }

    const controller = new AbortController()
    const signal = controller.signal

    async function fetchUserProfile() {
      try {
        if (isMounted) setLoading(true)
        
        const response = await api.get(`/profile/${userId}`, { signal })
        
        if (isMounted) {
          setUserProfile(response.data)
          setLoading(false)
          setError(null)
        }
      } catch (e) {
        console.error("Error fetching user profile: ", e)
        if (isMounted && !(e instanceof DOMException && e.name === 'AbortError')) {
          setError(e instanceof Error ? e.message : "Failed to fetch user profile")
          setLoading(false)
        }
      }
    }

    fetchUserProfile()

    return () => {
      controller.abort()
    }
  }, [session, status, router, userId, isMounted])

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "linkedin":
        return <Linkedin className="h-4 w-4" />
      case "github":
        return <Github className="h-4 w-4" />
      case "twitter":
        return <Twitter className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: Date) => {
    if (!dateString) return ""
    
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    } catch (e) {
      console.error("Error formatting date:", e)
      return ""
    }
  }

  const isDataReady = !loading && userProfile && userProfile.profile

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16">
        <Header />
        <main className="container mx-auto px-4 py-8 mt-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <Card>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                    <Skeleton className="h-8 w-3/4 mx-auto mt-4" />
                    <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="w-full md:w-2/3">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16">
        <Header />
        <main className="container mx-auto px-4 py-8 mt-8">
          <Card className="max-w-md mx-auto border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
              <CardDescription>We encountered a problem loading this profile</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{error || "User profile not found"}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.back()} variant="outline">
                Go Back
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    )
  }
  
  if (!isDataReady && !error) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16">
      <Header />
      <main className="container mx-auto px-4 py-8 mt-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-1 text-muted-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Sidebar */}
            <div className="w-full md:w-1/3">
              <Card className="sticky top-24">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto relative">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarFallback className="bg-primary text-white text-2xl">
                        {userProfile?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="mt-4 text-2xl">{userProfile.name}</CardTitle>
                  <CardDescription className="text-sm">{userProfile.profile?.profession || "BuddyUp User"}</CardDescription>
                  <div className="flex justify-center gap-2 mt-2">
                    <Badge variant="secondary">{userProfile.ads?.length || 0} projects</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{userProfile.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Joined {formatDate(userProfile.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{userProfile.profile?.location || "Location not set"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{userProfile.profile?.profession || "Profession not set"}</span>
                    </div>
                  </div>

                  {userProfile?.profile?.skills && userProfile?.profile?.skills?.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.profile.skills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {userProfile.profile.socialLinks && userProfile.profile.socialLinks.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-2">Connect</h3>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.profile.socialLinks.map((link, index) => (
                          <TooltipProvider key={index}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                                    {getSocialIcon(link.platform)}
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{link.platform}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </div>
                  )}
                {session?.user?.id !== userId && (
                  <div className="mt-6 flex flex-col gap-2">
                   
                      <ConnectButton userId={userId} />
                   
                    <MessageButton recipient={userProfile} messageType="message">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </MessageButton>
                  </div>
                 )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="w-full md:w-2/3">
              <Tabs defaultValue="about">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                </TabsList>
                <TabsContent value="about" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{userProfile.profile.aboutMe}</p>

                      {userProfile.profile.experience && userProfile.profile.experience.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-3">Experience</h3>
                          <div className="space-y-4">
                            {userProfile.profile.experience.map((exp, index) => (
                              <div key={index} className="border-l-2 border-primary pl-4 py-1">
                                <h4 className="font-medium">{exp.position}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {exp.company} • {formatDate(exp.startDate)} -{" "}
                                  {exp.current ? "Present" : formatDate(exp.endDate || new Date())}
                                </p>
                                {exp.description && <p className="text-sm mt-1">{exp.description}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {userProfile.profile.education && userProfile.profile.education.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-3">Education</h3>
                          {userProfile.profile.education.map((edu, index) => (
                            <div key={index} className="border-l-2 border-muted pl-4 py-1">
                              <h4 className="font-medium">
                                <span className="font-semibold">{edu.field}</span> at {edu.institution}
                              </h4>
                              <p className="text-sm text-gray-900">{edu.degree} Degree</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate || new Date())}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="projects" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Projects</CardTitle>
                      <CardDescription>Projects {userProfile.name} is working on</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {userProfile.ads && userProfile.ads.length > 0 ? (
                          userProfile.ads.map((ad) => (
                            <Card key={ad.id} className="overflow-hidden">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle className="text-lg">{ad.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-1 mt-1">
                                      <MapPin className="h-3.5 w-3.5" />
                                      {ad.location}
                                    </CardDescription>
                                  </div>
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/ads/${ad.id}`}>
                                      <ExternalLink className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <p className="text-sm text-muted-foreground">{ad.summary}</p>

                                <div className="flex flex-wrap gap-1.5 mt-3">
                                  {ad.tags.map((tag) => (
                                    <Badge key={tag.id} variant="secondary" className="text-xs">
                                      {tag.name}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                              <CardFooter className="pt-0 text-xs text-muted-foreground flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                Posted {formatDate(ad.createdAt)}
                              </CardFooter>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground">No projects found</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

