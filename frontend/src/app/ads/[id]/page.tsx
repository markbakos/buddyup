"use client"

import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {Ad} from "@/types/ads";
import api from '@/lib/api';
import {ArrowLeft, Calendar, MapPin} from "lucide-react";
import Header from "@/app/components/Header";
import Link from "next/link";
import {useSession} from "next-auth/react";

export default function AdDetailsPage() {
    const params = useParams()
    const adId = params.id as string

    const { data: session } = useSession()
    const router = useRouter()

    const [ad, setAd] = useState<Ad | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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
                console.log(response.data)
                setAd(response.data)
            }
            catch (e) {
                console.error("Error fetching ad details:", e)
                setError(e instanceof Error ? e.message : "Failed to fetch ad details")
            }
            finally {
                setLoading(false)
            }
        }

        if (adId) {
            fetchAdDetails()
        }
    }, [adId])




    if (loading) return (
        <div>Loading</div>
    )

    return (
        <div className="bg-gray-800 w-screen min-h-screen text-white">
            <Header />
            <div className="max-w-7xl px-4 mx-auto sm:px-6 lg:px-8 py-5">
                <Link href="/ads" className="flex items-center text-blue-400 hover:text-blue-300 mb-6">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to listings
                </Link>

                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded relative mb-6" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {!loading && ad && (
                    <div className="bg-gray-700 rounded-lg shadow-lg overflow-hidden">
                        <div className="p-6">
                            <h1 className="text-3xl font-bold mb-2">{ad.title}</h1>

                            <div className="flex flex-wrap items-center text-gray-300 mb-4">
                                {ad.location && (
                                    <div className="flex items-center mr-6 mb-2">
                                        <MapPin size={18} className="mr-1" />
                                        <span>{ad.location}</span>
                                    </div>
                                )}
                                <div className="flex items-center mb-2">
                                    <Calendar size={18} className="mr-1" />
                                    <span>Posted on {new Date(ad.createdAt).toLocaleDateString('en-US')}</span>
                                </div>
                            </div>

                            {ad.summary && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold mb-2">Summary</h2>
                                    <p className="text-gray-300">{ad.summary}</p>
                                </div>
                            )}

                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-2">Description</h2>
                                <div className="text-gray-300 whitespace-pre-line">{ad.description}</div>
                            </div>

                            {ad.adRoles && ad.adRoles.length > 0 && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold mb-2">Roles</h2>
                                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                        {ad.adRoles.map((adRole) => (
                                            <div key={adRole.id} className="bg-gray-600 p-4 rounded-lg">
                                                <h3 className="text-lg font-medium">{adRole.role.name}</h3>
                                                <div className="mt-2">
                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${adRole.isOpen ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'}`}>
                                                        {adRole.isOpen ? 'Open' : 'Filled'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {ad.tags && ad.tags.length > 0 && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold mb-2">Tags</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {ad.tags.map((tag) => (
                                            <span key={tag.id} className="bg-blue-900 text-blue-100 px-3 py-1 rounded-full text-sm">
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-gray-600">
                                <h2 className="text-xl font-semibold mb-4">Posted by</h2>
                                <div className="bg-gray-600 p-2 rounded-lg inline-block">
                                    <p className="font-medium">username</p>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}