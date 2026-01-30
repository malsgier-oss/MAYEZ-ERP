import { supabase } from '../lib/supabase'

const BUCKET = 'product-photos'
const MAX_SIZE_MB = 2
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function getExtension(file) {
  const name = file.name || ''
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i).toLowerCase() : '.jpg'
}

export function getProductPhotoUrl(product) {
  if (!product?.image_url) return null
  return product.image_url
}

export async function uploadProductPhoto(productId, file) {
  if (!file || !productId) return null
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Image must be under ${MAX_SIZE_MB} MB`)
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Use JPEG, PNG, or WebP')
  }
  const ext = getExtension(file)
  const path = `${productId}${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function removeProductPhoto(productId, currentImageUrl) {
  if (!productId || !currentImageUrl) return
  try {
    const path = currentImageUrl.split('/').pop()?.split('?')[0]
    if (path) await supabase.storage.from(BUCKET).remove([path])
  } catch {
    // ignore if file missing
  }
}
