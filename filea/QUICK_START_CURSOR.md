# MAYEZ-ERP Returns Feature: Quick Start for Cursor AI

## 🚀 30-Second Overview

**What:** Add returns/refunds feature to complete MAYEZ-ERP Phase 1  
**Where:** Invoice Detail screen  
**How:** Modal → select items → choose reason → restore stock + update invoice  
**Files:** InvoiceDetail.jsx + useInvoices.js (2 files only)  

---

## ⚡ Fast Track Implementation

### Option 1: Feed This Entire Prompt to Cursor

Copy and paste this into Cursor:

```
Implement returns feature for MAYEZ-ERP:

FILES TO MODIFY:
1. src/screens/InvoiceDetail.jsx - Add returns UI
2. src/hooks/useInvoices.js - Add business logic

REQUIREMENTS:
- Add orange "Process Return" button (only show for paid/partial invoices)
- Create modal with:
  * Checkbox list of invoice items
  * Dropdown for return reason (damaged, wrong_item, customer_changed_mind, defective, expired, other)
  * Summary showing selected items and total amount
  * Cancel and "Confirm Return" buttons
  
- When user confirms:
  * Validate: at least 1 item selected, reason chosen
  * Call processInvoiceReturn(invoiceId, selectedItems, reason)
  * Restore stock using recordStockMovement(..., 'return', ...)
  * Update invoice status to 'refunded' if all items returned
  * Reduce customer debt if invoice was unpaid/partial
  * Show success toast and refresh page

PATTERNS TO FOLLOW:
- Use ArrowUturnLeftIcon from @heroicons/react/24/outline
- Use toast notifications (existing pattern from POSScreen.jsx)
- Follow existing Tailwind styling (orange-600 for return actions)
- Use existing Supabase query patterns from useInvoices.js
- Add loading states during processing
- Disable buttons when processing

VALIDATION:
- No items selected → "Please select at least one item to return"
- No reason selected → "Please select a return reason"
- Success → "Return processed successfully"

Use the CODE_SNIPPETS.md file for exact code to implement.
```

---

### Option 2: Step-by-Step with Cursor

Feed Cursor these prompts in sequence:

#### Step 1
```
Add a "Process Return" button to src/screens/InvoiceDetail.jsx:
- Import ArrowUturnLeftIcon from @heroicons/react/24/outline
- Add button next to existing action buttons
- Only show when invoice.status is 'paid' or 'partial'
- Color: bg-orange-600
- Icon: ArrowUturnLeftIcon
- Text: "Process Return"
- Click handler: opens modal (setShowReturnModal(true))
```

#### Step 2
```
Add return modal to src/screens/InvoiceDetail.jsx:
- Add state: showReturnModal, selectedItems, returnReason, isProcessingReturn
- Create full-screen overlay modal
- Show list of invoice items with checkboxes
- Add dropdown for return reason (damaged, wrong_item, customer_changed_mind, defective, expired, other)
- Show summary of selected items
- Add Cancel and "Confirm Return" buttons
- Follow existing Tailwind patterns from the app
```

#### Step 3
```
Add return processing logic to src/screens/InvoiceDetail.jsx:
- Create handleProcessReturn async function
- Validate: selectedItems.length > 0 and returnReason is set
- Call processInvoiceReturn(invoice.id, selectedItems, returnReason)
- On success: toast.success, close modal, reload page
- On error: toast.error with message
- Show loading state during processing
```

#### Step 4
```
Add processInvoiceReturn function to src/hooks/useInvoices.js:
- Accept: invoiceId, returnItems array, reason string
- Fetch invoice with customer data
- For each returned item: call recordStockMovement(product_id, quantity, 'return', note, invoiceId)
- Calculate if full return (all items and quantities match)
- Update invoice status to 'refunded' if full return
- If invoice was unpaid/partial: reduce customer debt by return amount
- Return success data
- Export in return statement
```

#### Step 5
```
Test the implementation:
1. Create paid invoice with 3 items
2. Click "Process Return"
3. Select all items, choose reason, confirm
4. Verify: stock restored, status = 'refunded'
5. Test partial return (select 2/3 items)
6. Test validation (no items, no reason)
```

---

## 📋 Paste-Ready Code Snippets

### InvoiceDetail.jsx - Complete Modal JSX

