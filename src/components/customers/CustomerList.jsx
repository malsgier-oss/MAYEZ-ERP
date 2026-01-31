import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCustomers } from '../../hooks/useCustomers'
import { getCustomerDebt } from '../../hooks/useCustomers'
import { formatCurrency } from '../../utils/currency'
import { t } from '../../utils/i18n'

export default function CustomerList() {
  const { customers, loading, error } = useCustomers()
  const [debts, setDebts] = useState({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      const map = {}
      for (const c of customers) {
        map[c.id] = await getCustomerDebt(c.id)
      }
      setDebts(map)
    }
    if (customers.length) load()
    else setDebts({})
  }, [customers])

  const filtered = search.trim()
    ? customers.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
          (c.phone && c.phone.includes(search))
      )
    : customers

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold">{t('customers.title')}</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="search"
            placeholder={t('customers.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 sm:w-64 px-4 py-2 border rounded-lg"
          />
          <Link
            to="/customers/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium touch-target flex items-center justify-center"
          >
            {t('customers.add_customer')}
          </Link>
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
                  <th className="text-left p-3 font-medium">{t('customers.name')}</th>
                  <th className="text-left p-3 font-medium">{t('customers.phone')}</th>
                  <th className="text-left p-3 font-medium">{t('customers.debt')}</th>
                  <th className="text-right p-3 font-medium">{t('products.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium">{customer.name}</td>
                    <td className="p-3 text-slate-600">{customer.phone || '—'}</td>
                    <td className="p-3">
                      <span className={debts[customer.id] > 0 ? 'text-amber-700 font-medium' : 'text-slate-500'}>
                        {formatCurrency(debts[customer.id] ?? 0)}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/customers/${customer.id}`}
                        className="text-blue-600 hover:underline px-2 py-1"
                      >
                        {t('invoices.view')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="p-8 text-center text-slate-500">{t('customers.no_customers')}</p>
          )}
        </div>
      )}
    </div>
  )
}
