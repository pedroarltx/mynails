import type { ReactNode } from "react"
import { DashboardHeader } from "./dashboard-header"
import { DashboardSidebar } from "./dashboard-sidebar"

interface DashboardLayoutProps {
  children: ReactNode
  title: string
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr]">
      {/* Sidebar - Visível apenas em telas médias e maiores */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      <div className="flex flex-col">
        {/* Header - Visível apenas em telas pequenas */}
        <div className="md:hidden ">
          <DashboardHeader siteName={"Rafaela"}  />
        </div>

        {/* Conteúdo principal */}
        {children}
      </div>
    </div>
  )
}
