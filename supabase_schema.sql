-- Create profiles table
create table public.profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create cloud_connections table
create table public.cloud_connections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  provider text not null check (provider in ('google', 'dropbox')),
  access_token text, -- Encrypted in practice, but for now plain text or handled via Supabase secrets if possible. 
                     -- Ideally, store refresh_token.
  refresh_token text,
  expires_at timestamp with time zone,
  email text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  unique(user_id, provider)
);

-- Set up RLS for cloud_connections
alter table public.cloud_connections enable row level security;

create policy "Users can view their own cloud connections."
  on cloud_connections for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own cloud connections."
  on cloud_connections for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own cloud connections."
  on cloud_connections for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own cloud connections."
  on cloud_connections for delete
  using ( auth.uid() = user_id );
