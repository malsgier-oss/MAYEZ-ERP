# CURSOR AI PROMPT: Implement Returns Feature for MAYEZ-ERP

## 🎯 OBJECTIVE
Implement returns/refunds functionality for MAYEZ-ERP to complete Phase 1 scope.

## 📋 CONTEXT
MAYEZ-ERP is a React + Supabase ERP system with POS, inventory, invoices, and customers modules. 
We need to add the ability to process returns on sold items, which will:
- Restore stock quantities
- Update invoice status to 'refunded' for full returns
- Adjust customer debt for unpaid/partial invoices
- Track return history

## ✅ REQUIREMENTS

### Functional Requirements
1. **UI Components**
   - "Process Return" button on Invoice Detail page (only for paid/partial invoices)
   - Modal dialog for selecting items to return and choosing reason
   - Return history section showing past returns on an invoice
   - Proper loading states and validation

2. **Business Logic**
   - Restore stock via existing `recordStockMovement` function with type='return'
   - Update invoice status to 'refunded' if all items returned, else keep current status
   - Reduce customer debt by return amount if invoice was unpaid/partial
   - Track returns for audit purposes

3. **User Flow**
   - Manager opens paid or partial invoice
   - Clicks "Process Return" button
   - Selects which items to return (can be partial)
   - Chooses return reason from dropdown
   - Confirms return
   - System processes and shows success message
   - Page refreshes showing updated data

### Technical Requirements
- Use existing patterns from POSScreen.jsx for toast notifications
- Follow Tailwind styling conventions from rest of app
- Use existing Supabase hooks pattern
- Maintain consistency with current codebase structure
- All validation must happen before processing
- Error handling with user-friendly messages

## 📁 FILES TO MODIFY

### File 1: src/screens/InvoiceDetail.jsx
**Changes:**
1. Import ArrowUturnLeftIcon from heroicons
2. Add state variables: showReturnModal, selectedItems, returnReason, isProcessingReturn
3. Add handleProcessReturn async function with validation and error handling
4. Add "Process Return" button (conditional on invoice.status)
5. Add return modal with item selection, reason dropdown, summary, and actions
6. (Optional) Add return history display section

### File 2: src/hooks/useInvoices.js
**Changes:**
1. Add processInvoiceReturn async function that:
   - Fetches full invoice with customer data
   - Loops through returned items and calls recordStockMovement
   - Calculates if full or partial return
   - Updates invoice status
   - Adjusts customer debt if needed
   - Returns success data
2. Export processInvoiceReturn in return statement

### File 3 (Optional): Supabase SQL
**If we want proper return tracking:**
- Create 'returns' table with invoice_id, return_number, total_amount, reason
- Create 'return_items' table with return_id, product details, quantities
- Add indexes and RLS policies
- Update processInvoiceReturn to insert return records

## 🎨 UI/UX GUIDELINES

### Return Button
- Color: bg-orange-600 (warning color for destructive action)
- Icon: ArrowUturnLeftIcon from heroicons
- Position: Next to existing action buttons in invoice header
- Only visible when: invoice.status === 'paid' OR 'partial'

### Modal Design
- Full-screen overlay with centered modal
- Max width: 2xl (max-w-2xl)
- Sections:
  1. Header with title and close button
  2. Item selection with checkboxes and item details
  3. Reason dropdown (required)
  4. Summary box showing selected items count and total
  5. Action buttons: Cancel (left) and Confirm Return (right)

### Loading States
- Disable all buttons during processing
- Show spinner on Confirm button
- Change button text to "Processing..."
- Prevent modal close during processing

### Validation Messages
- "Please select at least one item to return" (if no items selected)
- "Please select a return reason" (if reason not chosen)
- "Return processed successfully" (on success)
- "Failed to process return: [error]" (on error)

## 🔍 CODE STYLE REQUIREMENTS

### React Patterns
```jsx
// Use functional components with hooks
const [state, setState] = useState(initialValue);

// Async handlers with try-catch
const handleAction = async () => {
  try {
    // logic
  } catch (error) {
    console.error('Error:', error);
    toast.error('User-friendly message');
  }
};

// Conditional rendering
{condition && <Component />}
```

### Tailwind Classes
```jsx
// Follow existing patterns from the app
className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"

// Consistent spacing
className="mb-4" // margin bottom
className="space-y-2" // vertical spacing between children

// Responsive
className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
```

### Supabase Queries
```javascript
// Always use select with specific fields
const { data, error } = await supabase
  .from('table')
  .select('*, related:related_table(*)')
  .eq('id', value)
  .single();

// Always handle errors
if (error) throw error;
if (!data) throw new Error('Not found');
```

## 🧪 TESTING REQUIREMENTS

After implementation, verify:

