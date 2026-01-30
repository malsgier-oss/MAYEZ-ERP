# MAYEZ-ERP Returns Feature: Testing & QA Checklist

## 🧪 Manual Testing Guide

### Pre-Testing Setup
- [ ] Ensure development environment is running
- [ ] Have test data: 2-3 products with stock > 10
- [ ] Have test customer with $0 debt
- [ ] Clear browser cache if needed

---

## 📝 Test Suite

### TEST 1: Full Return on Paid Invoice ✅

**Setup:**
1. Create new invoice with 3 items:
   - Product A: qty 2, price $10 = $20
   - Product B: qty 1, price $15 = $15
   - Product C: qty 3, price $5 = $15
   - Total: $50
2. Record payment: $50 (Cash)
3. Note stock levels before return

**Steps:**
1. Navigate to Invoices list
2. Click on the newly created invoice
3. Verify "Process Return" button is visible (orange)
4. Click "Process Return"
5. Modal should open showing all 3 items
6. Select ALL 3 items (check all checkboxes)
7. Choose reason: "Damaged Product"
8. Verify summary shows: "Items: 3 | Total Amount: $50.00"
9. Click "Confirm Return"

**Expected Results:**
- [ ] Success toast appears: "Return processed successfully"
- [ ] Modal closes automatically
- [ ] Page refreshes/reloads
- [ ] Invoice status now shows "refunded"
- [ ] "Process Return" button is no longer visible
- [ ] Product A stock increased by 2
- [ ] Product B stock increased by 1
- [ ] Product C stock increased by 3
- [ ] Stock movements table has 3 new entries with type='return'

**If Failed:** Check browser console for errors, verify processInvoiceReturn function exists

---

### TEST 2: Partial Return ✅

**Setup:**
1. Create new invoice with 3 items:
   - Product D: qty 2, price $20 = $40
   - Product E: qty 1, price $30 = $30
   - Product F: qty 2, price $10 = $20
   - Total: $90
2. Record payment: $90 (Cash)
3. Note stock levels before return

**Steps:**
1. Open the invoice
2. Click "Process Return"
3. Select ONLY 2 items (Product D and Product E)
4. Leave Product F unchecked
5. Choose reason: "Wrong Item"
6. Verify summary shows: "Items: 2 | Total Amount: $70.00"
7. Click "Confirm Return"

**Expected Results:**
- [ ] Success toast appears
- [ ] Modal closes
- [ ] Invoice status REMAINS "paid" (not refunded)
- [ ] "Process Return" button STILL VISIBLE (for remaining item)
- [ ] Only Product D and E stock increased
- [ ] Product F stock unchanged
- [ ] 2 stock movement entries created

**If Failed:** Check isFullReturn logic in processInvoiceReturn function

---

### TEST 3: Return on Unpaid Invoice (Debt Adjustment) ✅

**Setup:**
1. Create customer "Test Customer" with $0 debt
2. Create invoice for this customer with 2 items:
   - Product G: qty 5, price $8 = $40
   - Product H: qty 2, price $15 = $30
   - Total: $70
3. DO NOT record payment (leave as "unpaid")
4. Verify customer debt shows $70

**Steps:**
1. Open the unpaid invoice
2. Note: "Process Return" button should NOT be visible
3. Record partial payment: $35
4. Invoice status should now be "partial"
5. "Process Return" button should now appear
6. Click "Process Return"
7. Select both items
8. Choose reason: "Customer Changed Mind"
9. Confirm return

**Expected Results:**
- [ ] Success toast appears
- [ ] Invoice status changes to "refunded"
- [ ] Customer debt reduces from $35 to $0
- [ ] Customer debt never goes negative
- [ ] Stock restored: Product G +5, Product H +2
- [ ] Return properly tracked

**If Failed:** Check debt calculation logic, verify Math.max(0, ...) is used

---

### TEST 4: Validation & Error Handling ✅

**Setup:**
1. Use any paid invoice from previous tests

**Steps & Expected Results:**

**4A: No Items Selected**
1. Open invoice, click "Process Return"
2. Leave all items UNCHECKED
3. Select a reason
4. Click "Confirm Return"
- [ ] Error toast: "Please select at least one item to return"
- [ ] Modal remains open
- [ ] No processing occurs

