import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { processInvoiceReturn } from '../../hooks/useInvoices'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/date'
import { t } from '../../utils/i18n'

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const hasAutoPrinted = useRef(false)
  const [invoice, setInvoice] = useState(null)
  const [items, setItems] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [processing, setProcessing] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [returnReason, setReturnReason] = useState('')
  const [isProcessingReturn, setIsProcessingReturn] = useState(false)
  const [toast, setToast] = useState(null)

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

  useEffect(() => {
    if (!invoice || loading || hasAutoPrinted.current) return
    if (searchParams.get('print') === '1') {
      hasAutoPrinted.current = true
      setSearchParams({}, { replace: true })
      // Defer print until after receipt content is painted so the dialog shows the receipt, not "Loading..."
      const id = setTimeout(() => {
        window.print()
      }, 150)
      return () => clearTimeout(id)
    }
  }, [invoice, loading, searchParams, setSearchParams])

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
      setToast({ type: 'error', message: err.message || t('invoice.record_payment') })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setProcessing(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleProcessReturn = async () => {
    if (selectedItems.length === 0) {
      setToast({ type: 'error', message: t('invoice.select_items_return') })
      setTimeout(() => setToast(null), 3000)
      return
    }
    if (!returnReason) {
      setToast({ type: 'error', message: t('invoice.reason_return') })
      setTimeout(() => setToast(null), 3000)
      return
    }
    setIsProcessingReturn(true)
    try {
      await processInvoiceReturn(invoice.id, selectedItems, returnReason)
      setToast({ type: 'success', message: t('invoice.confirm_return') })
      setTimeout(() => setToast(null), 3000)
      setShowReturnModal(false)
      setSelectedItems([])
      setReturnReason('')
      // Reload invoice and items
      const { data: inv } = await supabase.from('invoices').select('*, customers(name, phone)').eq('id', id).single()
      setInvoice(inv || null)
      const { data: it } = await supabase.from('invoice_items').select('*').eq('invoice_id', id).order('created_at')
      setItems(it || [])
    } catch (err) {
      setToast({ type: 'error', message: err.message || t('invoice.process_return') })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setIsProcessingReturn(false)
    }
  }

  if (loading || !invoice) {
    return <p className="text-slate-500">{t('common.loading')}</p>
  }

  const balance = Number(invoice.total_amount) - Number(invoice.paid_amount)
  const customerName = invoice.customers?.name || t('invoice.walkin')
  const statusKey = { paid: 'invoice.status_paid', partial: 'invoice.status_partial', unpaid: 'invoice.status_unpaid', refunded: 'invoice.status_refunded' }[invoice.status] || 'invoice.status'
  const statusLabel = t(statusKey)

  return (
    <div>
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t('invoice.number').replace('{number}', invoice.invoice_number)}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => navigate('/invoices')} className="px-4 py-2 border rounded-lg">
            ← {t('common.back')}
          </button>
          <button type="button" onClick={handlePrint} className="px-4 py-2 bg-slate-700 text-white rounded-lg print:hidden">
            {t('common.print')}
          </button>
          {balance > 0 && (
            <button
              type="button"
              onClick={() => setShowPayment(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              {t('invoice.record_payment')}
            </button>
          )}
          {(invoice.status === 'paid' || invoice.status === 'partial') && (
            <button
              type="button"
              onClick={() => setShowReturnModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors print:hidden"
            >
              <span aria-hidden>↩</span>
              {t('invoice.process_return')}
            </button>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow border p-6 print:shadow-none">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-sm font-medium text-slate-500 mb-1">{t('invoice.bill_to')}</h2>
            <p className="font-medium">{customerName}</p>
            {invoice.customers?.phone && <p className="text-slate-600">{invoice.customers.phone}</p>}
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-sm">{t('invoice.invoice_date')}</p>
            <p className="font-medium">{formatDate(invoice.invoice_date)}</p>
            <p className="text-slate-500 text-sm mt-2">{t('invoice.status')}</p>
            <p>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  invoice.status === 'paid' ? 'bg-green-100' : invoice.status === 'partial' ? 'bg-amber-100' : 'bg-red-100'
                }`}
              >
                {statusLabel}
              </span>
            </p>
          </div>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 font-medium">{t('invoice.product')}</th>
              <th className="text-right py-2 font-medium">{t('invoice.qty')}</th>
              <th className="text-right py-2 font-medium">{t('invoice.price')}</th>
              <th className="text-right py-2 font-medium">{t('invoice.total')}</th>
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
              <span>{t('invoice.subtotal')}</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {(Number(invoice.discount_amount) > 0 || Number(invoice.discount_percentage) > 0) && (
              <div className="flex justify-between text-amber-700">
                <span>{t('invoice.discount')}</span>
                <span>−{formatCurrency(invoice.discount_amount || (invoice.subtotal * invoice.discount_percentage) / 100)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>{t('invoice.total')}</span>
              <span>{formatCurrency(invoice.total_amount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t('invoice.paid')}</span>
              <span>{formatCurrency(invoice.paid_amount)}</span>
            </div>
            {balance > 0 && (
              <div className="flex justify-between font-medium text-amber-700">
                <span>{t('invoice.balance_due')}</span>
                <span>{formatCurrency(balance)}</span>
              </div>
            )}
          </div>
        </div>
        {payments.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold mb-2">{t('invoice.payment_history')}</h3>
            <ul className="space-y-1 text-sm text-slate-600">
              {payments.map((p, i) => (
                <li key={i}>
                  {formatDate(p.payment_date)} — {formatCurrency(p.amount)} ({p.payment_method === 'cash' ? t('invoice.payment_method_cash') : t('invoice.payment_method_credit')})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{t('invoice.process_return')}</h3>
              <button
                type="button"
                onClick={() => {
                  setShowReturnModal(false)
                  setSelectedItems([])
                  setReturnReason('')
                }}
                disabled={isProcessingReturn}
                className="text-slate-500 hover:text-slate-700 text-2xl leading-none disabled:opacity-50"
              >
                ×
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('invoice.select_items_return')}</label>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-200 rounded-lg p-2">
                {items.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.some((si) => si.id === item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems([...selectedItems, item])
                        } else {
                          setSelectedItems(selectedItems.filter((si) => si.id !== item.id))
                        }
                      }}
                      className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.product_name}</div>
                      <div className="text-sm text-slate-600">
                        {t('invoice.qty')}: {item.quantity} × {formatCurrency(item.unit_price)} = {formatCurrency(item.line_total)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('invoice.reason_return')}</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">{t('invoice.select_reason')}</option>
                <option value="damaged">{t('invoice.return_reason_damaged')}</option>
                <option value="wrong_item">{t('invoice.return_reason_wrong')}</option>
                <option value="customer_changed_mind">{t('invoice.return_reason_changed_mind')}</option>
                <option value="defective">{t('invoice.return_reason_defective')}</option>
                <option value="expired">{t('invoice.return_reason_expired')}</option>
                <option value="other">{t('invoice.return_reason_other')}</option>
              </select>
            </div>
            {selectedItems.length > 0 && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-sm font-medium text-amber-800 mb-1">{t('invoice.return_summary')}</div>
                <div className="text-sm text-amber-700">
                  {t('invoice.qty')}: {selectedItems.length} | {t('invoice.total')}: {formatCurrency(selectedItems.reduce((sum, i) => sum + Number(i.line_total), 0))}
                </div>
                <div className="text-xs text-amber-600 mt-1">{t('invoice.return_stock_note')}</div>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowReturnModal(false)
                  setSelectedItems([])
                  setReturnReason('')
                }}
                disabled={isProcessingReturn}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleProcessReturn}
                disabled={isProcessingReturn || selectedItems.length === 0 || !returnReason}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessingReturn && (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isProcessingReturn ? t('invoice.processing') : t('invoice.confirm_return')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">{t('invoice.record_payment')}</h3>
            <p className="text-slate-600 mb-2">{t('invoice.balance_due')}: {formatCurrency(balance)}</p>
            <form onSubmit={handleRecordPayment}>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder={t('invoice.amount')}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg mb-4"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowPayment(false)} className="flex-1 py-2 border rounded-lg">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={processing} className="flex-1 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">
                  {processing ? '...' : t('invoice.record')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
