import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Cart item: { productId, productName, sku, quantity, unitPrice, lineTotal }
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      customerId: null,
      customerName: null,
      discountAmount: 0,
      discountPercentage: 0,

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id)
          let newItems
          if (existing) {
            newItems = state.items.map((i) =>
              i.productId === product.id
                ? {
                    ...i,
                    quantity: i.quantity + quantity,
                    lineTotal: (i.quantity + quantity) * i.unitPrice,
                  }
                : i
            )
          } else {
            const qty = quantity
            const unitPrice = product.selling_price
            newItems = [
              ...state.items,
              {
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                quantity: qty,
                unitPrice,
                lineTotal: qty * unitPrice,
              },
            ]
          }
          return { items: newItems }
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.productId !== productId) }
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId
                ? { ...i, quantity, lineTotal: quantity * i.unitPrice }
                : i
            ),
          }
        }),

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

      setCustomer: (customerId, customerName) =>
        set({ customerId, customerName }),

      clearCustomer: () => set({ customerId: null, customerName: null }),

      setDiscount: (amount, percentage) =>
        set({ discountAmount: amount ?? 0, discountPercentage: percentage ?? 0 }),

      clearCart: () =>
        set({
          items: [],
          customerId: null,
          customerName: null,
          discountAmount: 0,
          discountPercentage: 0,
        }),

      getSubtotal: () => {
        const state = get()
        return state.items.reduce((sum, i) => sum + Number(i.lineTotal), 0)
      },

      getTotal: () => {
        const state = get()
        const subtotal = state.items.reduce((sum, i) => sum + Number(i.lineTotal), 0)
        const discount = state.discountAmount || (subtotal * (state.discountPercentage || 0)) / 100
        return Math.max(0, subtotal - discount)
      },
    }),
    { name: 'mayez-cart' }
  )
)
