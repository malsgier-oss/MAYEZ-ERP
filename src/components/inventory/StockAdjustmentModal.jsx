import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { t } from '../../utils/i18n'

const REASONS = [
  { value: 'received', labelKey: 'inventory.reason_received' },
  { value: 'sold external', labelKey: 'inventory.reason_sold' },
  { value: 'damaged', labelKey: 'inventory.reason_damaged' },
  { value: 'stolen', labelKey: 'inventory.reason_stolen' },
  { value: 'counted', labelKey: 'inventory.reason_counted' },
]

export default function StockAdjustmentModal({ product, onClose, onDone }) {
  const [newStock, setNewStock] = useState(String(product.current_stock))
  const [reason, setReason] = useState('counted')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const current = Number(product.current_stock) || 0
  const target = parseInt(newStock, 10)
  const diff = isNaN(target) ? 0 : target - current

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (diff === 0) {
      onClose()
      return
    }
    setLoading(true)
    setError(null)
    try {
      const movementType = diff > 0 ? 'adjustment' : 'adjustment'
      const quantity = Math.abs(diff)
      await supabase.from('stock_movements').insert({
        product_id: product.id,
        movement_type: 'adjustment',
        quantity: diff > 0 ? quantity : -quantity,
        reference_type: 'adjustment',
        reference_id: null,
        reason: reason || null,
        notes: notes.trim() || null,
      })
      const updatedStock = current + diff
      await supabase
        .from('products')
        .update({
          current_stock: Math.max(0, updatedStock),
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id)
      onDone()
    } catch (err) {
      setError(err.message || t('stock_adjustment.failed_adjust'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-2">{t('inventory.adjust_stock')}</h3>
        <p className="text-slate-600 mb-4 font-medium">{product.name}</p>
        <p className="text-sm text-slate-500 mb-4">{t('inventory.current_stock_label')}: {current}</p>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">{t('inventory.new_stock')} *</span>
              <input
                type="number"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="mt-1 w-full px-4 py-2 border rounded-lg"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">{t('inventory.reason')}</span>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full px-4 py-2 border rounded-lg"
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {t(r.labelKey)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">{t('inventory.note_optional')}</span>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full px-4 py-2 border rounded-lg"
              />
            </label>
          </div>
          <div className="flex gap-2 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : diff >= 0 ? `+${diff}` : diff}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
