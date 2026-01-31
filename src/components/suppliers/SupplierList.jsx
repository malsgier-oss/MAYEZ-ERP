import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSuppliers } from '../../hooks/useSuppliers'
import { formatCurrency } from '../../utils/currency'
import { t } from '../../utils/i18n'

export default function SupplierList() {
  const { suppliers, loading, error } = useSuppliers()
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? suppliers.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(search.toLowerCase())) ||
          (s.phone && s.phone.includes(search))
      )
    : suppliers

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold">{t('suppliers.title')}</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="search"
            placeholder={t('suppliers.name') + ' / ' + t('suppliers.phone')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 sm:w-64 px-4 py-2 border rounded-lg"
          />
          <Link
            to="/suppliers/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium touch-target flex items-center justify-center"
          >
            {t('suppliers.add_supplier')}
          </Link>
        </div>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}
      {loading ? (
        <p className="text-slate-500">{t('suppliers.loading')}</p>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-3 font-medium">{t('suppliers.name')}</th>
                  <th className="text-left p-3 font-medium">{t('suppliers.phone')}</th>
                  <th className="text-right p-3 font-medium">{t('suppliers.payable')}</th>
                  <th className="text-right p-3 font-medium">{t('common.view')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((supplier) => (
                  <tr key={supplier.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium">{supplier.name}</td>
                    <td className="p-3 text-slate-600">{supplier.phone || '—'}</td>
                    <td className="p-3 text-right">
                      <span className={Number(supplier.payable) > 0 ? 'text-amber-700 font-medium' : 'text-slate-500'}>
                        {formatCurrency(supplier.payable ?? 0)}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/suppliers/${supplier.id}`}
                        className="text-blue-600 hover:underline px-2 py-1"
                      >
                        {t('common.view')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="p-8 text-center text-slate-500">{t('suppliers.no_suppliers')}</p>
          )}
        </div>
      )}
    </div>
  )
}
