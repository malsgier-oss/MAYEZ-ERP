import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSuppliers } from '../../hooks/useSuppliers'
import { t } from '../../utils/i18n'

export default function SupplierForm() {
  const navigate = useNavigate()
  const { addSupplier } = useSuppliers()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await addSupplier({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        notes: form.notes.trim() || null,
      })
      navigate('/suppliers')
    } catch (err) {
      setError(err.message || t('suppliers.failed_save'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('suppliers.add_supplier')}</h1>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('suppliers.name')} *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('suppliers.phone')}</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('suppliers.email')}</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('suppliers.address')}</label>
          <textarea
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('suppliers.notes')}</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
            rows={2}
          />
        </div>
        <div className="flex gap-2 pt-4">
          <button type="button" onClick={() => navigate('/suppliers')} className="px-4 py-2 border rounded-lg">
            {t('common.cancel')}
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 touch-target">
            {loading ? t('suppliers.loading') : t('common.add')}
          </button>
        </div>
      </form>
    </div>
  )
}
