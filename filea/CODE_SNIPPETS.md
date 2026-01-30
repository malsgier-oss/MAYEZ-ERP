# MAYEZ-ERP: Returns Feature - Code Snippets

This file contains all exact code snippets ready to copy/paste into Cursor.

---

## 📁 FILE 1: src/screens/InvoiceDetail.jsx

### STEP 1: Add Import at Top
```jsx
// ADD THIS to existing imports
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
```

### STEP 2: Add State Variables (after existing useState calls)
```jsx
// ADD THESE state variables
const [showReturnModal, setShowReturnModal] = useState(false);
const [selectedItems, setSelectedItems] = useState([]);
const [returnReason, setReturnReason] = useState('');
const [isProcessingReturn, setIsProcessingReturn] = useState(false);
```

### STEP 3: Add Handler Function (after existing functions)
```jsx
// ADD THIS handler function
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
    
    // Refresh invoice data - adjust this based on your data fetching
    window.location.reload(); // Simple solution, or implement refetch
  } catch (error) {
    console.error('Return processing error:', error);
    toast.error('Failed to process return: ' + error.message);
  } finally {
    setIsProcessingReturn(false);
  }
};
```

### STEP 4: Add Return Button (in header section with other action buttons)
```jsx
{/* ADD THIS button - show only for paid/partial invoices */}
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

### STEP 5: Add Return Modal (before the final closing return statement)
```jsx
{/* ADD THIS entire modal component */}
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
          className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
        >
          ×
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

### STEP 6: Add Return History Section (optional - shows past returns)
```jsx
{/* ADD THIS section after invoice items table, before payment records */}
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

## 📁 FILE 2: src/hooks/useInvoices.js

### STEP 1: Add processInvoiceReturn Function (after recordPayment function)
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

### STEP 2: Export the Function (update return statement)
```javascript
// FIND the return statement at end of useInvoices hook
// ADD processInvoiceReturn to the returned object:

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

## 📁 FILE 3: OPTIONAL - Database Schema for Return Tracking

If you want proper return history (not just stock movements), run this SQL in Supabase:

```sql
-- Create returns table
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

-- Add indexes for performance
CREATE INDEX idx_returns_invoice ON returns(invoice_id);
CREATE INDEX idx_return_items_return ON return_items(return_id);

-- Enable Row Level Security
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;

-- Add policies (adjust based on your auth setup)
CREATE POLICY "Enable all access for returns" ON returns FOR ALL USING (true);
CREATE POLICY "Enable all access for return_items" ON return_items FOR ALL USING (true);
```

### If using returns table, update processInvoiceReturn:
```javascript
// REPLACE step 6 in processInvoiceReturn with this:

// 6. Create return record in database
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

// 7. Create return items
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
```

### And update invoice query to fetch returns:
```javascript
// In InvoiceDetail.jsx or wherever you fetch invoice data
// UPDATE your invoice query to include returns:

const { data: invoice, error } = await supabase
  .from('invoices')
  .select(`
    *,
    items:invoice_items(*),
    customer:customers(*),
    returns:returns(
      *,
      items:return_items(*)
    )
  `)
  .eq('id', invoiceId)
  .single();
```

---

## 🧪 Quick Test Script

After implementing, run these tests:

### Test 1: Basic Return Flow
```
1. Navigate to any paid invoice
2. Should see orange "Process Return" button
3. Click it
4. Modal should open with all invoice items
5. Select 1-2 items
6. Choose a reason
7. Click "Confirm Return"
8. Should see success toast
9. Page should refresh
10. Stock should increase for selected items
```

### Test 2: Validation
```
1. Open return modal
2. Click "Confirm Return" without selecting items
3. Should see error: "Please select at least one item to return"
4. Select items but leave reason empty
5. Should see error: "Please select a return reason"
```

### Test 3: Full Return
```
1. Create invoice with 2 items
2. Mark as paid
3. Process return for BOTH items
4. Invoice status should change to "refunded"
5. Button should disappear (only shows for paid/partial)
```

### Test 4: Debt Adjustment
```
1. Create invoice for $100
2. Leave as unpaid (customer debt = $100)
3. Process full return
4. Customer debt should become $0
5. Invoice status = "refunded"
```

---

## 📝 Implementation Checklist

- [ ] Step 1: Update InvoiceDetail.jsx imports
- [ ] Step 2: Add state variables to InvoiceDetail.jsx
- [ ] Step 3: Add handleProcessReturn function
- [ ] Step 4: Add "Process Return" button
- [ ] Step 5: Add return modal JSX
- [ ] Step 6: (Optional) Add return history section
- [ ] Step 7: Add processInvoiceReturn to useInvoices.js
- [ ] Step 8: Export processInvoiceReturn function
- [ ] Step 9: (Optional) Run SQL to create returns table
- [ ] Step 10: Test all flows
- [ ] Step 11: Verify stock restoration works
- [ ] Step 12: Verify customer debt adjustment works
- [ ] Step 13: Check mobile responsiveness
- [ ] Step 14: Deploy to production

---

## 🆘 Common Issues & Fixes

### Issue: "processInvoiceReturn is not defined"
**Fix:** Make sure you exported it from useInvoices.js and imported it properly in InvoiceDetail.jsx

### Issue: "Cannot read property 'items' of undefined"
**Fix:** Invoice data hasn't loaded yet. Add a check:
```jsx
if (!invoice) return <div>Loading...</div>;
```

### Issue: Modal won't close
**Fix:** Check console for errors. Make sure setShowReturnModal(false) is being called

### Issue: Stock not updating
**Fix:** Verify recordStockMovement function exists and works
Check that product_id is correct in returnItems

### Issue: Toast not showing
**Fix:** Make sure toast library is imported
```jsx
import { toast } from 'react-hot-toast'; // or your toast library
```

---

**Ready to implement?** Start with FILE 1, then FILE 2, test thoroughly, and optionally add FILE 3 for proper return tracking.