**4B: No Reason Selected**
1. Select one or more items
2. Leave reason dropdown at "Select reason..."
3. Click "Confirm Return"
- [ ] Error toast: "Please select a return reason"
- [ ] Modal remains open
- [ ] Confirm button should be disabled

**4C: Valid Submission**
1. Select items
2. Choose reason
3. Click "Confirm Return"
- [ ] Processing begins (button shows "Processing...")
- [ ] Button is disabled during processing
- [ ] Spinner appears on button
- [ ] Success on completion

**If Failed:** Check validation logic in handleProcessReturn function

---

### TEST 5: UI/UX Behavior ✅

**Setup:**
1. Create invoices with different statuses

**Steps & Expected Results:**

**5A: Button Visibility**
1. Create invoice with status "unpaid"
   - [ ] "Process Return" button NOT VISIBLE
2. Record partial payment (status becomes "partial")
   - [ ] "Process Return" button NOW VISIBLE
3. Record full payment (status becomes "paid")
   - [ ] "Process Return" button STILL VISIBLE
4. Process full return (status becomes "refunded")
   - [ ] "Process Return" button NO LONGER VISIBLE

**5B: Modal Behavior**
1. Click "Process Return"
   - [ ] Modal opens with smooth animation
   - [ ] Background is darkened (overlay)
2. Click X button in modal
   - [ ] Modal closes
   - [ ] Selected items cleared
   - [ ] Reason reset
3. Click outside modal (on overlay)
   - [ ] Modal should close (if implemented)
4. Press ESC key
   - [ ] Modal should close (if implemented)

**5C: Loading States**
1. Click "Process Return" and immediately try to:
   - [ ] Close modal → should be prevented
   - [ ] Click Cancel → should be disabled
   - [ ] Click Confirm again → should be disabled
2. Watch button during processing:
   - [ ] Text changes to "Processing..."
   - [ ] Spinner appears
   - [ ] Button is grayed out

**If Failed:** Check state management and disabled conditions

---

### TEST 6: Data Integrity ✅

**Setup:**
1. Create invoice with known products and quantities

**Steps:**
1. Before return:
   - Note Product stock: ___
   - Note Invoice total: ___
   - Note Customer debt: ___
   - Note Invoice status: ___

2. Process return of 2 items:
   - Item 1: qty 3, subtotal $30
   - Item 2: qty 1, subtotal $10

3. After return:
   - [ ] Product 1 stock increased by exactly 3
   - [ ] Product 2 stock increased by exactly 1
   - [ ] Customer debt decreased by exactly $40 (if applicable)
   - [ ] Invoice status correct (refunded if full, else unchanged)

4. Check stock_movements table in Supabase:
   - [ ] 2 new records exist
   - [ ] Both have type = 'return'
   - [ ] Both reference correct invoice_id
   - [ ] Notes contain invoice number and reason
   - [ ] Quantities are positive numbers

**If Failed:** Check recordStockMovement calls and Supabase queries

---

### TEST 7: Edge Cases ✅

**7A: Single Item Invoice**
1. Create invoice with 1 item only
2. Process return
   - [ ] Works correctly
   - [ ] Status changes to "refunded"

**7B: High Quantity Return**
1. Create invoice with 100 units of one product
2. Process return
   - [ ] Stock correctly increased by 100
   - [ ] No overflow errors

**7C: Decimal Prices**
1. Create invoice with prices like $9.99, $12.50
2. Process return
   - [ ] Amounts calculated correctly
   - [ ] No rounding errors
   - [ ] Display shows 2 decimal places

**7D: Special Characters in Product Name**
1. Create product with name "Test & Co. (Premium)"
2. Include in invoice and return
   - [ ] Name displays correctly in modal
   - [ ] No escaping issues
   - [ ] Stock movement note correct

**7E: Multiple Returns on Same Invoice**
1. Create invoice with 5 items
2. Return 2 items
3. Return 2 more items
4. Return final item
   - [ ] Each return processes correctly
   - [ ] Status updates appropriately
   - [ ] Stock correctly incremented each time
   - [ ] Return history shows all returns (if implemented)

---

### TEST 8: Mobile Responsiveness ✅

**Setup:**
1. Open app on mobile device or use Chrome DevTools mobile view

