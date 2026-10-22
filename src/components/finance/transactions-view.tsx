"use client"

import { useMemo, useState } from "react"
import { DownloadIcon, PlusIcon, SearchIcon } from "lucide-react"
import { toast } from "sonner"
import { PeriodPicker } from "@/components/finance/period-picker"
import { TransactionFormDialog } from "@/components/finance/transaction-form-dialog"
import { TransactionList } from "@/components/finance/transaction-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTransactions } from "@/hooks/use-transactions"
import {
  CATEGORIES,
  downloadCSV,
  formatCurrency,
  normalize,
  periodRange,
  summarize,
  type Period,
  type Transaction,
} from "@/lib/finance"
import { cn } from "@/lib/utils"

const ALL = "todas"

const categoryItems = [
  { value: ALL, label: "Todas as categorias" },
  ...CATEGORIES.map((c) => ({ value: c, label: c })),
]
const typeItems = [
  { value: ALL, label: "Receitas e despesas" },
  { value: "receita", label: "Só receitas" },
  { value: "despesa", label: "Só despesas" },
]

export function TransactionsView() {
  const [period, setPeriod] = useState<Period>(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() + 1 }
  })
  const [category, setCategory] = useState(ALL)
  const [type, setType] = useState(ALL)
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  const { transactions, loading, error, create, update, remove } = useTransactions(periodRange(period))

  const filtered = useMemo(() => {
    const query = normalize(search.trim())
    return transactions.filter(
      (t) =>
        (category === ALL || t.category === category) &&
        (type === ALL || t.type === type) &&
        (!query || normalize(t.description).includes(query))
    )
  }, [transactions, category, type, search])

  const summary = summarize(filtered)

  function exportCSV() {
    if (filtered.length === 0) {
      toast.info("Não há transações para exportar com os filtros atuais.")
      return
    }
    const suffix = period.month === null ? `${period.year}` : `${period.year}-${String(period.month).padStart(2, "0")}`
    downloadCSV(filtered, `transacoes-${suffix}.csv`)
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transações</h1>
          <p className="text-sm text-muted-foreground">
            Registre, edite e acompanhe suas receitas e despesas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <DownloadIcon /> Exportar CSV
          </Button>
          <Button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <PlusIcon /> Nova transação
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por descrição..."
                className="pl-8"
                aria-label="Buscar por descrição"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <PeriodPicker value={period} onChange={setPeriod} />
              <Select items={categoryItems} value={category} onValueChange={(v) => setCategory(v ?? ALL)}>
                <SelectTrigger className="w-48" aria-label="Categoria">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select items={typeItems} value={type} onValueChange={(v) => setType(v ?? ALL)}>
                <SelectTrigger className="w-44" aria-label="Tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 border-t pt-3 text-sm">
            <span className="text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "transação" : "transações"}
            </span>
            <span>
              Receitas <strong className="font-medium text-emerald-700 tabular-nums">{formatCurrency(summary.income)}</strong>
            </span>
            <span>
              Despesas <strong className="font-medium text-red-600 tabular-nums">{formatCurrency(summary.expense)}</strong>
            </span>
            <span>
              Saldo{" "}
              <strong
                className={cn(
                  "font-medium tabular-nums",
                  summary.balance < 0 ? "text-red-600" : "text-emerald-700"
                )}
              >
                {formatCurrency(summary.balance)}
              </strong>
            </span>
          </div>

          {error && <p className="text-sm text-destructive">Erro ao carregar dados: {error}</p>}

          <TransactionList
            transactions={filtered}
            loading={loading}
            emptyMessage={
              transactions.length === 0
                ? "Nenhuma transação neste período."
                : "Nenhuma transação corresponde aos filtros."
            }
            onEdit={(t) => {
              setEditing(t)
              setFormOpen(true)
            }}
            onDelete={remove}
          />
        </CardContent>
      </Card>

      <TransactionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        transaction={editing}
        onSubmit={(input) => (editing ? update(editing.id, input) : create(input))}
      />
    </div>
  )
}
