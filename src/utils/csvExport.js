/**
 * Client-side CSV export for backup. Escapes quotes and wraps in double quotes when needed.
 */

function escapeCsvCell(value) {
  if (value == null) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

function buildCsv(headers, rows) {
  const headerRow = headers.map(escapeCsvCell).join(',')
  const dataRows = rows.map((row) => headers.map((h) => escapeCsvCell(row[h])).join(','))
  return [headerRow, ...dataRows].join('\r\n')
}

function downloadBlob(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

export function exportProductsCsv(products) {
  const headers = ['id', 'sku', 'name', 'description', 'unit', 'selling_price', 'current_stock', 'low_stock_threshold', 'is_active']
  const rows = (products || []).map((p) => ({
    id: p.id,
    sku: p.sku ?? '',
    name: p.name ?? '',
    description: p.description ?? '',
    unit: p.unit ?? '',
    selling_price: p.selling_price ?? '',
    current_stock: p.current_stock ?? '',
    low_stock_threshold: p.low_stock_threshold ?? '',
    is_active: p.is_active ?? true,
  }))
  downloadBlob(buildCsv(headers, rows), `mayez-products-${new Date().toISOString().slice(0, 10)}.csv`)
}

export function exportCustomersCsv(customers) {
  const headers = ['id', 'name', 'phone', 'email', 'address', 'notes', 'debt', 'is_active']
  const rows = (customers || []).map((c) => ({
    id: c.id,
    name: c.name ?? '',
    phone: c.phone ?? '',
    email: c.email ?? '',
    address: c.address ?? '',
    notes: c.notes ?? '',
    debt: c.debt ?? '',
    is_active: c.is_active ?? true,
  }))
  downloadBlob(buildCsv(headers, rows), `mayez-customers-${new Date().toISOString().slice(0, 10)}.csv`)
}

export function exportInvoicesCsv(invoices) {
  const headers = ['id', 'invoice_number', 'customer_id', 'invoice_date', 'due_date', 'subtotal', 'discount_amount', 'total_amount', 'paid_amount', 'status']
  const rows = (invoices || []).map((i) => ({
    id: i.id,
    invoice_number: i.invoice_number ?? '',
    customer_id: i.customer_id ?? '',
    invoice_date: i.invoice_date ?? '',
    due_date: i.due_date ?? '',
    subtotal: i.subtotal ?? '',
    discount_amount: i.discount_amount ?? '',
    total_amount: i.total_amount ?? '',
    paid_amount: i.paid_amount ?? '',
    status: i.status ?? '',
  }))
  downloadBlob(buildCsv(headers, rows), `mayez-invoices-${new Date().toISOString().slice(0, 10)}.csv`)
}
