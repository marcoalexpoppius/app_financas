export const TRANSACTION_TYPES = ["receita", "despesa"] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]

export const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Educação",
  "Salário",
  "Freelance",
  "Outros",
] as const
export type Category = (typeof CATEGORIES)[number]

// Cor fixa por categoria (segue a entidade, não a posição no ranking).
// Ordem validada para daltonismo; "Outros" fica em cinza neutro.
export const CATEGORY_COLORS: Record<Category, string> = {
  Alimentação: "#2a78d6",
  Transporte: "#eb6834",
  Moradia: "#1baf7a",
  Lazer: "#eda100",
  Saúde: "#e87ba4",
  Educação: "#008300",
  Salário: "#6250d6",
  Freelance: "#e34948",
  Outros: "#8a8a85",
}

export const INCOME_COLOR = "#1baf7a"
export const EXPENSE_COLOR = "#e34948"

export type Transaction = {
  id: string
  user_id: string
  description: string
  amount: number
  date: string // YYYY-MM-DD
  type: TransactionType
  category: Category
  created_at: string
}

export type TransactionInput = Pick<
  Transaction,
  "description" | "amount" | "date" | "type" | "category"
>

export const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

export function formatCurrency(value: number) {
  return brl.format(value)
}

export function formatDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-")
  return `${d}/${m}/${y}`
}

export function todayISO() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export type Period = {
  year: number
  /** 1–12, ou `null` para o ano inteiro */
  month: number | null
}

export function periodRange({ year, month }: Period) {
  const pad = (n: number) => String(n).padStart(2, "0")
  if (month === null) {
    return { from: `${year}-01-01`, to: `${year}-12-31` }
  }
  const lastDay = new Date(year, month, 0).getDate()
  return { from: `${year}-${pad(month)}-01`, to: `${year}-${pad(month)}-${pad(lastDay)}` }
}

export function periodLabel({ year, month }: Period) {
  return month === null ? `Ano de ${year}` : `${MONTHS[month - 1]} de ${year}`
}

export function summarize(transactions: Transaction[]) {
  let income = 0
  let expense = 0
  for (const t of transactions) {
    if (t.type === "receita") income += t.amount
    else expense += t.amount
  }
  return { income, expense, balance: income - expense }
}

export function totalsByCategory(transactions: Transaction[], type: TransactionType) {
  const totals = new Map<Category, number>()
  for (const t of transactions) {
    if (t.type !== type) continue
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount)
  }
  return [...totals.entries()]
    .map(([category, total]) => ({ category, total, color: CATEGORY_COLORS[category] }))
    .sort((a, b) => b.total - a.total)
}

export function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
}

function csvCell(value: string) {
  return /[";\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/**
 * CSV no padrão do Excel brasileiro: separador `;`, vírgula decimal e BOM UTF-8
 * para que acentos abram corretamente.
 */
export function transactionsToCSV(transactions: Transaction[]) {
  const header = ["Data", "Descrição", "Tipo", "Categoria", "Valor"]
  const rows = transactions.map((t) => [
    formatDate(t.date),
    t.description,
    t.type === "receita" ? "Receita" : "Despesa",
    t.category,
    (t.type === "despesa" ? -t.amount : t.amount).toFixed(2).replace(".", ","),
  ])
  return "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n")
}

export function downloadCSV(transactions: Transaction[], filename: string) {
  const blob = new Blob([transactionsToCSV(transactions)], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
