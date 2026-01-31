-- Suppliers (wholesalers), purchases, purchase_items, supplier_payments
-- Run in Supabase SQL Editor. Supports "receive stock" with cash or credit (pay later).

-- =============================================================================
-- 1. SUPPLIERS
-- =============================================================================
create table if not exists suppliers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  payable decimal(12,2) not null default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_suppliers_name on suppliers(name);

-- =============================================================================
-- 2. PURCHASES (stock receipts from supplier)
-- =============================================================================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'purchase_status') then
    create type purchase_status as enum ('paid', 'partial', 'unpaid');
  end if;
end $$;

create table if not exists purchases (
  id uuid primary key default uuid_generate_v4(),
  supplier_id uuid not null references suppliers(id),
  purchase_number text unique not null,
  purchase_date date not null default current_date,
  total_amount decimal(12,2) not null default 0,
  paid_amount decimal(12,2) not null default 0,
  status purchase_status not null default 'unpaid',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_purchases_supplier on purchases(supplier_id);
create index if not exists idx_purchases_date on purchases(purchase_date);

-- =============================================================================
-- 3. PURCHASE ITEMS
-- =============================================================================
create table if not exists purchase_items (
  id uuid primary key default uuid_generate_v4(),
  purchase_id uuid not null references purchases(id) on delete cascade,
  product_id uuid not null references products(id),
  product_name text not null,
  quantity decimal(12,2) not null,
  unit_cost decimal(12,2) not null,
  line_total decimal(12,2) not null,
  created_at timestamptz default now()
);

create index if not exists idx_purchase_items_purchase on purchase_items(purchase_id);

-- =============================================================================
-- 4. SUPPLIER PAYMENTS
-- =============================================================================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'supplier_payment_method') then
    create type supplier_payment_method as enum ('cash', 'bank_transfer', 'other');
  end if;
end $$;

create table if not exists supplier_payments (
  id uuid primary key default uuid_generate_v4(),
  supplier_id uuid not null references suppliers(id),
  purchase_id uuid references purchases(id),
  amount decimal(12,2) not null,
  payment_date date not null default current_date,
  payment_method supplier_payment_method not null default 'cash',
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_supplier_payments_supplier on supplier_payments(supplier_id);

-- =============================================================================
-- 5. PURCHASE NUMBER SEQUENCE
-- =============================================================================
create sequence if not exists purchase_number_seq start 1;

create or replace function get_next_purchase_number()
returns text as $$
  select 'PUR-' || lpad(nextval('purchase_number_seq')::text, 5, '0');
$$ language sql;

-- =============================================================================
-- 6. RLS
-- =============================================================================
alter table suppliers enable row level security;
alter table purchases enable row level security;
alter table purchase_items enable row level security;
alter table supplier_payments enable row level security;

drop policy if exists "Allow all suppliers" on suppliers;
drop policy if exists "Allow all purchases" on purchases;
drop policy if exists "Allow all purchase_items" on purchase_items;
drop policy if exists "Allow all supplier_payments" on supplier_payments;

create policy "Allow all suppliers" on suppliers for all using (true) with check (true);
create policy "Allow all purchases" on purchases for all using (true) with check (true);
create policy "Allow all purchase_items" on purchase_items for all using (true) with check (true);
create policy "Allow all supplier_payments" on supplier_payments for all using (true) with check (true);
