import { useState } from 'react'
import { useCategories } from '../../hooks/useCategories'
import { t } from '../../utils/i18n'
import { getCategoryPhotoUrl, uploadCategoryPhoto, removeCategoryPhoto } from '../../utils/categoryPhoto'

export default function CategoryList() {
  const { categories, loading, error, addCategory, updateCategory, deleteCategory } = useCategories()
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPhotoFile, setEditPhotoFile] = useState(null)
  const [editRemovePhoto, setEditRemovePhoto] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhotoFile, setNewPhotoFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    try {
      const created = await addCategory(newName.trim())
      if (newPhotoFile) {
        const url = await uploadCategoryPhoto(created.id, newPhotoFile)
        await updateCategory(created.id, { image_url: url })
      }
      setNewName('')
      setNewPhotoFile(null)
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
    setEditPhotoFile(null)
    setEditRemovePhoto(false)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editingId || !editName.trim()) return
    setSaving(true)
    try {
      const cat = categories.find((c) => c.id === editingId)
      const updates = { name: editName.trim() }
      if (editRemovePhoto && cat?.image_url) {
        await removeCategoryPhoto(editingId, cat.image_url)
        updates.image_url = null
      } else if (editPhotoFile) {
        if (cat?.image_url) await removeCategoryPhoto(editingId, cat.image_url)
        updates.image_url = await uploadCategoryPhoto(editingId, editPhotoFile)
      }
      await updateCategory(editingId, updates)
      setEditingId(null)
      setEditName('')
      setEditPhotoFile(null)
      setEditRemovePhoto(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editingId) return
    if (!window.confirm(t('categories.delete_confirm'))) return
    setSaving(true)
    try {
      const cat = categories.find((c) => c.id === editingId)
      if (cat?.image_url) await removeCategoryPhoto(editingId, cat.image_url)
      await deleteCategory(editingId)
      setEditingId(null)
      setEditName('')
      setEditPhotoFile(null)
      setEditRemovePhoto(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const currentEditPhotoUrl = editRemovePhoto
    ? null
    : editPhotoFile
      ? URL.createObjectURL(editPhotoFile)
      : editingId
        ? getCategoryPhotoUrl(categories.find((c) => c.id === editingId))
        : null
  const newPhotoPreview = newPhotoFile ? URL.createObjectURL(newPhotoFile) : null

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold">{t('categories.title')}</h1>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium touch-target"
        >
          {t('categories.add_category')}
        </button>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}
      {loading ? (
        <p className="text-slate-500">{t('categories.loading')}</p>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <li key={cat.id} className="p-4 flex items-center gap-4 hover:bg-slate-50">
                {getCategoryPhotoUrl(cat) ? (
                  <img
                    src={getCategoryPhotoUrl(cat)}
                    alt=""
                    className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                    —
                  </div>
                )}
                {editingId === cat.id ? (
                  <form onSubmit={handleUpdate} className="flex flex-wrap gap-2 flex-1 items-start">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 min-w-[120px] px-3 py-2 border rounded-lg"
                      autoFocus
                    />
                    <div className="flex gap-2 flex-wrap">
                      <label className="flex items-center gap-1 text-sm text-slate-600">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          onChange={(e) => {
                            setEditPhotoFile(e.target.files?.[0] || null)
                            setEditRemovePhoto(false)
                          }}
                        />
                        <span className="px-2 py-1 border rounded cursor-pointer hover:bg-slate-50">{t('categories.photo')}</span>
                      </label>
                      {currentEditPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setEditRemovePhoto(true)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          {t('categories.remove_photo')}
                        </button>
                      )}
                    </div>
                    {currentEditPhotoUrl && (
                      <img
                        src={currentEditPhotoUrl}
                        alt=""
                        className="w-14 h-14 object-cover rounded border"
                      />
                    )}
                    <div className="flex gap-2 w-full flex-wrap">
                      <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50">
                        {saving ? t('categories.loading') : t('common.save')}
                      </button>
                      <button type="button" onClick={() => { setEditingId(null); setEditName(''); setEditPhotoFile(null); setEditRemovePhoto(false) }} className="px-3 py-2 border rounded-lg text-sm">
                        {t('common.cancel')}
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={saving}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-red-700"
                      >
                        {t('categories.delete')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <span className="font-medium flex-1">{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => startEdit(cat)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {t('common.edit')}
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
          {categories.length === 0 && !showAdd && (
            <p className="p-8 text-center text-slate-500">{t('categories.no_categories')}</p>
          )}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">{t('categories.add_category')}</h2>
            <form onSubmit={handleAdd}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('categories.category_name')}</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('categories.category_name')}
                className="w-full px-4 py-2 border rounded-lg mb-4"
                autoFocus
              />
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('categories.photo')}</label>
              <div className="mb-4 flex items-center gap-3">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="block w-full text-sm text-slate-500 file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700"
                  onChange={(e) => setNewPhotoFile(e.target.files?.[0] || null)}
                />
                {newPhotoPreview && (
                  <>
                    <img src={newPhotoPreview} alt="" className="w-16 h-16 object-cover rounded border" />
                    <button type="button" onClick={() => setNewPhotoFile(null)} className="text-sm text-red-600 hover:underline">
                      {t('categories.remove_photo')}
                    </button>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowAdd(false); setNewName(''); setNewPhotoFile(null) }} className="flex-1 py-2 border rounded-lg">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={saving || !newName.trim()} className="flex-1 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                  {saving ? t('categories.loading') : t('common.add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
