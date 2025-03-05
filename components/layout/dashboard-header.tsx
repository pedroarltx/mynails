"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, User, Settings, LogOut, ChevronDown } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface NavbarProps {
  siteName: string
  logo?: string
  profileImage?: string
  links: {
    label: string
    href: string
  }[]
  onLogout?: () => void
}

export function DashboardHeader({
  logo = "../logo.jpeg",
  profileImage = "../logo.jpeg",
  links = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Agendamentos", href: "/dashboard/agendamentos" },
    { label: "Finanças", href: "/dashboard/financas" },
  ],
  onLogout = () => console.log("Logout clicked"),
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-99 w-full border-b bg-background shadow-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Menu Hambúrguer - Mobile */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5 text-primary" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex flex-col gap-6 py-4 px-6">
              <div className="flex items-center gap-2">
                {logo && (
                  <Image
                    src={logo || "/placeholder.svg"}
                    alt={`logo`}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-md"
                  />
                )}
              </div>
              <div className="flex text-black flex-col gap-2">
                {links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="flex text-black items-center py-2 text-base hover:underline  transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo e Título - Desktop */}
        <Link href="/" className="flex items-center gap-2">
          {logo && (
            <Image
              src={logo || "../public/placeholder-user.svg"}
              alt={`ogo`}
              width={40}
              height={40}
              className="h-10 w-10 rounded-md"
            />
          )}
        </Link>

        {/* Links - Desktop */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <div className="flex gap-6">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-sm text-black font-medium hover:text-primary hover:underline transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Perfil e Dropdown */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="flex items-center gap-2">
                  <Image
                    src={profileImage || "/placeholder.svg"}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <ChevronDown className="h-4 w-4 hidden sm:block" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4" />
                </div>
                <div className="text-sm font-medium">Perfil</div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex w-full cursor-pointer items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onLogout}
                className="flex cursor-pointer items-center text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
