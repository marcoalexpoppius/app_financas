-- Finanças Pessoais Poppius — schema inicial
-- Execute no SQL Editor do Supabase (ou via `supabase db push`).

create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  description text not null check (char_length(description) between 1 and 200),
  amount      numeric(12, 2) not null check (amount > 0),
  date        date not null default current_date,
  type        text not null check (type in ('receita', 'despesa')),
  category    text not null check (category in (
                'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde',
                'Educação', 'Salário', 'Freelance', 'Outros'
              )),
  created_at  timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc);

-- Row Level Security: cada usuário só enxerga e altera as próprias transações.
alter table public.transactions enable row level security;

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own" on public.transactions
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own" on public.transactions
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own" on public.transactions
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own" on public.transactions
  for delete to authenticated
  using ((select auth.uid()) = user_id);
