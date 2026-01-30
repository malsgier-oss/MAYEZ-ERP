# MAYEZ-ERP — PM Status

**Last updated:** 2026-01-30  
**Phase:** 1 (MVP) — completion & go-live prep  
**Owner:** PM

---

## Status at a glance

| Area | Status | Notes |
|------|--------|--------|
| **Phase 1 features** | ✅ Complete | POS, products, customers, invoices, returns, inventory, reports, settings |
| **Polish** | ✅ Done | Last `alert()` replaced with toast (record payment) |
| **Build** | ✅ Passing | `npm run build` succeeds |
| **Scope lock** | ⏳ Pending | Stakeholder sign-off on Phase 1 scope |
| **Categories & photos** | ✅ Done | Categories + product photos (upload, thumbnail) |
| **Phase 2** | 🔄 Started | Dashboard, Categories, Product photos implemented |
| **Go-live** | ⏳ Not set | After smoke test, UAT, device test |
| **Seed & help** | ✅ Ready | `supabase/seed_example.sql`, `supabase/add_customers_debt.sql`, `STAFF_HELP.md` |

---

## Decisions needed

1. **Phase 1 scope lock**  
   Confirm with shop owner: Phase 1 is complete as-is; no new features until after go-live. Optional items (print-after-sale, return history table) — include now or backlog?

2. **Categories & product photos**  
   Planned in `PHOTOS_CATEGORIES_PLAN.md`. Treat as **post–Phase 1** (after go-live) unless owner explicitly asks for them before launch.

3. **Go-live date**  
   Set after: seed data, smoke test, and at least one tablet test. Recommend 1-week parallel run (old system + MAYEZ-ERP).

---

## Next actions (priority order)

| # | Action | Owner | Done |
|---|--------|--------|------|
| 1 | Stakeholder meeting: confirm Phase 1 scope, optional items, go-live intent | PM / Owner | ☐ |
| 2 | Seed Supabase: run `supabase/seed_example.sql` (or replace with real data) | Dev / Owner | ☐ |
| 3 | Full smoke test (sale → payment → return → inventory → reports) | Dev / QA | ☐ |
| 4 | Run Returns checklist (`filea/TESTING_CHECKLIST.md`) | QA | ☐ |
| 5 | Test on target tablet (touch, orientation) | Owner / Staff | ☐ |
| 6 | One-page staff help sheet (PDF) | PM / Dev | ☑ `STAFF_HELP.md` — export to PDF for print |
| 7 | Set go-live date; plan parallel run + training | PM | ☐ |

---

## Backlog (Phase 2+)

- **Categories:** ✅ Done — CategoryList, ProductForm category, ProductList filter.
- **Product photos:** ✅ Done — upload in Product form, thumbnail in Product list; Storage bucket `product-photos` required.
- **Print receipt** right after sale (if not in Phase 1).
- **Return history table + UI** (if audit trail required).
- **Phase 2:** Multi-user, purchasing, suppliers, advanced reports (per `document.md`).

---

## Risks & mitigations

| Risk | Mitigation |
|------|-------------|
| Scope creep before go-live | Lock Phase 1; put new asks in backlog. |
| No real data for UAT | Owner provides product list + sample customers; dev/owner seed together. |
| Tablet not tested | Schedule one session on actual device before go-live. |
| Staff resistance | Involve staff in UAT; keep POS flow fast and simple. |

---

## Reference docs

- **COMPREHENSIVE_PLAN.md** — Master plan, phases, deployment.
- **document.md** — Vision, data model, UX, Cursor guidance.
- **PHOTOS_CATEGORIES_PLAN.md** — Categories & photos (post–Phase 1).
- **filea/TESTING_CHECKLIST.md** — Returns & QA.
- **filea/RETURNS_IMPLEMENTATION_PLAN.md** — Returns spec.
- **STAFF_HELP.md** — One-page staff guide (print or export to PDF).
- **supabase/seed_example.sql** — Example products/customers/categories; run after schema.
- **supabase/add_customers_debt.sql** — Add `customers.debt` for return debt adjustment.

---

*Use this file for standups, stakeholder updates, and go-live readiness. Update "Last updated" and checkboxes as actions complete.*
