# MAYEZ-ERP: Returns Feature Implementation Plan

## 📋 Executive Summary

**Objective:** Implement returns/refunds functionality to complete Phase 1 scope

**Scope:**
- Returns UI in Invoice Detail screen
- Stock restoration for returned items
- Invoice status updates (refunded/partial)
- Customer debt adjustment for unpaid invoices
- Return history tracking per invoice

**Estimated Effort:** 1-2 days
**Files to Modify:** 3 core files
**New Files:** 0 (using existing infrastructure)

---

## ✅ Implementation Status (Updated)

| Item | Status | Notes |
|------|--------|------|
| Returns UI in Invoice Detail | ✅ Done | Process Return button, modal, item selection, reason, summary |
| Stock restoration | ✅ Done | `recordStockMovement` with type `'return'` in `useInvoices.js` |
| Invoice status (refunded/partial) | ✅ Done | Full return → `refunded`; partial → status unchanged |
| Refunded status in DB | ✅ Done | `supabase/add_refunded_status.sql` applied |
| Customer debt adjustment | ⏳ Optional | Not in current code; add if unpaid/partial returns should reduce debt |
| Return history on invoice | ⏳ Optional | Requires `returns` + `return_items` tables (see File 3); not in UI yet |
| Toasts | ✅ Done | Custom toast state in `InvoiceDetail.jsx` (not react-hot-toast) |

**Phase 1 Returns:** Core flow is **implemented**. Optional: debt adjustment for unpaid invoices, return history table + UI.

### Implementation notes (actual code)
- **InvoiceDetail:** `src/components/invoices/InvoiceDetail.jsx` — uses `items` from `invoice_items` (loaded separately), `line_total` / `unit_price` (not `subtotal`/`price`). Toast is local state, not `react-hot-toast`.
- **useInvoices:** `processInvoiceReturn` is a standalone export; `recordStockMovement(productId, quantity, movementType, referenceType, referenceId, reason, notes)` — for returns, quantity is restored (return type adds back stock).
- **DB:** `invoice_items` has `line_total`, `unit_price`; `add_refunded_status.sql` adds `refunded` to `invoice_status`.

---

## 🎯 User Story

**As a** store manager  
**I want to** process returns for sold items  
**So that** inventory is accurate and customer accounts are properly adjusted

### Acceptance Criteria
✅ Can process full or partial returns from paid/partial invoices  
✅ Stock quantities are restored for returned items  
✅ Invoice status updates to 'refunded' for full returns  
✅ Customer debt is reduced if invoice was unpaid/partial  
✅ Return history is visible on invoice detail page  
✅ Success/error messages guide the user through the flow  

---

## 📐 Technical Architecture

### Data Flow
```
User clicks "Process Return"
    ↓
Modal shows invoice items
    ↓
User selects items + reason
    ↓
User confirms return
    ↓
System processes:
  1. Restore stock (recordStockMovement)
  2. Update invoice status
  3. Adjust customer debt (if applicable)
  4. Create return record
    ↓
Success message + refresh UI
```

### Database Operations
- **Read:** invoice with items and customer data
- **Write:** 
  - stock_movements (via recordStockMovement)
  - invoices.status update
  - customers.debt update (conditional)
  - No new table needed (returns tracked via stock_movements)

### State Management
- Local component state for modal visibility
- Selected items tracking
- Loading/processing states
- Toast notifications for feedback

---

## 📁 Implementation Files

### File 1: src/screens/InvoiceDetail.jsx
**Purpose:** Add returns UI and modal

**Current State:** Displays invoice details, payment recording, print functionality

**Changes Required:**

#### A. Imports (Add at top)
```jsx
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
```

#### B. New State Variables (After existing useState)
```jsx
const [showReturnModal, setShowReturnModal] = useState(false);
const [selectedItems, setSelectedItems] = useState([]);
const [returnReason, setReturnReason] = useState('');
const [isProcessingReturn, setIsProcessingReturn] = useState(false);
```

#### C. Handler Function (After existing functions)
```jsx
const handleProcessReturn = async () => {
  // Validation
  if (selectedItems.length === 0) {
    toast.error('Please select at least one item to return');
    return;
  }
  
  if (!returnReason) {
    toast.error('Please select a return reason');
    return;
  }

  setIsProcessingReturn(true);
  
  try {
    // Call hook function
    await processInvoiceReturn(invoice.id, selectedItems, returnReason);
    
    toast.success('Return processed successfully');
    setShowReturnModal(false);
    setSelectedItems([]);
    setReturnReason('');
    
    // Refresh invoice data (depends on your data fetching pattern)
    // May need to call refetch() or reload the page
  } catch (error) {
    console.error('Return processing error:', error);
    toast.error('Failed to process return: ' + error.message);
  } finally {
    setIsProcessingReturn(false);
  }
};
```

