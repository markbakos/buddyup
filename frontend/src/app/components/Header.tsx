"use client"

import Link from "next/link"
import { useState, useEffect, useRef} from "react"
import {Home, SquareIcon, MessageSquare, ChevronDown, Users, User} from "lucide-react"

import { useSession, signOut } from "next-auth/react"
export default function Header() {
    const { data: session } = useSession()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const navItems = [
        { name: "Home", icon: Home, href: "/" },
        { name: "Ads", icon: SquareIcon, href: "/ads" },
        { name: "Messages", icon: MessageSquare, href: "/messages" },
    ]

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <header className="w-full bg-gray-700 shadow-md">
            <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <Users className="w-10 h-10" />
                    <span className="text-xl font-semibold text-white hidden sm:inline">BuddyUp</span>
                </Link>

                <div className="flex items-center space-x-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex flex-col items-center text-white hover:text-indigo-200 transition-colors"
                        >
                            <item.icon className="h-6 w-6 mb-1" />
                            <span className="text-xs hidden sm:inline">{item.name}</span>
                        </Link>
                    ))}

                    {session ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center space-x-1 text-white hover:text-indigo-200 transition-colors focus:outline-none"
                            >
                                <div className="flex-col flex items-center">
                                    <User className="w-6 h-6 mb-1"/>
                                    <span className="text-xs hidden sm:inline">Profile</span>
                                </div>
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100">
                                        View Profile
                                    </Link>
                                    <button
                                        onClick={() => signOut()}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-x-1">
                            <Link href="/auth/signin">
                                <button className="bg-white text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-white active:bg-indige-100 transition-colors">
                                    Sign in
                                </button>
                            </Link>
                            <Link href="/auth/signin">
                                <button className="border border-white px-4 py-2 rounded-md font-semibold hover:bg-white hover:text-gray-700 active:bg-indigo-100 transition-colors">
                                    Join now
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    )
}
