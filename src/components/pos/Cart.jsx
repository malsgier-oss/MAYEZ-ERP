import { useCartStore } from '../../store/cartStore'
import { formatCurrency } from '../../utils/currency'

export default function Cart() {
  const { items, customerName, discountAmount, discountPercentage, updateQuantity, removeItem, clearCart } = useCartStore()
  const subtotal = items.reduce((sum, i) => sum + Number(i.lineTotal), 0)
  const discount = discountAmount ?? (subtotal * (discountPercentage ?? 0)) / 100
  const total = Math.max(0, subtotal - discount)

  const handleClear = () => {
    if (items.length > 0 && !window.confirm('Clear cart? This cannot be undone.')) return
    clearCart()
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-full min-h-[300px]">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Cart</h2>
        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-red-600 hover:bg-red-50 px-2 py-1 rounded touch-target"
          >
            Clear
          </button>
        )}
      </div>
      {customerName && (
        <div className="px-4 py-2 bg-slate-50 text-slate-600 text-sm">
          Customer: <span className="font-medium">{customerName}</span>
        </div>
      )}
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {items.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Cart is empty</p>
        ) : (
          items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between gap-2 py-2 border-b border-slate-100"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.productName}</p>
                <p className="text-sm text-slate-500">
                  {formatCurrency(item.unitPrice)} × {item.quantity} = {formatCurrency(item.lineTotal)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-10 h-10 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold touch-target flex items-center justify-center"
                >
                  −
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-10 h-10 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold touch-target flex items-center justify-center"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-red-600 hover:bg-red-50 p-2 rounded touch-target"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-4 border-t border-slate-200 space-y-1">
        {subtotal > 0 && (
          <>
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {(discountAmount > 0 || discountPercentage > 0) && (
              <div className="flex justify-between text-sm text-amber-700">
                <span>Discount</span>
                <span>−{formatCurrency(discount)}</span>
              </div>
            )}
          </>
        )}
        <div className="flex justify-between text-xl font-bold pt-2">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}
