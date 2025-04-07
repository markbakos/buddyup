import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { User, Briefcase, Users, MessageSquare, Bell, Bookmark } from "lucide-react"

export function FeedSidebar() {
  const { data: session } = useSession()

  const menuItems = [
    { icon: User, label: "My Profile", href: "/profile" },
    { icon: Briefcase, label: "My Projects", href: "/profile?tab=projects" },
    { icon: Users, label: "Connections", href: "/profile?tab=connections" },
    { icon: MessageSquare, label: "Messages", href: "/messages" },
    { icon: Bell, label: "Notifications", href: "/alerts" },
    { icon: Bookmark, label: "Saved Items", href: "/saved" },
  ]

  return (
    <div className="space-y-4 sticky top-20">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">My Profile</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {session?.user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{session?.user?.name}</h3>
              <p className="text-xs text-muted-foreground">{session?.user?.jobTitle || "BuddyUp User"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-sm">
            <div className="bg-muted rounded-md p-2">
              <p className="font-semibold">{session?.user?.connectionCount}</p>
              <p className="text-xs text-muted-foreground">Connections</p>
            </div>
            <div className="bg-muted rounded-md p-2">
              <p className="font-semibold">{session?.user?.projectCount}</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <nav className="flex flex-col">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </CardContent>
      </Card>
    </div>
  )
}

