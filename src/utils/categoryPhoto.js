import { supabase } from '../lib/supabase'

const BUCKET = 'category-photos'
const MAX_SIZE_MB = 2
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function getExtension(file) {
  const name = file.name || ''
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i).toLowerCase() : '.jpg'
}

export function getCategoryPhotoUrl(category) {
  if (!category?.image_url) return null
  return category.image_url
}

/** Get a signed URL so the image loads even when the bucket is private (1h expiry). */
export async function getCategoryPhotoSignedUrl(imageUrl) {
  if (!imageUrl) return null
  const path = imageUrl.split('/').pop()?.split('?')[0]
  if (!path) return imageUrl
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
  if (error) return imageUrl
  return data?.signedUrl || imageUrl
}

export async function uploadCategoryPhoto(categoryId, file) {
  if (!file || !categoryId) return null
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Image must be under ${MAX_SIZE_MB} MB`)
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Use JPEG, PNG, or WebP')
  }
  const ext = getExtension(file)
  const path = `${categoryId}${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function removeCategoryPhoto(categoryId, currentImageUrl) {
  if (!categoryId || !currentImageUrl) return
  try {
    const path = currentImageUrl.split('/').pop()?.split('?')[0]
    if (path) await supabase.storage.from(BUCKET).remove([path])
  } catch {
    // ignore if file missing
  }
}
