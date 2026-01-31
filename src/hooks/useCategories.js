import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const FETCH_TIMEOUT_MS = 15_000

function withTimeout(promise, ms, message = 'Request timed out') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ])
}

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const query = supabase
        .from('categories')
        .select('*')
        .order('name')
      const { data, error: e } = await withTimeout(query, FETCH_TIMEOUT_MS, 'Categories load timed out. Check your connection and Supabase.')
      if (e) {
        setError(e.message)
        setCategories([])
      } else {
        setCategories(data || [])
      }
    } catch (err) {
      setError(err?.message || 'Failed to load categories')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const addCategory = async (name) => {
    const { data, error: e } = await supabase
      .from('categories')
      .insert({ name: name.trim() })
      .select()
      .single()
    if (e) throw e
    setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  const updateCategory = async (id, updates) => {
    const { data, error: e } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (e) throw e
    setCategories((prev) => prev.map((c) => (c.id === id ? data : c)))
    return data
  }

  const deleteCategory = async (id) => {
    const { error: e } = await supabase.from('products').update({ category_id: null }).eq('category_id', id)
    if (e) throw e
    const { error: e2 } = await supabase.from('categories').delete().eq('id', id)
    if (e2) throw e2
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  return { categories, loading, error, fetchCategories, addCategory, updateCategory, deleteCategory }
}
