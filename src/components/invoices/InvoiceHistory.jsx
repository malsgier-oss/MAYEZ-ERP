import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useInvoices } from '../../hooks/useInvoices'
import { formatCurrency } from '../../utils/currency'
import { formatDate } from '../../utils/date'
import { t } from '../../utils/i18n'

export default function InvoiceHistory() {
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const { invoices, loading, error } = useInvoices({
    status: statusFilter || undefined,
    fromDate: dateFrom || undefined,
    toDate: dateTo || undefined,
  })

  const statusKey = (s) => ({ paid: 'invoice.status_paid', partial: 'invoice.status_partial', unpaid: 'invoice.status_unpaid', refunded: 'invoice.status_refunded' }[s] || 'invoice.status')

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t('invoices.title')}</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">{t('invoices.all_statuses')}</option>
            <option value="unpaid">{t('invoice.status_unpaid')}</option>
            <option value="partial">{t('invoice.status_partial')}</option>
            <option value="paid">{t('invoice.status_paid')}</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </div>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}
      {loading ? (
        <p className="text-slate-500">{t('common.loading')}</p>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-3 font-medium">{t('invoices.date')}</th>
                  <th className="text-left p-3 font-medium">{t('invoices.invoice_number')}</th>
                  <th className="text-left p-3 font-medium">{t('invoices.customer')}</th>
                  <th className="text-right p-3 font-medium">{t('invoices.total')}</th>
                  <th className="text-right p-3 font-medium">{t('invoices.paid')}</th>
                  <th className="text-right p-3 font-medium">{t('invoices.balance')}</th>
                  <th className="text-right p-3 font-medium">{t('invoice.status')}</th>
                  <th className="text-right p-3 font-medium">{t('products.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const balance = Number(inv.total_amount) - Number(inv.paid_amount)
                  const customerName = inv.customers?.name || t('invoice.walkin')
                  return (
                    <tr
                      key={inv.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        inv.status === 'unpaid' ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <td className="p-3">{formatDate(inv.invoice_date)}</td>
                      <td className="p-3 font-medium">{inv.invoice_number}</td>
                      <td className="p-3 text-slate-600">{customerName}</td>
                      <td className="p-3 text-right">{formatCurrency(inv.total_amount)}</td>
                      <td className="p-3 text-right">{formatCurrency(inv.paid_amount)}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(balance)}</td>
                      <td className="p-3 text-right">
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
                        <Link to={`/invoices/${inv.id}`} className="text-blue-600 hover:underline">
                          {t('invoices.view')}
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {invoices.length === 0 && (
            <p className="p-8 text-center text-slate-500">{t('invoices.no_invoices')}</p>
          )}
        </div>
      )}
    </div>
  )
}
