import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import { formatCurrency } from '../../utils/currency'

export default function ProductList() {
  const { products, loading, error } = useProducts()
  const [search, setSearch] = useState('')
  const filtered = search.trim()
    ? products.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
          (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
      )
    : products

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 sm:w-64 px-4 py-2 border rounded-lg"
          />
          <Link
            to="/products/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium touch-target flex items-center justify-center"
          >
            Add Product
          </Link>
        </div>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">SKU</th>
                  <th className="text-left p-3 font-medium">Price</th>
                  <th className="text-left p-3 font-medium">Stock</th>
                  <th className="text-left p-3 font-medium">Low stock</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium">{product.name}</td>
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
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="p-8 text-center text-slate-500">No products found</p>
          )}
        </div>
      )}
    </div>
  )
}
