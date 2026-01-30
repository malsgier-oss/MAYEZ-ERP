import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
const UNITS = ['pcs', 'kg', 'box', 'pack', 'meter', 'liter']

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const { addProduct, updateProduct, products } = useProducts()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    name: '',
    sku: '',
    description: '',
    unit: 'pcs',
    selling_price: 0,
    current_stock: 0,
    low_stock_threshold: 0,
  })

  const product = products.find((p) => p.id === id)

  useEffect(() => {
    if (isEdit && product) {
      setForm({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        unit: product.unit || 'pcs',
        selling_price: product.selling_price ?? 0,
        current_stock: product.current_stock ?? 0,
        low_stock_threshold: product.low_stock_threshold ?? 0,
      })
    }
  }, [isEdit, product])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim() || null,
        description: form.description.trim() || null,
        unit: form.unit,
        selling_price: Number(form.selling_price) || 0,
        current_stock: Number(form.current_stock) || 0,
        low_stock_threshold: Number(form.low_stock_threshold) || 0,
      }
      if (isEdit) {
        await updateProduct(id, payload)
      } else {
        await addProduct(payload)
      }
      navigate('/products')
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
          <input
            type="text"
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
          <select
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Selling price *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={form.selling_price}
            onChange={(e) => setForm((f) => ({ ...f, selling_price: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Current stock</label>
          <input
            type="number"
            min="0"
            value={form.current_stock}
            onChange={(e) => setForm((f) => ({ ...f, current_stock: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Low stock threshold</label>
          <input
            type="number"
            min="0"
            value={form.low_stock_threshold}
            onChange={(e) => setForm((f) => ({ ...f, low_stock_threshold: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 touch-target"
          >
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
