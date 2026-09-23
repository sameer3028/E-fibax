/**
 * Utility functions for product category mapping and filtering across the entire application.
 * 
 * SINGLE SOURCE OF TRUTH:
 * Use ONLY the category selected/assigned to a product in the Admin Portal (p.categoryId, p.category, p.categoryIds).
 * 
 * Do NOT determine category from:
 * - Product title/name
 * - Description
 * - Dosage form string
 * - Keywords or SKU
 * - Image or text matching
 */

export function isProductInCategory(product, targetCategory) {
  if (!targetCategory || targetCategory === 'all') return true;
  if (!product) return false;

  const target = String(targetCategory).trim().toLowerCase();

  // Get saved categories from product object
  const pCatId = product.categoryId ? String(product.categoryId).trim().toLowerCase() : '';
  const pCat = product.category ? String(product.category).trim().toLowerCase() : '';

  // Direct match against primary saved category fields
  if (pCatId === target || pCat === target) return true;

  // Handle aliases (e.g., skincare / personal-care)
  if (
    (target === 'skincare' || target === 'personal-care') &&
    (pCatId === 'skincare' || pCatId === 'personal-care' || pCat === 'skincare' || pCat === 'personal-care')
  ) {
    return true;
  }

  // Handle multiple category assignments (categoryIds array)
  if (Array.isArray(product.categoryIds)) {
    const foundInIds = product.categoryIds.some(id => {
      const val = String(id).trim().toLowerCase();
      if (val === target) return true;
      if ((target === 'skincare' || target === 'personal-care') && (val === 'skincare' || val === 'personal-care')) return true;
      return false;
    });
    if (foundInIds) return true;
  }

  // Handle multiple category assignments (categories array)
  if (Array.isArray(product.categories)) {
    const foundInCategories = product.categories.some(c => {
      const val = String(c).trim().toLowerCase();
      if (val === target) return true;
      if ((target === 'skincare' || target === 'personal-care') && (val === 'skincare' || val === 'personal-care')) return true;
      return false;
    });
    if (foundInCategories) return true;
  }

  return false;
}