### Test Case 1: Full Return on Paid Invoice
1. Create test invoice with 2-3 items, mark as paid
2. Process return selecting ALL items
3. Expected: Invoice status becomes 'refunded', stock restored for all items

### Test Case 2: Partial Return
1. Create invoice with 3 items
2. Process return selecting 2 items only
3. Expected: Invoice status stays 'paid', stock restored for 2 items only

### Test Case 3: Unpaid Invoice Return
1. Create invoice with $100 total, leave unpaid
2. Verify customer debt is $100
3. Process full return
4. Expected: Customer debt becomes $0, invoice status 'refunded'

### Test Case 4: Validation
1. Click Process Return
2. Try to confirm without selecting items → should show error
3. Select items but leave reason blank → should show error
4. Both fields filled → should process successfully

### Test Case 5: UI States
1. Verify button only appears on paid/partial invoices
2. Verify modal opens and closes properly
3. Verify loading state during processing
4. Verify page refreshes after successful return

## 🚨 CRITICAL REQUIREMENTS

### DO NOT:
- ❌ Create new files - use existing file structure
- ❌ Use alert() - use toast notifications
- ❌ Process returns on refunded invoices
- ❌ Allow negative customer debt
- ❌ Skip validation steps
- ❌ Modify invoice_items directly (use stock_movements)

### DO:
- ✅ Use existing recordStockMovement function
- ✅ Follow existing code patterns and styling
- ✅ Add comprehensive error handling
- ✅ Show loading states during async operations
- ✅ Validate all inputs before processing
- ✅ Keep customer debt >= 0
- ✅ Use descriptive stock movement notes

## 📦 DEPENDENCIES
All required dependencies should already be installed:
- React + hooks
- Heroicons (@heroicons/react)
- Tailwind CSS
- Supabase client
- Toast library (react-hot-toast or similar)

## 🎯 SUCCESS CRITERIA

Implementation is complete when:
1. ✅ Return button appears only on eligible invoices
2. ✅ Modal opens with all invoice items selectable
3. ✅ Validation prevents invalid submissions
4. ✅ Returns successfully restore stock quantities
5. ✅ Invoice status updates correctly (refunded vs partial)
6. ✅ Customer debt adjusts properly for unpaid invoices
7. ✅ Success/error messages guide the user
8. ✅ All 5 test cases pass
9. ✅ Code follows existing patterns and style
10. ✅ No console errors or warnings

## 📝 IMPLEMENTATION NOTES

### Return Reason Options
```
- damaged: "Damaged Product"
- wrong_item: "Wrong Item"
- customer_changed_mind: "Customer Changed Mind"
- defective: "Defective Product"
- expired: "Expired Product"
- other: "Other"
```

### Stock Movement Note Format
```
"Return from invoice #[invoice_number] - Reason: [reason]"
```

### Status Logic
```javascript
// Full return: all items AND quantities match
isFullReturn = invoice.items.every(invoiceItem => 
  returnItems.some(returnItem => 
    returnItem.id === invoiceItem.id && 
    returnItem.quantity === invoiceItem.quantity
  )
);

newStatus = isFullReturn ? 'refunded' : invoice.status;
```

### Debt Calculation
```javascript
// Only adjust for unpaid/partial invoices
if (invoice.status === 'unpaid' || invoice.status === 'partial') {
  newDebt = Math.max(0, currentDebt - returnAmount);
}
```

## 🔧 TROUBLESHOOTING HINTS

If you encounter issues:

**Issue: Can't find recordStockMovement**
→ Check it's defined in useInvoices.js and exported

**Issue: Invoice data undefined**
→ Add loading check before rendering return button

**Issue: Modal won't close**
→ Verify setShowReturnModal(false) is called after success

**Issue: Toast not showing**
→ Check toast library is imported correctly

**Issue: Stock not updating**
→ Verify product_id is correct in returnItems array

## 📚 REFERENCE FILES

Review these existing files for patterns:
- `src/screens/POSScreen.jsx` - for toast notifications and modal patterns
- `src/hooks/useInvoices.js` - for Supabase query patterns
- `src/screens/InvoiceDetail.jsx` - current structure to modify

## 🚀 START HERE

1. First, read through the entire prompt to understand the scope
2. Open src/screens/InvoiceDetail.jsx and add the return button
3. Implement the modal component
4. Add the handler function with validation
5. Update src/hooks/useInvoices.js with processInvoiceReturn
6. Test all 5 test cases
7. Fix any issues that arise
8. Verify code follows existing patterns
9. Done!

---

**Priority:** HIGH  
**Complexity:** MEDIUM  
**Estimated Time:** 2-4 hours  
**Phase:** Phase 1 Completion

Ready to implement? Let's build this! 🚀
