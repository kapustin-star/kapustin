-- Таблица сделок для канбан-доски "Моя CRM"
-- Вставь в SQL-редактор Supabase (SQL Editor -> New query -> Run)

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  client text not null,
  company text,
  contact text,
  amount numeric,
  note text,
  stage text not null default 'lead',
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Проверить, включена ли RLS (должно быть true после ALTER ниже)
alter table public.deals enable row level security;

-- Пользователь видит только свои сделки
create policy "Select own deals"
  on public.deals for select
  using (auth.uid() = user_id);

-- Пользователь создаёт только свои сделки
create policy "Insert own deals"
  on public.deals for insert
  with check (auth.uid() = user_id);

-- Пользователь меняет только свои сделки
create policy "Update own deals"
  on public.deals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Пользователь удаляет только свои сделки (необязательно, но удобно)
create policy "Delete own deals"
  on public.deals for delete
  using (auth.uid() = user_id);
