"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  EXPENSE_COLOR,
  INCOME_COLOR,
  MONTHS,
  formatCurrency,
  type Category,
  type Transaction,
} from "@/lib/finance"

type CategoryTotal = { category: Category; total: number; color: string }

function TooltipBox({ title, rows }: { title: string; rows: { label: string; value: number; color: string }[] }) {
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-foreground">{title}</p>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-2">
          <span className="size-2.5 rounded-sm" style={{ background: row.color }} />
          <span className="text-muted-foreground">{row.label}</span>
          <span className="ml-auto pl-3 font-medium tabular-nums text-foreground">
            {formatCurrency(row.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

/** Rosca de despesas por categoria, com legenda-tabela (valor e %) ao lado. */
export function CategoryDonut({ data }: { data: CategoryTotal[] }) {
  const total = data.reduce((sum, d) => sum + d.total, 0)

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        Nenhuma despesa no período.
      </div>
    )
  }

  return (
    <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,220px)_1fr]">
      <div className="relative mx-auto aspect-square w-full max-w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              innerRadius="62%"
              outerRadius="100%"
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.category} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const item = payload[0].payload as CategoryTotal
                return (
                  <TooltipBox
                    title={item.category}
                    rows={[{ label: `${((item.total / total) * 100).toFixed(1)}%`, value: item.total, color: item.color }]}
                  />
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-sm font-semibold tabular-nums">{formatCurrency(total)}</span>
        </div>
      </div>

      <ul className="grid gap-2 text-sm">
        {data.map((d) => (
          <li key={d.category} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: d.color }} />
            <span className="truncate">{d.category}</span>
            <span className="ml-auto tabular-nums text-muted-foreground">
              {((d.total / total) * 100).toFixed(0)}%
            </span>
            <span className="w-28 text-right font-medium tabular-nums">{formatCurrency(d.total)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const compact = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 })

/** Receitas x despesas mês a mês para um ano. */
export function MonthlyBars({ transactions, highlightMonth }: { transactions: Transaction[]; highlightMonth: number | null }) {
  const data = MONTHS.map((name, i) => ({ month: name.slice(0, 3), index: i + 1, receita: 0, despesa: 0 }))
  for (const t of transactions) {
    const m = Number(t.date.slice(5, 7)) - 1
    data[m][t.type] += t.amount
  }

  return (
    <div className="grid gap-3">
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: INCOME_COLOR }} /> Receitas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: EXPENSE_COLOR }} /> Despesas
        </span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2} barCategoryGap="22%" margin={{ left: 0, right: 4 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={56}
              stroke="var(--muted-foreground)"
              tickFormatter={(v: number) => compact.format(v)}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const row = payload[0].payload as (typeof data)[number]
                return (
                  <TooltipBox
                    title={MONTHS[row.index - 1]}
                    rows={[
                      { label: "Receitas", value: row.receita, color: INCOME_COLOR },
                      { label: "Despesas", value: row.despesa, color: EXPENSE_COLOR },
                    ]}
                  />
                )
              }}
            />
            {(["receita", "despesa"] as const).map((key) => (
              <Bar key={key} dataKey={key} radius={[4, 4, 0, 0]} maxBarSize={18} isAnimationActive={false}>
                {data.map((d) => (
                  <Cell
                    key={d.index}
                    fill={key === "receita" ? INCOME_COLOR : EXPENSE_COLOR}
                    fillOpacity={highlightMonth === null || highlightMonth === d.index ? 1 : 0.35}
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
