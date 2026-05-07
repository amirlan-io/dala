create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  price integer not null,
  category text not null,
  images text[] not null default '{}',
  is_new boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.hero_settings (
  id text primary key default 'default',
  title text not null default '',
  subtitle text not null default '',
  image_url text not null default ''
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_phone text,
  items jsonb not null default '[]'::jsonb,
  total_price integer not null default 0,
  created_at timestamptz not null default now()
);
