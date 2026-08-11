-- ============================================================
-- Suruchi Foods (Original Tapeswaram Khaja) - WhatsApp Agent
-- Same schema you already built and are running in Supabase.
-- Copied here so the codebase is self-contained and portable.
-- ============================================================

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  phone text unique,
  email text,
  city text,
  segment text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  customer_phone text,
  role text,
  message text,
  created_at timestamp with time zone default now()
);

create table if not exists knowledge_base (
  id uuid primary key default gen_random_uuid(),
  question text,
  answer text
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text,
  category text,
  pack_size text,
  price numeric,
  currency text default 'INR',
  order_type text default 'regular',
  available boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