#### D. Return Button (In header section, after existing action buttons)
```jsx
{/* Show return button only for paid/partial invoices */}
{(invoice.status === 'paid' || invoice.status === 'partial') && (
  <button
    onClick={() => setShowReturnModal(true)}
    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
  >
    <ArrowUturnLeftIcon className="w-5 h-5" />
    Process Return
  </button>
)}
```

#### E. Return Modal (Before closing return statement)
```jsx
{/* Return Modal */}
{showReturnModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      {/* Modal Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Process Return</h3>
        <button
          onClick={() => {
            setShowReturnModal(false);
            setSelectedItems([]);
            setReturnReason('');
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      {/* Items Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select Items to Return:
        </label>
        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
          {invoice.items.map((item) => (
            <label 
              key={item.id} 
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedItems.some(si => si.id === item.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems([...selectedItems, item]);
                  } else {
                    setSelectedItems(selectedItems.filter(si => si.id !== item.id));
                  }
                }}
                className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
              />
              <div className="flex-1">
                <div className="font-medium">{item.product_name}</div>
                <div className="text-sm text-gray-600">
                  Qty: {item.quantity} × ${item.price.toFixed(2)} = ${item.subtotal.toFixed(2)}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Return Reason */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Reason for Return:
        </label>
        <select
          value={returnReason}
          onChange={(e) => setReturnReason(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">Select reason...</option>
          <option value="damaged">Damaged Product</option>
          <option value="wrong_item">Wrong Item</option>
          <option value="customer_changed_mind">Customer Changed Mind</option>
          <option value="defective">Defective Product</option>
          <option value="expired">Expired Product</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Return Summary */}
      {selectedItems.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm font-medium text-yellow-800 mb-1">
            Return Summary:
          </div>
          <div className="text-sm text-yellow-700">
            Items: {selectedItems.length} | 
            Total Amount: ${selectedItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}
          </div>
          <div className="text-xs text-yellow-600 mt-1">
            Stock will be restored for all selected items
          </div>
        </div>
      )}

      {/* Modal Actions */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => {
            setShowReturnModal(false);
            setSelectedItems([]);
            setReturnReason('');
          }}
          disabled={isProcessingReturn}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={handleProcessReturn}
          disabled={isProcessingReturn || selectedItems.length === 0 || !returnReason}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isProcessingReturn && (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          )}
          {isProcessingReturn ? 'Processing...' : 'Confirm Return'}
        </button>
      </div>
    </div>
  </div>
)}
```

#### F. Return History Section (After invoice items table, before payment records)
```jsx
{/* Return History */}
{invoice.returns && invoice.returns.length > 0 && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
    <h4 className="font-semibold mb-3 text-yellow-800 flex items-center gap-2">
      <ArrowUturnLeftIcon className="w-5 h-5" />
      Return History
    </h4>
    <div className="space-y-3">
      {invoice.returns.map((returnRecord, idx) => (
        <div 
          key={idx} 
          className="text-sm pb-3 border-b border-yellow-200 last:border-0 last:pb-0"
        >
          <div className="flex justify-between items-start mb-1">
            <span className="font-medium text-gray-900">
              {new Date(returnRecord.created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              {returnRecord.reason.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="text-gray-600">
            Items returned: {returnRecord.items.length} • 
            Amount: ${returnRecord.total_amount.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {returnRecord.items.map(item => item.product_name).join(', ')}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

---

### File 2: src/hooks/useInvoices.js
**Purpose:** Add return processing business logic

**Current State:** Has recordPayment, recordStockMovement functions

**Changes Required:**

#### Add New Function (After recordPayment function)
```javascript
/**
 * Process a return for an invoice
 * @param {string} invoiceId - Invoice ID
 * @param {Array} returnItems - Array of items to return (from invoice.items)
 * @param {string} reason - Return reason
 */
