"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CATEGORIES,
  todayISO,
  type Category,
  type Transaction,
  type TransactionInput,
  type TransactionType,
} from "@/lib/finance"
import { cn } from "@/lib/utils"

const INCOME_CATEGORIES: Category[] = ["Salário", "Freelance", "Outros"]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Transação em edição; ausente para criar uma nova. */
  transaction?: Transaction | null
  onSubmit: (input: TransactionInput) => Promise<void>
}

export function TransactionFormDialog({ open, onOpenChange, transaction, onSubmit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? "Editar transação" : "Nova transação"}</DialogTitle>
          <DialogDescription>
            {transaction
              ? "Altere os dados e salve."
              : "Registre uma receita ou despesa."}
          </DialogDescription>
        </DialogHeader>
        {/* `key` remonta o formulário a cada abertura, zerando o estado. */}
        {open && (
          <TransactionForm
            key={transaction?.id ?? "new"}
            transaction={transaction}
            onCancel={() => onOpenChange(false)}
            onSubmit={async (input) => {
              await onSubmit(input)
              onOpenChange(false)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function TransactionForm({
  transaction,
  onSubmit,
  onCancel,
}: {
  transaction?: Transaction | null
  onSubmit: (input: TransactionInput) => Promise<void>
  onCancel: () => void
}) {
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "despesa")
  const [description, setDescription] = useState(transaction?.description ?? "")
  const [amount, setAmount] = useState(
    transaction ? transaction.amount.toFixed(2).replace(".", ",") : ""
  )
  const [date, setDate] = useState(transaction?.date ?? todayISO())
  const [category, setCategory] = useState<Category | null>(transaction?.category ?? null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Sugere primeiro as categorias mais comuns para o tipo escolhido.
  const orderedCategories =
    type === "receita"
      ? [...INCOME_CATEGORIES, ...CATEGORIES.filter((c) => !INCOME_CATEGORIES.includes(c))]
      : [...CATEGORIES]

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Com vírgula, pontos são separadores de milhar ("1.234,56"); sem vírgula, o ponto é decimal.
    const value = Number(
      amount.includes(",") ? amount.replace(/\./g, "").replace(",", ".") : amount
    )
    if (!description.trim()) return setError("Informe uma descrição.")
    if (!Number.isFinite(value) || value <= 0) return setError("Informe um valor maior que zero.")
    if (!date) return setError("Informe a data.")
    if (!category) return setError("Escolha uma categoria.")

    setError(null)
    setSaving(true)
    try {
      await onSubmit({
        type,
        description: description.trim(),
        amount: Math.round(value * 100) / 100,
        date,
        category,
      })
      toast.success(transaction ? "Transação atualizada." : "Transação criada.")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1" role="radiogroup" aria-label="Tipo">
        {(["despesa", "receita"] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={type === option}
            onClick={() => setType(option)}
            className={cn(
              "rounded-md py-1.5 text-sm font-medium transition-colors",
              type === option
                ? option === "receita"
                  ? "bg-background text-emerald-600 shadow-sm"
                  : "bg-background text-red-600 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option === "receita" ? "Receita" : "Despesa"}
          </button>
        ))}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex.: Supermercado"
          maxLength={200}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
            placeholder="0,00"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="date">Data</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label>Categoria</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as Category | null)}>
          <SelectTrigger className="w-full" aria-label="Categoria">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {orderedCategories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  )
}
