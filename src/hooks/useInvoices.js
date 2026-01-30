import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const FETCH_TIMEOUT_MS = 15_000

function withTimeout(promise, ms, message = 'Request timed out') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ])
}

export function useInvoices(filters = {}) {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchInvoices = async () => {
    setLoading(true)
    setError(null)
    try {
      let q = supabase.from('invoices').select('*, customers(name)').order('invoice_date', { ascending: false })
      if (filters.customerId) q = q.eq('customer_id', filters.customerId)
      if (filters.status) q = q.eq('status', filters.status)
      if (filters.fromDate) q = q.gte('invoice_date', filters.fromDate)
      if (filters.toDate) q = q.lte('invoice_date', filters.toDate)
      const { data, error: e } = await withTimeout(q.limit(200), FETCH_TIMEOUT_MS, 'Invoices load timed out. Check your connection and Supabase.')
      if (e) {
        setError(e.message)
        setInvoices([])
      } else {
        setInvoices(data || [])
      }
    } catch (err) {
      setError(err?.message || 'Failed to load invoices')
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [filters.customerId, filters.status, filters.fromDate, filters.toDate])

  return { invoices, loading, error, fetchInvoices }
}

export async function getNextInvoiceNumber() {
  try {
    const { data, error } = await supabase.rpc('get_next_invoice_number')
    if (!error && data) return data
  } catch {}
  const { data: last } = await supabase.from('invoices').select('invoice_number').order('created_at', { ascending: false }).limit(1).maybeSingle()
  const num = last?.invoice_number ? parseInt(String(last.invoice_number).replace(/\D/g, ''), 10) + 1 : 1
  return 'INV-' + String(num).padStart(5, '0')
}

export async function createInvoiceWithItems(invoice, items) {
  const { data: inv, error: invErr } = await supabase.from('invoices').insert(invoice).select().single()
  if (invErr) throw invErr
  const itemsWithInvoice = items.map((i) => ({
    invoice_id: inv.id,
    product_id: i.productId,
    product_name: i.productName,
    quantity: i.quantity,
    unit_price: i.unitPrice,
    line_total: i.lineTotal,
  }))
  const { error: itemsErr } = await supabase.from('invoice_items').insert(itemsWithInvoice)
  if (itemsErr) throw itemsErr
  return inv
}

export async function recordStockMovement(productId, quantity, movementType, referenceType, referenceId, reason, notes) {
  const { error } = await supabase.from('stock_movements').insert({
    product_id: productId,
    movement_type: movementType,
    quantity: -Math.abs(quantity),
    reference_type: referenceType,
    reference_id: referenceId,
    reason: reason || null,
    notes: notes || null,
  })
  if (error) throw error
  const { data: product } = await supabase.from('products').select('current_stock').eq('id', productId).single()
  const newStock = (Number(product?.current_stock) || 0) + (movementType === 'return' ? Math.abs(quantity) : -Math.abs(quantity))
  await supabase.from('products').update({ current_stock: Math.max(0, newStock), updated_at: new Date().toISOString() }).eq('id', productId)
}

export async function recordPayment(payment) {
  const { data, error } = await supabase.from('payments').insert(payment).select().single()
  if (error) throw error
  const inv = await supabase.from('invoices').select('paid_amount, total_amount, status').eq('id', payment.invoice_id).single()
  const paid = Number(inv.data?.paid_amount) + Number(payment.amount)
  const total = Number(inv.data?.total_amount)
  const status = paid >= total ? 'paid' : paid > 0 ? 'partial' : 'unpaid'
  await supabase.from('invoices').update({ paid_amount: paid, status, updated_at: new Date().toISOString() }).eq('id', payment.invoice_id)
  return data
}

/**
 * Process a return for an invoice: restore stock, update invoice status.
 * @param {string} invoiceId - Invoice ID
 * @param {Array} returnItems - Array of invoice_items to return (must have id, product_id, quantity, line_total)
 * @param {string} reason - Return reason (e.g. damaged, wrong_item, customer_changed_mind)
 */
export async function processInvoiceReturn(invoiceId, returnItems, reason) {
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*, items:invoice_items(*)')
    .eq('id', invoiceId)
    .single()

  if (invoiceError) throw invoiceError
  if (!invoice) throw new Error('Invoice not found')

  const invoiceItems = invoice.items || []

  for (const item of returnItems) {
    await recordStockMovement(
      item.product_id,
      item.quantity,
      'return',
      'invoice',
      invoiceId,
      null,
      `Return from invoice #${invoice.invoice_number} - Reason: ${reason}`,
    )
  }

  const returnAmount = returnItems.reduce((sum, item) => sum + Number(item.line_total), 0)
  const isFullReturn =
    invoiceItems.length === returnItems.length &&
    invoiceItems.every((invItem) =>
      returnItems.some(
        (retItem) => retItem.id === invItem.id && Number(retItem.quantity) === Number(invItem.quantity),
      ),
    )

  const newStatus = isFullReturn ? 'refunded' : invoice.status

  const { error: updateError } = await supabase
    .from('invoices')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', invoiceId)

  if (updateError) throw updateError

  // Reduce customer debt when returning items from an unpaid or partial invoice
  if (invoice.status === 'unpaid' || invoice.status === 'partial') {
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('debt')
      .eq('id', invoice.customer_id)
      .single()

    if (!customerError && customer != null) {
      const currentDebt = Number(customer.debt) || 0
      const newDebt = Math.max(0, currentDebt - returnAmount)

      const { error: debtError } = await supabase
        .from('customers')
        .update({ debt: newDebt })
        .eq('id', invoice.customer_id)

      if (debtError) throw debtError
    }
  }

  return { success: true, returnAmount, isFullReturn, newStatus }
}
