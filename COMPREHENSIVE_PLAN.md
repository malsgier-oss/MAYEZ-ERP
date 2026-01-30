# MAYEZ-ERP: Comprehensive Plan

**Document Version:** 1.0  
**Last Updated:** 2026-01-30  
**Purpose:** Single reference for project status, roadmap, development, testing, deployment, and operations.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Assessment](#2-current-state-assessment)
3. [Phase 1 Completion Plan](#3-phase-1-completion-plan)
4. [Roadmap: Phases 2 & 3](#4-roadmap-phases-2--3)
5. [Development Plan](#5-development-plan)
6. [Testing & QA Strategy](#6-testing--qa-strategy)
7. [Deployment & Go-Live](#7-deployment--go-live)
8. [Maintenance & Operations](#8-maintenance--operations)
9. [Risk Mitigation](#9-risk-mitigation)
10. [Reference Documents](#10-reference-documents)

---

## 1. Executive Summary

### Vision

**MAYEZ-ERP** is a sales-first ERP for small businesses. Phase 1 replaces the cash register + notebook with a fast POS, product catalog, invoices, customer debt tracking, inventory, and basic reports.

### Stack

| Layer        | Technology              |
|-------------|-------------------------|
| Frontend    | Vite, React 18, React Router 6 |
| State       | Zustand (cart)          |
| Backend/DB  | Supabase                |
| Styling     | Tailwind CSS            |

### Success Criteria (Phase 1)

- Complete a sale in **&lt; 30 seconds**
- Staff adoption within **3 days**
- **Zero** sales blocked by system issues
- Owner can see daily sales and customer debt in &lt; 5 minutes

---

## 2. Current State Assessment

### Implemented (Phase 1 Scope)

| Area           | Status   | Notes |
|----------------|----------|--------|
| **POS**        | ✅ Done  | Cart, product search, customer select, Cash/Credit, discount, complete sale |
| **Products**   | ✅ Done  | List, add, edit; SKU, price, unit, stock, low-stock threshold |
| **Customers**  | ✅ Done  | List, add, detail, debt, payment on account |
| **Invoices**   | ✅ Done  | History, filter, detail, record payment, print |
| **Returns**    | ✅ Done  | Process return from invoice, stock restore, status (refunded/partial), optional debt adjustment |
| **Inventory**  | ✅ Done  | Stock list, low-stock filter, adjust stock with reason, movement history |
| **Reports**    | ✅ Done  | Daily sales, customer debt, low stock, top 10 products |
| **Settings**   | ✅ Done  | Business name, address, currency, receipt footer (browser storage) |

### Gaps & Optional (Phase 1)

| Item | Priority | Effort | Notes |
|------|----------|--------|--------|
| Customer debt adjustment on unpaid/partial returns | Optional | Low | If not done: document behavior; add in Phase 2 if needed |
| Return history table + UI on invoice detail | Optional | Medium | Currently tracked via `stock_movements`; add `returns`/`return_items` if audit trail required |
| Print receipt immediately after sale | Optional | Low | Per design doc; confirm with stakeholder |
| Seed data & real-device testing | Required before go-live | Low | Use real products/customers; test on tablet |
| Smoke test & UAT | Required before go-live | 1–2 days | Use `filea/TESTING_CHECKLIST.md` |

### Out of Scope (Phase 1 – Do Not Add)

- Multi-user / roles, barcode scanning, purchase orders, suppliers, expenses, bank reconciliation  
- Multi-currency, tax engine, offline sync, native mobile app  
- See `document.md` § Phase 1 OUT-OF-SCOPE for full list  

---

## 3. Phase 1 Completion Plan

### Step 1: Confirm Scope (Stakeholder)

- [ ] Review Phase 1 feature list with shop owner
- [ ] Confirm optional items: return history table, print-after-sale, debt on returns
- [ ] Lock Phase 1 scope (no new features; backlog for Phase 2)

### Step 2: Polish & Optional Features (If Any)

- [ ] Implement chosen optional items (see table above)
- [ ] Replace any remaining `alert()` with toasts
- [ ] Add loading/empty states where missing
- [ ] Ensure all forms validate and show clear errors

### Step 3: Data & Environment

- [ ] Seed Supabase with **real** products (not dummy data)
- [ ] Seed 5–10 real customers
- [ ] Verify `.env` and Supabase URL/keys for target environment
- [ ] Run `supabase/schema.sql` and `add_refunded_status.sql` if not already applied

### Step 4: Testing

- [ ] Run full manual smoke test (create sale → payment → return → inventory adjust → reports)
- [ ] Execute Returns test suite from `filea/TESTING_CHECKLIST.md`
- [ ] Test on **actual tablet** (touch targets, orientation)
- [ ] Test with throttled network (DevTools)
- [ ] Print test invoice on real printer

### Step 5: Documentation & Handoff

- [ ] One-page “Help” / cheat sheet (PDF) for staff
- [ ] Document known limitations and workarounds
- [ ] Confirm backup/restore process (Supabase)

### Step 6: Go-Live Decision

- [ ] All critical tests passed
- [ ] Owner and at least one staff member trained
- [ ] Go-live date set; parallel run planned (old + new system for ~1 week)

---

## 4. Roadmap: Phases 2 & 3

### Phase 2: ERP Expansion (4–6 weeks)

**Goal:** Professional business management.

| Deliverable | Description |
|-------------|-------------|
| Multi-user & roles | Owner, Cashier, Inventory Manager, Accountant; permissions per `document.md` |
| Purchasing | Suppliers, purchase orders, goods receipt, purchase invoice matching |
| Inventory | Receiving, automated low-stock alerts, better accuracy target (&gt; 95%) |
| Reporting | P&amp;L, sales analytics, profit margins, trends, customer analysis |
| Customers | Credit limits, price levels (wholesale/retail) |
| Finance | Expense tracking, bank reconciliation |
| Optional | Batch/lot tracking for factory prep |

**Success:** Owner reviews business health in &lt; 5 min/day; purchasing and inventory decisions data-driven.

### Phase 3: Factory Integration (6–8 weeks)

**Goal:** Manage production.

| Deliverable | Description |
|-------------|-------------|
| BOM | Bill of Materials per finished product |
| Production orders | Create, track, complete |
| Raw materials | Consumption, WIP, factory output → shop inventory |
| Costing | Production costing, waste/scrap tracking |
| Scheduling | Production scheduling (basic) |

**Success:** True production cost per item; production planned from sales demand; raw material ordering optimized.

### Decision Rule

- **Phase 1:** Ship when MVP is stable and adopted; no scope creep.
- **Phase 2:** Start after Phase 1 is in production and feedback is collected.
- **Phase 3:** Start when business has real factory/production needs.

---

## 5. Development Plan

### Phase 1 Remaining Work (If Any)

| Sprint/Task | Scope | Duration |
|-------------|--------|----------|
| Optional returns polish | Debt adjustment for unpaid returns; return history table + UI | 0.5–1 day |
| Print after sale | Receipt print right after completing sale | 0.5 day |
| Smoke test & fixes | Full flow test; fix bugs | 1 day |
| UAT & device test | Staff testing on tablet; fixes | 1–2 days |
| Docs & go-live prep | Help sheet, backup check, training | 0.5 day |

### Phase 2 High-Level Sprints (Reference)

| Sprint | Focus | Duration |
|--------|--------|----------|
| 2.1 | Auth (Supabase Auth), User + Role tables, RLS | 1 week |
| 2.2 | Dashboard (today’s sales, debt, low stock, recent invoices) | 0.5 week |
| 2.3 | Suppliers + Purchase Orders (CRUD, list, status) | 1 week |
| 2.4 | Goods receipt, stock from PO, inventory accuracy | 1 week |
| 2.5 | Expenses, P&amp;L report, sales trends | 1 week |
| 2.6 | Price levels, customer credit limits, bank reconciliation | 0.5–1 week |

### Cursor / Dev Conventions

- **Work units:** Use the task template in `document.md` (§ Cursor Guidance) for each feature.
- **Scope:** One clear task per unit; no “add inventory management” – use “Add stock adjustment modal with reason dropdown.”
- **Stack:** Keep using Zustand/Context where appropriate; avoid Redux/sagas unless justified.
- **UI:** Functional first (Tailwind); avoid heavy design systems in Phase 1.

---

## 6. Testing & QA Strategy

### Phase 1

| Type | When | How |
|------|------|-----|
| **Manual smoke** | Before every release | Create product → sale → payment → return → adjust stock → check reports |
| **Returns** | After any change to returns flow | Follow `filea/TESTING_CHECKLIST.md` |
| **Device** | Before go-live | Real tablet; portrait; touch targets ≥ 60px |
| **Network** | Before go-live | Throttle to “Slow 3G”; ensure errors are visible and retry possible |

### Phase 2+

- **Critical path:** Automate invoice calculation, stock deduction, payment allocation (e.g. Vitest).
- **Integration:** Key flows (sale, return, PO receipt) as integration tests.

### Sign-Off Before Production

- [ ] All smoke tests pass
- [ ] Returns checklist completed (or documented exceptions)
- [ ] No critical/open bugs
- [ ] Owner or delegate has approved for go-live

---

## 7. Deployment & Go-Live

### Pre-Launch Checklist

- [ ] `npm run build` succeeds
- [ ] Environment variables set (e.g. Vercel/Netlify): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] Supabase project is production (or dedicated staging)
- [ ] Database migrations applied (`schema.sql`, `add_refunded_status.sql`)
- [ ] Backup strategy confirmed (Supabase backups + optional export)
- [ ] Help sheet and contact for support ready

### Go-Live Strategy

1. **Parallel run:** 1 week with old system (cash register + notebook) alongside MAYEZ-ERP.
2. **Training:** 1 staff member fully trained; owner available first 3 days.
3. **Support:** Daily 15 min check-in for first week; log issues and quick fixes.
4. **Rollback:** Keep old process until confidence is high.

### Post Go-Live (First Month)

- [ ] Daily: Check Supabase logs for errors
- [ ] Weekly: Review low stock, customer debt, and top sales with owner
- [ ] Collect feedback for Phase 2 backlog

---

## 8. Maintenance & Operations

### Daily (Automated / Quick Check)

- Supabase backups (platform default)
- Optional: Quick check dashboard for failed syncs or errors

### Weekly (Manual)

- Physical stock count for a sample (e.g. 20% of products)
- Customer debt follow-up list
- Review top 10 products and low-stock list

### Monthly

- Full inventory audit (when in Phase 2)
- Review low-stock thresholds
- Optional: Archive old invoices (Phase 2)
- Test restore from backup

---

## 9. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **POS slow** | Indexes on product name, customer name, invoice number; pagination; target &lt; 2 s search, &lt; 1 s save |
| **Negative stock** | DB constraint `stock >= 0`; optimistic locking; real-time stock in POS; manual adjust if needed |
| **Staff resistance** | Involve staff in UAT; ensure POS is faster than old method; train on real data |
| **Data loss** | Supabase backups; weekly export if desired; test restore monthly |
| **Scope creep** | Lock Phase 1 scope; put new ideas in Phase 2 backlog; ship working over perfect |
| **Debt disputes** | Print payment receipts; return history (optional); clear “Collect Payment” and history on customer |

See `document.md` § Key Risks & Failure Points for full list and details.

---

## 10. Reference Documents

| Document | Purpose |
|----------|---------|
| **README.md** | Setup, stack, Phase 1 feature list |
| **document.md** | Full vision, phases, data model, UX, risks, Cursor guidance |
| **filea/RETURNS_IMPLEMENTATION_PLAN.md** | Returns feature spec and implementation status |
| **filea/TESTING_CHECKLIST.md** | Returns and general testing checklist |
| **filea/CODE_SNIPPETS.md** | Reusable code patterns (if present) |
| **supabase/schema.sql** | Database schema |
| **supabase/add_refunded_status.sql** | Refunded status for invoices |

---

## Quick Status Summary

| Phase   | Status      | Next Action |
|---------|-------------|-------------|
| **Phase 1** | Near complete | Confirm optional items → test → go-live |
| **Phase 2** | Not started  | After Phase 1 stable and feedback collected |
| **Phase 3** | Not started  | When factory/production is a real requirement |

---

**Document Owner:** Project / PM  
**Review:** After each phase or when scope or timeline changes.
