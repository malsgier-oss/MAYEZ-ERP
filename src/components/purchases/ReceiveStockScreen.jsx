import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSuppliers } from '../../hooks/useSuppliers'
import { useProducts } from '../../hooks/useProducts'
import { supabase } from '../../lib/supabase'
import { getNextPurchaseNumber, createPurchaseWithItems } from '../../hooks/usePurchases'
import { formatCurrency } from '../../utils/currency'
import { t } from '../../utils/i18n'

const emptyLine = () => ({ product_id: '', product_name: '', quantity: 1, unit_cost: 0, line_total: 0 })

export default function ReceiveStockScreen() {
  const navigate = useNavigate()
  const { suppliers } = useSuppliers()
  const { products } = useProducts()
  const [supplierId, setSupplierId] = useState('')
  const [lines, setLines] = useState([emptyLine()])
  const [payMethod, setPayMethod] = useState('cash')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const total = lines.reduce((sum, l) => sum + Number(l.line_total || 0), 0)

  const updateLine = (index, field, value) => {
    setLines((prev) => {
      const next = prev.map((l, i) => (i !== index ? l : { ...l, [field]: value }))
      if (field === 'product_id') {
        const product = products.find((p) => p.id === value)
        if (product) next[index].product_name = product.name
      }
      if (field === 'quantity' || field === 'unit_cost') {
        const q = Number(next[index].quantity) || 0
        const u = Number(next[index].unit_cost) || 0
        next[index].line_total = q * u
      }
      return next
    })
  }

  const addLine = () => setLines((prev) => [...prev, emptyLine()])
  const removeLine = (index) => setLines((prev) => prev.filter((_, i) => i !== index))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!supplierId) {
      setError(t('purchase.select_supplier'))
      return
    }
    const validLines = lines.filter((l) => l.product_id && Number(l.quantity) > 0)
    if (validLines.length === 0) {
      setError(t('purchase.add_one_line'))
      return
    }
    if (total <= 0) {
      setError('Total must be greater than 0')
      return
    }
    setLoading(true)
    setError(null)
    try {
      let purchaseNumber
      try {
        purchaseNumber = await getNextPurchaseNumber()
      } catch {
        const { data: last } = await supabase.from('purchases').select('purchase_number').order('created_at', { ascending: false }).limit(1).maybeSingle()
        const num = last?.purchase_number ? parseInt(String(last.purchase_number).replace(/\D/g, ''), 10) + 1 : 1
        purchaseNumber = 'PUR-' + String(num).padStart(5, '0')
      }
      const purchase = {
        supplier_id: supplierId,
        purchase_number: purchaseNumber,
        purchase_date: new Date().toISOString().split('T')[0],
        total_amount: total,
        paid_amount: payMethod === 'cash' ? total : 0,
        status: payMethod === 'cash' ? 'paid' : 'unpaid',
        notes: notes.trim() || null,
      }
      const items = validLines.map((l) => ({
        product_id: l.product_id,
        product_name: l.product_name,
        quantity: Number(l.quantity),
        unit_cost: Number(l.unit_cost) || 0,
        line_total: Number(l.line_total) || 0,
      }))
      await createPurchaseWithItems(purchase, items, payMethod === 'credit')
      setToast(t('purchase.purchase_created').replace('{number}', purchaseNumber))
      setTimeout(() => {
        setToast(null)
        navigate('/inventory')
      }, 2000)
    } catch (err) {
      setError(err.message || t('purchase.failed_create'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t('purchase.receive_stock')}</h1>
        <button type="button" onClick={() => navigate('/inventory')} className="text-slate-600 hover:underline">
          {t('common.back')} {t('nav.inventory')}
        </button>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}
      {toast && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">{toast}</div>
      )}
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('purchase.supplier')} *</label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          >
            <option value="">{t('purchase.select_supplier')}</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.phone ? `(${s.phone})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-700">{t('purchase.product')} / {t('purchase.quantity')} / {t('purchase.unit_cost')}</label>
            <button type="button" onClick={addLine} className="text-sm text-blue-600 hover:underline">
              {t('purchase.add_line')}
            </button>
          </div>
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-2 font-medium">{t('purchase.product')}</th>
                  <th className="text-right p-2 w-24">{t('purchase.quantity')}</th>
                  <th className="text-right p-2 w-28">{t('purchase.unit_cost')}</th>
                  <th className="text-right p-2 w-28">{t('purchase.line_total')}</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={index} className="border-t border-slate-100">
                    <td className="p-2">
                      <select
                        value={line.product_id}
                        onChange={(e) => updateLine(index, 'product_id', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="">—</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={line.quantity}
                        onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-right"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.unit_cost || ''}
                        onChange={(e) => updateLine(index, 'unit_cost', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-right"
                      />
                    </td>
                    <td className="p-2 text-right font-medium">
                      {formatCurrency(line.line_total || 0)}
                    </td>
                    <td className="p-2">
                      {lines.length > 1 && (
                        <button type="button" onClick={() => removeLine(index)} className="text-red-600 hover:underline text-sm">
                          {t('pos.remove')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-lg font-bold">{t('pos.total')}: {formatCurrency(total)}</span>
          <fieldset className="flex gap-4">
            <legend className="sr-only">{t('purchase.payment_method')}</legend>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payMethod"
                value="cash"
                checked={payMethod === 'cash'}
                onChange={() => setPayMethod('cash')}
              />
              <span>{t('purchase.pay_now')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payMethod"
                value="credit"
                checked={payMethod === 'credit'}
                onChange={() => setPayMethod('credit')}
              />
              <span>{t('purchase.pay_later')}</span>
            </label>
          </fieldset>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('suppliers.notes')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            rows={2}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <button type="button" onClick={() => navigate('/inventory')} className="px-4 py-2 border rounded-lg">
            {t('common.cancel')}
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 touch-target">
            {loading ? t('suppliers.loading') : t('purchase.receive_stock')}
          </button>
        </div>
      </form>
    </div>
  )
}
