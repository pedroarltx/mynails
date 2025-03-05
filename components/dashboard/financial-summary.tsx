"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from "lucide-react"
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Transaction {
  id: string
  description: string
  date: Date
  amount: number
  type: "receitas" | "despesa"
}

export function FinancialSummary() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)

  useEffect(() => {
    const transactionsRef = collection(db, "transactions")
    const q = query(transactionsRef, orderBy("date", "desc"), limit(5))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionsData: Transaction[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Transaction, "id">),
      }))
      setTransactions(transactionsData)

      const revenue = transactionsData.reduce((sum, t) => (t.type === "receitas" ? sum + t.amount : sum), 0)
      const expenses = transactionsData.reduce((sum, t) => (t.type === "despesa" ? sum + t.amount : sum), 0)

      setTotalRevenue(revenue)
      setTotalExpenses(expenses)
    })

    return () => unsubscribe()
  }, [])

  const netProfit = totalRevenue - totalExpenses

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo Financeiro</CardTitle>
        <CardDescription>Acompanhe suas receitas e despesas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-green-500/20 p-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Receitas</p>
                  <p className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-red-500/20 p-2">
                  <DollarSign className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Despesas</p>
                  <p className="text-2xl font-bold">R$ {totalExpenses.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">Lucro Líquido</p>
              <p className={`text-xl font-bold ${netProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                R$ {netProfit.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Últimas Transações</h3>
            <div className="rounded-lg border">
              <div className="divide-y">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <p className="font-medium">{transaction.description}</p>
                    </div>
                    <p className={`font-medium ${transaction.type === "receitas" ? "text-green-500" : "text-red-500"}`}>
                      {transaction.type === "receitas" ? "+" : "-"}R$ {transaction.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

