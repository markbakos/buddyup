"use client"

import {Ad} from "@/types/ads";
import Link from "next/link";
import React, {useState } from "react";

import { ChevronDown, ChevronUp, Clock, MapPin, ExternalLink, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function AdPosting({id, title, summary, description, location, metadata, tags, adRoles, createdAt, updatedAt}: Ad) {
    const [isRolesOpen, setIsRolesOpen] = useState(false)

    const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })

    return (
        <Card className="overflow-hidden h-full transition-all hover:shadow-md">
            <CardHeader className="p-6 pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl line-clamp-2">{title}</CardTitle>
                        {location && (
                            <CardDescription className="flex items-center mt-1">
                                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                {location}
                            </CardDescription>
                        )}
                    </div>
                    <div className="flex -space-x-2">
                        {[...Array(Math.min(3, adRoles?.length || 0))].map((_, i) => (
                            <Avatar key={i} className="h-8 w-8 border-2 border-background">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {adRoles?.[i]?.role?.name?.charAt(0) || "R"}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        {(adRoles?.length || 0) > 3 && (
                            <Avatar className="h-8 w-8 border-2 border-background">
                                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                    +{(adRoles?.length || 0) - 3}
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 pt-2 flex-grow">
                <p className="text-muted-foreground line-clamp-3 mb-4">{summary}</p>

                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {tags.slice(0, 3).map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="font-normal text-xs">
                                {tag.name}
                            </Badge>
                        ))}
                        {tags.length > 3 && (
                            <Badge variant="outline" className="font-normal text-xs">
                                +{tags.length - 3} more
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>

            <Collapsible open={isRolesOpen} onOpenChange={setIsRolesOpen} className="w-full">
                <CollapsibleContent className="px-6 pb-4 border-t border-border/50 bg-muted/20 data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden">
                    <div className="pt-4 pb-2">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-medium text-sm">Available Roles</h3>
                            <Badge variant="outline" className="font-normal text-xs">
                                {adRoles?.filter((role) => role.isOpen).length || 0} open
                            </Badge>
                        </div>

                        {adRoles && adRoles.length > 0 ? (
                            <div className="space-y-2 mb-4">
                                {adRoles.map((adRole) => (
                                    <div
                                        key={adRole.id}
                                        className="flex items-center justify-between p-2.5 bg-background rounded-md border border-border/50"
                                    >
                                        <span className="font-medium text-sm">{adRole.role.name}</span>
                                        <Badge variant={adRole.isOpen ? "default" : "destructive"} className={`text-xs ${adRole.isOpen ? "bg-green-600 hover:bg-green-500" : ""}`}>
                                            {adRole.isOpen ? "Open" : "Closed"}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm mb-4">No roles specified for this opportunity.</p>
                        )}

                        <Button size="sm" className="w-full" asChild>
                            <Link href={`/ads/${id}`}>
                                Apply Now
                                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </div>
                </CollapsibleContent>

                <CardFooter className="p-6 pt-0 flex flex-col gap-2">
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        Posted {formattedDate}
                        {adRoles && adRoles.length > 0 && (
                            <>
                                <span className="mx-2">•</span>
                                <Users className="h-3.5 w-3.5 mr-1.5" />
                                {adRoles.length} {adRoles.length === 1 ? "role" : "roles"}
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 w-full">
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                                {isRolesOpen ? "Hide Roles" : "View Roles"}
                                {isRolesOpen ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                            </Button>
                        </CollapsibleTrigger>

                        <Button size="sm" className="w-full" asChild>
                            <Link href={`/ads/${id}`}>
                                Details
                                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </div>
                </CardFooter>
            </Collapsible>
        </Card>
    )
}