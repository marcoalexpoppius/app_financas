import { ArrowDownRightIcon, ArrowUpRightIcon, ScaleIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/finance"
import { cn } from "@/lib/utils"

type Props = {
  income: number
  expense: number
  balance: number
  loading?: boolean
}

export function SummaryCards({ income, expense, balance, loading }: Props) {
  const cards = [
    {
      label: "Receitas",
      value: income,
      icon: ArrowUpRightIcon,
      tone: "bg-emerald-50 text-emerald-700",
      valueClass: "text-foreground",
    },
    {
      label: "Despesas",
      value: expense,
      icon: ArrowDownRightIcon,
      tone: "bg-red-50 text-red-700",
      valueClass: "text-foreground",
    },
    {
      label: "Saldo",
      value: balance,
      icon: ScaleIcon,
      tone: "bg-primary/10 text-primary",
      valueClass: balance < 0 ? "text-red-600" : "text-emerald-700",
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
      {cards.map(({ label, value, icon: Icon, tone, valueClass }) => (
        <Card key={label} size="sm">
          <CardContent className="flex items-center gap-3">
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tone)}>
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{label}</p>
              {loading ? (
                <Skeleton className="mt-1 h-7 w-28" />
              ) : (
                <p className={cn("truncate text-xl font-semibold tabular-nums sm:text-2xl", valueClass)}>
                  {formatCurrency(value)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
