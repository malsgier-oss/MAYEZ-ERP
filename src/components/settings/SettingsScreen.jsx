import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { t } from '../../utils/i18n'
import { exportProductsCsv, exportCustomersCsv, exportInvoicesCsv } from '../../utils/csvExport'

const DEFAULT_SETTINGS = {
  business_name: 'My Business',
  business_address: '',
  business_phone: '',
  invoice_prefix: 'INV',
  currency_symbol: '$',
  receipt_footer: 'Thank you for your business!',
  language: 'en',
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('mayez-settings')
    if (stored) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) })
      } catch {}
    }
  }, [])

  const handleSave = (e) => {
    e.preventDefault()
    setLoading(true)
    localStorage.setItem('mayez-settings', JSON.stringify(settings))
    setSaved(true)
    setLoading(false)
    setTimeout(() => setSaved(false), 2000)
    window.dispatchEvent(new CustomEvent('mayez-settings-saved'))
  }

  const handleExportProducts = async () => {
    setExporting('products')
    try {
      const { data } = await supabase.from('products').select('*').order('name')
      exportProductsCsv(data || [])
    } finally {
      setExporting(null)
    }
  }
  const handleExportCustomers = async () => {
    setExporting('customers')
    try {
      const { data } = await supabase.from('customers').select('*').order('name')
      exportCustomersCsv(data || [])
    } finally {
      setExporting(null)
    }
  }
  const handleExportInvoices = async () => {
    setExporting('invoices')
    try {
      const { data } = await supabase.from('invoices').select('*').order('invoice_date', { ascending: false })
      exportInvoicesCsv(data || [])
    } finally {
      setExporting(null)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('settings.title')}</h1>
      {saved && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">{t('settings.saved')}</div>
      )}
      <form onSubmit={handleSave} className="max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.language')}</label>
          <select
            value={settings.language}
            onChange={(e) => setSettings((s) => ({ ...s, language: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="en">{t('lang.en')}</option>
            <option value="ar">{t('lang.ar')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.business_name')}</label>
          <input
            type="text"
            value={settings.business_name}
            onChange={(e) => setSettings((s) => ({ ...s, business_name: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.address')}</label>
          <textarea
            value={settings.business_address}
            onChange={(e) => setSettings((s) => ({ ...s, business_address: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.phone')}</label>
          <input
            type="text"
            value={settings.business_phone}
            onChange={(e) => setSettings((s) => ({ ...s, business_phone: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.invoice_prefix')}</label>
          <input
            type="text"
            value={settings.invoice_prefix}
            onChange={(e) => setSettings((s) => ({ ...s, invoice_prefix: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="INV"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.currency_symbol')}</label>
          <input
            type="text"
            value={settings.currency_symbol}
            onChange={(e) => setSettings((s) => ({ ...s, currency_symbol: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="$"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.receipt_footer')}</label>
          <textarea
            value={settings.receipt_footer}
            onChange={(e) => setSettings((s) => ({ ...s, receipt_footer: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg"
            rows={2}
          />
        </div>
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 touch-target"
          >
            {loading ? t('settings.saving') : t('settings.save')}
          </button>
        </div>
      </form>
      <p className="mt-6 text-sm text-slate-500">
        {t('settings.stored_in_browser')}
      </p>

      <div className="mt-8 pt-8 border-t border-slate-200">
        <h2 className="text-lg font-semibold mb-3">{t('export.title')}</h2>
        <p className="text-sm text-slate-600 mb-4">Download CSV backup of your data.</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExportProducts}
            disabled={!!exporting}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 touch-target"
          >
            {exporting === 'products' ? '...' : t('export.products')}
          </button>
          <button
            type="button"
            onClick={handleExportCustomers}
            disabled={!!exporting}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 touch-target"
          >
            {exporting === 'customers' ? '...' : t('export.customers')}
          </button>
          <button
            type="button"
            onClick={handleExportInvoices}
            disabled={!!exporting}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 touch-target"
          >
            {exporting === 'invoices' ? '...' : t('export.invoices')}
          </button>
        </div>
      </div>
    </div>
  )
}
