import { useState, useMemo } from 'react'
import { useCartStore } from '../../store/cartStore'
import { formatCurrency } from '../../utils/currency'

export default function ProductSearch({ products, loading }) {
  const [search, setSearch] = useState('')
  const addItem = useCartStore((s) => s.addItem)

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
      <input
        type="search"
        placeholder="Search product or SKU..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 text-lg border border-slate-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        autoFocus
      />
      {loading ? (
        <p className="text-slate-500 py-8">Loading products...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 overflow-auto flex-1">
          {filtered.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => addItem(product, 1)}
              className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition touch-target-lg text-left w-full"
            >
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
                  Stock: {product.current_stock}
                </span>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-slate-500 py-8 text-center">No products found</p>
          )}
        </div>
      )}
    </div>
  )
}
