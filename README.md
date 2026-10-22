# Finanças Pessoais Poppius

Web app de finanças pessoais: registre receitas e despesas, categorize, filtre e acompanhe
o saldo mensal num dashboard com gráficos.

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 ·
shadcn/ui (Base UI) · Recharts · Supabase (Auth + PostgreSQL + RLS) · Vercel

## Funcionalidades

| Feature | Onde |
|---|---|
| Landing page | `/` |
| Cadastro e login (e-mail/senha, Supabase Auth) | `/cadastro`, `/login` |
| Proteção de rotas | `src/proxy.ts` + `AuthGate` em `src/app/(app)/layout.tsx` |
| Dashboard: cards de Receita, Despesa e Saldo, rosca de despesas por categoria, barras receitas x despesas por mês | `/dashboard` |
| CRUD de transações (descrição, valor, data, tipo, categoria) | `/transacoes` |
| Filtros por mês/ano, categoria e tipo + busca por descrição | `/transacoes` |
| Exportar CSV das transações filtradas (formato Excel BR: `;`, vírgula decimal, UTF-8 com BOM) | botão "Exportar CSV" |
| Layout responsivo (tabela no desktop, lista em cartões no celular) | todas as telas |

Cada usuário só vê e altera as próprias transações — garantido por Row Level Security no banco.

## Como rodar

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, execute o conteúdo de [`supabase/migrations/0001_transactions.sql`](supabase/migrations/0001_transactions.sql)
   (cria a tabela `transactions`, o índice e as políticas de RLS).
3. Em **Authentication → URL Configuration**, defina:
   - **Site URL**: `http://localhost:3000` (depois troque pela URL da Vercel)
   - **Redirect URLs**: `http://localhost:3000/auth/callback` e `https://SEU-APP.vercel.app/auth/callback`
4. (Opcional, para testes) Em **Authentication → Providers → Email**, desative "Confirm email"
   para entrar logo após o cadastro.

### 2. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha com os valores de **Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # ou a chave "anon" legada
```

### 3. Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Deploy na Vercel

1. Suba o repositório para o GitHub.
2. Na Vercel, **Add New → Project** e importe o repositório.
3. Adicione as duas variáveis de ambiente acima.
4. Deploy. Depois, atualize a Site URL / Redirect URLs no Supabase com o domínio da Vercel.

## Estrutura

```
src/
  proxy.ts                     # renova a sessão e redireciona rotas protegidas
  app/
    page.tsx                   # landing
    (auth)/login, cadastro     # formulários de autenticação
    (app)/layout.tsx           # AuthGate (verificação de sessão no servidor) + header
    (app)/dashboard            # dashboard
    (app)/transacoes           # CRUD, filtros e exportação
    auth/callback/route.ts     # confirmação de e-mail (troca code → sessão)
  components/finance/          # cards, gráficos, lista, formulário, filtros
  hooks/use-transactions.ts    # leitura e mutações via supabase-js (protegidas por RLS)
  lib/finance.ts               # categorias, cores, formatação, resumo, CSV
  lib/supabase/                # clientes browser e server
supabase/migrations/           # SQL do banco
```

## Marcos de desenvolvimento

1. **Scaffold** — Next.js + Tailwind + shadcn/ui.
2. **Banco e auth** — tabela com RLS, clientes Supabase, proxy de sessão, login/cadastro.
3. **Landing page.**
4. **CRUD de transações** — formulário em diálogo, edição, exclusão com confirmação.
5. **Dashboard** — cards de resumo e gráficos Recharts.
6. **Filtros, busca e exportação CSV.**
7. **Responsivo e deploy.**

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm run start` | serve o build |
| `npm run lint` | ESLint |
