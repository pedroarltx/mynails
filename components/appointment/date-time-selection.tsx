"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCallback, useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface DateTimeSelectionProps {
  date: Date | undefined;
  timeSlot: string;
  onSelectDate: (date: Date | undefined) => void;
  onSelectTimeSlot: (slot: string) => void;
}

// Horários disponíveis padrão (pode ser ajustado conforme necessário)
const ALL_TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

// Duração dos serviços em minutos (exemplo)
const SERVICE_DURATIONS: Record<string, number> = {
  "Alongamento em Fibra de Vidro (Com esmaltação em gel)": 180, // 2 horas
  "Pé e Mão Tradicional": 120, // 1 hora
  "Manicure Tradicional": 60, // 1 hora
  "Esmaltação em gel pé": 90, // 1,5 horas
  "Pedicure Tradicional": 60, // 1 hora
  "Esmaltação em gel mão": 90, // 1,5 horas
  "Alongamento em fibra de vidro simples": 180, // 3 horas
  "Banho em Gel": 60, // 1 hora
};

export function DateTimeSelection({
  date,
  timeSlot,
  onSelectDate,
  onSelectTimeSlot,
}: DateTimeSelectionProps) {
  const [availableTimeSlots, setAvailableTimeSlots] =
    useState<string[]>(ALL_TIME_SLOTS);
  const [loading, setLoading] = useState(false);

  // Função para calcular os horários ocupados com base na duração do serviço
  const getBookedSlots = useCallback((startTime: string, duration: number) => {
    const startIndex = ALL_TIME_SLOTS.indexOf(startTime);
    if (startIndex === -1) return [];

    const slotsToBook = Math.ceil(duration / 60); // Converte minutos em horas
    return ALL_TIME_SLOTS.slice(startIndex, startIndex + slotsToBook);
  }, []);

  // Função para escutar agendamentos em tempo real
  const listenToAgendamentos = useCallback(
    (selectedDate: Date) => {
      setLoading(true);

      try {
        // Define o início e o fim do dia selecionado
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0); // Início do dia (00:00:00.000)

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999); // Fim do dia (23:59:59.999)

        console.log(
          "Consultando agendamentos para o dia:",
          selectedDate.toISOString()
        );

        // Consulta os agendamentos no Firestore
        const agendamentosRef = collection(db, "agendamentos");
        const q = query(
          agendamentosRef,
          where("date", ">=", startOfDay),
          where("date", "<=", endOfDay)
        );

        // Escuta em tempo real
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          console.log(
            "Número de agendamentos encontrados:",
            querySnapshot.size
          );

          // Filtra apenas os agendamentos do dia selecionado
          const bookedTimeSlots = querySnapshot.docs
            .map((doc) => {
              const data = doc.data();
              console.log("Agendamento encontrado:", data);

              // Converte o timestamp do Firebase para um objeto Date
              const agendamentoDate = (data.date as Timestamp).toDate();

              // Verifica se o agendamento pertence ao dia selecionado
              if (
                agendamentoDate >= startOfDay &&
                agendamentoDate <= endOfDay
              ) {
                // Obtém a duração do serviço
                const duration = SERVICE_DURATIONS[data.serviceName] || 60; // Padrão de 1 hora
                // Calcula os horários ocupados com base na duração
                return getBookedSlots(data.timeSlot, duration);
              }
              return [];
            })
            .flat(); // Converte arrays aninhados em um único array

          console.log("Horários já agendados:", bookedTimeSlots);

          // Filtra os horários disponíveis
          const availableSlots = ALL_TIME_SLOTS.filter(
            (slot) => !bookedTimeSlots.includes(slot)
          );

          console.log("Horários disponíveis:", availableSlots);

          setAvailableTimeSlots(availableSlots);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
        alert("Erro ao buscar horários disponíveis. Tente novamente.");
        setLoading(false);
      }
    },
    [getBookedSlots]
  );

  // Atualiza os horários disponíveis quando a data é alterada
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (date) {
      unsubscribe = listenToAgendamentos(date);
    } else {
      setAvailableTimeSlots(ALL_TIME_SLOTS); // Reseta para todos os horários se nenhuma data estiver selecionada
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [date, listenToAgendamentos]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? (
                format(date, "PPP", { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onSelectDate}
              initialFocus
              locale={ptBR}
              disabled={(date) => {
                // Desabilita datas passadas e domingos
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today || date.getDay() === 0;
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {date && (
        <div className="space-y-2">
          <h3 className="font-medium">Horários Disponíveis</h3>
          {loading ? (
            <p>Carregando horários...</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableTimeSlots.map((slot) => (
                <Button
                  key={slot}
                  variant={timeSlot === slot ? "default" : "outline"}
                  className="text-center"
                  onClick={() => onSelectTimeSlot(slot)}
                >
                  {slot}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
