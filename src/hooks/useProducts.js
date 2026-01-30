import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const FETCH_TIMEOUT_MS = 15_000

function withTimeout(promise, ms, message = 'Request timed out') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ])
}

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const query = supabase
        .from('products')
        .select('*, categories(name)')
        .eq('is_active', true)
        .order('name')
      const { data, error: e } = await withTimeout(query, FETCH_TIMEOUT_MS, 'Products load timed out. Check your connection and Supabase.')
      if (e) {
        setError(e.message)
        setProducts([])
      } else {
        setProducts(data || [])
      }
    } catch (err) {
      setError(err?.message || 'Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const addProduct = async (product) => {
    const { data, error: e } = await supabase.from('products').insert(product).select().single()
    if (e) throw e
    setProducts((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  const updateProduct = async (id, updates) => {
    const { data, error: e } = await supabase.from('products').update(updates).eq('id', id).select().single()
    if (e) throw e
    setProducts((prev) => prev.map((p) => (p.id === id ? data : p)))
    return data
  }

  const deleteProduct = async (id) => {
    const { error: e } = await supabase.from('products').update({ is_active: false }).eq('id', id)
    if (e) throw e
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  return { products, loading, error, fetchProducts, addProduct, updateProduct, deleteProduct }
}
