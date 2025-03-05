"use client"

import type React from "react"
import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"

// Definir o esquema de validação com Zod
const schema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "O telefone é obrigatório"),
  notes: z.string().optional(),
})

// Tipo inferido a partir do esquema Zod
type FormData = z.infer<typeof schema>

interface ClientFormProps {
  service: string
  date: Date | undefined
  timeSlot: string
  serviceName: string
  servicePrice: number
}

export function ClientForm({ service, date, timeSlot, serviceName, servicePrice }: ClientFormProps) {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Função para salvar o agendamento
  const handleConfirmAgendamento = async () => {
    setLoading(true)

    // Validação manual dos campos
    const formData = getValues()
    const { name, email, phone, notes } = formData

    if (!date || !timeSlot) {
      alert("Por favor, selecione uma data e horário válidos.")
      setLoading(false)
      return
    }

    try {
      await addDoc(collection(db, "agendamentos"), {
        name,
        email,
        phone,
        notes: notes || "",
        serviceId: service,
        serviceName,
        servicePrice,
        date: Timestamp.fromDate(date), // Salva como Timestamp
        timeSlot,
        createdAt: Timestamp.fromDate(new Date()), // Salva como Timestamp
        status: "pendente", // Define o status inicial
      })

      alert("Agendamento realizado com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error)
      alert("Erro ao salvar. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Nome Completo
        </label>
        <input
          id="name"
          {...register("name")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Seu nome completo"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="seu.email@exemplo.com"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          Telefone
        </label>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="(00) 00000-0000"
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Observações (opcional)
        </label>
        <textarea
          id="notes"
          {...register("notes")}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Alguma informação adicional que devemos saber?"
        />
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <h3 className="font-medium">Resumo do Agendamento</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Serviço:</div>
          <div className="font-medium">{serviceName}</div>
          <div>Data:</div>
          <div className="font-medium">{date ? format(date, "PPP", { locale: ptBR }) : "-"}</div>
          <div>Horário:</div>
          <div className="font-medium">{timeSlot || "-"}</div>
          <div>Valor:</div>
          <div className="font-medium">R$ {servicePrice.toFixed(2) || "-"}</div>
        </div>
      </div>

      <Button type="submit" className="w-full" onClick={handleSubmit(handleConfirmAgendamento)} disabled={loading} >Confirmar Agendamento</Button>
    </form>
  )
}