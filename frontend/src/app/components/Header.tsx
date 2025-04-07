"use client"

import Link from "next/link"
import { useState, useEffect} from "react"
import { useSession, signOut } from "next-auth/react"

import { Home, Newspaper, MessageSquare, Users, User, Bell, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
    const { data: session } = useSession()
    const [scrolled, setScrolled] = useState(false)

    const navItems = [
        { name: "Home", icon: Home, href: "/" },
        { name: "Discover", icon: Newspaper, href: "/ads" },
    ]

    const authNavItems = [
        { name: "Home", icon: Home, href: "/" },
        { name: "Discover", icon: Newspaper, href: "/ads" },
        { name: "Messages", icon: MessageSquare, href: "/messages" },
        { name: "Alerts", icon: Bell, href: "/alerts" },
    ]

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setScrolled(true)
            } else {
                setScrolled(false)
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => {
            window.removeEventListener("scroll", handleScroll)
        }
    }, [])

    useEffect(() => {
        console.log(session)
    }, [session])

    return (
        <header
            className={`w-full fixed top-0 z-50 transition-all duration-300 ${
                scrolled ? "bg-white/95 backdrop-blur-sm shadow-md text-gray-800" : "bg-gray-800 text-white"
            }`}
        >
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="bg-primary rounded-lg p-1.5">
                            <Users className="w-6 h-6 text-white"/>
                        </div>
                        <span className="text-xl font-bold hidden sm:inline">BuddyUp</span>
                    </Link>

                    <div className="hidden md:flex relative max-w-md w-full mx-4">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-500 z-10"/>
                        </div>
                        <input
                            type="text"
                            placeholder="Search connections..."
                            className={`w-full pl-10 pr-4 py-2 rounded-full border ${
                                scrolled ? "border-gray-300 bg-gray-50" : "border-gray-600 bg-gray-800/50 backdrop-blur-sm"
                            } focus:outline-none focus:ring-2 focus:ring-primary`}
                        />
                    </div>

                    <div className="flex items-center space-x-1 sm:space-x-4">
                        <nav className="flex items-center space-x-1 sm:space-x-4">
                            {(session ? authNavItems : navItems).map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                                        scrolled ? "hover:bg-gray-100 text-gray-700 hover:text-primary" : "hover:bg-white/10 text-white"
                                    }`}
                                >
                                    <item.icon className="h-5 w-5"/>
                                    <span className="text-xs mt-1 hidden sm:inline">{item.name}</span>
                                </Link>
                            ))}
                        </nav>

                        {session ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                        <Avatar className="h-10 w-10 border-2 border-primary">
                                            <AvatarImage src={session.user?.image || ""}
                                                         alt={session.user?.name || ""}/>
                                            <AvatarFallback className="bg-primary text-white">
                                                {session.user?.name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="flex items-center justify-start gap-2 p-2">
                                        <div className="flex flex-col space-y-0.5">
                                            <p className="text-sm font-medium">{session.user.name}</p>
                                            <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4"/>
                                            <span>My Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem onClick={() => signOut()}
                                                      className="text-red-600 focus:text-red-600">
                                        Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link href="/auth/signin">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-gray-800 border-gray-800 hover:text-gray-900"
                                    >
                                        Sign in
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm">Join now</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
