import { Suspense } from "react"
import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/server"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AppShellSkeleton />}>
      <AuthGate>{children}</AuthGate>
    </Suspense>
  )
}

/**
 * Lê a sessão no servidor (por isso fica atrás do Suspense) e barra quem não
 * está logado. O proxy já redireciona antes; isto é a segunda linha de defesa.
 */
async function AuthGate({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect("/login")

  return (
    <>
      <AppHeader email={String(data.claims.email ?? "")} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </>
  )
}

function AppShellSkeleton() {
  return (
    <>
      <div className="h-14 border-b" />
      <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-8 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-72" />
      </div>
    </>
  )
}
