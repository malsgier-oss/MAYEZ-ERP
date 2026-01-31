-- MAYEZ ERP - Full schema (run once in Supabase SQL Editor)
-- Use this on a NEW project. Includes: categories, products (with category_id, image_url),
-- customers (with debt), invoices (status: paid/partial/unpaid/refunded), invoice_items,
-- payments, stock_movements, invoice number sequence, RLS policies.
-- After running: create Storage bucket "product-photos" (public) in Dashboard if using product photos.
-- If you already ran schema.sql before: use add_refunded_status.sql, add_customers_debt.sql, add_product_image_url.sql instead.

-- =============================================================================
-- 1. EXTENSION
-- =============================================================================
create extension if not exists "uuid-ossp";

-- =============================================================================
-- 2. CATEGORIES
-- =============================================================================
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now()
);

-- =============================================================================
-- 3. PRODUCTS (with category_id, image_url)
-- =============================================================================
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  sku text unique,
  name text not null,
  description text,
  category_id uuid references categories(id),
  unit text not null default 'pcs',
  selling_price decimal(12,2) not null default 0,
  current_stock integer not null default 0,
  low_stock_threshold integer not null default 0,
  is_active boolean default true,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_products_name on products(name);
create index if not exists idx_products_sku on products(sku);
create index if not exists idx_products_is_active on products(is_active);

-- Add image_url if table already existed without it
alter table products add column if not exists image_url text;

-- =============================================================================
-- 4. CUSTOMERS (with debt)
-- =============================================================================
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  debt decimal(12,2) not null default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_customers_name on customers(name);
create index if not exists idx_customers_phone on customers(phone);

-- Add debt if table already existed without it
alter table customers add column if not exists debt decimal(12,2) not null default 0;

-- =============================================================================
-- 5. INVOICES (status: paid, partial, unpaid, refunded)
-- =============================================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'invoice_status') then
    create type invoice_status as enum ('paid', 'partial', 'unpaid', 'refunded');
  else
    alter type invoice_status add value if not exists 'refunded';
  end if;
end $$;

create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  invoice_number text unique not null,
  customer_id uuid references customers(id),
  invoice_date date not null default current_date,
  due_date date,
  subtotal decimal(12,2) not null default 0,
  discount_amount decimal(12,2) not null default 0,
  discount_percentage decimal(5,2) not null default 0,
  total_amount decimal(12,2) not null default 0,
  paid_amount decimal(12,2) not null default 0,
  status invoice_status not null default 'unpaid',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_invoices_number on invoices(invoice_number);
create index if not exists idx_invoices_customer on invoices(customer_id);
create index if not exists idx_invoices_date on invoices(invoice_date);
create index if not exists idx_invoices_status on invoices(status);

-- =============================================================================
-- 6. INVOICE ITEMS
-- =============================================================================
create table if not exists invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  product_id uuid not null references products(id),
  product_name text not null,
  quantity decimal(12,2) not null,
  unit_price decimal(12,2) not null,
  line_total decimal(12,2) not null,
  created_at timestamptz default now()
);

create index if not exists idx_invoice_items_invoice on invoice_items(invoice_id);

-- =============================================================================
-- 7. PAYMENTS
-- =============================================================================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type payment_method as enum ('cash', 'credit', 'bank_transfer');
  end if;
end $$;

create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references invoices(id),
  customer_id uuid not null references customers(id),
  payment_date date not null default current_date,
  amount decimal(12,2) not null,
  payment_method payment_method not null default 'cash',
  reference_number text,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_payments_invoice on payments(invoice_id);
create index if not exists idx_payments_customer on payments(customer_id);

-- =============================================================================
-- 8. STOCK MOVEMENTS
-- =============================================================================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'movement_type') then
    create type movement_type as enum ('sale', 'adjustment', 'return', 'receipt', 'production_in', 'production_out');
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_type where typname = 'reference_type') then
    create type reference_type as enum ('invoice', 'purchase_order', 'production_order', 'adjustment');
  end if;
end $$;

create table if not exists stock_movements (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id),
  movement_type movement_type not null,
  quantity decimal(12,2) not null,
  reference_type reference_type,
  reference_id uuid,
  reason text,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_stock_movements_product on stock_movements(product_id);
create index if not exists idx_stock_movements_created on stock_movements(created_at);

-- =============================================================================
-- 9. INVOICE NUMBER SEQUENCE
-- =============================================================================
create sequence if not exists invoice_number_seq start 1;

create or replace function get_next_invoice_number()
returns text as $$
  select 'INV-' || lpad(nextval('invoice_number_seq')::text, 5, '0');
$$ language sql;

-- =============================================================================
-- 10. RLS POLICIES (Phase 1: allow all for anon)
-- =============================================================================
alter table products enable row level security;
alter table customers enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table payments enable row level security;
alter table stock_movements enable row level security;
alter table categories enable row level security;

drop policy if exists "Allow all products" on products;
drop policy if exists "Allow all customers" on customers;
drop policy if exists "Allow all invoices" on invoices;
drop policy if exists "Allow all invoice_items" on invoice_items;
drop policy if exists "Allow all payments" on payments;
drop policy if exists "Allow all stock_movements" on stock_movements;
drop policy if exists "Allow all categories" on categories;

create policy "Allow all products" on products for all using (true) with check (true);
create policy "Allow all customers" on customers for all using (true) with check (true);
create policy "Allow all invoices" on invoices for all using (true) with check (true);
create policy "Allow all invoice_items" on invoice_items for all using (true) with check (true);
create policy "Allow all payments" on payments for all using (true) with check (true);
create policy "Allow all stock_movements" on stock_movements for all using (true) with check (true);
create policy "Allow all categories" on categories for all using (true) with check (true);
