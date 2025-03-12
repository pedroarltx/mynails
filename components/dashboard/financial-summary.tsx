"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, PlusCircle, MinusCircle } from "lucide-react"
import { collection, onSnapshot, query, orderBy, limit, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { string } from "zod"

interface Transaction {
  id: string
  description: string
  date: Date
  amount: number
  category: string
  type: "receitas" | "despesa"
}

const categories = ["Alimentação", "Transporte", "Lazer", "Material Estoque", "Contas","Receitas" ]

export function FinancialSummary() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [ThirtyPercent, setThirtyPercent] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<"receitas" | "despesa">("receitas")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")

  useEffect(() => {
    const transactionsRef = collection(db, "transactions")
    const q = query(transactionsRef, orderBy("date", "desc"))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionsData: Transaction[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Transaction, "id">),
      }))
      setTransactions(transactionsData)

      const revenue = transactionsData.reduce((sum, t) => (t.type === "receitas" ? sum + t.amount : sum), 0)
      const expenses = transactionsData.reduce((sum, t) => (t.type === "despesa" ? sum + t.amount : sum), 0)
      const total = revenue 
      const thirtyPercent = total * 0.3

      setThirtyPercent(thirtyPercent)
      setTotalRevenue(revenue)
      setTotalExpenses(expenses)
    })

    return () => unsubscribe()
  }, [])

  const handleAddTransaction = async () => {
    if (!description || !amount || !category) return;

    await addDoc(collection(db, "transactions"), {
      description,
      amount: parseFloat(amount),
      category,
      type: transactionType,
      date: Date.now(),
    });

    setIsModalOpen(false);
    setDescription("");
    setAmount("");
    setCategory("");
  };

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
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button onClick={() => { setTransactionType("receitas"); setIsModalOpen(true); }} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
              <PlusCircle className="h-5 w-5" /> Adicionar Receita
            </Button>
            <Button onClick={() => { setTransactionType("despesa"); setIsModalOpen(true); }} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
              <MinusCircle className="h-5 w-5" /> Adicionar Despesa
            </Button>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar {transactionType === "receitas" ? "Receita" : "Despesa"}</DialogTitle>
              </DialogHeader>
              <Label>Descrição</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              <Label>Valor</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Label>Categoria</Label>
              <Select onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button onClick={handleAddTransaction}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
