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

-- ============================================================
-- client_accounts — per-client integration credentials, edited
-- from the dashboard's Settings page instead of a .env file.
-- One row per client business (see app/api/settings/whatsapp/route.ts).
-- ============================================================
create table if not exists client_accounts (
  id uuid primary key default gen_random_uuid(),
  business_name text unique,
  connection_status text default 'disconnected',

  -- WhatsApp Business (Meta Cloud API)
  whatsapp_access_token text,
  whatsapp_phone_number_id text,
  whatsapp_waba_id text,

  -- Razorpay (payment links)
  razorpay_key_id text,
  razorpay_key_secret text,

  -- Twilio (sandbox / SMS fallback)
  twilio_account_sid text,
  twilio_auth_token text,
  twilio_whatsapp_from text,

  -- AI (OpenAI + ElevenLabs voice agent)
  openai_api_key text,
  elevenlabs_api_key text,
  elevenlabs_agent_id text,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Safe to re-run against an existing table that only has the
-- original WhatsApp columns — adds the new ones without touching data.
alter table client_accounts add column if not exists razorpay_key_id text;
alter table client_accounts add column if not exists razorpay_key_secret text;
alter table client_accounts add column if not exists twilio_account_sid text;
alter table client_accounts add column if not exists twilio_auth_token text;
alter table client_accounts add column if not exists twilio_whatsapp_from text;
alter table client_accounts add column if not exists openai_api_key text;
alter table client_accounts add column if not exists elevenlabs_api_key text;
alter table client_accounts add column if not exists elevenlabs_agent_id text;