const processInvoiceReturn = async (invoiceId, returnItems, reason) => {
  try {
    // 1. Get the full invoice with customer data
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*),
        customer:customers(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError) throw invoiceError;
    if (!invoice) throw new Error('Invoice not found');

    // 2. Restore stock for each returned item
    for (const item of returnItems) {
      await recordStockMovement(
        item.product_id,
        item.quantity,
        'return',
        `Return from invoice #${invoice.invoice_number} - Reason: ${reason}`,
        invoiceId
      );
    }

    // 3. Calculate return amount
    const returnAmount = returnItems.reduce((sum, item) => sum + item.subtotal, 0);
    
    // 4. Check if this is a full return (all items and quantities match)
    const totalItemsCount = invoice.items.length;
    const returnedItemsCount = returnItems.length;
    
    const isFullReturn = totalItemsCount === returnedItemsCount && 
      invoice.items.every(invoiceItem => 
        returnItems.some(returnItem => 
          returnItem.id === invoiceItem.id && 
          returnItem.quantity === invoiceItem.quantity
        )
      );

    // 5. Update invoice status
    const newStatus = isFullReturn ? 'refunded' : invoice.status;
    
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId);

    if (updateError) throw updateError;

    // 6. Adjust customer debt if invoice was unpaid or partial
    if (invoice.status === 'unpaid' || invoice.status === 'partial') {
      const currentDebt = invoice.customer.debt || 0;
      const newDebt = Math.max(0, currentDebt - returnAmount);
      
      const { error: debtError } = await supabase
        .from('customers')
        .update({ debt: newDebt })
        .eq('id', invoice.customer_id);

      if (debtError) throw debtError;
    }

    // 7. Create return record for history tracking
    // Note: We're storing this in stock_movements with type='return'
    // If you want separate return tracking, add a 'returns' table
    const returnRecord = {
      invoice_id: invoiceId,
      items: returnItems.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        subtotal: item.subtotal
      })),
      total_amount: returnAmount,
      reason: reason,
      created_at: new Date().toISOString()
    };

    // Store in invoice metadata or separate table
    // For now, returns are tracked via stock_movements
    
    return {
      success: true,
      returnAmount,
      isFullReturn,
      newStatus
    };

  } catch (error) {
    console.error('Error processing return:', error);
    throw error;
  }
};
```

#### Update Return Statement
```javascript
// Add processInvoiceReturn to the returned object
return {
  invoices,
  loading,
  error,
  createInvoice,
  recordPayment,
  recordStockMovement,
  processInvoiceReturn, // ADD THIS LINE
};
```

---

### File 3: src/hooks/useInvoices.js (Alternative: Add returns table)
**Purpose:** If you want proper return history tracking

**Optional Enhancement:** Create a returns table in Supabase

#### SQL Migration (Run in Supabase SQL Editor)
```sql
-- Create returns table for proper tracking
CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  return_number TEXT UNIQUE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

-- Create return_items table
CREATE TABLE IF NOT EXISTS return_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_returns_invoice ON returns(invoice_id);
CREATE INDEX idx_return_items_return ON return_items(return_id);

-- Add RLS policies
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for returns" ON returns FOR ALL USING (true);
CREATE POLICY "Enable all access for return_items" ON return_items FOR ALL USING (true);
```

#### Updated processInvoiceReturn with proper tracking
```javascript
// ... (same code as before until step 7)

// 7. Create return record in database
const returnNumber = `RET-${Date.now()}`;

const { data: returnRecord, error: returnError } = await supabase
  .from('returns')
  .insert({
    invoice_id: invoiceId,
    return_number: returnNumber,
    total_amount: returnAmount,
    reason: reason,
    created_by: 'system' // or actual user if you have auth
  })
  .select()
  .single();

if (returnError) throw returnError;

// 8. Create return items
const returnItemsData = returnItems.map(item => ({
  return_id: returnRecord.id,
  product_id: item.product_id,
  product_name: item.product_name,
  quantity: item.quantity,
  price: item.price,
  subtotal: item.subtotal
}));

const { error: itemsError } = await supabase
  .from('return_items')
  .insert(returnItemsData);

if (itemsError) throw itemsError;

