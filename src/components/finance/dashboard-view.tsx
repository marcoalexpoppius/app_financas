"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { PlusIcon } from "lucide-react"
import { CategoryDonut, MonthlyBars } from "@/components/finance/charts"
import { PeriodPicker } from "@/components/finance/period-picker"
import { SummaryCards } from "@/components/finance/summary-cards"
import { TransactionFormDialog } from "@/components/finance/transaction-form-dialog"
import { TransactionList } from "@/components/finance/transaction-list"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTransactions } from "@/hooks/use-transactions"
import {
  periodLabel,
  periodRange,
  summarize,
  totalsByCategory,
  type Period,
} from "@/lib/finance"

export function DashboardView() {
  const [period, setPeriod] = useState<Period>(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() + 1 }
  })
  const [formOpen, setFormOpen] = useState(false)

  // Busca o ano inteiro: alimenta o gráfico mensal e o recorte do mês.
  const yearRange = periodRange({ year: period.year, month: null })
  const { transactions: yearTransactions, loading, error, create } = useTransactions(yearRange)

  const transactions = useMemo(() => {
    const { from, to } = periodRange(period)
    return yearTransactions.filter((t) => t.date >= from && t.date <= to)
  }, [yearTransactions, period])

  const summary = summarize(transactions)
  const byCategory = totalsByCategory(transactions, "despesa")

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{periodLabel(period)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PeriodPicker value={period} onChange={setPeriod} />
          <Button onClick={() => setFormOpen(true)}>
            <PlusIcon /> Nova transação
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          Erro ao carregar dados: {error}
        </p>
      )}

      <SummaryCards {...summary} loading={loading} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por categoria</CardTitle>
            <CardDescription>{periodLabel(period)}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-56" /> : <CategoryDonut data={byCategory} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Receitas x despesas</CardTitle>
            <CardDescription>Mês a mês em {period.year}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <MonthlyBars transactions={yearTransactions} highlightMonth={period.month} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas transações</CardTitle>
          <CardDescription>{periodLabel(period)}</CardDescription>
          <CardAction>
            <Link href="/transacoes" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Ver todas
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <TransactionList
            transactions={transactions.slice(0, 6)}
            loading={loading}
            emptyMessage="Nenhuma transação neste período. Que tal registrar a primeira?"
          />
        </CardContent>
      </Card>

      <TransactionFormDialog open={formOpen} onOpenChange={setFormOpen} onSubmit={create} />
    </div>
  )
}
