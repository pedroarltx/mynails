"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { collection, query, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface ServicePopularity {
  name: string
  percentage: number
}

export function PopularServices() {
  const [services, setServices] = useState<ServicePopularity[]>([])

  useEffect(() => {
    const fetchPopularServices = async () => {
      const appointmentsRef = collection(db, "agendamentos")
      const appointmentsSnapshot = await getDocs(query(appointmentsRef))

      const serviceCounts: { [key: string]: number } = {}
      let totalAppointments = 0

      appointmentsSnapshot.forEach((doc) => {
        const serviceName = doc.data().serviceName
        serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1
        totalAppointments++
      })

      const popularServices = Object.entries(serviceCounts)
        .map(([name, count]) => ({
          name,
          percentage: (count / totalAppointments) * 100,
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 4)

      if (popularServices.length < 4) {
        popularServices.push({
          name: "Outros",
          percentage: 100 - popularServices.reduce((sum, service) => sum + service.percentage, 0),
        })
      }

      setServices(popularServices)
    }

    fetchPopularServices()
  }, [])

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Serviços Mais Populares</CardTitle>
        <CardDescription>Distribuição dos serviços mais agendados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service, index) => (
            <div key={index} className="flex items-center">
              <div className="w-full flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{service.name}</span>
                  <span className="text-sm text-muted-foreground">{service.percentage.toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${service.percentage}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

