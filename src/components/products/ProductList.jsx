import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'
import { formatCurrency } from '../../utils/currency'
import { getProductPhotoUrl } from '../../utils/productPhoto'
import { t } from '../../utils/i18n'

export default function ProductList() {
  const { products, loading, error } = useProducts()
  const { categories } = useCategories()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const filtered = products
    .filter((p) => {
      if (categoryFilter && p.category_id !== categoryFilter) return false
      if (!search.trim()) return true
      return (
        (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
      )
    })

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold">{t('products.title')}</h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">{t('products.all_categories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="search"
            placeholder={t('products.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 sm:w-48 px-4 py-2 border rounded-lg min-w-0"
          />
          <Link
            to="/products/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium touch-target flex items-center justify-center"
          >
            {t('products.add_product')}
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
                  <th className="text-left p-3 font-medium w-14">{t('products.photo_column')}</th>
                  <th className="text-left p-3 font-medium">{t('products.name')}</th>
                  <th className="text-left p-3 font-medium">{t('products.category')}</th>
                  <th className="text-left p-3 font-medium">{t('products.sku')}</th>
                  <th className="text-left p-3 font-medium">{t('products.price')}</th>
                  <th className="text-left p-3 font-medium">{t('products.stock')}</th>
                  <th className="text-left p-3 font-medium">{t('products.low_stock')}</th>
                  <th className="text-right p-3 font-medium">{t('products.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="p-3">
                      {getProductPhotoUrl(product) ? (
                        <img
                          src={getProductPhotoUrl(product)}
                          alt=""
                          className="w-10 h-10 object-cover rounded border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">—</div>
                      )}
                    </td>
                    <td className="p-3 font-medium">{product.name}</td>
                    <td className="p-3 text-slate-600">{categories.find((c) => c.id === product.category_id)?.name ?? '—'}</td>
                    <td className="p-3 text-slate-600">{product.sku || '—'}</td>
                    <td className="p-3">{formatCurrency(product.selling_price)}</td>
                    <td className="p-3">
                      <span
                        className={
                          product.low_stock_threshold > 0 &&
                          product.current_stock <= product.low_stock_threshold
                            ? 'text-red-600 font-medium'
                            : ''
                        }
                      >
                        {product.current_stock}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{product.low_stock_threshold || '—'}</td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/products/${product.id}/edit`}
                        className="text-blue-600 hover:underline px-2 py-1"
                      >
                        {t('common.edit')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="p-8 text-center text-slate-500">{t('products.no_products_found')}</p>
          )}
        </div>
      )}
    </div>
  )
}
