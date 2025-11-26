-- =========================================================
-- RESET COMPLETO DO BANCO DE DADOS
-- =========================================================

-- 1. Drop tables if they exist
DROP TABLE IF EXISTS public.cloud_connections;
DROP TABLE IF EXISTS public.user_connections;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =========================================================
-- CRIAR TABELA PERFIL (Schema do Usuário)
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text default 'client',
  
  name text,
  avatar_url text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================================
-- TRIGGER PARA ATUALIZAR updated_at AUTOMATICAMENTE
-- =========================================================
create or replace function public.handle_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_profiles_updated_at();

-- =========================================================
-- ATIVAR RLS (PROFILES)
-- =========================================================
alter table public.profiles enable row level security;

-- =========================================================
-- POLÍTICAS (PROFILES)
-- =========================================================

create policy "Users can select own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id);

-- =========================================================
-- TRIGGER PARA CRIAR PROFILE AUTOMATICAMENTE NO SIGNUP
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, display_name, name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'name',
    COALESCE(new.raw_user_meta_data->>'role', 'client')  -- Pega o role dos metadados, ou 'client' se não existir
  );
  return new;
end;
$$;

-- Drop trigger if exists to avoid duplication error on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- =========================================================
-- CRIAR TABELA CLOUD_CONNECTIONS (Necessária para o App)
-- =========================================================
CREATE TABLE public.cloud_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL, -- 'google' or 'dropbox'
  access_token TEXT,
  refresh_token TEXT,
  expires_at BIGINT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, provider)
);

-- =========================================================
-- ATIVAR RLS (CLOUD_CONNECTIONS)
-- =========================================================
ALTER TABLE public.cloud_connections ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- POLÍTICAS (CLOUD_CONNECTIONS)
-- =========================================================
CREATE POLICY "Users can view their own connections" ON public.cloud_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connections" ON public.cloud_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections" ON public.cloud_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections" ON public.cloud_connections
  FOR DELETE USING (auth.uid() = user_id);
