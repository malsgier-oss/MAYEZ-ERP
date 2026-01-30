/**
 * Format number as currency (Phase 1: single currency from settings)
 */
export function formatCurrency(amount, currencySymbol = '$') {
  if (amount == null || isNaN(amount)) return currencySymbol + '0.00'
  return currencySymbol + Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
