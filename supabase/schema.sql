-- =====================================================================
-- LEEK Admin - reference Supabase schema
-- Derived from lib/types/database.ts and the queries in this repo.
-- Review it against your real database before running it: if you already
-- have these tables, only use it as a checklist.
-- Run in: Supabase -> SQL Editor
-- =====================================================================

-- ---------- Enums ----------
do $$ begin
  create type public.order_status as enum
    ('pending', 'picking', 'out_for_delivery', 'delivered', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum
    ('pending', 'pending_cod', 'pending_wire', 'paid', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum ('cod', 'card', 'wire');
exception when duplicate_object then null; end $$;

-- ---------- Helpers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- Admins ----------
-- Users listed here can sign in to LEEK Admin.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to authenticated;

-- ---------- Tables ----------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  phone      text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  label      text,
  line1      text not null,
  city       text not null default 'Casablanca',
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  image_url  text,
  position   integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  price       numeric(10, 2) not null check (price >= 0),
  unit        text not null default 'pcs',
  is_active   boolean not null default true,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.inventory (
  id                  uuid primary key default gen_random_uuid(),
  product_id          uuid not null unique references public.products (id) on delete cascade,
  quantity            integer not null default 0 check (quantity >= 0),
  low_stock_threshold integer not null default 0 check (low_stock_threshold >= 0),
  updated_at          timestamptz not null default now()
);

create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id),
  address_id   uuid references public.addresses (id),
  status       public.order_status not null default 'pending',
  total_amount numeric(10, 2) not null default 0,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.order_items (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid not null references public.orders (id) on delete cascade,
  product_id            uuid references public.products (id) on delete set null,
  product_name_snapshot text not null,
  unit_price_snapshot   numeric(10, 2) not null,
  quantity              integer not null check (quantity > 0),
  subtotal              numeric(10, 2) not null,
  created_at            timestamptz not null default now()
);

create table if not exists public.payments (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null unique references public.orders (id) on delete cascade,
  user_id      uuid not null references auth.users (id),
  method       public.payment_method not null,
  status       public.payment_status not null default 'pending',
  amount       numeric(10, 2) not null,
  provider_ref text,
  metadata     jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.order_status_history (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  old_status public.order_status,
  new_status public.order_status not null,
  changed_by uuid references auth.users (id),
  note       text,
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists orders_user_idx       on public.orders (user_id);
create index if not exists history_order_idx     on public.order_status_history (order_id);

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array['profiles','categories','products','inventory','orders','payments']
  loop
    execute format('drop trigger if exists trg_%1$s_updated_at on public.%1$s', t);
    execute format(
      'create trigger trg_%1$s_updated_at before update on public.%1$s
         for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------- RPC used by the Orders page ----------
create or replace function public.update_order_status(
  p_order_id   uuid,
  p_new_status public.order_status,
  p_note       text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_old public.order_status;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select status into v_old from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'order not found';
  end if;

  update public.orders set status = p_new_status where id = p_order_id;

  insert into public.order_status_history (order_id, old_status, new_status, changed_by, note)
  values (p_order_id, v_old, p_new_status, auth.uid(), p_note);
end $$;

grant execute on function public.update_order_status(uuid, public.order_status, text) to authenticated;

-- ---------- Row Level Security ----------
alter table public.admins               enable row level security;
alter table public.profiles             enable row level security;
alter table public.addresses            enable row level security;
alter table public.categories           enable row level security;
alter table public.products             enable row level security;
alter table public.inventory            enable row level security;
alter table public.orders               enable row level security;
alter table public.order_items          enable row level security;
alter table public.payments             enable row level security;
alter table public.order_status_history enable row level security;

-- Admins: full access to everything the dashboard touches
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','addresses','categories','products','inventory',
    'orders','order_items','payments','order_status_history'
  ]
  loop
    execute format('drop policy if exists "admin full access" on public.%I', t);
    execute format(
      'create policy "admin full access" on public.%I
         for all to authenticated
         using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Storefront (optional): anyone can read active catalogue items
drop policy if exists "public read active categories" on public.categories;
create policy "public read active categories" on public.categories
  for select using (is_active);

drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products
  for select using (is_active and deleted_at is null);

-- Customer-facing policies (own orders, own profile, ...) belong to the
-- storefront app and are intentionally not defined here.

-- ---------- Storage bucket for images ----------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "admin upload product images" on storage.objects;
create policy "admin upload product images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admin update product images" on storage.objects;
create policy "admin update product images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admin delete product images" on storage.objects;
create policy "admin delete product images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- ---------- Make yourself an admin ----------
-- 1) Create a user in Supabase -> Authentication -> Users
-- 2) Then run (replace the email):
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'you@example.com';
