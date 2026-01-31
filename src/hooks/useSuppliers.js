import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const FETCH_TIMEOUT_MS = 15_000

function withTimeout(promise, ms, message = 'Request timed out') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ])
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSuppliers = async () => {
    setLoading(true)
    setError(null)
    try {
      const query = supabase.from('suppliers').select('*').eq('is_active', true).order('name')
      const { data, error: e } = await withTimeout(query, FETCH_TIMEOUT_MS, 'Suppliers load timed out.')
      if (e) {
        setError(e.message)
        setSuppliers([])
      } else {
        setSuppliers(data || [])
      }
    } catch (err) {
      setError(err?.message || 'Failed to load suppliers')
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const addSupplier = async (supplier) => {
    const { data, error: e } = await supabase.from('suppliers').insert(supplier).select().single()
    if (e) throw e
    setSuppliers((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  const updateSupplier = async (id, updates) => {
    const { data, error: e } = await supabase.from('suppliers').update(updates).eq('id', id).select().single()
    if (e) throw e
    setSuppliers((prev) => prev.map((s) => (s.id === id ? data : s)))
    return data
  }

  return { suppliers, loading, error, fetchSuppliers, addSupplier, updateSupplier }
}
