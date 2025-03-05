"use client"

import { useState, useEffect } from "react"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Download, Filter, Plus, Search } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFirestore } from "@/lib/useFirestore"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { TransactionDialog } from "@/components/dashboard/transaction-dialog"
import { DateRangePicker } from "@/components/ui/date-range-picker"

interface Transaction {
  id: string
  description: string
  category: string
  date: string
  amount: number
  type: "receitas" | "despesas"
}

export default function FinancasPage() {
  const [filter, setFilter] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState({ from: new Date(new Date().getFullYear(), 0, 1), to: new Date() })
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const { documents: transactions, addDocument, loading, error } = useFirestore<Transaction>("transactions")

  useEffect(() => {
    console.log("Transactions loaded:", transactions)
  }, [transactions])

  const filteredTransactions = transactions
    .filter((t) => filter === "todos" || t.type === filter)
    .filter((t) => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate >= dateRange.from && transactionDate <= dateRange.to
    })

  console.log("Filtered transactions:", filteredTransactions)

  const totalRevenue = filteredTransactions.filter((t) => t.type === "receitas").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions.filter((t) => t.type === "despesas").reduce((sum, t) => sum + t.amount, 0)

  const netProfit = totalRevenue - totalExpenses

  const revenueCategories = calculateCategoryPercentages(filteredTransactions, "receitas")
  const expenseCategories = calculateCategoryPercentages(filteredTransactions, "despesas")

  const handleAddTransaction = async (newTransaction: Omit<Transaction, "id">) => {
    await addDocument(newTransaction)
    setIsTransactionDialogOpen(false)
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  if (error) {
    return <div>Erro ao carregar dados: {error}</div>
  }

  return (
    <DashboardLayout title="Finanças">
      <div className="p-4 space-y-4 flex-1">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">R$ {totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total de receitas no período selecionado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">R$ {totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total de despesas no período selecionado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {netProfit.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Lucro líquido no período selecionado</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-2">
          <DateRangePicker
            from={dateRange?.from || new Date()}
            to={dateRange?.to || new Date()}
            onSelect={(range) => setDateRange({ from: range.from, to: range.to })}
          />
          <Button variant="outline" size="sm" className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm" onClick={() => setIsTransactionDialogOpen(true)} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
        </div>

        <Tabs defaultValue="transacoes" className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="transacoes" className="flex-1">Transações</TabsTrigger>
            <TabsTrigger value="categorias" className="flex-1">Categorias</TabsTrigger>
          </TabsList>
          <TabsContent value="transacoes" className="space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar transações..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="receitas">Receitas</SelectItem>
                  <SelectItem value="despesas">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.description}</TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>{format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                          <TableCell
                            className={`text-right font-medium ${
                              transaction.type === "receitas" ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {transaction.type === "receitas" ? "+" : "-"}R$ {transaction.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="categorias" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Categorias de Receitas</CardTitle>
                  <CardDescription>Distribuição das receitas por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueCategories.map((category, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-full flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{category.name}</span>
                            <span className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}%</span>
                          </div>
                          <div className="mt-1 h-2 w-full rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-green-500"
                              style={{ width: `${category.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Categorias de Despesas</CardTitle>
                  <CardDescription>Distribuição das despesas por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {expenseCategories.map((category, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-full flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{category.name}</span>
                            <span className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}%</span>
                          </div>
                          <div className="mt-1 h-2 w-full rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-red-500"
                              style={{ width: `${category.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <TransactionDialog
        isOpen={isTransactionDialogOpen}
        onClose={() => setIsTransactionDialogOpen(false)}
        onAddTransaction={handleAddTransaction}
      />
    </DashboardLayout>
  )
}

function calculateCategoryPercentages(transactions: Transaction[], type: "receitas" | "despesas") {
  const filteredTransactions = transactions.filter((t) => t.type === type)
  const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
  const categories = filteredTransactions.reduce(
    (acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    },
    {} as Record<string, number>,
  )

  return Object.entries(categories).map(([name, amount]) => ({
    name,
    percentage: (amount / total) * 100,
  }))
}

function generateReports(transactions: Transaction[]) {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  return [
    {
      title: `Relatório Mensal - ${format(currentDate, "MMMM yyyy", { locale: ptBR })}`,
      description: "Resumo completo de receitas e despesas do mês",
      data: transactions.filter((t) => {
        const transactionDate = new Date(t.date)
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
      }),
    },
    {
      title: `Relatório Trimestral - Q${Math.floor(currentMonth / 3) + 1} ${currentYear}`,
      description: "Análise financeira do trimestre atual",
      data: transactions.filter((t) => {
        const transactionDate = new Date(t.date)
        return (
          transactionDate.getFullYear() === currentYear &&
          Math.floor(transactionDate.getMonth() / 3) === Math.floor(currentMonth / 3)
        )
      }),
    },
    {
      title: "Relatório de Serviços",
      description: "Detalhamento dos serviços mais lucrativos",
      data: transactions.filter((t) => t.type === "receitas" && t.category === "Serviços"),
    },
    {
      title: "Relatório de Despesas",
      description: "Análise detalhada de todas as despesas",
      data: transactions.filter((t) => t.type === "despesas"),
    },
  ]
}

function downloadReport(report: { title: string; description: string; data: Transaction[] }) {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    "Descrição,Categoria,Data,Valor,Tipo\n" +
    report.data.map((t) => `${t.description},${t.category},${t.date},${t.amount},${t.type}`).join("\n")

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `${report.title}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}