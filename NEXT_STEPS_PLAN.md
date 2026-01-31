# MAYEZ-ERP: Next Steps Plan

**Created:** 2026-01-30  
**Purpose:** Prioritized plan for the next deliverables; execute in order.

---

## Status

| # | Item | Status | Notes |
|---|------|--------|--------|
| 1 | Print receipt after sale | ✅ Done | POS success modal → "Print receipt" → invoice page with ?print=1 → auto-print |
| 2 | Data export (CSV backup) | ✅ Done | Settings: Export products, customers, invoices (CSV download) |
| 3 | Go-live prep doc | ✅ Done | Added to PM_STATUS § Go-live checklist |
| 4 | Phase 2 options | Backlog | Auth vs Purchasing next; document when ready |

---

## 1. Print receipt after sale

**Goal:** One tap to print receipt right after completing a sale in POS.

**Implementation:**
- After POS creates invoice: show success with **"Print receipt"** and **"Done"**.
- **Print receipt** → navigate to `/invoices/:id?print=1`.
- Invoice detail page: when `?print=1` and invoice loaded → call `window.print()` once, then clear query (optional).
- **Done** → stay on POS, clear success state.

**Files:** `POSScreen.jsx`, `InvoiceDetail.jsx`.

---

## 2. Data export (CSV backup)

**Goal:** Owner can download a backup of products, customers, or invoices as CSV.

**Implementation:**
- Add **Export** section in **Settings** (or Reports): three buttons — Export products, Export customers, Export invoices.
- Each button fetches data from Supabase and triggers a CSV download (client-side).
- CSV: simple headers + rows; dates and numbers formatted for Excel/local use.

**Files:** New `src/utils/csvExport.js`, `SettingsScreen.jsx` (or small Export component).

---

## 3. Go-live prep (document only)

**Goal:** Single checklist for data, test, and deploy.

**Implementation:**
- Add **Go-live checklist** section to `PM_STATUS.md` or a short `GO_LIVE_CHECKLIST.md`: seed data, smoke test, device test, env vars, backup, parallel run.

---

## 4. Phase 2 (later)

- **Auth / multi-user:** Supabase Auth, users/roles, RLS.
- **Purchasing:** Suppliers, purchase orders, goods receipt.
- **Advanced reports:** P&amp;L, trends, etc.

Decide after go-live and user feedback.

---

## Execution order

1. ✅ Plan written (this file).
2. Implement **Print receipt after sale**.
3. Implement **Data export (CSV)**.
4. Add **Go-live checklist** to PM_STATUS or new file.
5. Update **PM_STATUS** and **README** with completed items.
