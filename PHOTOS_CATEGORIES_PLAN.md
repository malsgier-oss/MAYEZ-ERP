# MAYEZ-ERP: Product Photos & Categories Plan

**Document Version:** 1.0  
**Last Updated:** 2026-01-30  
**Purpose:** Plan for adding product categories (UI + usage) and product photos to the catalog.

---

## Table of Contents

1. [Current State](#1-current-state)
2. [Goals & Scope](#2-goals--scope)
3. [Categories](#3-categories)
4. [Product Photos](#4-product-photos)
5. [Implementation Order](#5-implementation-order)
6. [Technical Specs](#6-technical-specs)
7. [Files to Create or Modify](#7-files-to-create-or-modify)
8. [Testing Checklist](#8-testing-checklist)
9. [Out of Scope / Later](#9-out-of-scope--later)

---

## 1. Current State

| Feature | Schema | UI / Usage |
|--------|--------|------------|
| **Categories** | ✅ `categories` table exists; `products.category_id` FK exists | ❌ No category CRUD; ProductForm/ProductList don't use category |
| **Product photos** | ❌ No image column or storage | ❌ No upload or display |

**Relevant schema (existing):**

- `categories`: `id`, `name`, `created_at`
- `products`: includes `category_id` (FK to `categories`)

---

## 2. Goals & Scope

### Categories

- Manage categories (list, add, edit, optional delete/archive).
- Assign one category per product in ProductForm.
- Filter products by category in ProductList and optionally in POS.
- Show category name in product list and product form (read/edit).

### Product Photos

- One primary image per product (Phase 1).
- Upload image when adding/editing a product.
- Display thumbnail in ProductList and in POS (optional, for faster recognition).
- Store images in Supabase Storage; store public URL in `products` (new column).

### Success Criteria

- User can create categories and assign products to them.
- User can filter product list by category.
- User can add/change a product photo and see it in list and form.
- No breaking changes to existing POS flow (categories/photos are additive).

---

## 3. Categories

### 3.1 Data Model (Already Exists)

- **categories**: `id`, `name`, `created_at`
- **products**: `category_id` (nullable FK to `categories`)

Optional: add `sort_order` or `is_active` to categories later; not required for Phase 1.

### 3.2 New UI

| Screen | Addition |
|--------|----------|
| **Categories management** | New section or page: list categories, Add/Edit category (name only). Optional: "Products in category" count. |
| **ProductForm** | Dropdown or combobox: "Category" (optional). Load categories from `categories` table. Save `category_id` in product. |
| **ProductList** | Filter dropdown: "All categories" / list of categories. Show category name column (or subtext). |
| **POS (optional)** | Filter products by category in ProductSearch (dropdown or tabs). |

### 3.3 API / Data

- **Categories**: `useCategories()` hook (or inline in ProductForm): fetch all categories, `addCategory`, `updateCategory`. Optional: soft delete.
- **Products**: `useProducts()` already fetches `*`; ensure select includes `category_id` and optionally `categories(name)` for display. ProductForm payload must include `category_id` (null or UUID).

### 3.4 Navigation

- Add "Categories" under Products (e.g. "Products" + "Categories" in sidebar), or a "Categories" item in Settings. Recommendation: under Products or main nav as "Categories".

---

## 4. Product Photos

### 4.1 Storage Strategy

- **Supabase Storage**: Create a bucket (e.g. `product-photos`), public read. Store by `{product_id}.{ext}` or `{product_id}/{filename}` to avoid collisions.
- **products table**: Add column `image_url` (text, nullable). Store the public URL after upload.
- **Fallback**: If no image, show a placeholder (e.g. icon or "No image" placeholder) in list and form.

### 4.2 Data Model Change

- Add to `products` (migration):

```sql
alter table products add column if not exists image_url text;
```

- Supabase Storage: bucket `product-photos`, public read; upload with path like `{product_id}.jpg` (or keep original extension). Optionally resize/optimize on upload (client or Edge Function later).

### 4.3 UI

| Screen | Addition |
|--------|----------|
| **ProductForm** | "Product photo" section: file input (accept image/*), preview, optional "Remove photo". On save: upload to Storage, set `image_url`; if "Remove", delete from Storage and set `image_url` to null. |
| **ProductList** | Thumbnail column (small image or placeholder). |
| **POS ProductSearch** | Optional: small thumbnail next to product name for faster recognition. |

### 4.4 Upload Flow

1. User selects file in ProductForm.
2. If new product: create product first (without image), then upload with `product_id` as path component; then update product with `image_url`.
3. If edit: upload to Storage (overwrite or new path), get public URL, update `products.image_url`.
4. File size limit: e.g. 2–5 MB. Allowed types: image/jpeg, image/png, image/webp.

---

## 5. Implementation Order

### Phase A: Categories Only (smallest change)

1. **useCategories hook** – fetch, add, update categories.
2. **Categories list screen** – list categories, add/edit (name only), link from nav.
3. **ProductForm** – load categories, add Category dropdown, save `category_id`.
4. **useProducts** – ensure select includes `category_id` and optionally `categories(name)`.
5. **ProductList** – category filter dropdown, show category name column.

### Phase B: Product Photos

6. **DB migration** – add `products.image_url`; create Storage bucket and policy.
7. **ProductForm** – image upload (file input + preview), upload to Storage, set `image_url`; handle remove.
8. **ProductList** – thumbnail column with placeholder when no image.
9. **POS (optional)** – show small thumbnail in product grid/list.

Implementing **Phase A first** keeps scope clear and avoids mixing category and storage work. **Phase B** can follow immediately or in a later sprint.

---

## 6. Technical Specs

### 6.1 Categories

- **Hook**: `src/hooks/useCategories.js` – `categories`, `loading`, `error`, `fetchCategories`, `addCategory(name)`, `updateCategory(id, { name })`.
- **Routes**: `/categories` (list), `/categories/new`, `/categories/:id/edit` (or single page with modal for add/edit).
- **ProductForm**: `category_id` in form state and payload; dropdown options from `useCategories().categories`.

### 6.2 Product Photos

- **Bucket**: `product-photos`, public read. Path: `{product_id}` + extension (e.g. `abc-123-uuid.jpg`).
- **Policy**: Allow anon/authenticated upload and delete for your app; public read for GET.
- **URL**: Use Supabase Storage public URL: `{SUPABASE_URL}/storage/v1/object/public/product-photos/{path}`.
- **ProductForm**: On submit with new image – upload file, get public URL, set `image_url` in product insert/update. Max size: e.g. 2 MB; types: jpeg, png, webp.

---

## 7. Files to Create or Modify

### Categories (Phase A)

| Action | File |
|--------|------|
| Create | `src/hooks/useCategories.js` |
| Create | `src/components/categories/CategoryList.jsx` (and optional CategoryForm modal or page) |
| Modify | `src/App.jsx` – routes for `/categories`, `/categories/new`, `/categories/:id/edit` |
| Modify | `src/components/shared/Layout.jsx` – nav link "Categories" |
| Modify | `src/components/products/ProductForm.jsx` – category dropdown, `category_id` in state and payload |
| Modify | `src/hooks/useProducts.js` – select `*, categories(name)` (or minimal category for display) |
| Modify | `src/components/products/ProductList.jsx` – category filter, category column |

### Product Photos (Phase B)

| Action | File |
|--------|------|
| Create | `supabase/migrations/add_product_image_url.sql` (or add to schema doc) – `alter table products add column image_url text` |
| Create | Storage bucket + policy (Supabase dashboard or migration) |
| Create | `src/utils/productPhoto.js` (or similar) – `uploadProductPhoto(productId, file)`, `getProductPhotoUrl(product)`, `removeProductPhoto(productId)` |
| Modify | `src/components/products/ProductForm.jsx` – file input, preview, upload on save, remove button |
| Modify | `src/components/products/ProductList.jsx` – thumbnail column |
| Modify | `src/hooks/useProducts.js` – ensure `image_url` is in select (already `*`) |
| Optional | POS ProductSearch / Cart – show small product image |

---

## 8. Testing Checklist

### Categories

- [ ] Create category, appears in list.
- [ ] Edit category name, list and product form show new name.
- [ ] Assign category to product, save; ProductList shows category; filter by that category shows product.
- [ ] Product with no category: filter "All" shows it; "No category" or empty filter option works.
- [ ] Delete or deactivate category: products with that `category_id` either show "Unknown" or keep FK (handle gracefully).

### Product Photos

- [ ] Upload image on new product: image appears in form preview and in ProductList thumbnail.
- [ ] Upload image on edit: replaces previous; URL updates.
- [ ] Remove photo: placeholder in list and form; `image_url` null in DB.
- [ ] Large file or non-image: validation message; no crash.
- [ ] POS (if implemented): thumbnail visible in product list/search.

---

## 9. Out of Scope / Later

- Multiple images per product (gallery).
- Image cropping/editing in browser.
- Categories hierarchy (parent/child).
- Moving Storage to CDN or custom domain.
- Automatic image resizing (can add later via Supabase Edge Function or client).

---

## Quick Reference

| Feature | DB | Storage | New hook | New screens | Modified |
|---------|----|--------|----------|-------------|----------|
| **Categories** | Already there | — | useCategories | CategoryList (+ optional form) | ProductForm, ProductList, Layout, App (routes) |
| **Product photos** | Add `image_url` | Bucket `product-photos` | — | — | ProductForm, ProductList, optional POS |

---

**Document Owner:** MAYEZ-ERP  
**Next step:** Implement Phase A (Categories), then Phase B (Product photos) per this plan.
