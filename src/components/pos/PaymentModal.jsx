import { useState } from 'react'
import { formatCurrency } from '../../utils/currency'

export default function PaymentModal({ total, onClose, onCash, onCredit, processing }) {
  const [cashAmount, setCashAmount] = useState(String(total))

  const handleCash = () => {
    const amount = parseFloat(cashAmount) || 0
    if (amount <= 0) return
    onCash(amount)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-2">Complete payment</h3>
        <p className="text-2xl font-bold text-slate-800 mb-4">{formatCurrency(total)}</p>
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm text-slate-600">Cash received</span>
            <input
              type="number"
              step="0.01"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-3 text-lg"
            />
          </label>
        </div>
        <div className="flex gap-2 mt-6">
          <button type="button" onClick={onClose} disabled={processing} className="flex-1 py-3 border rounded-xl">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCash}
            disabled={processing}
            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium disabled:opacity-50"
          >
            {processing ? '...' : 'Cash'}
          </button>
          <button
            type="button"
            onClick={() => onCredit()}
            disabled={processing}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50"
          >
            {processing ? '...' : 'Credit'}
          </button>
        </div>
      </div>
    </div>
  )
}
