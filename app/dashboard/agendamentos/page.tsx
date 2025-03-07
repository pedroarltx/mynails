"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import ProtectedRoute from "@/hooks/protected-route"
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  User,
} from "lucide-react"
import * as dateFns from "date-fns"
import { ptBR } from "date-fns/locale"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { collection, onSnapshot, addDoc, updateDoc, doc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Modal } from "@/components/ui/modal"
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { debounce } from "lodash"

// Esquema de validação para Agendamento
const appointmentSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "O telefone é obrigatório"),
  serviceName: z.string().min(1, "O serviço é obrigatório"),
  date: z.date({ required_error: "A data é obrigatória" }),
  timeSlot: z.string().min(1, "O horário é obrigatório"),
  notes: z.string().optional(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
})

// Esquema de validação para Cliente
const clientSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "O telefone é obrigatório"),
  lastAppointment: z.date().optional(),
})

// Esquema de validação para Serviço
const serviceSchema = z.object({
  name: z.string().min(1, "O nome do serviço é obrigatório"),
  duration: z.number().min(1, "A duração é obrigatória"),
  price: z.number().min(0, "O preço é obrigatório"),
})

// Tipos inferidos a partir dos esquemas Zod
type AppointmentFormData = z.infer<typeof appointmentSchema>
type ClientFormData = z.infer<typeof clientSchema>
type ServiceFormData = z.infer<typeof serviceSchema>

// Interface para Agendamento
interface Appointment {
  id: string
  name: string
  email: string
  phone: string
  serviceName: string
  date: Date
  timeSlot: string
  notes?: string
  status: string
  createdAt: Timestamp
}

// Interface para Cliente
interface Client {
  id: string
  name: string
  email: string
  phone: string
  lastAppointment?: Date
}

// Interface para Serviço
interface Service {
  id: string
  title: string
  duration: number
  price: number
}

