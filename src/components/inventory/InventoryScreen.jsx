import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/currency'
import { t } from '../../utils/i18n'
import StockAdjustmentModal from './StockAdjustmentModal'

export default function InventoryScreen() {
  const { products, loading, error, fetchProducts } = useProducts()
  const [filterLow, setFilterLow] = useState(false)
  const [adjustProduct, setAdjustProduct] = useState(null)
  const [movements, setMovements] = useState([])
  const [showMovementsFor, setShowMovementsFor] = useState(null)

  const filtered = filterLow
    ? products.filter((p) => p.low_stock_threshold > 0 && p.current_stock <= p.low_stock_threshold)
    : products

  const loadMovements = async (productId) => {
    const { data } = await supabase
      .from('stock_movements')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(20)
    setMovements(data || [])
    setShowMovementsFor(productId)
  }

  const handleAdjustDone = () => {
    setAdjustProduct(null)
    fetchProducts()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t('inventory.title')}</h1>
        <div className="flex flex-wrap gap-4 items-center">
          <Link
            to="/purchases/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium touch-target"
          >
            {t('purchase.receive_stock')}
          </Link>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterLow}
              onChange={(e) => setFilterLow(e.target.checked)}
              className="rounded"
            />
            <span>{t('inventory.show_low_only')}</span>
          </label>
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
                  <th className="text-left p-3 font-medium">{t('inventory.product')}</th>
                  <th className="text-left p-3 font-medium">{t('products.sku')}</th>
                  <th className="text-right p-3 font-medium">{t('inventory.current_stock_label')}</th>
                  <th className="text-right p-3 font-medium">{t('inventory.low_threshold')}</th>
                  <th className="text-right p-3 font-medium">{t('products.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const isLow =
                    product.low_stock_threshold > 0 &&
                    product.current_stock <= product.low_stock_threshold
                  return (
                    <tr
                      key={product.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        isLow ? 'bg-red-50/50' : ''
                      }`}
                    >
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3 text-slate-600">{product.sku || '—'}</td>
                      <td className="p-3 text-right">
                        <span className={isLow ? 'text-red-600 font-medium' : ''}>
                          {product.current_stock}
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-500">
                        {product.low_stock_threshold || '—'}
                      </td>
                      <td className="p-3 text-right flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setAdjustProduct(product)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm touch-target"
                        >
                          {t('inventory.adjust_stock')}
                        </button>
                        <button
                          type="button"
                          onClick={() => loadMovements(product.id)}
                          className="px-3 py-2 border rounded-lg text-sm"
                        >
                          {t('inventory.history')}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="p-8 text-center text-slate-500">
              {filterLow ? t('inventory.no_low_stock') : t('inventory.no_products')}
            </p>
          )}
        </div>
      )}

      {adjustProduct && (
        <StockAdjustmentModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onDone={handleAdjustDone}
        />
      )}

      {showMovementsFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">{t('inventory.stock_history')}</h3>
            <ul className="space-y-2 text-sm">
              {movements.map((m) => (
                <li key={m.id} className="flex justify-between border-b border-slate-100 pb-2">
                  <span>
                    {m.movement_type} — {m.quantity > 0 ? '+' : ''}{m.quantity}
                    {m.reason && ` (${m.reason})`}
                  </span>
                  <span className="text-slate-500">{new Date(m.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setShowMovementsFor(null)}
              className="mt-4 w-full py-2 border rounded-lg"
            >
              {t('pos.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
