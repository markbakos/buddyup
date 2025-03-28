"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { Ad } from "@/types/ads"
import api from "@/lib/api"
import { ArrowLeft, MapPin, Clock, Tag, Users, Briefcase, Share2, BookmarkPlus } from "lucide-react"
import Header from "@/app/components/Header"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function AdDetailsPage() {
    const params = useParams()
    const adId = params.id as string

    const { data: session } = useSession()
    const router = useRouter()

    const [ad, setAd] = useState<Ad | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("details")

    useEffect(() => {
        if (!session) {
            router.push("/auth/signin")
        }
    }, [session, router])

    useEffect(() => {
        async function fetchAdDetails() {
            setLoading(true)
            setError(null)

            try {
                const response = await api.get(`/ads/${adId}`)
                setAd(response.data)
            } catch (e) {
                console.error("Error fetching ad details:", e)
                setError(e instanceof Error ? e.message : "Failed to fetch ad details")
            } finally {
                setLoading(false)
            }
        }

        if (adId) {
            fetchAdDetails()
        }
    }, [adId])

    const handleApplyNow = () => {
        setActiveTab("roles")
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16">
                <Header />
                <main className="container mx-auto px-4 py-8 mt-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center mb-6">
                            <Skeleton className="h-4 w-24" />
                        </div>

                        <Card>
                            <CardHeader>
                                <Skeleton className="h-8 w-3/4 mb-2" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />

                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-32" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Skeleton className="h-24 w-full rounded-lg" />
                                        <Skeleton className="h-24 w-full rounded-lg" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16">
                <Header />
                <main className="container mx-auto px-4 py-8 mt-8">
                    <Card className="max-w-md mx-auto border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="text-red-600">Error</CardTitle>
                            <CardDescription>We encountered a problem loading this opportunity</CardDescription>
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

    if (!ad) return null

    const formattedDate = new Date(ad.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    })

    const formattedUserJoinDate = new Date(ad.user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    })

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16">
            <Header />
            <main className="container mx-auto px-4 py-8 mt-8">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/ads"
                        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Back to opportunities
                    </Link>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-2xl font-bold">{ad.title}</CardTitle>
                                            <CardDescription className="mt-2">
                                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                                    {ad.location && (
                                                        <div className="flex items-center text-sm">
                                                            <MapPin size={14} className="mr-1 text-muted-foreground" />
                                                            <span>{ad.location}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center text-sm">
                                                        <Clock size={14} className="mr-1 text-muted-foreground" />
                                                        <span>Posted {formattedDate}</span>
                                                    </div>
                                                    {ad.adRoles && ad.adRoles.length > 0 && (
                                                        <div className="flex items-center text-sm">
                                                            <Users size={14} className="mr-1 text-muted-foreground" />
                                                            <span>
                                {ad.adRoles.length} {ad.adRoles.length === 1 ? "role" : "roles"}
                              </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <BookmarkPlus size={16} />
                                                <span className="sr-only">Save</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Share2 size={16} />
                                                <span className="sr-only">Share</span>
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="details">Details</TabsTrigger>
                                            <TabsTrigger value="roles">Roles</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="details" className="space-y-6 pt-4">
                                            {ad.summary && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-2">Summary</h3>
                                                    <p className="text-muted-foreground">{ad.summary}</p>
                                                </div>
                                            )}

                                            <div>
                                                <h3 className="text-lg font-semibold mb-2">Description</h3>
                                                <div className="text-muted-foreground whitespace-pre-line">{ad.description}</div>
                                            </div>

                                            {ad.tags && ad.tags.length > 0 && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-2">Tags</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {ad.tags.map((tag) => (
                                                            <Badge key={tag.id} variant="secondary">
                                                                {tag.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="roles" className="pt-4">
                                            {ad.adRoles && ad.adRoles.length > 0 ? (
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    {ad.adRoles.map((adRole) => (
                                                        <Card key={adRole.id} className="overflow-hidden">
                                                            <CardHeader className="p-4 pb-2 bg-muted/30">
                                                                <CardTitle className="text-base">{adRole.role.name}</CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="p-4 pt-2">
                                                                <Badge variant={adRole.isOpen ? "default" : "destructive"} className="mb-2">
                                                                    {adRole.isOpen ? "Open" : "Filled"}
                                                                </Badge>
                                                            </CardContent>
                                                            {adRole.isOpen && (
                                                                <CardFooter className="p-4 pt-0">
                                                                    <Button size="sm" className="w-full">
                                                                        Apply for this role
                                                                    </Button>
                                                                </CardFooter>
                                                            )}
                                                        </Card>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium">No roles specified</h3>
                                                    <p className="text-muted-foreground mt-1">
                                                        This opportunity doesn't have any specific roles listed.
                                                    </p>
                                                </div>
                                            )}
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>

                                <CardFooter className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
                                    <div className="flex items-center">
                                        <Button variant="default" size="lg" className="mr-2" onClick={handleApplyNow}>
                                            Apply Now
                                        </Button>
                                    </div>
                                    <div className="text-sm text-muted-foreground">ID: {ad.id.substring(0, 8)}</div>
                                </CardFooter>
                            </Card>
                        </div>

                        <div className="md:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Posted by</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src="/placeholder.svg?height=40&width=40" />
                                            <AvatarFallback>U</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{ad.user.name}</p>
                                            <p className="text-sm text-muted-foreground">Project Creator</p>
                                        </div>
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Member since</span>
                                            <span>{formattedUserJoinDate}</span>
                                        </div>
                                    </div>
                                    <Link href={`/profile/${ad.userId}`}>
                                        <Button variant="outline" className="w-full mt-4">
                                            View Profile
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card className="mt-4">
                                <CardHeader>
                                    <CardTitle className="text-lg">Similar Opportunities</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                                            <div className="rounded-md bg-primary/10 p-2 mt-0.5">
                                                <Tag className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <Link href="#" className="font-medium hover:underline line-clamp-1">
                                                    Similar Project Title {i}
                                                </Link>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {ad.adRoles && ad.adRoles[0]?.role?.name} • {ad.location || "Remote"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                                <CardFooter>
                                    <Link href="/ads" className="w-full">
                                        <Button variant="ghost" className="w-full text-sm">
                                            View More
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

