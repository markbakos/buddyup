"use client"

import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import AdPosting from "@/app/ads/AdPosting";
import {AdsResponse} from "@/types/ads";

export default function AdsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [keywords, setKeywords] = useState(searchParams.get("keywords") || "")
    const [adsData, setAdsData] = useState<AdsResponse | null>()
    const [error, setError] = useState<string | null>(null)

    const [loading, setLoading] = useState(false)

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
                const response = await fetch(`http://localhost:4000/ads?${newParams.toString()}`)

                if (!response.ok) {
                    throw new Error(`Failed to fetch ads: ${response.status} ${response.statusText}`)
                }

                const data = await response.json()
                setAdsData(data)
                console.log(adsData)
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

    const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeywords(e.target.value)
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl text-gray-800">
            <div className="w-10/12">
                <input
                    type="text"
                    placeholder="Search ads..."
                    value={keywords}
                    onChange={handleKeywordChange}
                    className="w-1/3 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div className="grid grid-cols-4">
                {adsData ? adsData.ads.map((ad) => (
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
                )) :
                    <h1>No ads found</h1>
                }
            </div>
        </div>
    )
}