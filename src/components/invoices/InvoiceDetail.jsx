import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/date'

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)
  const [items, setItems] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: inv } = await supabase.from('invoices').select('*, customers(name, phone)').eq('id', id).single()
      setInvoice(inv || null)
      const { data: it } = await supabase.from('invoice_items').select('*').eq('invoice_id', id).order('created_at')
      setItems(it || [])
      const { data: pay } = await supabase.from('payments').select('*').eq('invoice_id', id).order('payment_date')
      setPayments(pay || [])
      setLoading(false)
    }
    if (id) load()
  }, [id])

  const handleRecordPayment = async (e) => {
    e.preventDefault()
    const amount = parseFloat(paymentAmount)
    if (!amount || amount <= 0 || !invoice) return
    setProcessing(true)
    try {
      await supabase.from('payments').insert({
        invoice_id: invoice.id,
        customer_id: invoice.customer_id,
        payment_date: new Date().toISOString().split('T')[0],
        amount,
        payment_method: 'cash',
      })
      const newPaid = Number(invoice.paid_amount) + amount
      const status = newPaid >= Number(invoice.total_amount) ? 'paid' : 'partial'
      await supabase.from('invoices').update({ paid_amount: newPaid, status, updated_at: new Date().toISOString() }).eq('id', id)
      setInvoice((prev) => ({ ...prev, paid_amount: newPaid, status }))
      setPayments((prev) => [...prev, { amount, payment_date: new Date().toISOString().split('T')[0], payment_method: 'cash' }])
      setPaymentAmount('')
      setShowPayment(false)
    } catch (err) {
      alert(err.message || 'Failed to record payment')
    } finally {
      setProcessing(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading || !invoice) {
    return <p className="text-slate-500">Loading...</p>
  }

  const balance = Number(invoice.total_amount) - Number(invoice.paid_amount)
  const customerName = invoice.customers?.name || 'Walk-in Customer'

  return (
    <div>
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Invoice {invoice.invoice_number}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => navigate('/invoices')} className="px-4 py-2 border rounded-lg">
            ← Back
          </button>
          <button type="button" onClick={handlePrint} className="px-4 py-2 bg-slate-700 text-white rounded-lg print:hidden">
            Print
          </button>
          {balance > 0 && (
            <button
              type="button"
              onClick={() => setShowPayment(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Record Payment
            </button>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow border p-6 print:shadow-none">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-sm font-medium text-slate-500 mb-1">Bill to</h2>
            <p className="font-medium">{customerName}</p>
            {invoice.customers?.phone && <p className="text-slate-600">{invoice.customers.phone}</p>}
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-sm">Invoice date</p>
            <p className="font-medium">{formatDate(invoice.invoice_date)}</p>
            <p className="text-slate-500 text-sm mt-2">Status</p>
            <p>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  invoice.status === 'paid' ? 'bg-green-100' : invoice.status === 'partial' ? 'bg-amber-100' : 'bg-red-100'
                }`}
              >
                {invoice.status}
              </span>
            </p>
          </div>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 font-medium">Product</th>
              <th className="text-right py-2 font-medium">Qty</th>
              <th className="text-right py-2 font-medium">Price</th>
              <th className="text-right py-2 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-2">{item.product_name}</td>
                <td className="text-right py-2">{item.quantity}</td>
                <td className="text-right py-2">{formatCurrency(item.unit_price)}</td>
                <td className="text-right py-2">{formatCurrency(item.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {(Number(invoice.discount_amount) > 0 || Number(invoice.discount_percentage) > 0) && (
              <div className="flex justify-between text-amber-700">
                <span>Discount</span>
                <span>−{formatCurrency(invoice.discount_amount || (invoice.subtotal * invoice.discount_percentage) / 100)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(invoice.total_amount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Paid</span>
              <span>{formatCurrency(invoice.paid_amount)}</span>
            </div>
            {balance > 0 && (
              <div className="flex justify-between font-medium text-amber-700">
                <span>Balance due</span>
                <span>{formatCurrency(balance)}</span>
              </div>
            )}
          </div>
        </div>
        {payments.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold mb-2">Payment history</h3>
            <ul className="space-y-1 text-sm text-slate-600">
              {payments.map((p, i) => (
                <li key={i}>
                  {formatDate(p.payment_date)} — {formatCurrency(p.amount)} ({p.payment_method})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Record payment</h3>
            <p className="text-slate-600 mb-2">Balance due: {formatCurrency(balance)}</p>
            <form onSubmit={handleRecordPayment}>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg mb-4"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowPayment(false)} className="flex-1 py-2 border rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={processing} className="flex-1 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">
                  {processing ? '...' : 'Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
