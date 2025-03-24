"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import { Mail, Calendar, MapPin, Briefcase, Edit, Settings, ExternalLink } from "lucide-react"

import Link from "next/link"
import {useEffect, useState} from 'react'
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import Header from '@/app/components/Header';
import { UserStats } from '@/types/user';
import api from '@/lib/api';
import { Ad } from "@/types/ads"

export default function Profile() {
    const [user, setUser] = useState<UserStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const {data:session, status} = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "loading") {
            return
        }

        if (!session) {
            router.push("/auth/signin")
            return
        }

        async function fetchUser() {
            try {
                const response = await api.get("/profile")
                setUser(response.data)
                console.log(response.data)
            } catch (e) {
                console.error("Error fetching user: ", e)
                setError(e instanceof Error ? e.message : "Failed to fetch user")
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [session, status, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16">
                <Header/>
                <main className="container mx-auto px-4 py-8 mt-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-1/3">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <Skeleton className="h-24 w-24 rounded-full mx-auto"/>
                                        <Skeleton className="h-8 w-3/4 mx-auto mt-4"/>
                                        <Skeleton className="h-4 w-1/2 mx-auto mt-2"/>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <Skeleton className="h-4 w-full"/>
                                            <Skeleton className="h-4 w-full"/>
                                            <Skeleton className="h-4 w-full"/>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="w-full md:w-2/3">
                                <Card>
                                    <CardHeader>
                                        <Skeleton className="h-8 w-1/3"/>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            <Skeleton className="h-24 w-full"/>
                                            <Skeleton className="h-24 w-full"/>
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

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16">
                <Header/>
                <main className="container mx-auto px-4 py-8 mt-8">
                    <Card className="max-w-md mx-auto border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="text-red-600">Error</CardTitle>
                            <CardDescription>We encountered a problem loading your profile</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-red-600">{error}</p>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => window.location.reload()} variant="outline">
                                Try Again
                            </Button>
                        </CardFooter>
                    </Card>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16">
            <Header/>
            <main className="container mx-auto px-4 py-8 mt-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Profile Sidebar */}
                        <div className="w-full md:w-1/3">
                            <Card className="sticky top-24">
                                <CardHeader className="text-center pb-2">
                                    <div className="mx-auto relative">
                                        <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                                            <AvatarImage
                                                src={"/placeholder.svg?height=96&width=96"}
                                                alt={user?.name || "User"}
                                            />
                                            <AvatarFallback className="bg-primary text-white text-2xl">
                                                {user?.name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <CardTitle className="mt-4 text-2xl">{user?.name}</CardTitle>
                                    <CardDescription className="text-sm">Product Designer at BuddyUp</CardDescription>
                                    <div className="flex justify-center gap-2 mt-2">
                                        <Badge variant="secondary">{user?.ads?.length} projects</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground"/>
                                            <span className="text-muted-foreground">{user?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground"/>
                                            <span className="text-muted-foreground">
                                                Joined{" "}
                                                {user?.createdAt
                                                    ? new Date(user?.createdAt).toLocaleDateString("en-US", {
                                                        month: "long",
                                                        year: "numeric",
                                                    })
                                                    : ""}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground"/>
                                            <span className="text-muted-foreground">{user?.profile.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Briefcase className="h-4 w-4 text-muted-foreground"/>
                                            <span className="text-muted-foreground">{user?.profile.profession}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="text-sm font-medium mb-2">Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {user?.profile.skills?.map((skill) => (
                                                <Badge key={skill} variant="outline">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-col gap-2">
                                        <Link href="/profile/edit">
                                            <Button className="w-full">
                                                <Edit className="mr-2 h-4 w-4"/>
                                                Edit Profile
                                            </Button>
                                        </Link>
                                            <Button variant="outline" className="w-full">
                                                <Settings className="mr-2 h-4 w-4"/>
                                                Account Settings
                                        </Button>
                                    </div>
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
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle>About Me</CardTitle>
                                                <CardDescription>Share a bit about yourself</CardDescription>
                                            </div>
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4"/>
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground">
                                                {user?.profile.aboutMe}
                                            </p>

                                            <div className="mt-6">
                                                <h3 className="text-lg font-medium mb-3">Experience</h3>
                                                <div className="space-y-4">
                                                    {user?.profile.experience?.map((experience) => (
                                                        <div key={experience.company} className="border-l-2 border-primary pl-4 py-1">
                                                            <h4 className="font-medium">{experience.company}</h4>
                                                            <p className="text-sm text-muted-foreground">{new Date(experience.startDate).toLocaleDateString()} -
                                                                {experience?.endDate ? new Date(experience.endDate).toLocaleDateString() : " Present"}</p>
                                                            <p className="text-sm mt-1">
                                                                {experience.description}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-6">
                                                <h3 className="text-lg font-medium mb-3">Education</h3>
                                                {user?.profile.education?.map((education) => (
                                                    <div key={education.institution} className="border-l-2 border-muted pl-4 py-1">
                                                        <h4 className="font-medium"><span className="font-semibold">{education.field}</span> at {education.institution}</h4>
                                                        <p className="text-sm text-gray-900">{education.degree} Degree</p>
                                                        <p className="text-sm text-muted-foreground">{new Date(education.startDate).toLocaleDateString()} -
                                                            {education?.endDate ? new Date(education.endDate).toLocaleDateString() : " Present"}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="projects" className="mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>My Projects</CardTitle>
                                            <CardDescription>Projects you're currently working on</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {user?.ads?.length === 0 && (
                                                    <div className="text-center text-muted-foreground">
                                                        No projects yet
                                                    </div>
                                                )}
                                                {user?.ads?.map((ad: Ad) => (
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
                                                 </Card>
                                                ))}
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