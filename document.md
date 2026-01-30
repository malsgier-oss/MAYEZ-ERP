# Sales-First ERP: Pre-Project Design Document
## Implementation Blueprint for Cursor Development

**Document Version:** 1.0  
**Last Updated:** 2026-01-30  
**Status:** Ready for Development ✅

---

## Table of Contents
1. [ERP Vision & Philosophy](#1-erp-vision--philosophy)
2. [Phased Project Structure](#2-phased-project-structure)
3. [ERP Modules](#3-erp-modules)
4. [Scope Control](#4-scope-control)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Main Application Screens](#6-main-application-screens)
7. [High-Level Data Model](#7-high-level-data-model)
8. [Critical UX Principles](#8-critical-ux-principles)
9. [Key Risks & Failure Points](#9-key-risks--failure-points)
10. [Cursor Guidance](#10-cursor-guidance)
11. [Appendix: Quick Decision Matrix](#appendix-quick-decision-matrix)

---

# 1. ERP Vision & Philosophy

## Core Principles

### Sales-First Architecture
- Every design decision prioritizes speed of sale
- POS interface is the primary interface, not an afterthought
- 3 taps maximum from opening app to completing a sale
- All other features support the sales process

### Usability-First Design
- Non-technical staff must operate without training
- Touch-optimized for tablet use
- Large buttons, minimal text entry
- Forgiving error handling (undo, not warnings)

### Gradual Sophistication
- Start simple, add complexity only when proven necessary
- Each phase must be production-ready, not a prototype
- New features don't slow down existing workflows
- Data model allows growth without migration pain

### Reality-Based ERP
- Designed for actual small business chaos, not theoretical processes
- Accepts that inventory will have discrepancies
- Acknowledges that customers pay irregularly
- Built for interruptions (phone calls, walk-ins, power cuts)

---

# 2. Phased Project Structure

## Phase 1: MVP - Sales & Debt Management (3-4 weeks)

### Goal
Replace cash register + notebook system

### Deliverables
- Fast POS interface (tablet-optimized)
- Product catalog with prices
- Invoice creation and printing
- Customer debt tracking
- Payment collection
- Basic inventory levels
- Stock adjustments

### Success Metrics
- Complete a sale in < 30 seconds
- Staff adoption within 3 days
- Zero sales blocked by system issues

### Explicit Scope
- Single location only
- Single currency
- No user permissions (single user mode)
- No purchase orders
- No supplier management
- Manual inventory adjustments only
- Cash and credit payments only

---

## Phase 2: ERP Expansion (4-6 weeks)

### Goal
Professional business management

### Deliverables
- Multi-user with role-based permissions
- Purchase orders and supplier management
- Inventory receiving and tracking
- Advanced reporting (sales analytics, profit margins)
- Customer price levels (wholesale/retail)
- Expense tracking
- Bank reconciliation
- Automated low-stock alerts
- Batch/lot tracking (for factory products)

### Success Metrics
- Owner can review business health in < 5 minutes daily
- Purchasing decisions based on data, not guesswork
- Inventory accuracy > 95%

---

## Phase 3: Factory Integration (6-8 weeks)

### Goal
Manage production process

### Deliverables
- Bill of Materials (BOM)
- Production orders
- Raw material inventory
- Production costing
- Work-in-progress tracking
- Factory output → shop inventory flow
- Production scheduling
- Waste/scrap tracking

### Success Metrics
- Know true production cost per item
- Production planning based on sales demand
- Raw material ordering optimized

---

# 3. ERP Modules

## Module 1: Sales (POS)

### Responsibilities
- Create and manage invoices
- Apply discounts
- Record payments (cash/credit)
- Print/email receipts
- Handle returns and refunds
- Quick product search
- Real-time inventory check

### Must NOT
- Manage inventory levels (read-only)
- Create products (read-only catalog)
- Modify customer credit limits
- Generate financial reports
- Handle purchasing

### Key Interface
- Tablet-first, portrait orientation
- Large product tiles or fast search
- Numeric keypad for quantities
- One-tap payment buttons

---

## Module 2: Customers

### Responsibilities
- Customer master data (name, phone, address)
- View customer purchase history
- Track outstanding debt
- Record payments on account
- Set credit limits (Phase 2)
- Customer price levels (Phase 2)

### Must NOT
- Create invoices (that's Sales module)
- Manage inventory
- Process credit card payments directly
- Send marketing emails (out of scope)

### Key Interface
- Quick search by name or phone
- Debt summary prominently displayed
- Payment history timeline
- Simple "collect payment" button

---

## Module 3: Products & Inventory

### Responsibilities
- Product catalog (SKU, name, price, unit)
- Current stock levels per product
- Stock adjustments (manual corrections)
- Low stock thresholds
- Inventory movements log
- Inventory receiving (Phase 2)
- Batch/lot tracking (Phase 3)

### Must NOT
- Set selling prices (Product catalog does this)
- Create purchase orders (Purchasing module)
- Track production (Factory module)
- Calculate COGS automatically in Phase 1

### Key Interface
- Product list with stock levels
- Color-coded stock warnings (red = low, yellow = medium, green = good)
- Quick adjustment modal ("Fix Stock" button)
- Search and filter by category

---

## Module 4: Invoicing & Documents

### Responsibilities
- Generate invoice PDFs
- Email invoices to customers
- Invoice numbering sequence
- Invoice status (paid, partial, unpaid)
- Payment allocation
- Credit notes and returns
- Invoice search and history

### Must NOT
- Handle inventory deductions (automatic via Sales)
- Manage customer data
- Process actual payments (Sales does this)
- Generate financial statements

### Key Interface
- Clean invoice template
- Print preview
- Email send confirmation
- Status badges

---

## Module 5: Reporting (Phase 1: Basic)

### Phase 1 Responsibilities
- Daily sales summary
- Customer debt aging report
- Low stock report
- Best-selling products

### Phase 2 Additions
- Profit & loss statement
- Sales by product category
- Sales trends over time
- Customer purchase analysis
- Inventory valuation

### Must NOT
- Provide real-time dashboards (Phase 1)
- Custom report builder (over-engineering)
- Data export to Excel (Phase 2 feature)

---

## Module 6: Purchasing (Phase 2)

### Responsibilities
- Supplier management
- Purchase orders
- Goods receipt
- Purchase invoice matching
- Supplier payments
- Purchase history

### Must NOT
- Exist in Phase 1
- Handle production materials (Factory module)
- Manage inventory levels directly

---

## Module 7: Factory Production (Phase 3)

### Responsibilities
- Bill of Materials (BOM)
- Production orders
- Raw material consumption
- Production output recording
- Work-in-progress tracking
- Production costing
- Scrap/waste recording

### Must NOT
- Manage finished goods sales (Sales module)
- Handle supplier purchasing (Purchasing module)
- Exist before Phase 3

---

# 4. Scope Control

## Phase 1: IN-SCOPE (Must Have)

### Sales & POS
✅ Create invoice with multiple line items  
✅ Add products via search or browsing  
✅ Calculate totals automatically  
✅ Record cash payment  
✅ Record credit payment (debt)  
✅ Print invoice receipt  
✅ Apply manual discount (percentage or fixed amount)  
✅ Handle returns (reverse invoice)  

### Products
✅ Product list (SKU, name, price, unit, current stock)  
✅ Add/edit/delete products  
✅ Simple categories (optional grouping)  
✅ Stock level display in POS  

### Inventory
✅ View current stock per product  
✅ Manual stock adjustment (with reason note)  
✅ Stock movement history log  
✅ Low stock visual indicator  

### Customers
✅ Customer list (name, phone, total debt)  
✅ Add/edit customer  
✅ View customer debt balance  
✅ Record payment on account (reduce debt)  
✅ View customer invoice history  

### Reports (Basic)
✅ Daily sales total  
✅ Customer debt list (who owes what)  
✅ Low stock products list  
✅ Top 10 best-selling products  

---

## Phase 1: OUT-OF-SCOPE (Explicitly Excluded)

### Features
❌ Multi-user login and permissions  
❌ Barcode scanning  
❌ Customer price levels (wholesale/retail different prices)  
❌ Quantity-based pricing (bulk discounts)  
❌ Purchase orders  
❌ Supplier management  
❌ Expense tracking  
❌ Bank reconciliation  
❌ Inventory forecasting  
❌ Automated reorder points  
❌ Email/SMS notifications  
❌ Multi-location/multi-warehouse  
❌ Serial number tracking  
❌ Batch/lot tracking  
❌ Expiry date management  
❌ Production/manufacturing  
❌ Advanced analytics/dashboards  
❌ Custom report builder  
❌ Data export (Excel/CSV)  
❌ Audit trails  
❌ Document attachments  
❌ Mobile app (native)  
❌ Offline mode with sync  
❌ Multi-currency  
❌ Tax calculations (assume prices include tax)  
❌ Payment terminals integration  
❌ Accounting software integration  

### UI Complexity
❌ Customizable layouts  
❌ Theme switching  
❌ Keyboard shortcuts  
❌ Drag-and-drop  
❌ Advanced filters  

---

# 5. User Roles & Permissions

## Phase 1: Single User Mode
- No login required (or simple PIN)
- Everyone has full access
- Focus on speed, not security
- Suitable for owner-operated or trusted staff

## Phase 2: Role-Based Access

### Owner/Manager
- Full system access
- View all reports
- Manage products and prices
- Manage users
- Adjust inventory
- Delete invoices
- View financial data

### Cashier/Sales Staff
- Create invoices
- Record payments
- View product prices
- Search customers
- View (but not edit) customer debt
- Cannot adjust inventory
- Cannot view cost prices
- Cannot delete invoices

### Inventory Manager (Phase 2)
- Manage products
- Adjust inventory
- Create purchase orders
- Receive goods
- Cannot view financial reports
- Cannot manage customers

### Accountant (Phase 2)
- View all reports
- Manage expenses
- Bank reconciliation
- Cannot create invoices
- Cannot adjust inventory

---

# 6. Main Application Screens

## Phase 1 Screens

### 1. POS/Sales Screen (Primary)
- Product search/browse
- Shopping cart
- Customer selection
- Payment buttons (Cash/Credit)
- Quick actions (Clear cart, Apply discount)

### 2. Product List Screen
- All products with stock levels
- Add/Edit product button
- Search and filter
- Stock level color indicators

### 3. Product Form (Modal/Slide-over)
- Product name
- SKU (auto-generated or manual)
- Unit (pcs, kg, box, etc.)
- Selling price
- Current stock
- Low stock threshold
- Category (optional)

### 4. Customer List Screen
- All customers with debt balance
- Add customer button
- Search by name/phone
- Debt amount highlighted

### 5. Customer Detail Screen
- Customer info
- Current debt balance (prominent)
- Invoice history
- "Collect Payment" button
- Edit customer button

### 6. Invoice History Screen
- List of all invoices
- Filter by date, customer, status
- Search by invoice number
- Unpaid invoices highlighted

### 7. Invoice Detail Screen
- Full invoice view
- Line items
- Payment history
- Print/Email buttons
- Refund button (if applicable)

### 8. Inventory Screen
- All products with stock
- "Adjust Stock" button per product
- Low stock filter
- Stock movement history

### 9. Stock Adjustment Modal
- Product name (read-only)
- Current stock (read-only)
- New stock (input)
- Reason (dropdown: received, sold external, damaged, stolen, counted)
- Note (optional text)

### 10. Reports Screen
- Daily sales summary
- Customer debt report
- Low stock report
- Best sellers report
- Date range selector

### 11. Settings Screen (Basic)
- Business info (name, address, phone)
- Invoice prefix/numbering
- Currency symbol
- Receipt footer text
- Backup/restore data button

---

## Phase 2 Additional Screens

### 12. Dashboard (Home screen)
- Today's sales total
- Outstanding debt total
- Low stock count
- Recent invoices list

### 13. Purchase Order Screen
- Create PO
- PO list and status
- Receive goods
- Match supplier invoice

### 14. Supplier List Screen
- Supplier management
- Payment terms
- Purchase history

### 15. Expense Tracking Screen
- Record expenses
- Expense categories
- Payment method

### 16. Advanced Reports
- Profit & loss
- Sales trends
- Inventory valuation
- Customer analysis

### 17. User Management Screen
- Add/edit users
- Assign roles
- Activity log

---

## Phase 3 Additional Screens

### 18. Production Dashboard
- Active production orders
- Material requirements
- Production schedule

### 19. Bill of Materials Screen
- Create/edit BOMs
- Component list
- Yield calculations

### 20. Production Order Screen
- Create production order
- Record output
- Track WIP

---

# 7. High-Level Data Model

## Core Entities (Phase 1)

### Product
- `id` (UUID, primary key)
- `sku` (text, unique)
- `name` (text, required)
- `description` (text, optional)
- `category_id` (UUID, FK to Category, optional)
- `unit` (text: 'pcs', 'kg', 'box', etc.)
- `selling_price` (decimal)
- `cost_price` (decimal, Phase 2)
- `current_stock` (integer, calculated or stored)
- `low_stock_threshold` (integer)
- `is_active` (boolean, default true)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Category (Optional Phase 1)
- `id` (UUID, primary key)
- `name` (text, required)
- `parent_id` (UUID, FK to Category, for nested categories Phase 2)

### Customer
- `id` (UUID, primary key)
- `name` (text, required)
- `phone` (text)
- `email` (text, optional)
- `address` (text, optional)
- `credit_limit` (decimal, Phase 2)
- `price_level_id` (UUID, FK to PriceLevel, Phase 2)
- `notes` (text)
- `is_active` (boolean, default true)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Invoice
- `id` (UUID, primary key)
- `invoice_number` (text, auto-generated, unique)
- `customer_id` (UUID, FK to Customer, nullable for walk-in)
- `invoice_date` (date)
- `due_date` (date, optional, for credit sales)
- `subtotal` (decimal)
- `discount_amount` (decimal)
- `discount_percentage` (decimal)
- `total_amount` (decimal)
- `paid_amount` (decimal)
- `balance` (decimal, calculated: total - paid)
- `status` (enum: 'paid', 'partial', 'unpaid')
- `notes` (text)
- `created_by` (UUID, FK to User, Phase 2)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### InvoiceItem
- `id` (UUID, primary key)
- `invoice_id` (UUID, FK to Invoice)
- `product_id` (UUID, FK to Product)
- `product_name` (text, snapshot)
- `quantity` (decimal)
- `unit_price` (decimal, snapshot of price at time of sale)
- `line_total` (decimal, calculated: quantity × unit_price)
- `created_at` (timestamp)

### Payment
- `id` (UUID, primary key)
- `invoice_id` (UUID, FK to Invoice, nullable if payment on account)
- `customer_id` (UUID, FK to Customer)
- `payment_date` (date)
- `amount` (decimal)
- `payment_method` (enum: 'cash', 'credit', 'bank_transfer', etc.)
- `reference_number` (text, optional, for bank transfers)
- `notes` (text)
- `created_at` (timestamp)

### StockMovement
- `id` (UUID, primary key)
- `product_id` (UUID, FK to Product)
- `movement_type` (enum: 'sale', 'adjustment', 'return', 'receipt', 'production_in', 'production_out')
- `quantity` (decimal, positive for in, negative for out)
- `reference_type` (text: 'invoice', 'purchase_order', 'production_order', 'adjustment')
- `reference_id` (UUID, FK to referenced entity)
- `reason` (text, for adjustments)
- `notes` (text)
- `created_by` (UUID, FK to User, Phase 2)
- `created_at` (timestamp)

---

## Additional Entities (Phase 2)

### User
- `id` (UUID, primary key)
- `username` (text, unique)
- `password_hash` (text)
- `full_name` (text)
- `email` (text)
- `role_id` (UUID, FK to Role)
- `is_active` (boolean)
- `last_login` (timestamp)
- `created_at` (timestamp)

### Role
- `id` (UUID, primary key)
- `name` (text: 'Owner', 'Cashier', 'Inventory Manager', etc.)
- `permissions` (JSON or separate Permission table)

### Supplier
- `id` (UUID, primary key)
- `name` (text, required)
- `contact_person` (text)
- `phone` (text)
- `email` (text)
- `address` (text)
- `payment_terms` (text)
- `is_active` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### PurchaseOrder
- `id` (UUID, primary key)
- `po_number` (text, unique)
- `supplier_id` (UUID, FK to Supplier)
- `order_date` (date)
- `expected_delivery_date` (date)
- `status` (enum: 'draft', 'sent', 'partial', 'received', 'cancelled')
- `subtotal` (decimal)
- `total_amount` (decimal)
- `notes` (text)
- `created_by` (UUID, FK to User)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### PurchaseOrderItem
- `id` (UUID, primary key)
- `purchase_order_id` (UUID, FK to PurchaseOrder)
- `product_id` (UUID, FK to Product)
- `quantity_ordered` (decimal)
- `quantity_received` (decimal)
- `unit_cost` (decimal)
- `line_total` (decimal)

### Expense
- `id` (UUID, primary key)
- `expense_date` (date)
- `category` (text: 'rent', 'utilities', 'salaries', etc.)
- `amount` (decimal)
- `payment_method` (text)
- `supplier_id` (UUID, FK to Supplier, optional)
- `description` (text)
- `created_by` (UUID, FK to User)
- `created_at` (timestamp)

### PriceLevel (Phase 2)
- `id` (UUID, primary key)
- `name` (text: 'Retail', 'Wholesale', 'VIP')
- `is_default` (boolean)

### ProductPrice (Phase 2)
- `product_id` (UUID, FK to Product)
- `price_level_id` (UUID, FK to PriceLevel)
- `price` (decimal)
- Composite primary key: (product_id, price_level_id)

---

## Factory Entities (Phase 3)

### BillOfMaterial (BOM)
- `id` (UUID, primary key)
- `product_id` (UUID, FK to Product - finished product)
- `version` (text)
- `is_active` (boolean)
- `yield_quantity` (decimal, how many units this BOM produces)
- `notes` (text)

### BOMItem
- `id` (UUID, primary key)
- `bom_id` (UUID, FK to BillOfMaterial)
- `material_product_id` (UUID, FK to Product)
- `quantity_required` (decimal)
- `unit` (text)
- `wastage_percentage` (decimal)

### ProductionOrder
- `id` (UUID, primary key)
- `po_number` (text, unique)
- `bom_id` (UUID, FK to BillOfMaterial)
- `quantity_to_produce` (decimal)
- `quantity_produced` (decimal)
- `status` (enum: 'planned', 'in_progress', 'completed', 'cancelled')
- `start_date` (date)
- `completion_date` (date)
- `notes` (text)
- `created_by` (UUID, FK to User)

### ProductionOutput
- `id` (UUID, primary key)
- `production_order_id` (UUID, FK to ProductionOrder)
- `output_date` (date)
- `quantity_produced` (decimal)
- `quantity_scrapped` (decimal)
- `notes` (text)

### MaterialConsumption
- `id` (UUID, primary key)
- `production_order_id` (UUID, FK to ProductionOrder)
- `product_id` (UUID, FK to Product - raw material)
- `quantity_consumed` (decimal)
- `consumption_date` (date)

---

## Key Relationships

**Invoice ↔ Customer**: Many-to-One (many invoices per customer)  
**Invoice ↔ InvoiceItem**: One-to-Many (invoice has multiple line items)  
**InvoiceItem ↔ Product**: Many-to-One (references product)  
**Payment ↔ Invoice**: Many-to-One (multiple payments per invoice)  
**Payment ↔ Customer**: Many-to-One (payment on account)  
**StockMovement ↔ Product**: Many-to-One (tracks all inventory changes)  
**Customer ↔ PriceLevel**: Many-to-One (Phase 2)  
**Product ↔ Category**: Many-to-One (optional)  

---

# 8. Critical UX Principles

## Tablet POS Optimization

### Touch Target Sizing
- Minimum button size: 60×60px (80×80px preferred)
- Generous spacing between buttons (16px minimum)
- Avoid tiny icons or text links
- Fat-finger-friendly numeric input

### Speed Optimizations
- Auto-focus on search input when screen opens
- Support barcode scanner input (typed numbers + Enter)
- Recently sold products shown first
- Customer search by phone (numeric keypad)
- One-tap "Regular Customer" shortcut
- Swipe gestures for common actions

### Visual Hierarchy
- Current cart total always visible (large, top-right)
- Payment buttons: Large, color-coded (Green = Cash, Blue = Credit)
- Stock warnings: Red badge on product if low
- Customer debt: Orange/red if overdue

### Error Prevention
- Disable "Complete Sale" if cart empty
- Confirm before clearing cart with items
- Warn if selling out-of-stock item (but allow override)
- Confirm refunds

### Offline Tolerance
- Graceful degradation if connection lost
- Queue failed operations for retry
- Visual indicator of connection status
- Critical operations work offline (sale recording)

---

## General UX Rules

### Simplicity
- One primary action per screen
- Avoid dropdown menus where possible (use buttons)
- No more than 3 levels of navigation depth
- Breadcrumbs for navigation context

### Feedback
- Instant visual confirmation of actions
- Toast notifications (3 seconds max)
- Loading states for any action > 1 second
- Success animations (checkmark, green flash)

### Forgiving Design
- Undo button for critical actions
- Auto-save drafts
- Restore deleted items (soft delete)
- "Are you sure?" only for truly destructive actions

### Search-First
- Global search available everywhere
- Search by name, SKU, phone, invoice number
- Fuzzy matching (typo tolerance)
- Recent searches saved

### Accessibility
- High contrast mode option
- Large text mode option
- Keyboard navigation support (Phase 2)
- Screen reader friendly (Phase 2)

---

## Mobile-First Responsive Design

### Tablet (Primary)
- Portrait mode (768×1024)
- Two-column layout where logical
- Side-by-side product list + cart

### Desktop (Secondary)
- Use extra space for data tables
- More items visible per page
- Keyboard shortcuts enabled

### Phone (Phase 2)
- Single column
- Bottom navigation
- Simplified POS (emergency use)

---

# 9. Key Risks & Failure Points

## Technical Risks

### 1. Database Performance Degradation
**Risk:** Slow queries as data grows (10,000+ invoices)  
**Symptoms:** POS lags when searching products/customers  
**Prevention:**
- Index on: `product.name`, `customer.name`, `invoice.invoice_number`
- Pagination on all list views
- Lazy loading for invoice history
- Archive old data (Phase 2)

### 2. Stock Sync Issues
**Risk:** Race conditions causing negative stock  
**Symptoms:** Two cashiers sell last item simultaneously  
**Prevention:**
- Database-level constraints (stock >= 0)
- Optimistic locking on invoice creation
- Real-time stock refresh in POS
- Accept occasional inconsistency, provide manual fix

### 3. Offline Capability Failure
**Risk:** System unusable without internet  
**Symptoms:** Cannot complete sales during outage  
**Prevention:**
- Service worker caching (PWA)
- LocalStorage for last 50 products/customers
- Queue operations, sync when online
- Manual receipt printing as backup

---

## Business Risks

### 4. Staff Resistance to Change
**Risk:** Staff prefer paper/old system  
**Symptoms:** System unused, parallel paper records  
**Prevention:**
- Involve staff in testing
- Make POS faster than old method
- Train on actual data, not dummy data
- Gradual rollout (start with 1 cashier)

### 5. Data Entry Errors
**Risk:** Wrong prices, quantities, customers  
**Symptoms:** Inventory chaos, customer complaints  
**Prevention:**
- Large, clear price display
- Quantity defaults to 1
- Recently used customers suggested first
- Easy correction (void/refund process)

### 6. Inventory Inaccuracy Spiral
**Risk:** Physical stock ≠ system stock  
**Symptoms:** Selling items you don't have, misreporting  
**Prevention:**
- Weekly physical counts (Phase 1)
- Automatic low-stock alerts
- Investigate large discrepancies
- Accept 5% variance (Phase 1)
- Implement cycle counting (Phase 2)

---

## Scope Creep Risks

### 7. Feature Bloat in Phase 1
**Risk:** Adding "just one more thing"  
**Symptoms:** Project never finishes  
**Prevention:**
- Lock Phase 1 scope after this document
- "Phase 2" bucket for all new ideas
- Measure success by speed, not features
- Ship incomplete over perfect

### 8. Over-Engineering Data Model
**Risk:** Building for hypothetical future needs  
**Symptoms:** Complex joins, slow queries  
**Prevention:**
- Design for today's data volume (1,000 products max)
- Denormalization is fine (snapshot prices in invoices)
- No "flexible" JSON fields in Phase 1
- Migrate data in Phase 2 if needed

---

## User Experience Risks

### 9. Slow POS = Abandoned System
**Risk:** Sale takes > 1 minute  
**Symptoms:** Queue of impatient customers  
**Prevention:**
- < 2 second product search response
- < 1 second invoice save
- Optimistic UI updates
- Performance testing with 1,000+ products

### 10. Overwhelming Interface
**Risk:** Too many buttons/options  
**Symptoms:** Staff asks "how do I...?" daily  
**Prevention:**
- Primary action always obvious
- Hide advanced features behind "More" menu
- Tooltips on hover (desktop)
- One-page quick reference guide

---

## Data Integrity Risks

### 11. Lost Financial Data
**Risk:** Corrupted database, no backups  
**Symptoms:** Lost sales history, customer debt unknown  
**Prevention:**
- Daily automated backups (Supabase handles this)
- Export to CSV weekly (manual)
- Audit log for deletions (Phase 2)
- Test restore process monthly

### 12. Debt Tracking Errors
**Risk:** Customer disputes balance  
**Symptoms:** "I already paid!" conflicts  
**Prevention:**
- Payment receipts always printed
- Customer can see their own history (Phase 2 portal)
- SMS payment confirmations (Phase 2)
- Manual adjustment log with notes

---

# 10. Cursor Guidance

## How to Structure Work for Cursor

### Phase 1 Implementation Order

#### Sprint 1: Foundation (Week 1)
1. Project setup (Vite + React + Supabase)
2. Database schema (Products, Customers, Invoices tables)
3. Basic routing structure
4. Supabase auth (simple PIN)

#### Sprint 2: Core POS (Week 2)
5. Product list screen (read from Supabase)
6. Product form (CRUD operations)
7. POS screen layout (cart + product search)
8. Add products to cart (state management)
9. Calculate totals (subtotal, discount, total)

#### Sprint 3: Sales Completion (Week 3)
10. Customer selection in POS
11. Payment recording (cash/credit)
12. Invoice creation (write to database)
13. Stock deduction (StockMovement records)
14. Print receipt (basic HTML template)

#### Sprint 4: Customer & Inventory (Week 4)
15. Customer list screen
16. Customer detail (debt, history)
17. Payment on account
18. Inventory screen
19. Stock adjustment modal
20. Basic reports (daily sales, debt list)

---

## Cursor Prompting Strategy

### Anti-Pattern: Vague Requests
❌ "Build me a sales system"  
❌ "Add inventory management"  
❌ "Make it look nice"  

### Best Practice: Atomic Tasks
✅ "Create a Supabase table called 'products' with columns: id (uuid), sku (text, unique), name (text), selling_price (decimal), current_stock (integer)"

✅ "Build a React component called ProductList.jsx that fetches all products from Supabase, displays them in a grid with name and price, and has an 'Add Product' button"

✅ "Add a search input to ProductList that filters products by name in real-time as the user types"

---

## Work Unit Template for Cursor

Use this format for every task:
```
TASK: [One-sentence goal]

CONTEXT:
- Related files: [list]
- Dependencies: [what must exist first]
- Data model: [relevant tables/fields]

REQUIREMENTS:
1. [Specific requirement]
2. [Specific requirement]
3. [...]

ACCEPTANCE CRITERIA:
- [ ] [Testable outcome]
- [ ] [Testable outcome]

OUT OF SCOPE:
- [What NOT to include]

EXAMPLE:
[If UI, describe expected behavior]
```

### Example Work Unit
```
TASK: Build POS cart component with add/remove/clear functionality

CONTEXT:
- Related files: POSScreen.jsx, CartItem.jsx
- Dependencies: Product data from Supabase, Zustand store for cart state
- Data model: Product (id, name, price), CartItem (productId, quantity, lineTotal)

REQUIREMENTS:
1. Display cart items in a list (product name, quantity, line total)
2. Show running total at bottom (bold, large font)
3. "+" button to increase quantity
4. "-" button to decrease quantity (remove if quantity = 0)
5. "Clear Cart" button (confirm before clearing)
6. Empty state message: "Cart is empty"

ACCEPTANCE CRITERIA:
- [ ] Adding same product twice increases quantity (doesn't duplicate)
- [ ] Total updates immediately when quantity changes
- [ ] Clear cart shows confirmation dialog
- [ ] Cart persists if user navigates away (Zustand)

OUT OF SCOPE:
- Payment processing (separate task)
- Discount application (separate task)
- Customer selection (separate task)

EXAMPLE:
When user adds "Plastic Bag Small" ($5) qty 2, cart shows:
- Plastic Bag Small | 2 × $5.00 = $10.00
Total: $10.00
```

---

## Avoiding AI Over-Engineering

### Common Cursor Traps

#### Trap 1: Premature Abstraction
- Cursor loves creating reusable components
- Resist until you have 3+ identical patterns
- Copy-paste is fine in Phase 1

**Example:**
❌ "Create a generic form builder system"  
✅ "Create a simple Product form with 5 fields"

#### Trap 2: Enterprise Patterns
- Cursor may suggest Redux, complex state management
- Use simple tools: Zustand or Context API
- Avoid middleware, sagas, thunks

**Example:**
❌ "Set up Redux with Redux Toolkit and async thunks"  
✅ "Use Zustand for cart state with 3 actions: add, remove, clear"

#### Trap 3: Perfect UI Components
- Cursor can build beautiful Shadcn UI components
- But you need functional first, pretty later
- Use Tailwind utility classes, not custom CSS

**Example:**
❌ "Create a design system with tokens and themes"  
✅ "Use Tailwind buttons with bg-blue-500 and px-4 py-2"

#### Trap 4: Comprehensive Error Handling
- Cursor will add try-catch everywhere
- Phase 1: Basic error toasts are enough
- Don't build error boundary hierarchies yet

**Example:**
❌ "Implement error boundaries with retry logic and logging service"  
✅ "Show a toast notification if API call fails"

---

## File Structure for Cursor

Organize code to minimize context confusion:
```
/src
  /components
    /pos
      POSScreen.jsx
      Cart.jsx
      ProductSearch.jsx
    /products
      ProductList.jsx
      ProductForm.jsx
    /customers
      CustomerList.jsx
      CustomerDetail.jsx
    /shared
      Button.jsx
      Modal.jsx
  /hooks
    useProducts.js
    useInvoices.js
  /store
    cartStore.js
  /lib
    supabase.js
  /utils
    currency.js
    date.js
  App.jsx
  main.jsx
```

**Key Principles:**
- Feature folders (pos, products, customers)
- Shared components separate
- One component per file
- Colocate related components

---

## Testing Strategy (Pragmatic)

### Phase 1: Manual Testing Only
- No unit tests (move fast)
- Smoke test checklist:
  - Create product → appears in list
  - Create invoice → saves to database
  - Record payment → reduces customer debt
  - Adjust stock → updates inventory

### Phase 2: Critical Path Tests
- Test invoice calculation logic
- Test stock deduction logic
- Test payment allocation
- Use Vitest (fast, Cursor-friendly)

### Phase 3: Integration Tests
- Test production order flow
- Test BOM calculations

---

## Deployment Checklist

### Pre-Launch (Phase 1)
- [ ] Seed database with real products (not dummy data)
- [ ] Seed 5-10 real customers
- [ ] Test on actual tablet device
- [ ] Print test invoice on actual printer
- [ ] Test with slow internet (throttle in DevTools)
- [ ] Set up daily backup reminder
- [ ] Create "Help" cheat sheet (PDF)

### Go-Live
- [ ] Parallel run for 1 week (old + new system)
- [ ] Train 1 staff member fully
- [ ] Owner available for first 3 days
- [ ] Daily check-in meeting (first week)

---

## Maintenance Plan

### Daily (Automated)
- Database backup (Supabase)
- Error log review (Phase 2)

### Weekly (Manual)
- Physical stock count (at least 20% of products)
- Customer debt follow-up
- Review top 10 products

### Monthly
- Full inventory audit (Phase 2)
- Review low-stock thresholds
- Archive old invoices (Phase 2)

---

# Appendix: Quick Decision Matrix

When Cursor asks a question, use this matrix:

| Question | Phase 1 Answer | Phase 2+ |
|----------|----------------|----------|
| "Should we handle offline mode?" | Deferred (network required) | Yes, with sync |
| "Should we validate email format?" | No (optional field) | Yes |
| "Should we add user roles?" | No (single user) | Yes |
| "Should we support multiple currencies?" | No (single currency) | Maybe |
| "Should we calculate tax?" | No (prices include tax) | Maybe |
| "Should we track inventory by location?" | No (single location) | Yes (Phase 2) |
| "Should we add batch operations?" | No (one-at-a-time fine) | Yes |
| "Should we add export to Excel?" | No | Yes (Phase 2) |
| "Should we add custom fields?" | No (fixed schema) | Maybe (Phase 3) |
| "Should we add notifications?" | No | Yes (Phase 2) |

---

# Final Notes for PM/Dev Handoff

**This document is complete and ready for Cursor.**

## Next Steps
1. Review with stakeholders (shop owner)
2. Confirm Phase 1 scope (no additions)
3. Set up Supabase project
4. Begin Sprint 1 using Cursor work units
5. Daily standups (15 min) to catch scope creep

## Success Criteria for Phase 1
- Staff can complete sale in < 30 seconds
- System adopted within 3 days
- Zero critical bugs after week 1
- Owner can see daily sales and customer debt

## Remember
- Phase 1 is an MVP, not the final system
- Ship working software over perfect software
- User feedback drives Phase 2 priorities
- Cursor is a tool, not an architect—you make final decisions

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-30  
**Ready for Development:** ✅