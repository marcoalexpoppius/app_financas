"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

const MESSAGES: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "User already registered": "Já existe uma conta com este e-mail.",
  "Email not confirmed": "Confirme seu e-mail antes de entrar (verifique sua caixa de entrada).",
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isLogin = mode === "login"

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isLogin && password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.")
      return
    }
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data, error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        })

    setLoading(false)
    if (error) {
      setError(MESSAGES[error.message] ?? error.message)
      return
    }
    if (!isLogin && !data.session) {
      toast.success("Conta criada! Enviamos um link de confirmação para o seu e-mail.")
      router.push("/login")
      return
    }
    router.replace("/dashboard")
    router.refresh()
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">{isLogin ? "Entrar" : "Criar conta"}</CardTitle>
        <CardDescription>
          {isLogin ? "Acesse suas finanças." : "Comece a organizar suas finanças hoje."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="h-9" disabled={loading}>
            {loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Ainda não tem conta? " : "Já tem conta? "}
            <Link
              href={isLogin ? "/cadastro" : "/login"}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {isLogin ? "Cadastre-se" : "Entrar"}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
