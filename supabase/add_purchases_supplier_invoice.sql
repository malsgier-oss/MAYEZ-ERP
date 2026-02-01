-- Add optional supplier invoice reference to purchases (run after add_suppliers_purchases.sql).
-- Run in Supabase SQL Editor.

alter table purchases add column if not exists supplier_invoice_number text;
alter table purchases add column if not exists supplier_invoice_url text;
