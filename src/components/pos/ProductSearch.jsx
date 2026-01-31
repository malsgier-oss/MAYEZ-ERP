import { useState, useMemo, useCallback } from 'react'
import { useCartStore } from '../../store/cartStore'
import { formatCurrency } from '../../utils/currency'
import { getProductPhotoUrl } from '../../utils/productPhoto'
import { t } from '../../utils/i18n'

export default function ProductSearch({ products, loading, onBackToCategories }) {
  const [search, setSearch] = useState('')
  const [failedImageUrls, setFailedImageUrls] = useState(new Set())
  const addItem = useCartStore((s) => s.addItem)

  const handleImageError = useCallback((url) => {
    setFailedImageUrls((prev) => new Set(prev).add(url))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return products
    const q = search.toLowerCase()
    return products.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q))
    )
  }, [products, search])

  return (
    <div className="flex flex-col h-full">
      {onBackToCategories && (
        <button
          type="button"
          onClick={onBackToCategories}
          className="self-start mb-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg touch-target"
        >
          ← {t('pos.back_to_categories')}
        </button>
      )}
      <input
        type="search"
        placeholder={t('pos.search_placeholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 text-lg border border-slate-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        autoFocus
      />
      {loading ? (
        <p className="text-slate-500 py-8">{t('pos.loading_products')}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 overflow-auto flex-1">
          {filtered.map((product) => {
            const photoUrl = getProductPhotoUrl(product)
            const showImage = photoUrl && !failedImageUrls.has(photoUrl)
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => addItem(product, 1)}
                className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition touch-target-lg text-left w-full"
              >
                {showImage ? (
                  <img
                    src={photoUrl}
                    alt=""
                    className="w-full h-20 object-cover rounded-lg mb-2 border border-slate-200 flex-shrink-0"
                    onError={() => handleImageError(photoUrl)}
                  />
                ) : (
                  <div className="w-full h-20 rounded-lg mb-2 border border-slate-200 bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl text-slate-400">📦</span>
                  </div>
                )}
                <span className="font-medium truncate w-full text-center">{product.name}</span>
                <span className="text-lg font-bold text-blue-600 mt-1">{formatCurrency(product.selling_price)}</span>
                {product.current_stock !== null && (
                  <span
                    className={`text-xs mt-1 ${
                      product.low_stock_threshold > 0 && product.current_stock <= product.low_stock_threshold
                        ? 'text-red-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {t('pos.stock')}: {product.current_stock}
                  </span>
                )}
              </button>
            )
          })}
          {filtered.length === 0 && (
            <p className="col-span-full text-slate-500 py-8 text-center">{t('pos.no_products')}</p>
          )}
        </div>
      )}
    </div>
  )
}
