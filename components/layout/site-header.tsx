"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">Rafaela Silva</span>
        </Link>

        {/* Menu Hambúrguer - Mobile */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden p-2">
              <Menu className="h-5 w-5 text-primary" />
              <span className="sr-only">Abrir menu</span>
            </button>
          </SheetTrigger>

          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex flex-col gap-6 py-4 px-6">
              <div className="flex flex-col gap-2">
                <Link href="/" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                  Início
                </Link>
                <Link href="/#servicos" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                  Serviços
                </Link>
                <Link href="/#contato" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                  Contato
                </Link>
                <Link href="/agendamento" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                  Agendar
                </Link>
                <Link href="/login" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Links - Desktop */}
        <nav className="hidden md:flex ml-auto gap-4 sm:gap-6">
          <Link href="/" className="text-sm font-medium">
            Início
          </Link>
          <Link href="/#servicos" className="text-sm font-medium">
            Serviços
          </Link>
          <Link href="/#contato" className="text-sm font-medium">
            Contato
          </Link>
          <Link href="/agendamento" className="text-sm font-medium">
            Agendar
          </Link>
          <Link href="/login" className="text-sm font-medium">
            Login
          </Link>
        </nav>
      </div>
    </header>
  )
}