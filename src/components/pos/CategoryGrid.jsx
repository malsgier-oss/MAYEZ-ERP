import { useState, useCallback } from 'react'
import { t } from '../../utils/i18n'
import { getCategoryPhotoUrl } from '../../utils/categoryPhoto'

export default function CategoryGrid({ categories, loading, onSelectCategory }) {
  const [failedImageUrls, setFailedImageUrls] = useState(new Set())

  const handleImageError = useCallback((url) => {
    setFailedImageUrls((prev) => new Set(prev).add(url))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col h-full justify-center items-center py-12">
        <p className="text-slate-500">{t('pos.loading_products')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 overflow-auto flex-1 content-start">
      <button
        type="button"
        onClick={() => onSelectCategory('all')}
        className="flex flex-col items-center justify-center p-4 bg-white border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-slate-50 transition touch-target-lg w-full min-h-[100px]"
      >
        <span className="text-2xl mb-1">📦</span>
        <span className="font-medium text-slate-700">{t('pos.all_categories')}</span>
      </button>
      {categories.map((cat) => {
        const photoUrl = getCategoryPhotoUrl(cat)
        const showImage = photoUrl && !failedImageUrls.has(photoUrl)
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition touch-target-lg text-left w-full min-h-[100px] overflow-hidden"
          >
            {showImage ? (
              <img
                src={photoUrl}
                alt=""
                className="w-14 h-14 object-cover rounded-lg mb-2 border border-slate-200"
                onError={() => handleImageError(photoUrl)}
              />
            ) : (
              <span className="text-2xl mb-2 text-slate-400">📁</span>
            )}
            <span className="font-medium truncate w-full text-center text-slate-800">{cat.name}</span>
          </button>
        )
      })}
    </div>
  )
}
