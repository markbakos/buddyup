"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import AdPosting from "@/app/ads/AdPosting"
import type { AdsResponse } from "@/types/ads"
import Header from "@/app/components/Header"
import api from "@/lib/api"
import Link from "next/link"
import { useSession } from "next-auth/react"

import { Search, ArrowUpDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Filters {
    categories: string[]
    roles: string[]
    status: string[]
}

function AdsPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session } = useSession()
    const [keywords, setKeywords] = useState(searchParams.get("keywords") || "")
    const [adsData, setAdsData] = useState<AdsResponse | null>()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [searchInput, setSearchInput] = useState(keywords)
    const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest")

    const [filters, setFilters] = useState<Filters>({
        categories: searchParams.get("categories")?.split(",").filter(Boolean) || [],
        roles: searchParams.get("roles")?.split(",").filter(Boolean) || [],
        status: searchParams.get("status")?.split(",").filter(Boolean) || ["open"],
    })
    const [activeFiltersCount, setActiveFiltersCount] = useState<number>(0)
    const [showMobileFilters, setShowMobileFilters] = useState(false)

    const categoryOptions = ["TypeScript", "Python", "Frontend", "Backend", "Development"]
    const roleOptions = ["Designer", "Frontend Developer", "Backend Developer", "Full-Stack Developer", "Engineer"]
    const statusOptions = [
        { value: "open", label: "Open positions" },
        { value: "closed", label: "Closed positions" }
    ]

    useEffect(() => {
        const count = filters.categories.length + filters.roles.length + 
                     (filters.status.length === 1 && filters.status[0] === "open" ? 0 : filters.status.length)
        setActiveFiltersCount(count)
    }, [filters])

    const handleFilterChange = (filterType: keyof Filters, value: string) => {
        setFilters(prev => {
            const currentValues = [...prev[filterType]]
            const index = currentValues.indexOf(value)
            
            if (index > -1) {
                currentValues.splice(index, 1)
            } else {
                currentValues.push(value)
            }
            
            return { ...prev, [filterType]: currentValues }
        })
    }

    const handleStatusChange = (value: string) => {
        setFilters(prev => {
            let newStatus: string[]
            
            if (prev.status.includes(value)) {
                newStatus = prev.status.filter(s => s !== value)
                if (newStatus.length === 0) {
                    newStatus = ["open"]
                }
            } else {
                newStatus = [value]
            }
            
            return { ...prev, status: newStatus }
        })
    }

    const clearAllFilters = () => {
        setFilters({
            categories: [],
            roles: [],
            status: ["open"],
        })
    }

    const clearFilterType = (filterType: keyof Filters) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: filterType === 'status' ? ["open"] : [],
        }))
    }

    useEffect(() => {
        const newParams = new URLSearchParams(searchParams.toString())

        if (keywords) {
            newParams.set("keywords", keywords)
        } else {
            newParams.delete("keywords")
        }

        newParams.set("sort", sortBy)

        if (filters.categories.length > 0) {
            newParams.set("tags", filters.categories.join(","))
        } else {
            newParams.delete("tags")
        }
        
        if (filters.roles.length > 0) {
            newParams.set("roles", filters.roles.join(","))
        } else {
            newParams.delete("roles")
        }
        
        if (filters.status.length > 0 && !(filters.status.length === 1 && filters.status[0] === "open")) {
            newParams.set("status", filters.status.join(","))
        } else {
            newParams.delete("status")
        }

        const newUrl = `${window.location.pathname}?${newParams.toString()}`
        router.push(newUrl)

        async function fetchAds() {
            setLoading(true)
            setError(null)

            try {
                const response = await api.get(`/ads?${newParams.toString()}`)
                setAdsData(response.data)
            } catch (e) {
                console.error("Error fetching ads: ", e)
                setError(e instanceof Error ? e.message : "Failed to fetch ads")
                setAdsData(null)
            } finally {
                setLoading(false)
            }
        }

        fetchAds()
    }, [keywords, sortBy, filters, router, searchParams])

    const handleSearch = () => {
        setKeywords(searchInput)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch()
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16">
            <Header/>
            <main className="container mx-auto px-4 py-8 mt-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Discover Opportunities</h1>
                            <p className="text-muted-foreground mt-1">Find your next collaboration or project</p>
                        </div>
                        {session && (
                            <Link href="/ads/post">
                                <Button variant="default">Post New Ad</Button>
                            </Link>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                        <div className="lg:col-span-3">
                            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                <div className="relative flex-1">
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                                    <Input
                                        type="text"
                                        placeholder="Search opportunities..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="pl-10"
                                    />
                                </div>
                                <Button onClick={handleSearch} className="shrink-0">
                                    Search
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="shrink-0">
                                            <ArrowUpDown className="h-4 w-4 mr-2"/>
                                            Sort
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setSortBy("week")}>Last week</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSortBy("month")}>Last month</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSortBy("all")}>All time</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button 
                                    onClick={() => setShowMobileFilters(true)} 
                                    variant="outline" 
                                    className="shrink-0 flex items-center lg:hidden"
                                >
                                    Filters
                                    {activeFiltersCount > 0 && (
                                        <Badge className="ml-2" variant="secondary">{activeFiltersCount}</Badge>
                                    )}
                                </Button>
                            </div>

                            {activeFiltersCount > 0 && (
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <span className="text-sm text-muted-foreground">Active filters:</span>
                                    
                                    {filters.categories.length > 0 && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Categories ({filters.categories.length})
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-4 w-4 p-0 hover:bg-transparent"
                                                onClick={() => clearFilterType('categories')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    )}
                                    
                                    {filters.roles.length > 0 && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Roles ({filters.roles.length})
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-4 w-4 p-0 hover:bg-transparent"
                                                onClick={() => clearFilterType('roles')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    )}
                                    
                                    {!(filters.status.length === 1 && filters.status[0] === "open") && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            Status ({filters.status.map(s => s === "open" ? "Open" : "Closed").join(", ")})
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-4 w-4 p-0 hover:bg-transparent"
                                                onClick={() => clearFilterType('status')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    )}
                                    
                                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7 px-2 text-xs">
                                        Clear all
                                    </Button>
                                </div>
                            )}

                            {loading && (
                                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <Card key={i} className="overflow-hidden">
                                            <CardContent className="p-0">
                                                <div className="p-6">
                                                    <Skeleton className="h-6 w-3/4 mb-2"/>
                                                    <Skeleton className="h-4 w-full mb-2"/>
                                                    <Skeleton className="h-4 w-full mb-2"/>
                                                    <Skeleton className="h-4 w-2/3"/>
                                                    <div className="flex gap-2 mt-4">
                                                        <Skeleton className="h-4 w-16 rounded-full"/>
                                                        <Skeleton className="h-4 w-16 rounded-full"/>
                                                    </div>
                                                    <div className="flex gap-2 mt-6">
                                                        <Skeleton className="h-9 w-full rounded"/>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {error && (
                                <Card className="border-red-200 bg-red-50 mb-6">
                                    <CardHeader>
                                        <CardTitle className="text-red-600">Error</CardTitle>
                                        <CardDescription>We encountered a problem loading the ads</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-red-600">{error}</p>
                                        <Button onClick={() => window.location.reload()} variant="outline"
                                                className="mt-4">
                                            Try Again
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {!loading && !error && (
                                <>
                                    {adsData && adsData.ads.length > 0 ? (
                                        <>
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-sm text-muted-foreground">
                                                    Showing {adsData.ads.length} results
                                                    {keywords && <span> for &quot;{keywords}&quot;</span>}
                                                    {activeFiltersCount > 0 && <span> with filters</span>}
                                                </p>
                                                <Badge variant="outline" className="font-normal">
                                                    {sortBy === "week" ? "Last week" : sortBy === "month" ? "Last month" : "All time"}
                                                </Badge>
                                            </div>
                                            <div
                                                className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
                                                {adsData.ads.map((ad) => (
                                                    <AdPosting
                                                        key={ad.id}
                                                        id={ad.id}
                                                        title={ad.title}
                                                        summary={ad.summary}
                                                        description={ad.description}
                                                        location={ad.location}
                                                        metadata={ad.metadata}
                                                        userId={ad.userId}
                                                        user={ad.user}
                                                        tags={ad.tags}
                                                        adRoles={ad.adRoles}
                                                        createdAt={ad.createdAt}
                                                        updatedAt={ad.updatedAt}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <Card className="bg-white border-muted">
                                            <CardContent className="flex flex-col items-center justify-center py-12">
                                                <div className="rounded-full bg-muted p-3 mb-4">
                                                    <Search className="h-6 w-6 text-muted-foreground"/>
                                                </div>
                                                <h2 className="text-xl font-semibold">No opportunities found</h2>
                                                <p className="text-muted-foreground mt-2 text-center max-w-md">
                                                    We couldn&apos;t find any opportunities matching your search criteria.
                                                    Try adjusting your filters
                                                    or search terms.
                                                </p>
                                                {(keywords || activeFiltersCount > 0) && (
                                                    <div className="flex gap-2 mt-4">
                                                        {keywords && (
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setKeywords("")
                                                                    setSearchInput("")
                                                                }}
                                                            >
                                                                Clear search
                                                            </Button>
                                                        )}
                                                        {activeFiltersCount > 0 && (
                                                            <Button
                                                                variant="outline"
                                                                onClick={clearAllFilters}
                                                            >
                                                                Clear filters
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}
                                </>
                            )}
                        </div>

                        <div className={`lg:col-span-1 ${showMobileFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : 'hidden lg:block'}`}>
                            {showMobileFilters && (
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-semibold text-lg">Filters</h2>
                                    <Button variant="ghost" size="sm" onClick={() => setShowMobileFilters(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Filters</CardTitle>
                                            <CardDescription>Refine your search</CardDescription>
                                        </div>
                                        {activeFiltersCount > 0 && (
                                            <Button variant="ghost" size="sm" className="h-8" onClick={clearAllFilters}>
                                                Clear all
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-sm font-medium">Categories</h3>
                                                {filters.categories.length > 0 && (
                                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => clearFilterType('categories')}>
                                                        Clear
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                {categoryOptions.map((category) => (
                                                    <div key={category} className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id={`category-${category}`} 
                                                            checked={filters.categories.includes(category)}
                                                            onCheckedChange={() => handleFilterChange('categories', category)}
                                                        />
                                                        <Label 
                                                            htmlFor={`category-${category}`}
                                                            className="text-sm cursor-pointer"
                                                        >
                                                            {category}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-sm font-medium">Roles</h3>
                                                {filters.roles.length > 0 && (
                                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => clearFilterType('roles')}>
                                                        Clear
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                {roleOptions.map((role) => (
                                                    <div key={role} className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id={`role-${role}`} 
                                                            checked={filters.roles.includes(role)}
                                                            onCheckedChange={() => handleFilterChange('roles', role)}
                                                        />
                                                        <Label 
                                                            htmlFor={`role-${role}`}
                                                            className="text-sm cursor-pointer"
                                                        >
                                                            {role}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-sm font-medium">Status</h3>
                                                {!(filters.status.length === 1 && filters.status[0] === "open") && (
                                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => clearFilterType('status')}>
                                                        Reset
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                {statusOptions.map((option) => (
                                                    <div key={option.value} className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id={`status-${option.value}`} 
                                                            checked={filters.status.includes(option.value)}
                                                            onCheckedChange={() => handleStatusChange(option.value)}
                                                        />
                                                        <Label 
                                                            htmlFor={`status-${option.value}`}
                                                            className="text-sm cursor-pointer"
                                                        >
                                                            {option.label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {showMobileFilters && (
                                            <div className="pt-4 border-t">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        onClick={() => {
                                                            clearAllFilters()
                                                            setShowMobileFilters(false)
                                                        }}
                                                    >
                                                        Reset
                                                    </Button>
                                                    <Button onClick={() => setShowMobileFilters(false)}>
                                                        Apply Filters
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
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

export default function AdsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16">
      <Header/>
      <main className="container mx-auto px-4 py-8 mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </div>
      </main>
    </div>}>
      <AdsPageContent />
    </Suspense>
  )
}