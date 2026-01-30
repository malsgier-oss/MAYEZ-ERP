import { useState } from 'react'
import { useCategories } from '../../hooks/useCategories'

export default function CategoryList() {
  const { categories, loading, error, addCategory, updateCategory, fetchCategories } = useCategories()
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    try {
      await addCategory(newName.trim())
      setNewName('')
      setShowAdd(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (cat) => {
    setEditingId(cat.id)
    setEditName(cat.name)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editingId || !editName.trim()) return
    setSaving(true)
    try {
      await updateCategory(editingId, { name: editName.trim() })
      setEditingId(null)
      setEditName('')
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium touch-target"
        >
          Add category
        </button>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <li key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                {editingId === cat.id ? (
                  <form onSubmit={handleUpdate} className="flex gap-2 flex-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg"
                      autoFocus
                    />
                    <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50">
                      Save
                    </button>
                    <button type="button" onClick={() => { setEditingId(null); setEditName('') }} className="px-3 py-2 border rounded-lg text-sm">
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <span className="font-medium">{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => startEdit(cat)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
          {categories.length === 0 && !showAdd && (
            <p className="p-8 text-center text-slate-500">No categories yet. Add one to group products.</p>
          )}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Add category</h2>
            <form onSubmit={handleAdd}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Category name"
                className="w-full px-4 py-2 border rounded-lg mb-4"
                autoFocus
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowAdd(false); setNewName('') }} className="flex-1 py-2 border rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={saving || !newName.trim()} className="flex-1 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                  {saving ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
