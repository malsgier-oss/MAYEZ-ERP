import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/date'
import { t } from '../../utils/i18n'

export default function ReportsScreen() {
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().split('T')[0]
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0])
  const [dailySales, setDailySales] = useState(null)
  const [debtList, setDebtList] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const from = dateFrom
      const to = dateTo

      const { data: inv } = await supabase
        .from('invoices')
        .select('id, total_amount, paid_amount, invoice_date')
        .gte('invoice_date', from)
        .lte('invoice_date', to)
      const totalSales = (inv || []).reduce((sum, i) => sum + Number(i.total_amount), 0)
      const totalPaid = (inv || []).reduce((sum, i) => sum + Number(i.paid_amount), 0)
      setDailySales({ totalSales, totalPaid, count: (inv || []).length })

      const { data: unpaid } = await supabase
        .from('invoices')
        .select('id, customer_id, total_amount, paid_amount, invoice_number')
        .in('status', ['unpaid', 'partial'])
      const customerIds = [...new Set((unpaid || []).map((i) => i.customer_id).filter(Boolean))]
      const { data: cust } = await supabase.from('customers').select('id, name').in('id', customerIds)
      const custMap = (cust || []).reduce((m, c) => ({ ...m, [c.id]: c.name }), {})
      const debtByCustomer = {}
      ;(unpaid || []).forEach((i) => {
        const bal = Number(i.total_amount) - Number(i.paid_amount)
        if (bal <= 0) return
        const cid = i.customer_id
        if (!debtByCustomer[cid]) debtByCustomer[cid] = { name: custMap[cid] || 'Unknown', total: 0, invoices: [] }
        debtByCustomer[cid].total += bal
        debtByCustomer[cid].invoices.push(i.invoice_number)
      })
      setDebtList(Object.entries(debtByCustomer).map(([id, v]) => ({ id, ...v })))

      const { data: prods } = await supabase
        .from('products')
        .select('id, name, current_stock, low_stock_threshold')
        .eq('is_active', true)
      setLowStock(
        (prods || []).filter((p) => p.low_stock_threshold > 0 && p.current_stock <= p.low_stock_threshold)
      )

      const invoiceIds = (inv || []).map((i) => i.id).filter(Boolean)
      const { data: items } = invoiceIds.length
        ? await supabase
            .from('invoice_items')
            .select('product_id, quantity, product_name')
            .in('invoice_id', invoiceIds)
        : { data: [] }
      const byProduct = {}
      ;(items || []).forEach((row) => {
        const pid = row.product_id
        if (!byProduct[pid]) byProduct[pid] = { name: row.product_name, qty: 0 }
        byProduct[pid].qty += Number(row.quantity)
      })
      setTopProducts(
        Object.entries(byProduct)
          .map(([id, v]) => ({ id, ...v }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 10)
      )

      setLoading(false)
    }
    load()
  }, [dateFrom, dateTo])

  if (loading && !dailySales) {
    return <p className="text-slate-500">{t('reports.loading')}</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('reports.title')}</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <label className="flex items-center gap-2">
          <span className="text-sm text-slate-600">{t('reports.from')}</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm text-slate-600">{t('reports.to')}</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-lg font-semibold mb-4">{t('reports.daily_sales_summary')}</h2>
          {dailySales ? (
            <div className="space-y-2">
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(dailySales.totalSales)}</p>
              <p className="text-slate-600 text-sm">{t('reports.invoices_label')}: {dailySales.count}</p>
              <p className="text-slate-600 text-sm">{t('reports.collected')}: {formatCurrency(dailySales.totalPaid)}</p>
            </div>
          ) : (
            <p className="text-slate-500">{t('reports.no_data')}</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-lg font-semibold mb-4">{t('reports.customer_debt')}</h2>
          {debtList.length === 0 ? (
            <p className="text-slate-500">{t('reports.no_debt')}</p>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-auto">
              {debtList.map((d) => (
                <li key={d.id} className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="font-medium">{d.name}</span>
                  <span className="text-amber-700 font-medium">{formatCurrency(d.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-lg font-semibold mb-4">{t('reports.low_stock_products')}</h2>
          {lowStock.length === 0 ? (
            <p className="text-slate-500">{t('reports.all_stock_ok')}</p>
          ) : (
            <ul className="space-y-2">
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between border-b border-slate-100 pb-2">
                  <span>{p.name}</span>
                  <span className="text-red-600 font-medium">
                    {p.current_stock} / {p.low_stock_threshold}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-lg font-semibold mb-4">{t('reports.top_10_products')}</h2>
          {topProducts.length === 0 ? (
            <p className="text-slate-500">{t('reports.no_sales')}</p>
          ) : (
            <ol className="space-y-2 list-decimal list-inside">
              {topProducts.map((p) => (
                <li key={p.id} className="flex justify-between border-b border-slate-100 pb-2">
                  <span>{p.name}</span>
                  <span className="font-medium">{p.qty} {t('reports.sold')}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
