"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Transaction, TransactionInput } from "@/lib/finance"

type Range = { from: string; to: string }

function toTransaction(row: Record<string, unknown>): Transaction {
  return { ...(row as Transaction), amount: Number(row.amount) }
}

/**
 * Carrega as transações do usuário logado no intervalo de datas informado.
 * A RLS do Supabase garante que só as transações do próprio usuário retornam.
 */
export function useTransactions({ from, to }: Range) {
  const supabase = useMemo(() => createClient(), [])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  // Carregando = os dados em mãos são de outro período. Recarregas após salvar
  // (só `version` muda) mantêm a lista atual na tela até a resposta chegar.
  const rangeKey = `${from}|${to}`
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const loading = loadedKey !== rangeKey

  useEffect(() => {
    let cancelled = false
    supabase
      .from("transactions")
      .select("*")
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        setError(error?.message ?? null)
        setTransactions((data ?? []).map(toTransaction))
        setLoadedKey(rangeKey)
      })
    return () => {
      cancelled = true
    }
  }, [supabase, from, to, rangeKey, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  const create = useCallback(
    async (input: TransactionInput) => {
      const { error } = await supabase.from("transactions").insert(input)
      if (error) throw new Error(error.message)
      reload()
    },
    [supabase, reload]
  )

  const update = useCallback(
    async (id: string, input: TransactionInput) => {
      const { error } = await supabase.from("transactions").update(input).eq("id", id)
      if (error) throw new Error(error.message)
      reload()
    },
    [supabase, reload]
  )

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id)
      if (error) throw new Error(error.message)
      setTransactions((current) => current.filter((t) => t.id !== id))
    },
    [supabase]
  )

  return { transactions, loading, error, reload, create, update, remove }
}
