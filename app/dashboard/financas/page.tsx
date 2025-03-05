"use client";

import { useState, useEffect, useMemo, lazy, Suspense, SyntheticEvent } from "react";
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Download, Filter, Plus, Search } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore } from "@/lib/useFirestore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { debounce } from "lodash";
import { TransactionDialog } from "@/components/dashboard/transaction-dialog";

interface Transaction {
  id: string;
  description: string;
  category: string;
  date: string;
  amount: number;
  type: "receitas" | "despesas";
}

export default function FinancasPage() {
  const [filter, setFilter] = useState<"todos" | "receitas" | "despesas">("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const { documents: transactions, addDocument, loading, error } = useFirestore<Transaction>("transactions");

  // Filtra as transações com base no filtro, termo de busca e intervalo de datas
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => filter === "todos" || t.type === filter)
      .filter((t) => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
      });
  }, [transactions, filter, searchTerm, dateRange]);

  // Calcula o total de receitas
  const totalRevenue = useMemo(
    () => filteredTransactions.filter((t) => t.type === "receitas").reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  // Calcula o total de despesas
  const totalExpenses = useMemo(
    () => filteredTransactions.filter((t) => t.type === "despesas").reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  // Calcula o lucro líquido
  const netProfit = useMemo(() => totalRevenue - totalExpenses, [totalRevenue, totalExpenses]);

  // Calcula as porcentagens das categorias de receitas e despesas
  const revenueCategories = useMemo(
    () => calculateCategoryPercentages(filteredTransactions, "receitas"),
    [filteredTransactions]
  );

  const expenseCategories = useMemo(
    () => calculateCategoryPercentages(filteredTransactions, "despesas"),
    [filteredTransactions]
  );

  // Adiciona uma nova transação
  const handleAddTransaction = async (newTransaction: Omit<Transaction, "id">) => {
    await addDocument(newTransaction);
    setIsTransactionDialogOpen(false);
  };

  // Debouncing para a busca
  const handleSearch = debounce((term: string) => {
    setSearchTerm(term);
  }, 300);

  

  const handleFilterChange = (value: string) => {
    setFilter(value as "receitas" | "despesas" | "todos");
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar dados: {error}</div>;

  return (
    <DashboardLayout title="Finanças">
      <div className="p-4 space-y-4 flex-1">
        {/* Cards de Resumo */}
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

        {/* Filtros e Botões */}
        <div className="flex flex-col md:flex-row items-center gap-2">
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onSelect={(event: SyntheticEvent<HTMLDivElement, Event> | { from: Date | undefined; to: Date | undefined }) => {
              if ('from' in event && 'to' in event) {
                setDateRange({ from: event.from, to: event.to });
              }
            }}
          />
          <Button size="sm" onClick={() => setIsTransactionDialogOpen(true)} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
        </div>

        {/* Abas de Transações e Categorias */}
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
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <Select value={filter} onValueChange={handleFilterChange}>
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

      {/* Modal de Nova Transação */}
      <Suspense fallback={<div>Carregando...</div>}>
        <TransactionDialog
          isOpen={isTransactionDialogOpen}
          onClose={() => setIsTransactionDialogOpen(false)}
          onAddTransaction={handleAddTransaction}
        />
      </Suspense>
    </DashboardLayout>
  );
}

// Função para calcular as porcentagens das categorias
function calculateCategoryPercentages(
  transactions: Transaction[],
  type: "receitas" | "despesas"
): { name: string; percentage: number }[] {
  const filteredTransactions = transactions.filter((t) => t.type === type);
  const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const categories = filteredTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categories).map(([name, amount]) => ({
    name,
    percentage: total === 0 ? 0 : (amount / total) * 100,
  }));
}