import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const FETCH_TIMEOUT_MS = 15_000

function withTimeout(promise, ms, message = 'Request timed out') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ])
}

export function useCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCustomers = async () => {
    setLoading(true)
    setError(null)
    try {
      const query = supabase.from('customers').select('*').eq('is_active', true).order('name')
      const { data, error: e } = await withTimeout(query, FETCH_TIMEOUT_MS, 'Customers load timed out. Check your connection and Supabase.')
      if (e) {
        setError(e.message)
        setCustomers([])
      } else {
        setCustomers(data || [])
      }
    } catch (err) {
      setError(err?.message || 'Failed to load customers')
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const addCustomer = async (customer) => {
    const { data, error: e } = await supabase.from('customers').insert(customer).select().single()
    if (e) throw e
    setCustomers((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  const updateCustomer = async (id, updates) => {
    const { data, error: e } = await supabase.from('customers').update(updates).eq('id', id).select().single()
    if (e) throw e
    setCustomers((prev) => prev.map((c) => (c.id === id ? data : c)))
    return data
  }

  return { customers, loading, error, fetchCustomers, addCustomer, updateCustomer }
}

export async function getCustomerDebt(customerId) {
  const { data: unpaid } = await supabase
    .from('invoices')
    .select('total_amount, paid_amount')
    .eq('customer_id', customerId)
    .in('status', ['unpaid', 'partial'])
  const debt = (unpaid || []).reduce((sum, inv) => sum + (Number(inv.total_amount) - Number(inv.paid_amount)), 0)
  return debt
}
