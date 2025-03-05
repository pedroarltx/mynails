"use client";

import { useEffect, useState } from "react";
import { Calendar, CreditCard, DollarSign, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, query, where, getDocs, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Appointment {
  id: string;
  clientId: string;
  date: Date;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: Date;
}

export function OverviewCards() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [newClients, setNewClients] = useState(0);
  const [appointmentsGrowth, setAppointmentsGrowth] = useState(0);
  const [clientsGrowth, setClientsGrowth] = useState(0);

  useEffect(() => {
    const calculateMetrics = async () => {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const appointmentsRef = collection(db, "agendamentos");
      const transactionsRef = collection(db, "transactions");

      try {
        // Current month metrics
        const currentMonthAppointments = await getDocs(
          query(appointmentsRef, where("date", ">=", firstDayOfMonth))
        );
        const currentClients = new Set(
          currentMonthAppointments.docs.map((doc) => doc.data().clientId)
        ).size;

        // Last month metrics
        const lastMonthAppointments = await getDocs(
          query(
            appointmentsRef,
            where("date", ">=", firstDayOfLastMonth),
            where("date", "<", firstDayOfMonth)
          )
        );
        const lastMonthTransactions = await getDocs(
          query(
            transactionsRef,
            where("date", ">=", firstDayOfLastMonth),
            where("date", "<", firstDayOfMonth)
          )
        );

        const lastRevenue = lastMonthTransactions.docs
          .filter((doc) => doc.data().type === "receitas")
          .reduce((sum, doc) => sum + Number(doc.data().amount), 0);

        const lastAppointments = lastMonthAppointments.size;
        const lastClients = new Set(
          lastMonthAppointments.docs.map((doc) => doc.data().clientId)
        ).size;

        // Calculate growth percentages
        const calculateGrowth = (current: number, last: number) => {
          if (last === 0) return 0; // Evita divisão por zero
          return ((current - last) / last) * 100;
        };

        setTotalAppointments(currentMonthAppointments.size);
        setNewClients(currentClients);
        setAppointmentsGrowth(calculateGrowth(currentMonthAppointments.size, lastAppointments));
        setClientsGrowth(calculateGrowth(currentClients, lastClients));
      } catch (error) {
        console.error("Erro ao calcular métricas:", error);
      }
    };

    calculateMetrics();
  }, []);

  useEffect(() => {
    const transactionsRef = collection(db, "transactions");
    const q = query(transactionsRef, orderBy("date", "desc"), limit(5));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionsData: Transaction[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Transaction, "id">),
      }));

      const revenue = transactionsData.reduce(
        (sum, t) => (t.type === "receitas" ? sum + t.amount : sum),
        0
      );

      setTotalRevenue(revenue);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {appointmentsGrowth > 0 ? "+" : ""}
            {!isNaN(appointmentsGrowth) ? appointmentsGrowth.toFixed(1) : "0.0"}% em relação ao mês passado
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{totalAppointments}</div>
          <p className="text-xs text-muted-foreground">
            {appointmentsGrowth > 0 ? "+" : ""}
            {!isNaN(appointmentsGrowth) ? appointmentsGrowth.toFixed(1) : "0.0"}% em relação ao mês passado
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{newClients}</div>
          <p className="text-xs text-muted-foreground">
            {clientsGrowth > 0 ? "+" : ""}
            {!isNaN(clientsGrowth) ? clientsGrowth.toFixed(1) : "0.0"}% em relação ao mês passado
          </p>
        </CardContent>
      </Card>
      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        {/* <CardContent>
          <div className="text-2xl font-bold">R$ {0.0.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {appointmentsGrowth > 0 ? "+" : ""}
            {!isNaN(appointmentsGrowth) ? appointmentsGrowth.toFixed(1) : "0.0"}% em relação ao mês passado
          </p>
        </CardContent> 
      </Card> */}
    </div>
  );
}
