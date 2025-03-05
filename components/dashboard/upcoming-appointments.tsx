"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Interface para Agendamento
interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceName: string;
  servicePrice: number;
  date: Date; // Sempre um Date
  timeSlot: string;
  notes?: string;
  status: string;
  createdAt: Date; // Sempre um Date
}

// Função para converter Timestamp ou string ISO para Date
const convertToDate = (date: Timestamp | string | Date): Date => {
  if (date instanceof Timestamp) {
    return date.toDate(); // Converte Timestamp para Date
  } else if (typeof date === "string") {
    return new Date(date); // Converte string ISO para Date
  } else if (date instanceof Date) {
    return date; // Já é um Date
  }
  throw new Error("Formato de data não suportado");
};

export function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const appointmentsRef = collection(db, "agendamentos");

    // Filtra agendamentos com status "pendente" ou "cancelado"
    const q = query(
      appointmentsRef,
      where("status", "in", ["pendente"]) // Filtra por status
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appointmentsData: Appointment[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          serviceName: data.serviceName,
          servicePrice: data.servicePrice,
          date: convertToDate(data.date), // Converte para Date
          timeSlot: data.timeSlot,
          notes: data.notes,
          status: data.status,
          createdAt: convertToDate(data.createdAt), // Converte para Date
        };
      });
      setAppointments(appointmentsData);
    });

    return () => unsubscribe();
  }, []);

  const formatAppointmentDate = (date: Date): string => {
    return format(date, "dd/MM/yyyy", { locale: ptBR }); // Formata a data no padrão dd/MM/yyyy
  };

  const handleCompleteAppointment = async (appointment: Appointment): Promise<void> => {
    try {
      // Marcar o agendamento como concluído
      const appointmentRef = doc(db, "agendamentos", appointment.id);
      await updateDoc(appointmentRef, {
        status: "concluido", // Atualiza o status para "concluído"
      });


      // Enviar informações para a tabela "transactions"
      const transactionsRef = collection(db, "transactions");
      await addDoc(transactionsRef, {
        amount: appointment.servicePrice, // Valor do serviço
        category: "Trabalho", // Categoria fixa
        date: Date.now(), 
        description: appointment.serviceName, // Descrição do serviço
        type: "receitas", // Tipo de transação
      });

      // Atualizar o estado local
      setAppointments((prevAppointments) =>
        prevAppointments.filter((a) => a.id !== appointment.id) // Remove o agendamento concluído da lista
      );
    } catch (error) {
      console.error("Erro ao concluir agendamento:", error);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Próximos Agendamentos</CardTitle>
        <CardDescription>Visualize e gerencie os próximos atendimentos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum agendamento pendente ou cancelado.</p>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-col md:flex-row items-center justify-between rounded-lg border p-4 gap-4"
              >
                <div className="space-y-1 flex-1">
                  <p className="font-medium">{appointment.name}</p>
                  <p className="text-sm text-muted-foreground">{appointment.serviceName}</p>
                  <p className="text-sm text-muted-foreground">Status: {appointment.status}</p>
                  {appointment.notes && (
                    <p className="text-sm text-muted-foreground">Observações: {appointment.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{formatAppointmentDate(appointment.date)}</p>
                    <p className="text-sm text-muted-foreground">{appointment.timeSlot}</p>
                  </div>
                  {appointment.status === "pendente" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleCompleteAppointment(appointment)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}