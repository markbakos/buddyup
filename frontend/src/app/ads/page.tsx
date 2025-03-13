"use client"

import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import AdPosting from "@/app/ads/AdPosting";
import {AdsResponse} from "@/types/ads";
import {Search} from "lucide-react";
import Header from "@/app/components/Header";
import axios from "axios";

export default function AdsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [keywords, setKeywords] = useState(searchParams.get("keywords") || "")
    const [adsData, setAdsData] = useState<AdsResponse | null>()
    const [error, setError] = useState<string | null>(null)

    const [loading, setLoading] = useState(false)

    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const newParams = new URLSearchParams(searchParams.toString())

        if (keywords) {
            newParams.set("keywords", keywords)
        } else {
            newParams.delete("keywords")
        }

        const newUrl = `${window.location.pathname}?${newParams.toString()}`
        router.push(newUrl)

        async function fetchAds() {
            setLoading(true)
            setError(null)

            try {
                const response = await axios.get(`http://localhost:4000/ads?${newParams.toString()}`)

                console.log(response.data)
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
    }, [keywords, router, searchParams])

    const handleKeywordChange = () => {
        if(inputRef.current) {
            setKeywords(inputRef.current.value)
        }
    }

    const handleKeyDownSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleKeywordChange()
        }
    }

    return (
        <div className="bg-gray-800 w-screen min-h-screen">
            <Header />
            <div className="max-w-7xl px-4 mx-auto sm:px-6 lg:px-8 py-5">
                <div className="w-full flex">
                    <div className="mb-8 relative w-1/2 md:w-1/3">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search ad listings..."
                            onKeyDown={handleKeyDownSearch}
                            className="w-full p-4 pr-12 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        />
                        <Search
                            onClick={handleKeywordChange}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                            size={24}
                        />
                    </div>
                </div>



                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
                         role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {!loading && !error && (
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {adsData && adsData.ads.length > 0 ? (
                            adsData.ads.map((ad) => (
                                <AdPosting
                                    key={ad.id}
                                    id={ad.id}
                                    title={ad.title}
                                    description={ad.description}
                                    metadata={ad.metadata}
                                    tags={ad.tags}
                                    adRoles={ad.adRoles}
                                    createdAt={ad.createdAt}
                                    updatedAt={ad.updatedAt}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-600">
                                <h2 className="text-xl font-semibold">No job listings found</h2>
                                <p className="mt-2">Try adjusting your search criteria</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}