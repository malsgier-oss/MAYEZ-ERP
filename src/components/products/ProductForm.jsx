import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'
import { uploadProductPhoto, removeProductPhoto, getProductPhotoUrl } from '../../utils/productPhoto'
import { t } from '../../utils/i18n'

const UNITS = ['pcs', 'kg', 'box', 'pack', 'meter', 'liter']

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const { addProduct, updateProduct, products, fetchProducts } = useProducts()
  const { categories } = useCategories()
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [form, setForm] = useState({
    name: '',
    sku: '',
    description: '',
    category_id: null,
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
        category_id: product.category_id || null,
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
        category_id: form.category_id || null,
        unit: form.unit,
        selling_price: Number(form.selling_price) || 0,
        current_stock: Number(form.current_stock) || 0,
        low_stock_threshold: Number(form.low_stock_threshold) || 0,
      }
      if (isEdit) {
        if (removePhoto && product?.image_url) {
          await removeProductPhoto(id, product.image_url)
          payload.image_url = null
        } else if (photoFile) {
          payload.image_url = await uploadProductPhoto(id, photoFile)
        }
        await updateProduct(id, payload)
      } else {
        const created = await addProduct(payload)
        if (photoFile && created?.id) {
          const url = await uploadProductPhoto(created.id, photoFile)
          await updateProduct(created.id, { image_url: url })
        }
      }
      navigate('/products')
    } catch (err) {
      setError(err.message || t('common.failed_save'))
    } finally {
      setLoading(false)
    }
  }

  const currentPhotoUrl = removePhoto ? null : (photoFile ? URL.createObjectURL(photoFile) : getProductPhotoUrl(product))
  const showPreview = currentPhotoUrl || (isEdit && product?.image_url && !removePhoto && !photoFile)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? t('products.edit_product') : t('products.add_product')}</h1>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.name')} *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.sku')}</label>
          <input
            type="text"
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.category')}</label>
          <select
            value={form.category_id || ''}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value || null }))}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">{t('products.no_category')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.photo')}</label>
          <div className="flex flex-wrap items-start gap-4">
            {showPreview && (
              <div className="relative">
                <img
                  src={currentPhotoUrl || product?.image_url}
                  alt="Product"
                  className="w-24 h-24 object-cover rounded-lg border border-slate-200"
                />
                {isEdit && product?.image_url && !photoFile && !removePhoto && (
                  <button
                    type="button"
                    onClick={() => { setRemovePhoto(true); setPhotoFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-sm leading-none flex items-center justify-center hover:bg-red-600"
                    title={t('products.remove_photo')}
                  >
                    ×
                  </button>
                )}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) { setPhotoFile(f); setRemovePhoto(false) }
                }}
                className="text-sm"
              />
              <span className="text-xs text-slate-500">{t('products.photo_hint')}</span>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.description')}</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.unit')}</label>
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
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.price')} *</label>
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
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.current_stock')}</label>
          <input
            type="number"
            min="0"
            value={form.current_stock}
            onChange={(e) => setForm((f) => ({ ...f, current_stock: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.low_stock_threshold_label')}</label>
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
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 touch-target"
          >
            {loading ? t('products.saving') : isEdit ? t('products.update') : t('products.add_product')}
          </button>
        </div>
      </form>
    </div>
  )
}
