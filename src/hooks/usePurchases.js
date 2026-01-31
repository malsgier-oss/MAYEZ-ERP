import { supabase } from '../lib/supabase'

export async function getNextPurchaseNumber() {
  try {
    const { data, error } = await supabase.rpc('get_next_purchase_number')
    if (!error && data) return data
  } catch {}
  const { data: last } = await supabase.from('purchases').select('purchase_number').order('created_at', { ascending: false }).limit(1).maybeSingle()
  const num = last?.purchase_number ? parseInt(String(last.purchase_number).replace(/\D/g, ''), 10) + 1 : 1
  return 'PUR-' + String(num).padStart(5, '0')
}

/** Insert stock_movement with movement_type 'receipt' (positive quantity) and increase product stock */
async function recordStockReceipt(productId, quantity, purchaseId) {
  const qty = Math.abs(Number(quantity)) || 0
  if (qty <= 0) return
  const { error } = await supabase.from('stock_movements').insert({
    product_id: productId,
    movement_type: 'receipt',
    quantity: qty,
    reference_type: 'purchase_order',
    reference_id: purchaseId,
    reason: null,
    notes: null,
  })
  if (error) throw error
  const { data: product } = await supabase.from('products').select('current_stock').eq('id', productId).single()
  const newStock = (Number(product?.current_stock) || 0) + qty
  await supabase.from('products').update({ current_stock: Math.max(0, newStock), updated_at: new Date().toISOString() }).eq('id', productId)
}

/**
 * Create purchase with items, stock movements, and optionally increase supplier payable (credit).
 * @param {Object} purchase - { supplier_id, purchase_number, purchase_date, total_amount, paid_amount, status, notes }
 * @param {Array} items - [{ product_id, product_name, quantity, unit_cost, line_total }]
 * @param {boolean} isCredit - if true, increase supplier payable by total_amount
 */
export async function createPurchaseWithItems(purchase, items, isCredit = false) {
  const { data: pur, error: purErr } = await supabase.from('purchases').insert(purchase).select().single()
  if (purErr) throw purErr

  const itemsWithPurchase = items.map((i) => ({
    purchase_id: pur.id,
    product_id: i.product_id,
    product_name: i.product_name,
    quantity: i.quantity,
    unit_cost: i.unit_cost,
    line_total: i.line_total,
  }))
  const { error: itemsErr } = await supabase.from('purchase_items').insert(itemsWithPurchase)
  if (itemsErr) throw itemsErr

  for (const item of items) {
    await recordStockReceipt(item.product_id, item.quantity, pur.id)
  }

  if (isCredit && Number(purchase.total_amount) > 0) {
    const { data: supplier } = await supabase.from('suppliers').select('payable').eq('id', purchase.supplier_id).single()
    const currentPayable = Number(supplier?.payable) || 0
    const newPayable = currentPayable + Number(purchase.total_amount)
    await supabase.from('suppliers').update({ payable: newPayable, updated_at: new Date().toISOString() }).eq('id', purchase.supplier_id)
  }

  return pur
}

/**
 * Record a payment to a supplier; decrease supplier payable.
 * @param {Object} payment - { supplier_id, purchase_id?, amount, payment_date, payment_method, notes }
 */
export async function recordSupplierPayment(payment) {
  const { data, error } = await supabase.from('supplier_payments').insert(payment).select().single()
  if (error) throw error

  const { data: supplier } = await supabase.from('suppliers').select('payable').eq('id', payment.supplier_id).single()
  const currentPayable = Number(supplier?.payable) || 0
  const newPayable = Math.max(0, currentPayable - Number(payment.amount))
  await supabase.from('suppliers').update({ payable: newPayable, updated_at: new Date().toISOString() }).eq('id', payment.supplier_id)

  if (payment.purchase_id) {
    const { data: pur } = await supabase.from('purchases').select('paid_amount, total_amount').eq('id', payment.purchase_id).single()
    const paid = Number(pur?.paid_amount) + Number(payment.amount)
    const total = Number(pur?.total_amount)
    const status = paid >= total ? 'paid' : paid > 0 ? 'partial' : 'unpaid'
    await supabase.from('purchases').update({ paid_amount: paid, status, updated_at: new Date().toISOString() }).eq('id', payment.purchase_id)
  }

  return data
}
