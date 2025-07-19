-- run once in Supabase SQL editor or with psql

create table if not exists public.social_media_accounts (
  id            serial primary key,
  serial_number text      not null,
  name          text      not null,
  platform      text,
  url           text,
  followers     integer   default 0,
  level         integer   default 1,
  category      text,
  description   text,
  avatar        text,
  images        text[]    default '{}',
  updated_at    timestamptz default now()
);

-- row-level security (optional – remove if you haven’t enabled RLS)
alter table public.social_media_accounts enable row level security;
create policy "public read"  on public.social_media_accounts for select using ( true );