export default function AgendamentosPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [view, setView] = useState<"dia" | "semana" | "mes">("dia")
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([])
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [isSelectClientModalOpen, setIsSelectClientModalOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Formulário de Agendamento
  const {
    register: registerAppointment,
    handleSubmit: handleSubmitAppointment,
    reset: resetAppointment,
    control: controlAppointment,
    setValue,
    formState: { errors: appointmentErrors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  })

  // Formulário de Cliente
  const {
    register: registerClient,
    handleSubmit: handleSubmitClient,
    reset: resetClient,
    control: controlClient,
    formState: { errors: clientErrors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  })

  // Formulário de Serviço
  const {
    register: registerService,
    handleSubmit: handleSubmitService,
    reset: resetService,
    formState: { errors: serviceErrors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  })

  //  !data
  const generateDateOptions = useCallback(() => {
    const today = new Date()
    const days = Array.from({ length: 31 }, (_, i) => i + 1)
    const months = Array.from({ length: 12 }, (_, i) => i + 1)
    const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() + i)
    return { days, months, years }
  }, [])

  const { days, months, years } = useMemo(() => generateDateOptions(), [generateDateOptions])

  // Horários disponíveis
  const timeSlots = useMemo(
    () => ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
    [],
  )

  // Buscar agendamentos do Firebase
  useEffect(() => {
    const agendamentosRef = collection(db, "agendamentos")
    const unsubscribeAgendamentos = onSnapshot(agendamentosRef, (querySnapshot) => {
      const appointments = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate ? data.date.toDate() : new Date(),
        } as Appointment
      })
      setAllAppointments(appointments)
    })

    return () => unsubscribeAgendamentos()
  }, [])

  // Buscar clientes do Firebase
  useEffect(() => {
    const clientesRef = collection(db, "clientes")
    const unsubscribeClientes = onSnapshot(clientesRef, (querySnapshot) => {
      const clientes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        lastAppointment: doc.data().lastAppointment?.toDate(),
      })) as Client[]
      setClients(clientes)
    })

    return () => unsubscribeClientes()
  }, [])

  // Buscar serviços do Firebase
  useEffect(() => {
    const servicesRef = collection(db, "services")
    const unsubscribeServices = onSnapshot(servicesRef, (querySnapshot) => {
      const services = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[]
      setServices(services)
    })

    return () => unsubscribeServices()
  }, [])

  // Fechar modal de agendamento
  const handleCloseAppointmentModal = useCallback(() => {
    setIsAppointmentModalOpen(false)
    resetAppointment()
    setEditingAppointment(null)
  }, [resetAppointment])

  // Salvar novo agendamento
  const onSubmitAppointment = useCallback(
    async (data: AppointmentFormData) => {
      try {
        const { name, email, phone, notes, serviceName, date, timeSlot } = data
        const selectedService = services.find((service) => service.title === serviceName)

        if (!selectedService) {
          throw new Error("Serviço não encontrado.")
        }

        const agendamento = {
          name,
          email,
          phone,
          notes: notes || "",
          serviceId: selectedService.id,
          serviceName: selectedService.title,
          servicePrice: selectedService.price,
          date: Timestamp.fromDate(date),
          timeSlot,
          createdAt: Timestamp.fromDate(new Date()),
          status: "pendente",
        }

        await addDoc(collection(db, "agendamentos"), agendamento)
        handleCloseAppointmentModal()
        resetAppointment()
      } catch (error) {
        toast.error("Ocorreu um erro ao criar o agendamento. Tente novamente.")
      }
    },
    [services, handleCloseAppointmentModal, resetAppointment],
  )

  // Atualizar agendamento
  const handleUpdateAppointment = useCallback(
    async (data: AppointmentFormData) => {
      if (!editingAppointment) return

      try {
        await updateDoc(doc(db, "agendamentos", editingAppointment.id), {
          ...data,
          date: Timestamp.fromDate(data.date),
        })
        toast.success("Agendamento atualizado com sucesso!")
        handleCloseAppointmentModal()
        setEditingAppointment(null)
      } catch (error) {
        toast.error("Erro ao atualizar agendamento. Tente novamente.")
      }
    },
    [editingAppointment, handleCloseAppointmentModal],
  )

  // Fechar modal de seleção de cliente
  const handleCloseSelectClientModal = useCallback(() => {
    setIsSelectClientModalOpen(false)
  }, [])

  // Fechar modal de cliente
  const handleCloseClientModal = useCallback(() => {
    setIsClientModalOpen(false)
    resetClient()
  }, [resetClient])

  // Salvar novo cliente
  const onSubmitClient = useCallback(
    async (data: ClientFormData) => {
      try {
        const clientData = {
          ...data,
          // If lastAppointment exists, convert to Timestamp for Firebase
          ...(data.lastAppointment && {
            lastAppointment: Timestamp.fromDate(data.lastAppointment),
          }),
          createdAt: new Date().toISOString(),
        }

        await addDoc(collection(db, "clientes"), clientData)
        toast.success("Cliente cadastrado com sucesso!")
        handleCloseClientModal()
      } catch (error) {
        toast.error("Erro ao cadastrar cliente. Tente novamente.")
      }
    },
    [handleCloseClientModal],
  )

  // Salvar novo serviço
  const onSubmitService = useCallback(
    async (data: ServiceFormData) => {
      try {
        await addDoc(collection(db, "services"), {
          ...data,
          createdAt: new Date().toISOString(),
        })
        toast.success("Serviço cadastrado com sucesso!")
        setIsServiceModalOpen(false)
        resetService()
      } catch (error) {
        toast.error("Erro ao cadastrar serviço. Tente novamente.")
      }
    },
    [resetService],
  )

  // Função para selecionar um cliente a partir dos últimos agendamentos
  const handleSelectClientFromAppointments = useCallback(
    (appointment: Appointment) => {
      resetClient({
        name: appointment.name,
        email: appointment.email,
        phone: appointment.phone,
      })
      setIsSelectClientModalOpen(false)
      setIsClientModalOpen(true)
    },
    [resetClient],
  )

  // Verificar se o horário está disponível
  const isTimeSlotAvailable = useCallback(
    (selectedDate: Date, timeSlot: string) => {
      return !allAppointments.some(
        (appointment) =>
          dateFns.format(appointment.date, "yyyy-MM-dd") === dateFns.format(selectedDate, "yyyy-MM-dd") &&
          appointment.timeSlot === timeSlot &&
          appointment.status !== "cancelado",
      )
    },
    [allAppointments],
  )

  // Cancelar agendamento
  const handleCancelAppointment = useCallback(async (appointmentId: string) => {
    if (window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      try {
        await updateDoc(doc(db, "agendamentos", appointmentId), {
          status: "cancelado",
        })
        toast.success("Agendamento cancelado com sucesso!")
      } catch (error) {
        toast.error("Erro ao cancelar agendamento. Tente novamente.")
      }
    }
  }, [])

  // Buscar clientes por nome ou email
  const searchClients = useCallback(
    (query: string) => {
      return clients.filter(
        (client) =>
          client.name.toLowerCase().includes(query.toLowerCase()) ||
          client.email.toLowerCase().includes(query.toLowerCase()),
      )
    },
    [clients],
  )

  // Obter horários disponíveis para o dia selecionado
  const getAvailableTimeSlots = useCallback(
    (selectedDate: Date) => {
      const occupiedSlots = allAppointments
        .filter(
          (appointment) =>
            dateFns.format(appointment.date, "yyyy-MM-dd") === dateFns.format(selectedDate, "yyyy-MM-dd") &&
            appointment.status !== "cancelado",
        )
        .map((appointment) => appointment.timeSlot)

      return timeSlots.filter((slot) => !occupiedSlots.includes(slot))
    },
    [allAppointments, timeSlots],
  )

  // Filtro de agendamentos
  const filteredAppointments = useMemo(() => {
    if (view === "dia" && date) {
      return allAppointments.filter(
        (appointment) => dateFns.format(appointment.date, "yyyy-MM-dd") === dateFns.format(date, "yyyy-MM-dd"),
      )
    } else if (view === "semana" && date) {
      const startOfWeekDate = dateFns.startOfWeek(date, { weekStartsOn: 0 })
      const endOfWeekDate = dateFns.endOfWeek(date, { weekStartsOn: 0 })
      return allAppointments.filter((appointment) =>
        dateFns.isWithinInterval(appointment.date, {
          start: startOfWeekDate,
          end: endOfWeekDate,
        }),
      )
    } else if (view === "mes" && date) {
      const startOfMonthDate = dateFns.startOfMonth(date)
      const endOfMonthDate = dateFns.endOfMonth(date)
      return allAppointments.filter((appointment) =>
        dateFns.isWithinInterval(appointment.date, {
          start: startOfMonthDate,
          end: endOfMonthDate,
        }),
      )
    }
    return []
  }, [allAppointments, date, view])

  // Debounced search
  const handleSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query)
    }, 300),
    [],
  )

  // Modificar a função que abre o modal de cliente
  const handleOpenClientModal = useCallback(() => {
    setIsSelectClientModalOpen(true)
  }, [])

  // Função para abrir o modal de novo cliente
  const handleOpenNewClientModal = useCallback(() => {
    setIsSelectClientModalOpen(false)
    setIsClientModalOpen(true)
  }, [])

  // Função para selecionar um cliente existente
  const handleSelectExistingClient = useCallback(
    (client: Client) => {
      // Lógica para selecionar o cliente
      setValue("name", client.name)
      setValue("email", client.email)
      setValue("phone", client.phone)
      setIsSelectClientModalOpen(false)
    },
    [setValue],
  )

  return (
    <ProtectedRoute>
      <DashboardLayout title="Agendamentos">
        <ToastContainer />
        <div className="p-4 space-y-4 flex-1">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full md:w-[240px] justify-start text-left font-normal mb-4 md:mb-0"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? dateFns.format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={ptBR} />
              </PopoverContent>
            </Popover>
            <Button size="sm" onClick={() => setIsAppointmentModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </div>

          {/* Modal de Novo Agendamento */}
          <Modal
            isOpen={isAppointmentModalOpen}
            onClose={handleCloseAppointmentModal}
            title={editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
            description="Preencha os detalhes do agendamento"
          >
            <form onSubmit={handleSubmitAppointment(onSubmitAppointment)} className="space-y-4">
              {/* Campo do Cliente */}
              <div className="space-y-2">
                <label htmlFor="client">Cliente</label>
                <Controller
                  name="name"
                  control={controlAppointment}
                  render={({ field }) => (
                    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                      <PopoverTrigger asChild>
                        <div className="w-full">
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <User className="mr-2 h-4 w-4" />
                            {field.value ?? "Selecione um cliente"}
                          </Button>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <div className="p-2">
                          <Input placeholder="Buscar cliente..." onChange={(e) => handleSearch(e.target.value)} />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                          {searchClients(searchQuery).map((client) => (
                            <div
                              key={client.id}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                handleSelectExistingClient(client)
                                field.onChange(client.name)
                                setSearchQuery("")
                                setIsPopoverOpen(false)
                              }}
                            >
                              <p className="font-medium">{client.name}</p>
                              <p className="text-sm text-muted-foreground">{client.email}</p>
                            </div>
                          ))}
                        </div>
                        <div className="p-2 border-t">
                          <Button variant="outline" className="w-full" onClick={handleOpenNewClientModal}>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Cliente
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>

              {/* Campo do Email */}
              <div className="space-y-2">
                <label htmlFor="email">Email do Cliente</label>
                <Input id="email" {...registerAppointment("email")} placeholder="Email do cliente" />
                {appointmentErrors.email && <p className="text-red-500 text-sm">{appointmentErrors.email.message}</p>}
              </div>

              {/* Campo do Telefone */}
              <div className="space-y-2">
                <label htmlFor="phone">Telefone do Cliente</label>
                <Input id="phone" {...registerAppointment("phone")} placeholder="Telefone do cliente" />
                {appointmentErrors.phone && <p className="text-red-500 text-sm">{appointmentErrors.phone.message}</p>}
              </div>

              {/* Campo do Serviço */}
              <div className="space-y-2">
                <label htmlFor="serviceName">Serviço</label>
                <div className="flex gap-2">
                  <Controller
                    name="serviceName"
                    control={controlAppointment}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.title}>
                              {service.title} ({service.duration} min)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Button type="button" variant="outline" onClick={() => setIsServiceModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Serviço
                  </Button>
                </div>
                {appointmentErrors.serviceName && (
                  <p className="text-red-500 text-sm">{appointmentErrors.serviceName.message}</p>
                )}
              </div>

              {/* Campo da Data */}
              <div className="space-y-2">
                <label htmlFor="date">Data</label>
                <div className="flex space-x-2">
                  <Controller
                    name="date"
                    control={controlAppointment}
                    render={({ field }) => (
                      <>
                        <Select
                          onValueChange={(day) => {
                            const newDate = field.value ? new Date(field.value) : new Date()
                            newDate.setDate(Number.parseInt(day))
                            field.onChange(newDate)
                          }}
                          value={field.value ? new Date(field.value).getDate().toString() : undefined}
                        >
                          <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="Dia" />
                          </SelectTrigger>
                          <SelectContent>
                            {days.map((day) => (
                              <SelectItem key={day} value={day.toString()}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          onValueChange={(month) => {
                            const newDate = field.value ? new Date(field.value) : new Date()
                            newDate.setMonth(Number.parseInt(month) - 1)
                            field.onChange(newDate)
                          }}
                          value={field.value ? (new Date(field.value).getMonth() + 1).toString() : undefined}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Mês" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month} value={month.toString()}>
                                {dateFns.format(new Date(2021, month - 1, 1), "MMMM", { locale: ptBR })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          onValueChange={(year) => {
                            const newDate = field.value ? new Date(field.value) : new Date()
                            newDate.setFullYear(Number.parseInt(year))
                            field.onChange(newDate)
                          }}
                          value={field.value ? new Date(field.value).getFullYear().toString() : undefined}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Ano" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                  />
                </div>
                {appointmentErrors.date && <p className="text-red-500 text-sm">{appointmentErrors.date.message}</p>}
              </div>

              {/* Campo do Horário */}
              <div className="space-y-2">
                <label htmlFor="timeSlot">Horário</label>
                <Controller
                  name="timeSlot"
                  control={controlAppointment}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableTimeSlots(date || new Date()).map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {appointmentErrors.timeSlot && (
                  <p className="text-red-500 text-sm">{appointmentErrors.timeSlot.message}</p>
                )}
              </div>

              {/* Campo de Observações */}
              <div className="space-y-2">
                <label htmlFor="notes">Observações</label>
                <Input id="notes" {...registerAppointment("notes")} placeholder="Observações (opcional)" />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseAppointmentModal}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </Modal>

          {/* Modal de Seleção de Cliente */}
          <Modal
            isOpen={isSelectClientModalOpen}
            onClose={handleCloseSelectClientModal}
            title="Selecionar Cliente"
            description="Escolha um cliente existente ou crie um novo"
          >
            <div className="space-y-4">
              <Input placeholder="Buscar cliente..." onChange={(e) => handleSearch(e.target.value)} />
              <div className="max-h-60 overflow-y-auto">
                {searchClients(searchQuery).map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectExistingClient(client)}
                  >
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                    <Button size="sm">Selecionar</Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleOpenNewClientModal}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Cliente
                </Button>
              </div>
            </div>
          </Modal>

          {/* Modal de Novo Cliente */}
          <Modal
            isOpen={isClientModalOpen}
            onClose={handleCloseClientModal}
            title="Novo Cliente"
            description="Preencha os detalhes do novo cliente"
          >
            <form onSubmit={handleSubmitClient(onSubmitClient)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name">Nome</label>
                <Input id="name" {...registerClient("name")} />
                {clientErrors.name && <p className="text-red-500 text-sm">{clientErrors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="email">Email</label>
                <Input id="email" type="email" {...registerClient("email")} />
                {clientErrors.email && <p className="text-red-500 text-sm">{clientErrors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="phone">Telefone</label>
                <Input id="phone" {...registerClient("phone")} />
                {clientErrors.phone && <p className="text-red-500 text-sm">{clientErrors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastAppointment">Último Atendimento</label>
                <div className="flex space-x-2">
                  <Controller
                    name="lastAppointment"
                    control={controlClient}
                    render={({ field }) => (
                      <>
                        <Select
                          onValueChange={(day) => {
                            const newDate = field.value ? new Date(field.value) : new Date()
                            newDate.setDate(Number.parseInt(day))
                            field.onChange(newDate)
                          }}
                          value={field.value ? new Date(field.value).getDate().toString() : undefined}
                        >
                          <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="Dia" />
                          </SelectTrigger>
                          <SelectContent>
                            {days.map((day) => (
                              <SelectItem key={day} value={day.toString()}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          onValueChange={(month) => {
                            const newDate = field.value ? new Date(field.value) : new Date()
                            newDate.setMonth(Number.parseInt(month) - 1)
                            field.onChange(newDate)
                          }}
                          value={field.value ? (new Date(field.value).getMonth() + 1).toString() : undefined}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Mês" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month} value={month.toString()}>
                                {dateFns.format(new Date(2021, month - 1, 1), "MMMM", { locale: ptBR })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          onValueChange={(year) => {
                            const newDate = field.value ? new Date(field.value) : new Date()
                            newDate.setFullYear(Number.parseInt(year))
                            field.onChange(newDate)
                          }}
                          value={field.value ? new Date(field.value).getFullYear().toString() : undefined}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Ano" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                  />
                </div>
                {clientErrors.lastAppointment && (
                  <p className="text-red-500 text-sm">{clientErrors.lastAppointment.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseClientModal}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </Modal>

          {/* Modal de Novo Serviço */}
          <Modal
            isOpen={isServiceModalOpen}
            onClose={() => setIsServiceModalOpen(false)}
            title="Novo Serviço"
            description="Adicione um novo serviço"
          >
            <form onSubmit={handleSubmitService(onSubmitService)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name">Nome do Serviço</label>
                <Input id="name" {...registerService("name")} />
                {serviceErrors.name && <p className="text-red-500 text-sm">{serviceErrors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="duration">Duração (minutos)</label>
                <Input id="duration" type="number" {...registerService("duration", { valueAsNumber: true })} />
                {serviceErrors.duration && <p className="text-red-500 text-sm">{serviceErrors.duration.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="price">Preço</label>
                <Input id="price" type="number" {...registerService("price", { valueAsNumber: true })} />
                {serviceErrors.price && <p className="text-red-500 text-sm">{serviceErrors.price.message}</p>}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsServiceModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </Modal>

          <Tabs defaultValue="calendario" className="space-y-4">
            {/* Barra de Navegação */}
            <div className="flex flex-col md:flex-row justify-between items-center">
              <TabsList>
                <TabsTrigger value="calendario">Calendário</TabsTrigger>
                <TabsTrigger value="lista">Lista</TabsTrigger>
                <TabsTrigger value="clientes">Clientes</TabsTrigger>
              </TabsList>
              {date && (
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (view === "dia") {
                        setDate(dateFns.addDays(date, -1)) // Navega para o dia anterior
                      } else if (view === "semana") {
                        setDate(dateFns.addDays(date, -7)) // Navega para a semana anterior
                      } else if (view === "mes") {
                        setDate(dateFns.addMonths(date, -1)) // Navega para o mês anterior
                      }
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDate(new Date())} // Volta para a data atual
                  >
                    Hoje
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (view === "dia") {
                        setDate(dateFns.addDays(date, 1)) // Navega para o próximo dia
                      } else if (view === "semana") {
                        setDate(dateFns.addDays(date, 7)) // Navega para a próxima semana
                      } else if (view === "mes") {
                        setDate(dateFns.addMonths(date, 1)) // Navega para o próximo mês
                      }
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Select value={view} onValueChange={(value: "dia" | "semana" | "mes") => setView(value)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Visualização" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dia">Dia</SelectItem>
                      <SelectItem value="semana">Semana</SelectItem>
                      <SelectItem value="mes">Mês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* calendario */}
            <TabsContent value="calendario" className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <div className="flex flex-col">
                    <div className="grid grid-cols-1 divide-y">
                      {timeSlots.map((slot, index) => (
                        <div key={index} className="flex py-4 px-6">
                          <div className="w-16 text-sm text-muted-foreground">{slot}</div>
                          <div className="flex-1 ml-4">
                            {filteredAppointments
                              .filter((appointment) => appointment.timeSlot === slot)
                              .map((appointment, i) => (
                                <div
                                  key={i}
                                  className={`rounded-md p-2 mb-2 border ${
                                    appointment.status === "concluido"
                                      ? "bg-green-200 border-green-400" // Verde para confirmado
                                      : appointment.status === "pendente"
                                        ? "bg-yellow-100 border-yellow-200" // Amarelo para pendente
                                        : "bg-red-100 border-red-200" // Vermelho para cancelado
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="font-medium">{appointment.name}</div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <div>
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setEditingAppointment(appointment)}>
                                          Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>Reagendar</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-red-600"
                                          onClick={() => handleCancelAppointment(appointment.id)}
                                        >
                                          Cancelar
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <div className="text-sm text-muted-foreground">{appointment.serviceName}</div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* LISTA */}
            <TabsContent value="lista" className="space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Buscar agendamentos..." className="pl-8 w-full md:w-[300px]" />
                </div>
                <Select defaultValue="todos">
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="hoje">Hoje</SelectItem>
                    <SelectItem value="amanha">Amanhã</SelectItem>
                    <SelectItem value="semana">Esta semana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Card>
                <CardContent className="p-0 text-sm">
                  <div className="overflow-x-auto">
                    {" "}
                    {/* Habilita a rolagem horizontal */}
                    <Table className="min-w-[50px]">
                      {" "}
                      {/* Define uma largura mínima para a tabela */}
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Cliente</TableHead> {/* Evita quebras de linha */}
                          <TableHead className="whitespace-nowrap">Serviço</TableHead>
                          <TableHead className="whitespace-nowrap">Data</TableHead>
                          {/* <TableHead className="whitespace-nowrap">
                          Horário
                        </TableHead> */}
                          <TableHead className="whitespace-nowrap">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAppointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell className="font-medium whitespace-nowrap">{appointment.name}</TableCell>
                            <TableCell className="">{appointment.serviceName}</TableCell>
                            {/* <TableCell className="whitespace-nowrap">
                            {format(new Date(appointment.date), "dd/MM")}
                          </TableCell> */}
                            <TableCell className="whitespace-nowrap">{appointment.timeSlot}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  appointment.status === "concluido"
                                    ? "bg-green-100 text-green-800"
                                    : appointment.status === "pendente"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {appointment.status === "concluido"
                                  ? "Concluido"
                                  : appointment.status === "pendente"
                                    ? "Pendente"
                                    : "Cancelado"}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CLIENTES */}
            <TabsContent value="clientes" className="space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Buscar clientes..." className="pl-8 w-full md:w-[300px]" />
                </div>
                <Button size="sm" onClick={() => setIsClientModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Cliente
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {clients.map((client, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle>{client.name}</CardTitle>
                      <CardDescription>{client.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center space-x-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">Telefone</p>
                          <p className="text-sm text-muted-foreground">{client.phone}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardContent className="pb-2">
                      <div className="flex items-center space-x-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">Último Atendimento</p>
                          <p className="text-sm text-muted-foreground">
                            {client.lastAppointment ? dateFns.format(client.lastAppointment, "dd/MM/yyyy") : "Nenhum"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    {/* <CardContent className="flex justify-end pt-0">
                    <Button variant="outline" size="sm">
                      Ver Histórico
                    </Button>
                  </CardContent> */}
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