```jsx
{showReturnModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Process Return</h3>
        <button onClick={() => { setShowReturnModal(false); setSelectedItems([]); setReturnReason(''); }} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Items to Return:</label>
        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
          {invoice.items.map((item) => (
            <label key={item.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
              <input type="checkbox" checked={selectedItems.some(si => si.id === item.id)} onChange={(e) => { if (e.target.checked) { setSelectedItems([...selectedItems, item]); } else { setSelectedItems(selectedItems.filter(si => si.id !== item.id)); } }} className="w-4 h-4" />
              <div className="flex-1">
                <div className="font-medium">{item.product_name}</div>
                <div className="text-sm text-gray-600">Qty: {item.quantity} × ${item.price.toFixed(2)} = ${item.subtotal.toFixed(2)}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Reason for Return:</label>
        <select value={returnReason} onChange={(e) => setReturnReason(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
          <option value="">Select reason...</option>
          <option value="damaged">Damaged Product</option>
          <option value="wrong_item">Wrong Item</option>
          <option value="customer_changed_mind">Customer Changed Mind</option>
          <option value="defective">Defective Product</option>
          <option value="expired">Expired Product</option>
          <option value="other">Other</option>
        </select>
      </div>

      {selectedItems.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm font-medium text-yellow-800">Return Summary:</div>
          <div className="text-sm text-yellow-700">Items: {selectedItems.length} | Total Amount: ${selectedItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}</div>
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button onClick={() => { setShowReturnModal(false); setSelectedItems([]); setReturnReason(''); }} disabled={isProcessingReturn} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
        <button onClick={handleProcessReturn} disabled={isProcessingReturn || selectedItems.length === 0 || !returnReason} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">
          {isProcessingReturn ? 'Processing...' : 'Confirm Return'}
        </button>
      </div>
    </div>
  </div>
)}
```

### useInvoices.js - processInvoiceReturn Function

```javascript
const processInvoiceReturn = async (invoiceId, returnItems, reason) => {
  try {
    const { data: invoice, error: invoiceError } = await supabase.from('invoices').select('*, items:invoice_items(*), customer:customers(*)').eq('id', invoiceId).single();
    if (invoiceError) throw invoiceError;
    if (!invoice) throw new Error('Invoice not found');

    for (const item of returnItems) {
      await recordStockMovement(item.product_id, item.quantity, 'return', `Return from invoice #${invoice.invoice_number} - Reason: ${reason}`, invoiceId);
    }

    const returnAmount = returnItems.reduce((sum, item) => sum + item.subtotal, 0);
    const isFullReturn = invoice.items.length === returnItems.length && invoice.items.every(invoiceItem => returnItems.some(returnItem => returnItem.id === invoiceItem.id && returnItem.quantity === invoiceItem.quantity));
    const newStatus = isFullReturn ? 'refunded' : invoice.status;
    
    const { error: updateError } = await supabase.from('invoices').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', invoiceId);
    if (updateError) throw updateError;

    if (invoice.status === 'unpaid' || invoice.status === 'partial') {
      const newDebt = Math.max(0, (invoice.customer.debt || 0) - returnAmount);
      const { error: debtError } = await supabase.from('customers').update({ debt: newDebt }).eq('id', invoice.customer_id);
      if (debtError) throw debtError;
    }

    return { success: true, returnAmount, isFullReturn, newStatus };
  } catch (error) {
    console.error('Error processing return:', error);
    throw error;
  }
};
```

---

## ✅ Verification Checklist

After Cursor implements, verify:

- [ ] Orange return button appears on paid invoices
- [ ] Button hidden on unpaid/refunded invoices  
- [ ] Modal opens when button clicked
- [ ] All invoice items shown with checkboxes
- [ ] Reason dropdown has 6 options
- [ ] Can't submit without items or reason
- [ ] Processing shows loading state
- [ ] Success toast appears
- [ ] Stock increases correctly
- [ ] Invoice status updates to 'refunded' for full returns
- [ ] Customer debt reduces for unpaid invoices

---

## 🎯 Success = Phase 1 Complete!

Once returns work, your Phase 1 checklist is DONE:
- ✅ POS
- ✅ Products  
- ✅ Customers
- ✅ Invoices
- ✅ Inventory
- ✅ Reports
- ✅ Settings
- ✅ **Returns** ← This feature!

Next steps: Polish (Option B) → Deploy (Option C) → Phase 2 features

---

## 🆘 If Cursor Gets Stuck

### Common Issues & Fixes

**"Can't find recordStockMovement"**
→ Make sure it's exported from useInvoices.js

**"Modal won't close"**  
→ Check setShowReturnModal(false) is in try block

**"Stock not updating"**
→ Verify product_id is correct in returnItems

**"Validation not working"**
→ Check disabled condition on Confirm button

**"TypeScript errors"**
→ This is JavaScript, not TypeScript - ignore type errors

**"Build errors"**
→ Run `npm install` to ensure dependencies are installed

---

## 📞 Need More Details?

Refer to these files in order:
1. **CODE_SNIPPETS.md** - Exact code to paste
2. **RETURNS_IMPLEMENTATION_PLAN.md** - Full technical spec
3. **TESTING_CHECKLIST.md** - How to test after implementation
4. **CURSOR_PROMPT.md** - Comprehensive prompt for Cursor

---

**Time to implement:** 1-2 hours  
**Difficulty:** Medium  
**Files modified:** 2  
**Lines of code:** ~200  

Let's build this! 🚀
