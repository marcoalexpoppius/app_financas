"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MONTHS, type Period } from "@/lib/finance"

const ALL_MONTHS = "todos"

export function PeriodPicker({
  value,
  onChange,
  allowWholeYear = true,
}: {
  value: Period
  onChange: (period: Period) => void
  allowWholeYear?: boolean
}) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => currentYear + 1 - i)
  if (!years.includes(value.year)) years.push(value.year)

  const monthItems = [
    ...(allowWholeYear ? [{ value: ALL_MONTHS, label: "Ano inteiro" }] : []),
    ...MONTHS.map((label, i) => ({ value: String(i + 1), label })),
  ]
  const yearItems = years.map((y) => ({ value: String(y), label: String(y) }))

  return (
    <div className="flex gap-2">
      <Select
        items={monthItems}
        value={value.month === null ? ALL_MONTHS : String(value.month)}
        onValueChange={(v) =>
          onChange({ ...value, month: !v || v === ALL_MONTHS ? null : Number(v) })
        }
      >
        <SelectTrigger className="w-36" aria-label="Mês">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {monthItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        items={yearItems}
        value={String(value.year)}
        onValueChange={(v) => v && onChange({ ...value, year: Number(v) })}
      >
        <SelectTrigger className="w-24" aria-label="Ano">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {yearItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
