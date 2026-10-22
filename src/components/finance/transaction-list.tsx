"use client"

import { useState } from "react"
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CATEGORY_COLORS, formatCurrency, formatDate, type Transaction } from "@/lib/finance"
import { cn } from "@/lib/utils"

type Props = {
  transactions: Transaction[]
  loading?: boolean
  emptyMessage?: string
  onEdit?: (transaction: Transaction) => void
  onDelete?: (id: string) => Promise<void>
}

function Amount({ t, className }: { t: Transaction; className?: string }) {
  return (
    <span
      className={cn(
        "font-medium whitespace-nowrap tabular-nums",
        t.type === "receita" ? "text-emerald-700" : "text-red-600",
        className
      )}
    >
      {t.type === "receita" ? "+ " : "− "}
      {formatCurrency(t.amount)}
    </span>
  )
}

function CategoryTag({ category }: { category: Transaction["category"] }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="size-2 rounded-full" style={{ background: CATEGORY_COLORS[category] }} />
      {category}
    </span>
  )
}

export function TransactionList({ transactions, loading, emptyMessage, onEdit, onDelete }: Props) {
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null)
  const hasActions = Boolean(onEdit || onDelete)

  if (loading) {
    return (
      <div className="grid gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {emptyMessage ?? "Nenhuma transação encontrada."}
      </p>
    )
  }

  const actions = (t: Transaction) =>
    hasActions && (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label={`Ações para ${t.description}`} />}
        >
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(t)}>
              <PencilIcon /> Editar
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem variant="destructive" onClick={() => setPendingDelete(t)}>
              <Trash2Icon /> Excluir
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )

  return (
    <>
      {/* Mobile: lista em cartões */}
      <ul className="divide-y md:hidden">
        {transactions.map((t) => (
          <li key={t.id} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{t.description}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
                <CategoryTag category={t.category} />
              </div>
            </div>
            <Amount t={t} className="text-sm" />
            {actions(t)}
          </li>
        ))}
      </ul>

      {/* Desktop: tabela */}
      <Table className="hidden md:table">
        <TableHeader>
          <TableRow>
            <TableHead className="w-28">Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            {hasActions && <TableHead className="w-12" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="text-muted-foreground tabular-nums">{formatDate(t.date)}</TableCell>
              <TableCell className="max-w-xs truncate font-medium">{t.description}</TableCell>
              <TableCell>
                <CategoryTag category={t.category} />
              </TableCell>
              <TableCell className="text-right">
                <Amount t={t} />
              </TableCell>
              {hasActions && <TableCell className="text-right">{actions(t)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.description}” será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                if (!pendingDelete || !onDelete) return
                const target = pendingDelete
                setPendingDelete(null)
                try {
                  await onDelete(target.id)
                  toast.success("Transação excluída.")
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Não foi possível excluir.")
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
