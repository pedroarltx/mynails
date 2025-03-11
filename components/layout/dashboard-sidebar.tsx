import type React from "react"
import Link from "next/link"
import { Calendar, DollarSign, LayoutDashboard, LogOut, Package2, Settings, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavItem {
  href: string
  icon: React.ReactNode
  title: string
  isActive?: boolean
}

export function DashboardSidebar() {
  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      title: "Dashboard",
      isActive: true,
    },
    {
      href: "/dashboard/agendamentos",
      icon: <Calendar className="h-4 w-4" />,
      title: "Agendamentos",
    },
    {
      href: "/dashboard/financas",
      icon: <DollarSign className="h-4 w-4" />,
      title: "Finanças",
    },
    {
      href: "/dashboard/services",
      icon: <Settings className="h-4 w-4" />,
      title: "Serviços",
    },
  ]

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="">Rafaela Silva</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-foreground ${
                  item.isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

