import Link from "next/link"
import {
  ArrowRightIcon,
  ChartPieIcon,
  FileDownIcon,
  LockKeyholeIcon,
  SearchIcon,
  SmartphoneIcon,
  TagsIcon,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const FEATURES = [
  {
    icon: ChartPieIcon,
    title: "Dashboard visual",
    text: "Receitas, despesas e saldo do mês num relance, com gráfico de gastos por categoria.",
  },
  {
    icon: TagsIcon,
    title: "Categorias prontas",
    text: "Alimentação, Transporte, Moradia, Lazer, Saúde e mais — é só lançar.",
  },
  {
    icon: SearchIcon,
    title: "Busca e filtros",
    text: "Encontre qualquer lançamento por descrição, mês, ano ou categoria.",
  },
  {
    icon: FileDownIcon,
    title: "Exportar CSV",
    text: "Baixe as transações filtradas e abra direto no Excel ou Google Sheets.",
  },
  {
    icon: SmartphoneIcon,
    title: "No celular também",
    text: "Layout pensado para telas pequenas: registre um gasto na fila do caixa.",
  },
  {
    icon: LockKeyholeIcon,
    title: "Seus dados, só seus",
    text: "Login seguro e isolamento por usuário direto no banco de dados.",
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
            Entrar
          </Link>
          <Link href="/cadastro" className={buttonVariants()}>
            Criar conta
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-20 sm:px-6 lg:grid-cols-2 lg:pt-20">
          <div className="grid gap-6">
            <span className="w-fit rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              Gratuito · sem planilhas
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Saiba para onde vai <span className="text-primary">cada real</span> do seu mês.
            </h1>
            <p className="max-w-lg text-lg text-pretty text-muted-foreground">
              Registre receitas e despesas em segundos e acompanhe seu saldo com um dashboard
              claro. Chega de extratos espalhados e anotações perdidas.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/cadastro" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}>
                Começar agora <ArrowRightIcon />
              </Link>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5")}
              >
                Já tenho conta
              </Link>
            </div>
          </div>

          <DashboardPreview />
        </section>

        <section className="border-t bg-card">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Tudo o que você precisa, nada que atrapalhe
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-xl border bg-background p-5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-medium">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Comece a organizar suas finanças hoje
          </h2>
          <p className="mt-2 text-muted-foreground">Leva menos de um minuto para criar sua conta.</p>
          <Link href="/cadastro" className={cn(buttonVariants({ size: "lg" }), "mt-6 h-11 px-6")}>
            Criar conta grátis
          </Link>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2026 Finanças Poppius
      </footer>
    </div>
  )
}

/** Ilustração estática do dashboard para a landing. */
function DashboardPreview() {
  const bars = [
    { name: "Moradia", pct: 38, color: "#1baf7a" },
    { name: "Alimentação", pct: 24, color: "#2a78d6" },
    { name: "Transporte", pct: 16, color: "#eb6834" },
    { name: "Lazer", pct: 12, color: "#eda100" },
  ]
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-xl shadow-primary/5" aria-hidden>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Receitas", value: "R$ 8.450", className: "text-emerald-600" },
          { label: "Despesas", value: "R$ 5.120", className: "text-red-600" },
          { label: "Saldo", value: "R$ 3.330", className: "text-primary" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border p-3">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className={cn("mt-1 text-sm font-semibold sm:text-lg", c.className)}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border p-4">
        <p className="text-sm font-medium">Despesas por categoria</p>
        <div className="mt-4 grid gap-3">
          {bars.map((b) => (
            <div key={b.name} className="grid gap-1">
              <div className="flex justify-between text-xs">
                <span>{b.name}</span>
                <span className="text-muted-foreground">{b.pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full" style={{ width: `${b.pct * 2.2}%`, background: b.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
