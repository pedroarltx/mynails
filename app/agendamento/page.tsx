"use client"

import type React from "react"

import { useState } from "react"
import { SiteLayout } from "@/components/layout/site-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AppointmentSteps } from "@/components/appointment/appointment-steps"
import { ServiceSelection } from "@/components/appointment/service-selection"
import { DateTimeSelection } from "@/components/appointment/date-time-selection"
import { ClientForm } from "@/components/appointment/client-form"
import { useFirestore } from "@/lib/useFirestore"
import { addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Service {
  id: string
  title: string
  description: string
  price: number
  image: string
}



export default function AgendamentoPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [service, setService] = useState<string>("")
  const [timeSlot, setTimeSlot] = useState<string>("")
  const [step, setStep] = useState(1)

  const { documents: services, loading, error } = useFirestore<Service>("services")

  // Gerar horários disponíveis (exemplo)
  const availableTimeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ]

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você implementaria a lógica para salvar o agendamento no Firestore
    try {
      await addDoc(collection(db, "agendamentos"), {
        service,
        date: date?.toISOString(),
        timeSlot,
        status: "pendente",
        // Adicione outros campos do formulário aqui
      })
      alert("Agendamento realizado com sucesso!")
      // Redirecionar para a página inicial ou de confirmação
    } catch (error) {
      console.error("Erro ao agendar:", error)
      alert("Erro ao realizar o agendamento. Por favor, tente novamente.")
    }
  }

  const selectedService = services.find((s) => s.id === service)

  if (loading) {
    return <div>Carregando...</div>
  }

  if (error) {
    return <div>Erro ao carregar serviços: {error}</div>
  }

  return (
    <SiteLayout>
      <div className="py-12">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Agende seu Horário</h1>
              <p className="text-muted-foreground">Escolha o serviço, data e horário para seu atendimento.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 1 && "Escolha o Serviço"}
                  {step === 2 && "Selecione a Data"}
                  {step === 3 && "Informações Pessoais"}
                </CardTitle>
                <CardDescription>
                  {step === 1 && "Selecione o serviço que deseja agendar"}
                  {step === 2 && "Escolha a data e horário disponível"}
                  {step === 3 && "Complete com seus dados para confirmar"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {step === 1 && (
                  <ServiceSelection services={services} selectedService={service} onSelectService={setService} />
                )}

                {step === 2 && (
                  <DateTimeSelection
                    date={date}
                    timeSlot={timeSlot}
                    availableTimeSlots={availableTimeSlots}
                    onSelectDate={setDate}
                    onSelectTimeSlot={setTimeSlot}
                  />
                )}

                {step === 3 && (
                  <ClientForm
                    onSubmit={handleSubmit}
                    service={service}
                    date={date}
                    timeSlot={timeSlot}
                    serviceName={selectedService?.title || ""}
                    servicePrice={selectedService?.price || 0}
                  />
                )}
              </CardContent>
              <CardFooter>
                <AppointmentSteps
                  currentStep={step}
                  totalSteps={3}
                  onNext={handleNextStep}
                  onPrevious={handlePrevStep}
                  canProceed={(step === 1 && service) || (step === 2 && date && timeSlot) || step === 3}
                />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}

