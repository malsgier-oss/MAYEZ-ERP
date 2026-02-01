import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/date'
import { t } from '../../utils/i18n'

export default function PurchaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [purchase, setPurchase] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: pur } = await supabase
        .from('purchases')
        .select('*, suppliers(name, phone)')
        .eq('id', id)
        .single()
      setPurchase(pur || null)
      const { data: it } = await supabase
        .from('purchase_items')
        .select('*')
        .eq('purchase_id', id)
        .order('created_at')
      setItems(it || [])
      setLoading(false)
    }
    if (id) load()
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  if (loading || !purchase) {
    return <p className="text-slate-500">{t('common.loading')}</p>
  }

  const supplierName = purchase.suppliers?.name || '—'
  const statusKey = { paid: 'invoice.status_paid', partial: 'invoice.status_partial', unpaid: 'invoice.status_unpaid' }[purchase.status] || 'invoice.status'
  const statusLabel = t(statusKey)

  return (
    <div>
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t('purchase.purchase_number_label').replace('{number}', purchase.purchase_number)}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded-lg">
            ← {t('common.back')}
          </button>
          <button type="button" onClick={handlePrint} className="px-4 py-2 bg-slate-700 text-white rounded-lg print:hidden">
            {t('common.print')}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow border p-6 print:shadow-none">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-sm font-medium text-slate-500 mb-1">{t('purchase.supplier')}</h2>
            <p className="font-medium">{supplierName}</p>
            {purchase.suppliers?.phone && <p className="text-slate-600">{purchase.suppliers.phone}</p>}
            {purchase.supplier_id && (
              <Link to={`/suppliers/${purchase.supplier_id}`} className="text-blue-600 hover:underline text-sm print:hidden">
                {t('supplier_detail.view_supplier')}
              </Link>
            )}
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-sm">{t('purchase.payment_date')}</p>
            <p className="font-medium">{formatDate(purchase.purchase_date)}</p>
            <p className="text-slate-500 text-sm mt-2">{t('invoice.status')}</p>
            <p>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  purchase.status === 'paid' ? 'bg-green-100' : purchase.status === 'partial' ? 'bg-amber-100' : 'bg-red-100'
                }`}
              >
                {statusLabel}
              </span>
            </p>
            {(purchase.supplier_invoice_number || purchase.supplier_invoice_url) && (
              <div className="mt-3 text-left">
                <p className="text-slate-500 text-sm">{t('purchase.supplier_invoice_number')}</p>
                <p className="font-medium">{purchase.supplier_invoice_number || '—'}</p>
                {purchase.supplier_invoice_url && (
                  <a
                    href={purchase.supplier_invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {t('common.view')} {t('purchase.supplier_invoice_url')}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 font-medium">{t('purchase.product')}</th>
              <th className="text-right py-2 font-medium">{t('purchase.quantity')}</th>
              <th className="text-right py-2 font-medium">{t('purchase.unit_cost')}</th>
              <th className="text-right py-2 font-medium">{t('purchase.line_total')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-2">{item.product_name}</td>
                <td className="text-right py-2">{item.quantity}</td>
                <td className="text-right py-2">{formatCurrency(item.unit_cost)}</td>
                <td className="text-right py-2">{formatCurrency(item.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>{t('pos.total')}</span>
              <span>{formatCurrency(purchase.total_amount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t('invoices.paid')}</span>
              <span>{formatCurrency(purchase.paid_amount)}</span>
            </div>
          </div>
        </div>
        {purchase.notes && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-2">{t('suppliers.notes')}</h3>
            <p className="text-sm text-slate-600">{purchase.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
