"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { debounce } from "lodash"
import React from "react"

interface Appointment {
  id: string
  name: string
  email: string
  phone: string
  serviceName: string
  servicePrice: number
  date: Date
  timeSlot: string
  notes?: string
  status: string
  createdAt: Date
}

const convertToDate = (date: Timestamp | string | Date): Date => {
  if (date instanceof Timestamp) {
    return date.toDate()
  } else if (typeof date === "string") {
    return new Date(date)
  } else if (date instanceof Date) {
    return date
  }
  throw new Error("Formato de data não suportado")
}

export function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    const appointmentsRef = collection(db, "agendamentos")
    const q = query(appointmentsRef, where("status", "==", "pendente"))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appointmentsData: Appointment[] = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          serviceName: data.serviceName,
          servicePrice: data.servicePrice,
          date: convertToDate(data.date),
          timeSlot: data.timeSlot,
          notes: data.notes,
          status: data.status,
          createdAt: convertToDate(data.createdAt),
        }
      })
      setAppointments(appointmentsData)
    })

    return () => unsubscribe()
  }, [])

  const formatAppointmentDate = useCallback((date: Date): string => {
    return format(date, "dd/MM/yyyy", { locale: ptBR })
  }, [])

  const handleCompleteAppointment = useCallback(
    debounce(async (appointment: Appointment): Promise<void> => {
      try {
        const appointmentRef = doc(db, "agendamentos", appointment.id)
        await updateDoc(appointmentRef, {
          status: "concluido",
        })

        const transactionsRef = collection(db, "transactions")
        await addDoc(transactionsRef, {
          amount: appointment.servicePrice,
          category: "Trabalho",
          date: Date.now(),
          description: appointment.serviceName,
          type: "receitas",
        })

        setAppointments((prevAppointments) => prevAppointments.filter((a) => a.id !== appointment.id))
      } catch (error) {}
    }, 300),
    [],
  )

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => a.status === "pendente")
  }, [appointments])

  const formatCurrency = useCallback((value: number): string => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }, [])

  return (
    <Card className="w-full max-w-4xl mx-auto p-6 shadow-lg rounded-2xl bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">Próximos Agendamentos</CardTitle>
        <CardDescription className="text-gray-500">Gerencie seus atendimentos com facilidade</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <p className="text-center text-gray-500">Nenhum agendamento pendente.</p>
          ) : (
            filteredAppointments.map((appointment) => (
              <AppointmentItem
                key={appointment.id}
                appointment={appointment}
                formatAppointmentDate={formatAppointmentDate}
                onComplete={handleCompleteAppointment}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const AppointmentItem = React.memo(
  ({
    appointment,
    formatAppointmentDate,
    onComplete,
  }: {
    appointment: Appointment
    formatAppointmentDate: (date: Date) => string
    onComplete: (appointment: Appointment) => void
  }) => {
    // Calculate 30% of the appointment price
    const thirtyPercentValue = appointment.servicePrice * 0.3

    // Format currency values
    const formatCurrency = (value: number): string => {
      return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    }

    return (
      <div className="flex flex-col md:flex-row items-center justify-between rounded-lg border p-4 gap-4 bg-gray-50 shadow-md">
        <div className="flex-1 space-y-2">
          <p className="text-lg font-medium text-gray-800">{appointment.name}</p>
          <p className="text-sm text-gray-600">{appointment.serviceName}</p>
          <p className="text-sm text-gray-500">Status: {appointment.status}</p>
          {appointment.notes && <p className="text-sm text-gray-500">Observações: {appointment.notes}</p>}

          {/* Add price information */}
          <div className="mt-3 pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Valor:</span>
              <span className="font-semibold text-gray-800">{formatCurrency(appointment.servicePrice)}</span>
            </div>
            <div className="flex justify-between items-center text-green-600">
              <span className="text-sm font-medium">30% do valor:</span>
              <span className="font-semibold">{formatCurrency(thirtyPercentValue)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 text-gray-700">
          <p className="font-medium">{formatAppointmentDate(appointment.date)}</p>
          <p className="text-sm">{appointment.timeSlot}</p>
          {appointment.status === "pendente" && (
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-24 flex items-center justify-center gap-2 border-green-500 text-green-600 hover:bg-green-100"
              onClick={() => onComplete(appointment)}
            >
              <CheckCircle className="h-5 w-5" /> Concluir
            </Button>
          )}
        </div>
      </div>
    )
  },
)

AppointmentItem.displayName = "AppointmentItem"

