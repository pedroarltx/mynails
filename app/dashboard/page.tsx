"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { PopularServices } from "@/components/dashboard/popular-services"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { FinancialSummary } from "@/components/dashboard/financial-summary"
import { useFirestore } from "@/lib/useFirestore"
import { useFirebase } from "@/components/firebase-provider"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user, loading: authLoading } = useFirebase()
  const router = useRouter()
  const { documents: appointments, loading: appointmentsLoading } = useFirestore("agendamentos")
  const { documents: transactions, loading: transactionsLoading } = useFirestore("transactions")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
    if (!authLoading && user && !appointmentsLoading && !transactionsLoading) {
      setIsLoading(false)
    }
  }, [authLoading, user, appointmentsLoading, transactionsLoading, router])

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <DashboardLayout title="Dashboard">
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <Tabs defaultValue="visao-geral" className="space-y-4">
          <TabsList>
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
            <TabsTrigger value="financas">Finanças</TabsTrigger>
          </TabsList>
          <TabsContent value="visao-geral" className="space-y-4">
            <OverviewCards appointments={appointments} transactions={transactions} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <PopularServices />
            </div>
            
          </TabsContent>
          <TabsContent value="agendamentos" className="space-y-4">
            <UpcomingAppointments />
          </TabsContent>
          <TabsContent value="financas" className="space-y-4">
            <FinancialSummary />
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  )
}

