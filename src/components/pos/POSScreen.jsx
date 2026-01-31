import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useProducts } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'
import { useCustomers } from '../../hooks/useCustomers'
import Cart from './Cart'
import CategoryGrid from './CategoryGrid'
import ProductSearch from './ProductSearch'
import PaymentModal from './PaymentModal'
import CustomerSelectModal from './CustomerSelectModal'
import { formatCurrency } from '../../utils/currency'
import { t } from '../../utils/i18n'
import { createInvoiceWithItems, getNextInvoiceNumber, recordStockMovement, recordPayment } from '../../hooks/useInvoices'
import { supabase } from '../../lib/supabase'

export default function POSScreen() {
  const navigate = useNavigate()
  const { products, loading } = useProducts()
  const { categories, loading: categoriesLoading, fetchCategories } = useCategories()
  const { customers } = useCustomers()
  const { items, customerId, customerName, discountAmount, discountPercentage, clearCart } = useCartStore()
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [showCustomerSelect, setShowCustomerSelect] = useState(false)
  const [showDiscount, setShowDiscount] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [toast, setToast] = useState(null)
  const [lastCreatedInvoice, setLastCreatedInvoice] = useState(null)

  const productsToShow = useMemo(() => {
    if (selectedCategoryId === null) return []
    if (selectedCategoryId === 'all') return products
    return products.filter((p) => p.category_id === selectedCategoryId)
  }, [products, selectedCategoryId])

  useEffect(() => {
    if (selectedCategoryId === null) fetchCategories()
  }, [selectedCategoryId, fetchCategories])

  const subtotal = items.reduce((sum, i) => sum + Number(i.lineTotal), 0)
  const discount = discountAmount ?? (subtotal * (discountPercentage ?? 0)) / 100
  const total = Math.max(0, subtotal - discount)
  const canComplete = items.length > 0 && total >= 0

  const handlePayment = async (method, amount) => {
    if (!canComplete) return
    setProcessing(true)
    try {
      let invoiceNumber
      try {
        invoiceNumber = await getNextInvoiceNumber()
      } catch {
        const { data: last } = await supabase.from('invoices').select('invoice_number').order('created_at', { ascending: false }).limit(1).single()
        const num = last ? parseInt(String(last.invoice_number).replace(/\D/g, ''), 10) + 1 : 1
        invoiceNumber = 'INV-' + String(num).padStart(5, '0')
      }
      const invoiceCustomerId = customerId || (method === 'credit' ? await createWalkInCustomer() : null)
      const invoice = {
        invoice_number: invoiceNumber,
        customer_id: invoiceCustomerId,
        invoice_date: new Date().toISOString().split('T')[0],
        subtotal,
        discount_amount: discountAmount || 0,
        discount_percentage: discountPercentage || 0,
        total_amount: total,
        paid_amount: method === 'credit' ? 0 : amount,
        status: method === 'credit' ? 'unpaid' : amount >= total ? 'paid' : 'partial',
      }
      const created = await createInvoiceWithItems(invoice, items)
      for (const item of items) {
        await recordStockMovement(item.productId, item.quantity, 'sale', 'invoice', created.id, null, null)
      }
      if (method === 'cash' && amount > 0) {
        await recordPayment({
          invoice_id: created.id,
          customer_id: invoiceCustomerId,
          payment_date: new Date().toISOString().split('T')[0],
          amount,
          payment_method: 'cash',
        })
      }
      clearCart()
      setShowPayment(false)
      setLastCreatedInvoice({ id: created.id, invoice_number: invoiceNumber })
      setToast({ type: 'success', message: t('pos.invoice_created').replace('{number}', invoiceNumber) })
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to create invoice' })
    } finally {
      setProcessing(false)
    }
  }

  async function createWalkInCustomer() {
    const { data } = await supabase.from('customers').insert({ name: 'Walk-in Customer' }).select('id').single()
    return data?.id
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col lg:flex-row gap-4">
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setShowCustomerSelect(true)}
            className="px-4 py-3 bg-slate-200 hover:bg-slate-300 rounded-xl font-medium touch-target"
          >
            {customerName || t('pos.select_customer')}
          </button>
          <button
            type="button"
            onClick={() => setShowDiscount(true)}
            className="px-4 py-3 bg-slate-200 hover:bg-slate-300 rounded-xl font-medium touch-target"
          >
            {t('pos.discount')}
          </button>
        </div>
        {selectedCategoryId === null ? (
          <CategoryGrid
            categories={categories}
            loading={categoriesLoading}
            onSelectCategory={setSelectedCategoryId}
          />
        ) : (
          <ProductSearch
            products={productsToShow}
            loading={loading}
            onBackToCategories={() => setSelectedCategoryId(null)}
          />
        )}
      </div>
      <div className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-4">
        <Cart />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowPayment(true)}
            disabled={!canComplete}
            className="flex-1 py-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl touch-target-lg"
          >
            {t('pos.cash')}
          </button>
          <button
            type="button"
            onClick={() => setShowPayment(true)}
            disabled={!canComplete}
            className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl touch-target-lg"
          >
            {t('pos.credit')}
          </button>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          total={total}
          onClose={() => setShowPayment(false)}
          onCash={(amount) => handlePayment('cash', amount)}
          onCredit={() => handlePayment('credit', total)}
          processing={processing}
        />
      )}
      {showCustomerSelect && (
        <CustomerSelectModal
          customers={customers}
          selectedId={customerId}
          onSelect={(c) => {
            useCartStore.getState().setCustomer(c?.id ?? null, c?.name ?? null)
            setShowCustomerSelect(false)
          }}
          onClose={() => setShowCustomerSelect(false)}
        />
      )}
      {showDiscount && (
        <DiscountModal
          onApply={(amount, pct) => {
            useCartStore.getState().setDiscount(amount, pct)
            setShowDiscount(false)
          }}
          onClose={() => setShowDiscount(false)}
        />
      )}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white`}
        >
          {toast.message}
        </div>
      )}

      {lastCreatedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-2 text-green-700">{t('pos.sale_complete')}</h3>
            <p className="text-slate-600 mb-4">{t('pos.invoice_created').replace('{number}', lastCreatedInvoice.invoice_number)}.</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  navigate(`/invoices/${lastCreatedInvoice.id}?print=1`)
                  setLastCreatedInvoice(null)
                }}
                className="w-full py-3 bg-slate-700 text-white rounded-xl font-medium touch-target"
              >
                {t('pos.print_receipt')}
              </button>
              <button
                type="button"
                onClick={() => setLastCreatedInvoice(null)}
                className="w-full py-3 border border-slate-300 rounded-xl font-medium touch-target"
              >
                {t('pos.done')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DiscountModal({ onApply, onClose }) {
  const [amount, setAmount] = useState('')
  const [pct, setPct] = useState('')
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">{t('pos.apply_discount')}</h3>
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm text-slate-600">{t('pos.fixed_amount')}</span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">{t('pos.percentage')}</span>
            <input
              type="number"
              step="0.1"
              value={pct}
              onChange={(e) => setPct(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
            />
          </label>
        </div>
        <div className="flex gap-2 mt-6">
          <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => onApply(parseFloat(amount) || 0, parseFloat(pct) || 0)}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg"
          >
            {t('pos.apply')}
          </button>
        </div>
      </div>
    </div>
  )
}
