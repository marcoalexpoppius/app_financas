import type { Metadata } from "next"
import { TransactionsView } from "@/components/finance/transactions-view"

export const metadata: Metadata = { title: "Transações" }

export default function TransactionsPage() {
  return <TransactionsView />
}
