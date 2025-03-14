"use client"

import {Ad} from "@/types/ads";
import {ChevronDown, ChevronUp, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import React, {useRef, useState } from "react";

export default function AdPosting({id, title, summary, description, metadata, tags, adRoles, createdAt, updatedAt}: Ad) {
    const [isRolesOpen, setIsRolesOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    return (
        <div
            className="w-[80vw] md:w-full mx-auto md:mx-0 bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg relative"
            style={{height: "400px"}}
        >
            <div className="p-6 h-full flex flex-col">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 line-clamp-2">{title}</h2>
                <p className="text-gray-600 mb-4 flex-grow overflow-hidden line-clamp-4">{summary}</p>

                <div className="mt-auto space-y-2">
                    <button
                        onClick={() => setIsRolesOpen(!isRolesOpen)}
                        className="flex items-center justify-center px-4 py-2 w-full text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-50 transition-colors duration-200"
                    >
                        Roles
                        {isRolesOpen ? <ChevronUp size={16} className="ml-1"/> :
                            <ChevronDown size={16} className="ml-1"/>}
                    </button>

                    <Link
                        href={`/ads/${id}`}
                        className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-50 transition-colors duration-200"
                    >
                        View Details
                        <ExternalLink size={16} className="ml-2"/>
                    </Link>

                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock size={16} className="mr-2"/>
                      Posted: {new Date(createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {isRolesOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute inset-0 bg-white bg-opacity-95 p-6 overflow-y-auto"
                    style={{backdropFilter: "blur(5px)"}}
                >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Available Roles</h3>
                    {adRoles && adRoles.length > 0 ? (
                        <ul className="space-y-2">
                            {adRoles.map((adRole) => (
                                <li key={adRole.id}
                                    className="flex items-center justify-between p-2 bg-gray-50 border rounded-md">
                                    <span className="font-medium text-gray-800">{adRole.role.name}</span>
                                    <span
                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${adRole.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                    >
                    {adRole.isOpen ? "Open" : "Closed"}
                  </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No roles advertised.</p>
                    )}
                    <Link
                        href={`/ads/${id}`}
                        className="mt-4 inline-flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-50 transition-colors duration-200"
                    >
                        Apply now!
                        <ExternalLink size={16} className="ml-2"/>
                    </Link>
                    <button
                        onClick={() => setIsRolesOpen(false)}
                        className="mt-2 w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-50 transition-colors duration-200"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    )
}