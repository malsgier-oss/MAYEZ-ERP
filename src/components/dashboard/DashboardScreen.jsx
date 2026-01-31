import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/date'
import { t } from '../../utils/i18n'

export default function DashboardScreen() {
  const [todaySales, setTodaySales] = useState(null)
  const [debtTotal, setDebtTotal] = useState(0)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [recentInvoices, setRecentInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split('T')[0]

      const { data: invToday } = await supabase
        .from('invoices')
        .select('total_amount, paid_amount')
        .eq('invoice_date', today)
      const total = (invToday || []).reduce((sum, i) => sum + Number(i.total_amount), 0)
      const count = (invToday || []).length
      setTodaySales({ total, count })

      const { data: unpaid } = await supabase
        .from('invoices')
        .select('total_amount, paid_amount')
        .in('status', ['unpaid', 'partial'])
      const debt = (unpaid || []).reduce(
        (sum, i) => sum + (Number(i.total_amount) - Number(i.paid_amount)),
        0
      )
      setDebtTotal(debt)

      const { data: prodsFull } = await supabase
        .from('products')
        .select('id, current_stock, low_stock_threshold')
        .eq('is_active', true)
      const low = (prodsFull || []).filter(
        (p) => p.low_stock_threshold > 0 && p.current_stock <= p.low_stock_threshold
      ).length
      setLowStockCount(low)

      const { data: recent } = await supabase
        .from('invoices')
        .select('id, invoice_number, invoice_date, total_amount, status')
        .order('created_at', { ascending: false })
        .limit(10)
      setRecentInvoices(recent || [])

      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <p className="text-slate-500">{t('common.loading')}</p>
  }

  const statusKey = (s) => ({ paid: 'invoice.status_paid', partial: 'invoice.status_partial', unpaid: 'invoice.status_unpaid', refunded: 'invoice.status_refunded' }[s] || 'invoice.status')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('dashboard.title')}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Link
          to="/"
          className="bg-white rounded-xl shadow border p-6 hover:bg-slate-50 transition-colors block"
        >
          <p className="text-sm text-slate-500 mb-1">{t('dashboard.today_sales')}</p>
          <p className="text-2xl font-bold text-slate-800">
            {todaySales ? formatCurrency(todaySales.total) : '—'}
          </p>
          <p className="text-sm text-slate-600 mt-1">{todaySales?.count ?? 0} {t('dashboard.invoices_count')}</p>
        </Link>
        <Link
          to="/reports"
          className="bg-white rounded-xl shadow border p-6 hover:bg-slate-50 transition-colors block"
        >
          <p className="text-sm text-slate-500 mb-1">{t('dashboard.outstanding_debt')}</p>
          <p className={`text-2xl font-bold ${debtTotal > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
            {formatCurrency(debtTotal)}
          </p>
        </Link>
        <Link
          to="/inventory"
          className="bg-white rounded-xl shadow border p-6 hover:bg-slate-50 transition-colors block"
        >
          <p className="text-sm text-slate-500 mb-1">{t('dashboard.low_stock_items')}</p>
          <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {lowStockCount}
          </p>
        </Link>
        <Link
          to="/invoices"
          className="bg-white rounded-xl shadow border p-6 hover:bg-slate-50 transition-colors block"
        >
          <p className="text-sm text-slate-500 mb-1">{t('dashboard.recent_invoices')}</p>
          <p className="text-2xl font-bold text-slate-800">{recentInvoices.length}</p>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b border-slate-100">{t('dashboard.recent_invoices')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 font-medium text-slate-600">{t('invoices.invoice_number')}</th>
                <th className="text-left p-3 font-medium text-slate-600">{t('invoices.date')}</th>
                <th className="text-right p-3 font-medium text-slate-600">{t('invoices.total')}</th>
                <th className="text-left p-3 font-medium text-slate-600">{t('invoice.status')}</th>
                <th className="text-right p-3 font-medium text-slate-600">{t('products.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-medium">{inv.invoice_number}</td>
                  <td className="p-3 text-slate-600">{formatDate(inv.invoice_date)}</td>
                  <td className="p-3 text-right">{formatCurrency(inv.total_amount)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        inv.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : inv.status === 'partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {t(statusKey(inv.status))}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link to={`/invoices/${inv.id}`} className="text-blue-600 hover:underline text-sm">
                      {t('dashboard.view')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recentInvoices.length === 0 && (
          <p className="p-8 text-center text-slate-500">{t('dashboard.no_invoices')}</p>
        )}
      </div>
    </div>
  )
}
