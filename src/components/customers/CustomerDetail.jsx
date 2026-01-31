import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/date'
import { t } from '../../utils/i18n'

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [debt, setDebt] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      const { data: c } = await supabase.from('customers').select('*').eq('id', id).single()
      setCustomer(c || null)
      const { data: inv } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', id)
        .order('invoice_date', { ascending: false })
        .limit(50)
      setInvoices(inv || [])
      const unpaid = (inv || []).filter((i) => i.status !== 'paid')
      const totalDebt = unpaid.reduce((sum, i) => sum + (Number(i.total_amount) - Number(i.paid_amount)), 0)
      setDebt(totalDebt)
      setLoading(false)
    }
    if (id && id !== 'new') load()
    else setLoading(false)
  }, [id])

  const handlePayment = async (e) => {
    e.preventDefault()
    const amount = parseFloat(paymentAmount)
    if (!amount || amount <= 0) return
    setProcessing(true)
    setError(null)
    try {
      const unpaid = invoices.filter((i) => i.status !== 'paid').sort((a, b) => new Date(a.invoice_date) - new Date(b.invoice_date))
      let remaining = amount
      const paymentDate = new Date().toISOString().split('T')[0]
      for (const inv of unpaid) {
        if (remaining <= 0) break
        const balance = Number(inv.total_amount) - Number(inv.paid_amount)
        const apply = Math.min(remaining, balance)
        if (apply <= 0) continue
        await supabase.from('payments').insert({
          customer_id: id,
          invoice_id: inv.id,
          payment_date: paymentDate,
          amount: apply,
          payment_method: 'cash',
          notes: t('customer_detail.notes_payment'),
        })
        const newPaid = Number(inv.paid_amount) + apply
        const status = newPaid >= Number(inv.total_amount) ? 'paid' : 'partial'
        await supabase.from('invoices').update({ paid_amount: newPaid, status, updated_at: new Date().toISOString() }).eq('id', inv.id)
        remaining -= apply
      }
      if (remaining > 0) {
        await supabase.from('payments').insert({
          customer_id: id,
          invoice_id: null,
          payment_date: paymentDate,
          amount: remaining,
          payment_method: 'cash',
          notes: t('customer_detail.notes_credit'),
        })
      }
      setPaymentAmount('')
      setShowPayment(false)
      const { data: inv } = await supabase.from('invoices').select('*').eq('customer_id', id).order('invoice_date', { ascending: false }).limit(50)
      setInvoices(inv || [])
      const stillUnpaid = (inv || []).filter((i) => i.status !== 'paid')
      setDebt(stillUnpaid.reduce((sum, i) => sum + (Number(i.total_amount) - Number(i.paid_amount)), 0))
    } catch (err) {
      setError(err.message || t('common.failed_payment'))
    } finally {
      setProcessing(false)
    }
  }

  if (id === 'new') {
    navigate('/customers')
    return null
  }
  if (loading || !customer) {
    return <p className="text-slate-500">{t('common.loading')}</p>
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{customer.name}</h1>
        <button
          type="button"
          onClick={() => navigate('/customers')}
          className="text-slate-600 hover:underline"
        >
          {t('customer_detail.back_to_list')}
        </button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-lg font-semibold mb-4">{t('customer_detail.details')}</h2>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-slate-500">{t('customers.phone')}</dt><dd>{customer.phone || '—'}</dd></div>
            <div><dt className="text-slate-500">{t('customers.email')}</dt><dd>{customer.email || '—'}</dd></div>
            <div><dt className="text-slate-500">{t('customers.address')}</dt><dd>{customer.address || '—'}</dd></div>
            {customer.notes && <div><dt className="text-slate-500">{t('customers.notes')}</dt><dd>{customer.notes}</dd></div>}
          </dl>
        </div>
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-lg font-semibold mb-4">{t('customers.outstanding_debt')}</h2>
          <p className={`text-2xl font-bold ${debt > 0 ? 'text-amber-700' : 'text-slate-600'}`}>
            {formatCurrency(debt)}
          </p>
          {debt > 0 && (
            <button
              type="button"
              onClick={() => setShowPayment(true)}
              className="mt-4 px-4 py-3 bg-green-600 text-white rounded-xl font-medium touch-target"
            >
              {t('customers.collect_payment')}
            </button>
          )}
        </div>
      </div>
      <div className="mt-8 bg-white rounded-xl shadow border overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b">{t('customers.invoice_history')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 font-medium">{t('invoices.date')}</th>
                <th className="text-left p-3 font-medium">{t('invoices.invoice_number')}</th>
                <th className="text-right p-3 font-medium">{t('invoices.total')}</th>
                <th className="text-right p-3 font-medium">{t('invoices.paid')}</th>
                <th className="text-right p-3 font-medium">{t('invoices.balance')}</th>
                <th className="text-right p-3 font-medium">{t('invoice.status')}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const balance = Number(inv.total_amount) - Number(inv.paid_amount)
                return (
                  <tr key={inv.id} className="border-t border-slate-100">
                    <td className="p-3">{formatDate(inv.invoice_date)}</td>
                    <td className="p-3">
                      <a href={`/invoices/${inv.id}`} className="text-blue-600 hover:underline">
                        {inv.invoice_number}
                      </a>
                    </td>
                    <td className="p-3 text-right">{formatCurrency(inv.total_amount)}</td>
                    <td className="p-3 text-right">{formatCurrency(inv.paid_amount)}</td>
                    <td className="p-3 text-right">{formatCurrency(balance)}</td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-1 rounded text-sm ${
                        inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                        inv.status === 'partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {t(({ paid: 'invoice.status_paid', partial: 'invoice.status_partial', unpaid: 'invoice.status_unpaid', refunded: 'invoice.status_refunded' })[inv.status] || 'invoice.status')}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">{t('customers.collect_payment')}</h3>
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            <form onSubmit={handlePayment}>
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
    </div>
  )
}