**Steps:**
1. Open invoice detail page
   - [ ] "Process Return" button visible and accessible
   - [ ] Button text not cut off
2. Click "Process Return"
   - [ ] Modal fits screen properly
   - [ ] No horizontal scrolling
   - [ ] All text readable
3. Select items
   - [ ] Checkboxes easily tappable
   - [ ] Item details readable
4. Scroll modal content
   - [ ] Scrolling works smoothly
   - [ ] Header stays visible (if sticky)
5. Submit return
   - [ ] Success toast visible
   - [ ] Toast doesn't overlap content

**Devices to Test:**
- [ ] Mobile (375px width)
- [ ] Tablet (768px width)
- [ ] Desktop (1024px+ width)

---

## 🔍 Performance Testing

### TEST 9: Performance Checks ✅

**9A: Large Invoice**
1. Create invoice with 50+ line items
   - [ ] Modal opens quickly (<1 second)
   - [ ] Scrolling is smooth
   - [ ] Checkbox selection responsive

**9B: Processing Speed**
1. Time the return process
   - [ ] Full return completes in <2 seconds
   - [ ] Network requests are batched when possible
   - [ ] No noticeable lag

**9C: Concurrent Operations**
1. Try to open multiple modals
   - [ ] Only one modal can be open
   - [ ] No conflicts between states

---

## 🛡️ Security & Data Validation

### TEST 10: Data Validation ✅

**10A: Invalid Data Handling**
1. Manually edit invoice in Supabase to have no items
2. Try to process return
   - [ ] Graceful error handling
   - [ ] No crash

**10B: Deleted Product**
1. Create invoice
2. Delete product from products table
3. Try to view/return invoice
   - [ ] Handles missing product gracefully
   - [ ] Shows appropriate message

**10C: Database Connection Error**
1. Disconnect from internet
2. Try to process return
   - [ ] Shows connection error
   - [ ] Doesn't crash app
   - [ ] User can retry

---

## 📊 Reporting Results

### Test Summary Template

```
MAYEZ-ERP Returns Feature - Test Results
Date: _____________
Tester: ___________

✅ PASSED TESTS:
- Test 1: Full Return on Paid Invoice
- Test 2: Partial Return
- [etc...]

❌ FAILED TESTS:
- Test X: [Description]
  Error: [Error details]
  Steps to reproduce: [Steps]

⚠️ ISSUES FOUND:
- [Issue 1]: [Description + Severity]
- [Issue 2]: [Description + Severity]

🔧 FIXES REQUIRED:
1. [Fix description]
2. [Fix description]

OVERALL STATUS: [PASS / FAIL / PASS WITH ISSUES]
```

---

## ✅ Sign-Off Checklist

Before marking returns feature as complete:

### Functionality
- [ ] All 10 test suites passed
- [ ] No critical bugs found
- [ ] No console errors during normal operation
- [ ] All edge cases handled

### Code Quality
- [ ] Code follows existing patterns
- [ ] No code duplication
- [ ] Proper error handling everywhere
- [ ] Comments added where needed

### User Experience
- [ ] Loading states clearly visible
- [ ] Error messages helpful
- [ ] Success feedback appropriate
- [ ] Mobile responsive

### Data Integrity
- [ ] Stock quantities correct
- [ ] Customer debt calculations accurate
- [ ] Invoice statuses update properly
- [ ] Audit trail complete (stock_movements)

### Documentation
- [ ] Code is self-documenting
- [ ] Complex logic has comments
- [ ] Test results documented
- [ ] Known issues listed (if any)

---

## 🐛 Bug Report Template

Use this template when reporting issues:

```markdown
**Bug Title:** [Short description]

**Severity:** [Critical / High / Medium / Low]

**Test Case:** [Which test revealed this bug]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happens]

**Screenshots/Videos:**
[Attach if available]

**Environment:**
- Browser: [Chrome/Firefox/Safari]
- Device: [Desktop/Mobile/Tablet]
- OS: [Windows/Mac/iOS/Android]

**Console Errors:**
```
[Paste any console errors]
```

**Additional Notes:**
[Any other relevant information]
```

---

**Testing Status:** [ ] Not Started | [ ] In Progress | [ ] Complete
**Final Approval:** [ ] Approved for Production | [ ] Needs Fixes
