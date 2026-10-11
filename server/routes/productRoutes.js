import { Router } from 'express';
import { getReviewsForProduct } from '../reviews.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { getArray, setArray } from '../store.js';

const router = Router();

function readProducts() {
  return getArray('products');
}

function saveProducts(products) {
  setArray('products', products);
}

// Helper to attach dynamic approved review statistics
function attachReviewStatsToProduct(p) {
  if (!p) return p;
  const stats = getReviewsForProduct(p.id);
  const totalCount = stats.totalApprovedCount || 0;
  return {
    ...p,
    ratingAverage: totalCount > 0 ? stats.averageRating : 0,
    ratingCount: totalCount
  };
}

// GET /api/products - Get all products with optional filters
router.get('/', (req, res) => {
  try {
    const { category, concern, search, inStockOnly } = req.query;
    let products = readProducts();

    if (category && category !== 'all') {
      products = products.filter(p => p.categoryId === category);
    }
    if (concern && concern !== 'all') {
      products = products.filter(p => p.concernId === concern);
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }
    if (inStockOnly === 'true') {
      products = products.filter(p => p.inStock);
    }

    const enrichedProducts = products.map(attachReviewStatsToProduct);

    res.json({
      success: true,
      count: enrichedProducts.length,
      data: enrichedProducts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products/:id - Single product
router.get('/:id', (req, res) => {
  try {
    const products = readProducts();
    const product = products.find(p => String(p.id) === String(req.params.id));
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    const enrichedProduct = attachReviewStatsToProduct(product);
    res.json({ success: true, data: enrichedProduct });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/products - Add new product (Admin only)
router.post('/', requireAdminAuth, (req, res) => {
  try {
    const products = readProducts();
    const body = req.body || {};

    if (!body.title || !body.salePrice) {
      return res.status(400).json({ success: false, error: 'Product title and sale price are required.' });
    }

    const newId = String(Date.now());
    const slug = (body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    const mrp = Number(body.mrp) || Math.round(Number(body.salePrice) * 1.25);
    const salePrice = Number(body.salePrice);
    const discountPercent = Math.round(((mrp - salePrice) / mrp) * 100);
    const stockQuantity = Number(body.stockQuantity) || 50;

    const pkgInput = body.shippingPackage || {};
    const weightGrams = Number(pkgInput.weightGrams !== undefined ? pkgInput.weightGrams : (body.packageWeightGrams || 0));
    const lengthCm = Number(pkgInput.lengthCm !== undefined ? pkgInput.lengthCm : (body.packageLengthCm || 0));
    const widthCm = Number(pkgInput.widthCm !== undefined ? pkgInput.widthCm : (body.packageWidthCm || 0));
    const heightCm = Number(pkgInput.heightCm !== undefined ? pkgInput.heightCm : (body.packageHeightCm || 0));

    const newProduct = {
      id: newId,
      title: body.title.trim(),
      slug: slug,
      sku: body.sku || ('FBX-' + slug.toUpperCase().slice(0, 6) + '-' + newId.slice(-4)),
      dosageForm: body.dosageForm || 'Syrup',
      categoryId: body.categoryId || 'syrups',
      concernId: body.concernId || 'immunity-vitality',
      mrp: mrp,
      salePrice: salePrice,
      discountPercent: discountPercent,
      stockQuantity: stockQuantity,
      lowStockThreshold: Number(body.lowStockThreshold) || 15,
      inStock: stockQuantity > 0,
      featuredImage: body.featuredImage || (Array.isArray(body.images) && body.images[0]) || 'https://fibaxpharma.com/wp-content/uploads/2025/11/front.webp',
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : (body.featuredImage ? [body.featuredImage] : []),
      ratingAverage: body.ratingAverage || '4.8',
      ratingCount: Number(body.ratingCount) || 1,
      isBestseller: !!body.isBestseller,
      volumeWeight: body.volumeWeight || '200 ml',
      shippingPackage: {
        weightGrams: weightGrams > 0 ? weightGrams : 0,
        lengthCm: lengthCm > 0 ? lengthCm : 0,
        widthCm: widthCm > 0 ? widthCm : 0,
        heightCm: heightCm > 0 ? heightCm : 0
      },
      packageWeightGrams: weightGrams > 0 ? weightGrams : 0,
      packageLengthCm: lengthCm > 0 ? lengthCm : 0,
      packageWidthCm: widthCm > 0 ? widthCm : 0,
      packageHeightCm: heightCm > 0 ? heightCm : 0,
      shortDesc: body.shortDesc || 'Authentic Ayurvedic formulation by Fibax Pharma.',
      keyBenefits: body.keyBenefits || [
        'Natural herbal recovery and daily wellness',
        'Standardized pure botanical extracts'
      ],
      ingredients: body.ingredients || 'Standardized Ayurvedic herbs and natural decoctions',
      dosage: body.dosage || '10-15 ml twice daily after meals with water.',
      ayushCertified: body.ayushCertified !== false,
      treatmentCourseConfig: body.treatmentCourseConfig !== undefined ? body.treatmentCourseConfig : {
        enabled: false,
        heading: "SELECT TREATMENT COURSE / VALUE PACK:",
        recommendationText: "Recommended 90-Day Course for Best Results",
        packs: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    products.unshift(newProduct);
    saveProducts(products);

    console.log(`✅ Added new product: ${newProduct.title} (ID: ${newProduct.id})`);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', requireAdminAuth, (req, res) => {
  try {
    const products = readProducts();
    const idx = products.findIndex(p => String(p.id) === String(req.params.id));
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const current = products[idx];
    const body = req.body || {};

    const mrp = body.mrp !== undefined ? Number(body.mrp) : current.mrp;
    const salePrice = body.salePrice !== undefined ? Number(body.salePrice) : current.salePrice;
    const discountPercent = Math.round(((mrp - salePrice) / mrp) * 100);
    const stockQuantity = body.stockQuantity !== undefined ? Number(body.stockQuantity) : current.stockQuantity;

    const currentPkg = current.shippingPackage || {};
    const bodyPkg = body.shippingPackage || {};

    const weightGrams = Number(bodyPkg.weightGrams !== undefined ? bodyPkg.weightGrams : (body.packageWeightGrams !== undefined ? body.packageWeightGrams : (currentPkg.weightGrams !== undefined ? currentPkg.weightGrams : (current.packageWeightGrams || 0))));
    const lengthCm = Number(bodyPkg.lengthCm !== undefined ? bodyPkg.lengthCm : (body.packageLengthCm !== undefined ? body.packageLengthCm : (currentPkg.lengthCm !== undefined ? currentPkg.lengthCm : (current.packageLengthCm || 0))));
    const widthCm = Number(bodyPkg.widthCm !== undefined ? bodyPkg.widthCm : (body.packageWidthCm !== undefined ? body.packageWidthCm : (currentPkg.widthCm !== undefined ? currentPkg.widthCm : (current.packageWidthCm || 0))));
    const heightCm = Number(bodyPkg.heightCm !== undefined ? bodyPkg.heightCm : (body.packageHeightCm !== undefined ? body.packageHeightCm : (currentPkg.heightCm !== undefined ? currentPkg.heightCm : (current.packageHeightCm || 0))));

    const updated = {
      ...current,
      ...body,
      mrp,
      salePrice,
      discountPercent,
      stockQuantity,
      inStock: stockQuantity > 0,
      shippingPackage: {
        weightGrams: weightGrams > 0 ? weightGrams : 0,
        lengthCm: lengthCm > 0 ? lengthCm : 0,
        widthCm: widthCm > 0 ? widthCm : 0,
        heightCm: heightCm > 0 ? heightCm : 0
      },
      packageWeightGrams: weightGrams > 0 ? weightGrams : 0,
      packageLengthCm: lengthCm > 0 ? lengthCm : 0,
      packageWidthCm: widthCm > 0 ? widthCm : 0,
      packageHeightCm: heightCm > 0 ? heightCm : 0,
      treatmentCourseConfig: body.treatmentCourseConfig !== undefined ? body.treatmentCourseConfig : {
        enabled: false,
        heading: "SELECT TREATMENT COURSE / VALUE PACK:",
        recommendationText: "Recommended 90-Day Course for Best Results",
        packs: []
      },
      updatedAt: new Date().toISOString()
    };

    products[idx] = updated;
    saveProducts(products);

    console.log(`✏️ Updated product: ${updated.title}`);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/products/:id/pricing - Quick price / offer adjustment (Admin only)
router.patch('/:id/pricing', requireAdminAuth, (req, res) => {
  try {
    const body = req.body || {};
    const { mrp, salePrice, isBestseller } = body;
    const products = readProducts();
    const idx = products.findIndex(p => String(p.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, error: 'Product not found' });

    const current = products[idx];
    const newMrp = mrp !== undefined ? Number(mrp) : current.mrp;
    const newSalePrice = salePrice !== undefined ? Number(salePrice) : current.salePrice;
    const discountPercent = Math.round(((newMrp - newSalePrice) / newMrp) * 100);

    products[idx] = {
      ...current,
      mrp: newMrp,
      salePrice: newSalePrice,
      discountPercent: discountPercent,
      isBestseller: isBestseller !== undefined ? !!isBestseller : current.isBestseller,
      treatmentCourseConfig: body.treatmentCourseConfig !== undefined ? body.treatmentCourseConfig : current.treatmentCourseConfig,
      updatedAt: new Date().toISOString()
    };

    saveProducts(products);
    res.json({ success: true, data: products[idx] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/products/:id/stock - Quick stock increment/adjustment (Admin only)
router.patch('/:id/stock', requireAdminAuth, (req, res) => {
  try {
    const { stockQuantity, delta, lowStockThreshold } = req.body || {};
    const products = readProducts();
    const idx = products.findIndex(p => String(p.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, error: 'Product not found' });

    const current = products[idx];
    let newQty = current.stockQuantity;
    if (stockQuantity !== undefined) {
      newQty = Math.max(0, Number(stockQuantity));
    } else if (delta !== undefined) {
      newQty = Math.max(0, newQty + Number(delta));
    }

    products[idx] = {
      ...current,
      stockQuantity: newQty,
      lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : current.lowStockThreshold,
      inStock: newQty > 0,
      updatedAt: new Date().toISOString()
    };

    saveProducts(products);
    res.json({ success: true, data: products[idx] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', requireAdminAuth, (req, res) => {
  try {
    let products = readProducts();
    const exists = products.some(p => String(p.id) === String(req.params.id));
    if (!exists) return res.status(404).json({ success: false, error: 'Product not found' });

    products = products.filter(p => String(p.id) !== String(req.params.id));
    saveProducts(products);

    console.log(`🗑️ Deleted product ID: ${req.params.id}`);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
