import { useState } from 'react'
import { t } from '../../utils/i18n'

export default function CustomerSelectModal({ customers, selectedId, onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const filtered = search.trim()
    ? customers.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
          (c.phone && c.phone.includes(search))
      )
    : customers

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] flex flex-col">
        <h3 className="text-lg font-semibold mb-4">{t('pos.select_customer_modal')}</h3>
        <input
          type="search"
          placeholder={t('pos.search_customer_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-4"
        />
        <div className="overflow-auto flex-1 space-y-1">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={`w-full text-left px-4 py-3 rounded-lg touch-target ${!selectedId ? 'bg-blue-100' : 'hover:bg-slate-100'}`}
          >
            {t('pos.walkin_no_customer')}
          </button>
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c)}
              className={`w-full text-left px-4 py-3 rounded-lg touch-target ${selectedId === c.id ? 'bg-blue-100' : 'hover:bg-slate-100'}`}
            >
              <span className="font-medium">{c.name}</span>
              {c.phone && <span className="text-slate-500 text-sm ms-2">{c.phone}</span>}
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} className="mt-4 w-full py-3 border rounded-xl">
          {t('pos.close')}
        </button>
      </div>
    </div>
  )
}
