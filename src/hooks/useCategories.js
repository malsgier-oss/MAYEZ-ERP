import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: e } = await supabase
        .from('categories')
        .select('*')
        .order('name')
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
  }

  useEffect(() => {
    fetchCategories()
  }, [])

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

  return { categories, loading, error, fetchCategories, addCategory, updateCategory }
}
