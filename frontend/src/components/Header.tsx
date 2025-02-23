import Link from "next/link"
import {Home, SquareIcon, MessageSquare, User, Users} from "lucide-react"

export default function Header() {
    const navItems = [
        { name: "Home", icon: Home, href: "/" },
        { name: "Ads", icon: SquareIcon, href: "/ads" },
        { name: "Messages", icon: MessageSquare, href: "/messages" },
        { name: "Profile", icon: User, href: "/profile" },
    ]

    return (
        <header className="w-full bg-slate-500 p-4">
            <nav className="container mx-auto flex items-center justify-between">

                <div className="flex space-x-4 sm:space-x-8 items-center justify-center flex-grow">
                    <div className="mx-6">
                        <Link href="/">
                            <Users className="w-12 h-12" />
                        </Link>

                    </div>
                    {navItems.map((item) => (
                        <Link key={item.name} href={item.href} className="flex flex-col items-center text-white">
                            <item.icon className="h-8 w-8 sm:h-6 sm:w-6 " />
                            <span className="text-md hidden sm:inline">{item.name}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </header>
    )
}

