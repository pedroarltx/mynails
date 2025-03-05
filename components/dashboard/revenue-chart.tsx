"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: Date; // Aqui a data é do tipo Date
}

export function RevenueChart() {
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);

  useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      const today = new Date();
      const revenueData: MonthlyRevenue[] = [];

      // Looping através dos últimos 6 meses
      for (let i = 0; i < 6; i++) {
        const currentMonth = subMonths(today, i);
        const startDate = startOfMonth(currentMonth);
        const endDate = endOfMonth(currentMonth);

        const transactionsRef = collection(db, "transactions");
        const q = query(
          transactionsRef,
          where("date", ">=", Timestamp.fromDate(startDate)),
          where("date", "<=", Timestamp.fromDate(endDate)),
          where("type", "==", "receitas")
        );

        const querySnapshot = await getDocs(q);
        const monthRevenue = querySnapshot.docs.reduce(
          (sum, doc) => {
            const data = doc.data() as Transaction;
            const amount = data.amount || 0; // Garantindo que amount seja numérico
            return sum + amount;
          }, 
          0
        );

        revenueData.unshift({
          month: format(currentMonth, "MMM", { locale: ptBR }),
          revenue: monthRevenue,
        });
      }

      console.log("Dados de receita mensal:", revenueData); // Verifique os dados aqui

      setMonthlyRevenue(revenueData);
    };

    fetchMonthlyRevenue();
  }, []);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Receita Mensal</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Bar dataKey="revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