return {
  success: true,
  returnAmount,
  isFullReturn,
  newStatus,
  returnNumber
};
```

---

## 🧪 Testing Checklist

### Manual Test Cases

#### Test 1: Full Return on Paid Invoice
1. Create invoice with 3 items
2. Mark as paid
3. Open invoice detail
4. Click "Process Return"
5. Select all items
6. Choose reason "Damaged Product"
7. Confirm return
8. **Expected:**
   - Success toast appears
   - Invoice status = 'refunded'
   - Stock increased for all 3 items
   - Return history shows in invoice

#### Test 2: Partial Return
1. Create invoice with 3 items
2. Mark as paid
3. Process return for 2 items only
4. **Expected:**
   - Invoice status stays 'paid'
   - Only 2 items' stock restored
   - Return history shows 2 items

#### Test 3: Return on Unpaid Invoice
1. Create invoice with total $100
2. Leave as unpaid
3. Customer should have $100 debt
4. Process full return
5. **Expected:**
   - Customer debt reduced to $0
   - Invoice status = 'refunded'
   - Stock restored

#### Test 4: Validation Errors
1. Click "Process Return"
2. Click "Confirm" without selecting items
3. **Expected:** Error toast "Please select at least one item"
4. Select items but no reason
5. **Expected:** Error toast "Please select a return reason"

#### Test 5: Return History Display
1. Process 2 returns on same invoice (partial)
2. Refresh page
3. **Expected:** Both returns shown in history section
4. Each shows: date, reason, items count, amount

### Edge Cases
- [ ] Invoice with single item (full return)
- [ ] Invoice already refunded (button should not show)
- [ ] Return on invoice with discount applied
- [ ] Multiple partial returns until full return
- [ ] Database connection error during return
- [ ] Customer with $0 debt gets return (debt stays $0)

---

## 🚀 Deployment Steps

### 1. Pre-Deployment
```bash
# Ensure all dependencies installed
npm install

# Run lint
npm run lint

# Test build
npm run build
```

### 2. Database Migration (If using returns table)
```bash
# Run SQL in Supabase dashboard > SQL Editor
# Copy SQL from "File 3: Optional Enhancement" section
```

### 3. Code Review Checklist
- [ ] All toast messages are user-friendly
- [ ] Loading states prevent duplicate clicks
- [ ] Error handling covers all failure points
- [ ] Stock movements have descriptive notes
- [ ] Invoice status logic is correct
- [ ] Customer debt calculation is accurate
- [ ] UI is responsive on mobile

### 4. Deployment
```bash
# Build production
npm run build

# Deploy to your hosting (Vercel/Netlify)
# Ensure environment variables are set
```

### 5. Post-Deployment Testing
- [ ] Process test return in production
- [ ] Verify Supabase logs show correct queries
- [ ] Check stock quantities update
- [ ] Verify customer debt calculations
- [ ] Test on mobile device

---

## 📊 Success Metrics

### Phase 1 Completion
- [x] POS functionality
- [x] Products management
- [x] Customers management
- [x] Invoices and payments
- [x] Inventory tracking
- [x] Reports
- [x] Settings
- [x] **Returns/Refunds** ← Implemented (core flow)
- [ ] Print receipt after sale (optional)

### User Impact
- Reduce manual stock adjustments
- Accurate customer debt tracking
- Complete audit trail for returns
- Faster return processing

---

## 🔧 Troubleshooting Guide

### Issue: "Cannot read property 'items' of undefined"
**Solution:** Invoice data not loaded yet. Add loading check:
```jsx
{!invoice ? <LoadingSpinner /> : /* rest of component */}
```

### Issue: Stock not restoring
**Solution:** Check recordStockMovement function exists in useInvoices.js
Verify product_id is correct in return items

### Issue: Modal not closing after return
**Solution:** Ensure setShowReturnModal(false) is called in try block after success

### Issue: Customer debt not updating
**Solution:** Verify invoice.customer is populated in SQL query
Check debt calculation logic for edge cases

---

## 📝 Next Steps After Implementation

### Immediate (Option B: Polish)
1. Add loading states to all data fetches
2. Add empty states ("No returns yet")
3. Replace remaining alert() with toasts
4. Create smoke test document

### Short-term (Option C: Deploy)
1. Deploy to staging environment
2. User acceptance testing with staff
3. Gather feedback on returns flow
4. Deploy to production

### Long-term (Option D: Phase 2)
1. Multi-user authentication
2. Role-based permissions (only managers can process returns)
3. Return analytics in reports
4. Email notifications for returns

---

## 📞 Support

### Code Questions
- Review existing patterns in POSScreen.jsx for UI consistency
- Check useInvoices.js for database query patterns
- Follow toast notification pattern from existing components

### Database Questions
- Check Supabase dashboard for query logs
- Verify RLS policies allow inserts/updates
- Use Supabase SQL editor to test queries directly

---

**Document Version:** 1.1  
**Last Updated:** January 30, 2026  
**Author:** PM for MAYEZ-ERP  
**Status:** Implemented (core). Optional: customer debt on unpaid returns, return history table + UI.
