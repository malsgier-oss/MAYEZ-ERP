import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/date'
import { recordSupplierPayment } from '../../hooks/usePurchases'
import { useSuppliers } from '../../hooks/useSuppliers'
import { t } from '../../utils/i18n'

export default function SupplierDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchSuppliers } = useSuppliers()
  const [supplier, setSupplier] = useState(null)
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      const { data: s } = await supabase.from('suppliers').select('*').eq('id', id).single()
      setSupplier(s || null)
      const { data: pur } = await supabase
        .from('purchases')
        .select('*')
        .eq('supplier_id', id)
        .order('purchase_date', { ascending: false })
        .limit(50)
      setPurchases(pur || [])
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
      await recordSupplierPayment({
        supplier_id: id,
        purchase_id: null,
        amount,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        notes: null,
      })
      setPaymentAmount('')
      setShowPayment(false)
      const { data: s } = await supabase.from('suppliers').select('*').eq('id', id).single()
      setSupplier(s || null)
      fetchSuppliers()
    } catch (err) {
      setError(err.message || t('supplier_detail.failed_payment'))
    } finally {
      setProcessing(false)
    }
  }

  if (id === 'new') {
    navigate('/suppliers')
    return null
  }
  if (loading || !supplier) {
    return <p className="text-slate-500">{t('suppliers.loading')}</p>
  }

  const payable = Number(supplier.payable) || 0

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{supplier.name}</h1>
        <button
          type="button"
          onClick={() => navigate('/suppliers')}
          className="text-slate-600 hover:underline"
        >
          {t('common.back')} {t('suppliers.title')}
        </button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-lg font-semibold mb-4">{t('suppliers.title')}</h2>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-slate-500">{t('suppliers.phone')}</dt><dd>{supplier.phone || '—'}</dd></div>
            <div><dt className="text-slate-500">{t('suppliers.email')}</dt><dd>{supplier.email || '—'}</dd></div>
            <div><dt className="text-slate-500">{t('suppliers.address')}</dt><dd>{supplier.address || '—'}</dd></div>
            {supplier.notes && <div><dt className="text-slate-500">{t('suppliers.notes')}</dt><dd>{supplier.notes}</dd></div>}
          </dl>
        </div>
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-lg font-semibold mb-4">{t('suppliers.payable')}</h2>
          <p className={`text-2xl font-bold ${payable > 0 ? 'text-amber-700' : 'text-slate-600'}`}>
            {formatCurrency(payable)}
          </p>
          {payable > 0 && (
            <button
              type="button"
              onClick={() => setShowPayment(true)}
              className="mt-4 px-4 py-3 bg-green-600 text-white rounded-xl font-medium touch-target"
            >
              {t('purchase.pay_supplier')}
            </button>
          )}
        </div>
      </div>
      <div className="mt-8 bg-white rounded-xl shadow border overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b">{t('purchase.new_purchase')} – {t('suppliers.title')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 font-medium">{t('purchase.payment_date')}</th>
                <th className="text-left p-3 font-medium">#</th>
                <th className="text-left p-3 font-medium">{t('purchase.supplier_invoice_number')}</th>
                <th className="text-right p-3 font-medium">{t('pos.total')}</th>
                <th className="text-right p-3 font-medium">{t('invoices.paid')}</th>
                <th className="text-right p-3 font-medium">{t('invoice.status')}</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((pur) => (
                <tr key={pur.id} className="border-t border-slate-100">
                  <td className="p-3">{formatDate(pur.purchase_date)}</td>
                  <td className="p-3 font-medium">
                    <Link to={`/purchases/${pur.id}`} className="text-blue-600 hover:underline">
                      {pur.purchase_number}
                    </Link>
                  </td>
                  <td className="p-3">
                    {pur.supplier_invoice_number || pur.supplier_invoice_url ? (
                      <span className="flex flex-wrap items-center gap-1">
                        {pur.supplier_invoice_number && <span>{pur.supplier_invoice_number}</span>}
                        {pur.supplier_invoice_url && (
                          <a
                            href={pur.supplier_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {t('common.view')}
                          </a>
                        )}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-3 text-right">{formatCurrency(pur.total_amount)}</td>
                  <td className="p-3 text-right">{formatCurrency(pur.paid_amount)}</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-1 rounded text-sm ${
                      pur.status === 'paid' ? 'bg-green-100 text-green-800' :
                      pur.status === 'partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {t(({ paid: 'invoice.status_paid', partial: 'invoice.status_partial', unpaid: 'invoice.status_unpaid' })[pur.status] || 'invoice.status')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {purchases.length === 0 && (
          <p className="p-8 text-center text-slate-500">{t('supplier_detail.no_purchases')}</p>
        )}
      </div>

      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">{t('purchase.pay_supplier')}</h3>
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            <form onSubmit={handlePayment}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('purchase.amount')}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder={t('purchase.amount')}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg mb-4"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowPayment(false)} className="flex-1 py-2 border rounded-lg">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={processing} className="flex-1 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">
                  {processing ? '...' : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
