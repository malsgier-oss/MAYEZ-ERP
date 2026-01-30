# MAYEZ ERP

Sales-first ERP – Phase 1 MVP: POS, products, customers, invoices, inventory, and basic reports.

## Stack

- **Vite** + **React** 18
- **React Router** 6
- **Supabase** (database + auth later)
- **Zustand** (cart state)
- **Tailwind CSS**

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - In the SQL Editor, run the contents of `supabase/schema.sql`.
   - In Project Settings → API, copy the project URL and anon key.

3. **Environment**
   - Copy `.env.example` to `.env`.
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

4. **Run**
   ```bash
   npm run dev
   ```

5. **Build**
   ```bash
   npm run build
   ```

## Phase 1 features

- **POS** – Add products to cart, select customer, Cash/Credit, discount, complete sale.
- **Products** – List, add, edit; SKU, price, unit, stock, low-stock threshold.
- **Customers** – List with debt, add customer, view detail, collect payment on account.
- **Invoices** – History, filter by status/date, view detail, record payment, print.
- **Inventory** – Stock list, low-stock filter, adjust stock with reason, movement history.
- **Reports** – Daily sales summary, customer debt, low stock, top 10 products.
- **Settings** – Business name, address, currency symbol, receipt footer (stored in browser).

## Design doc

See `document.md` for full vision, phases, data model, and Cursor guidance.
