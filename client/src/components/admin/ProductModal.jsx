import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  Check, 
  Image as ImageIcon, 
  RefreshCw, 
  Trash2, 
  Barcode,
  Plus,
  ArrowLeft,
  ArrowRight,
  Star,
  AlertCircle,
  CheckCircle2,
  Package
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { CONCERNS } from '../../data/concerns';
import { apiRequest } from '../../utils/api';

const PRESET_IMAGES = [
  { name: 'Syrup Bottle', url: 'https://fibaxpharma.com/wp-content/uploads/2025/11/fp-enzyme.png' },
  { name: 'Capsules Bottle', url: 'https://fibaxpharma.com/wp-content/uploads/2024/03/Diabdic-cap-580-x580_webp.webp' },
  { name: 'Relief Oil', url: 'https://fibaxpharma.com/wp-content/uploads/2023/10/AXE-ORTHO-OIL-copy.webp' },
  { name: 'Herbal Powder', url: 'https://fibaxpharma.com/wp-content/uploads/2025/11/Ashwagandha-powder-2000px.webp' },
  { name: 'Herbal Soap', url: 'https://fibaxpharma.com/wp-content/uploads/2025/11/rose-soap-1000px.webp' },
];

export function ProductModal({ isOpen, onClose, onSave, productToEdit }) {
  const multiFileInputRef = useRef(null);
  const slotReplaceInputRef = useRef(null);
  const [replacingSlotIndex, setReplacingSlotIndex] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    sku: '',
    categoryId: 'syrups',
    concernId: 'joint-pain-relief',
    dosageForm: 'Syrup',
    volumeWeight: '200 ml',
    mrp: 299,
    salePrice: 249,
    stockQuantity: 50,
    lowStockThreshold: 15,
    featuredImage: '',
    images: [],
    isBestseller: false,
    ayushCertified: true,
    shortDesc: '',
    ingredients: 'Standardized herbal extracts, purified botanical decoctions',
    dosage: '10-15 ml twice daily with warm water after meals',
    shippingPackage: {
      weightGrams: '',
      lengthCm: '',
      widthCm: '',
      heightCm: ''
    },
    treatmentCourseConfig: {
      enabled: false,
      heading: 'SELECT TREATMENT COURSE / VALUE PACK:',
      recommendationText: 'Recommended 90-Day Course for Best Results',
      packs: []
    },
  });

  useEffect(() => {
    setUploadError('');
    if (productToEdit) {
      const mappedCat = productToEdit.categoryId || (
        productToEdit.dosageForm === 'Capsules' ? 'capsules' :
        productToEdit.dosageForm === 'Juice' ? 'juices' :
        productToEdit.dosageForm === 'Powder' ? 'powders' :
        productToEdit.dosageForm === 'Oil' ? 'oils' :
        (productToEdit.dosageForm === 'Soap' || productToEdit.dosageForm === 'Facewash') ? 'skincare' :
        'syrups'
      );

      const initialImages = Array.isArray(productToEdit.images) && productToEdit.images.length > 0
        ? productToEdit.images.map(img => typeof img === 'string' ? img : img.url).filter(Boolean)
        : (productToEdit.featuredImage ? [productToEdit.featuredImage] : []);

      const sp = productToEdit.shippingPackage || {};
      const initWeight = sp.weightGrams ?? productToEdit.packageWeightGrams ?? '';
      const initLength = sp.lengthCm ?? productToEdit.packageLengthCm ?? '';
      const initWidth = sp.widthCm ?? productToEdit.packageWidthCm ?? '';
      const initHeight = sp.heightCm ?? productToEdit.packageHeightCm ?? '';

      setFormData({
        title: productToEdit.title || '',
        slug: productToEdit.slug || '',
        sku: productToEdit.sku || '',
        categoryId: mappedCat,
        concernId: productToEdit.concernId || 'joint-pain-relief',
        dosageForm: productToEdit.dosageForm || 'Syrup',
        volumeWeight: productToEdit.volumeWeight || '200 ml',
        mrp: productToEdit.mrp || 299,
        salePrice: productToEdit.salePrice || 249,
        stockQuantity: productToEdit.stockQuantity !== undefined ? productToEdit.stockQuantity : 50,
        lowStockThreshold: productToEdit.lowStockThreshold || 15,
        featuredImage: productToEdit.featuredImage || initialImages[0] || '',
        images: initialImages,
        isBestseller: !!productToEdit.isBestseller,
        ayushCertified: productToEdit.ayushCertified !== false,
        shortDesc: productToEdit.shortDesc || '',
        ingredients: productToEdit.ingredients || '',
        dosage: productToEdit.dosage || '',
        shippingPackage: {
          weightGrams: initWeight,
          lengthCm: initLength,
          widthCm: initWidth,
          heightCm: initHeight
        },
        treatmentCourseConfig: productToEdit.treatmentCourseConfig || {
          enabled: false,
          heading: 'SELECT TREATMENT COURSE / VALUE PACK:',
          recommendationText: 'Recommended 90-Day Course for Best Results',
          packs: []
        },
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        sku: '',
        categoryId: 'syrups',
        concernId: 'joint-pain-relief',
        dosageForm: 'Syrup',
        volumeWeight: '200 ml',
        mrp: 299,
        salePrice: 249,
        stockQuantity: 50,
        lowStockThreshold: 15,
        featuredImage: '',
        images: [],
        isBestseller: false,
        ayushCertified: true,
        shortDesc: '',
        ingredients: 'Standardized herbal extracts, purified botanical decoctions',
        dosage: '10-15 ml twice daily with warm water after meals',
        shippingPackage: {
          weightGrams: '',
          lengthCm: '',
          widthCm: '',
          heightCm: ''
        },
        treatmentCourseConfig: {
          enabled: false,
          heading: 'SELECT TREATMENT COURSE / VALUE PACK:',
          recommendationText: 'Recommended 90-Day Course for Best Results',
          packs: []
        },
      });
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const discountPercent = Math.round(((formData.mrp - formData.salePrice) / formData.mrp) * 100);
  const currentImageCount = formData.images ? formData.images.length : 0;

  // Auto-generate standardized SKU (e.g. FBX-ASHWA-200ML)
    const handleAddPack = () => {
    const currentPacks = formData.treatmentCourseConfig?.packs || [];
    if (currentPacks.length >= 5) {
      alert('Maximum 5 treatment packs allowed per product.');
      return;
    }
    const newPack = {
      id: Date.now(),
      name: '',
      quantity: 1,
      duration: '',
      price: formData.salePrice || '',
      discountPercent: 0,
      promotionalLabel: '',
      sortOrder: currentPacks.length + 1
    };
    setFormData(prev => ({
      ...prev,
      treatmentCourseConfig: {
        ...prev.treatmentCourseConfig,
        packs: [...currentPacks, newPack]
      }
    }));
  };

  const handleUpdatePack = (index, field, value) => {
    const currentPacks = [...(formData.treatmentCourseConfig?.packs || [])];
    if (!currentPacks[index]) return;
    currentPacks[index] = {
      ...currentPacks[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      treatmentCourseConfig: {
        ...prev.treatmentCourseConfig,
        packs: currentPacks
      }
    }));
  };

  const handleDeletePack = (index) => {
    const currentPacks = [...(formData.treatmentCourseConfig?.packs || [])];
    currentPacks.splice(index, 1);
    const reordered = currentPacks.map((p, i) => ({ ...p, sortOrder: i + 1 }));
    setFormData(prev => ({
      ...prev,
      treatmentCourseConfig: {
        ...prev.treatmentCourseConfig,
        packs: reordered
      }
    }));
  };

  const handleMovePack = (index, direction) => {
    const currentPacks = [...(formData.treatmentCourseConfig?.packs || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentPacks.length) return;
    const temp = currentPacks[index];
    currentPacks[index] = currentPacks[targetIndex];
    currentPacks[targetIndex] = temp;
    const reordered = currentPacks.map((p, i) => ({ ...p, sortOrder: i + 1 }));
    setFormData(prev => ({
      ...prev,
      treatmentCourseConfig: {
        ...prev.treatmentCourseConfig,
        packs: reordered
      }
    }));
  };

  const handleAutoGenerateSku = () => {
    const rawTitle = formData.title.trim() || 'PRODUCT';
    const cleanPrefix = rawTitle
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);

    const cleanVol = (formData.volumeWeight || 'STD')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 5);

    const randomDigits = Math.floor(100 + Math.random() * 900);
    const generated = `FBX-${cleanPrefix}-${cleanVol || randomDigits}`;
    setFormData(prev => ({ ...prev, sku: generated }));
  };

  // Multi-image Bulk File Upload handler
  const handleBulkFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadError('');
    const validFiles = [];

    for (const file of files) {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
        setUploadError('Please upload a valid JPG, PNG, or WebP image.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Image must be 5 MB or smaller.');
        return;
      }
      validFiles.push(file);
    }

    setUploadProgress(true);

    try {
      const uploadedUrls = [];
      for (const file of validFiles) {
        const base64Content = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });

        try {
          const res = await apiRequest('/api/upload', {
            method: 'POST',
            body: JSON.stringify({
              image: base64Content,
              filename: file.name
            })
          });
          if (res.success && res.url) {
            uploadedUrls.push(res.url);
          } else {
            uploadedUrls.push(base64Content);
          }
        } catch {
          uploadedUrls.push(base64Content);
        }
      }

      setFormData(prev => {
        const updatedImages = [...(prev.images || []), ...uploadedUrls];
        return {
          ...prev,
          images: updatedImages,
          featuredImage: prev.featuredImage || updatedImages[0] || ''
        };
      });
    } catch (err) {
      console.error('Error uploading images:', err);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setUploadProgress(false);
      if (multiFileInputRef.current) multiFileInputRef.current.value = '';
    }
  };

  // Slot Replace Upload handler
  const handleSlotReplaceUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || replacingSlotIndex === null) return;

    setUploadError('');
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      setUploadError('Please upload a valid JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be 5 MB or smaller.');
      return;
    }

    setUploadProgress(true);

    try {
      const base64Content = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      let finalUrl = base64Content;
      try {
        const res = await apiRequest('/api/upload', {
          method: 'POST',
          body: JSON.stringify({
            image: base64Content,
            filename: file.name
          })
        });
        if (res.success && res.url) {
          finalUrl = res.url;
        }
      } catch (err) {
        console.warn('Server upload fallback:', err);
      }

      setFormData(prev => {
        const newImages = [...(prev.images || [])];
        newImages[replacingSlotIndex] = finalUrl;
        return {
          ...prev,
          images: newImages,
          featuredImage: replacingSlotIndex === 0 ? finalUrl : (prev.featuredImage || newImages[0] || '')
        };
      });
    } catch (err) {
      setUploadError('Failed to replace image.');
    } finally {
      setUploadProgress(false);
      setReplacingSlotIndex(null);
      if (slotReplaceInputRef.current) slotReplaceInputRef.current.value = '';
    }
  };

  const handleSetPrimaryImage = (index) => {
    setFormData(prev => {
      const currentImages = [...(prev.images || [])];
      if (index <= 0 || index >= currentImages.length) return prev;
      const targetImg = currentImages[index];
      currentImages.splice(index, 1);
      currentImages.unshift(targetImg);
      return {
        ...prev,
        images: currentImages,
        featuredImage: currentImages[0]
      };
    });
  };

  const handleMoveImage = (index, direction) => {
    setFormData(prev => {
      const currentImages = [...(prev.images || [])];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= currentImages.length) return prev;
      const temp = currentImages[index];
      currentImages[index] = currentImages[targetIndex];
      currentImages[targetIndex] = temp;
      return {
        ...prev,
        images: currentImages,
        featuredImage: currentImages[0]
      };
    });
  };

  const handleDeleteImage = (index) => {
    setFormData(prev => {
      const currentImages = [...(prev.images || [])];
      currentImages.splice(index, 1);
      if (currentImages.length < 5) {
        setUploadError('Product has fewer than 5 images.');
      } else {
        setUploadError('');
      }
      return {
        ...prev,
        images: currentImages,
        featuredImage: currentImages[0] || ''
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.salePrice) {
      alert('Please provide product title and selling price.');
      return;
    }

    if (formData.treatmentCourseConfig?.enabled) {
      const packs = formData.treatmentCourseConfig.packs || [];
      if (packs.length === 0) {
        alert('Please add at least 1 pack when Treatment Course / Value Pack is enabled.');
        return;
      }
      if (packs.length > 5) {
        alert('Maximum 5 packs are allowed per product.');
        return;
      }
      for (let i = 0; i < packs.length; i++) {
        const pack = packs[i];
        if (!pack.name || !pack.name.trim()) {
          alert(`Pack #${i + 1}: Pack Name is required.`);
          return;
        }
        if (!pack.quantity || Number(pack.quantity) <= 0) {
          alert(`Pack #${i + 1}: Quantity must be greater than 0.`);
          return;
        }
        if (!pack.price || Number(pack.price) <= 0) {
          alert(`Pack #${i + 1}: Selling Price must be greater than 0.`);
          return;
        }
        if (pack.discountPercent !== undefined && pack.discountPercent !== '' && (Number(pack.discountPercent) < 0 || Number(pack.discountPercent) > 100)) {
          alert(`Pack #${i + 1}: Discount must be between 0% and 100%.`);
          return;
        }
      }
    }

    const sp = formData.shippingPackage || {};
    const w = Number(sp.weightGrams);
    const l = Number(sp.lengthCm);
    const wi = Number(sp.widthCm);
    const h = Number(sp.heightCm);

    const hasWeight = sp.weightGrams !== '' && sp.weightGrams !== null && !isNaN(w);
    const hasLength = sp.lengthCm !== '' && sp.lengthCm !== null && !isNaN(l);
    const hasWidth = sp.widthCm !== '' && sp.widthCm !== null && !isNaN(wi);
    const hasHeight = sp.heightCm !== '' && sp.heightCm !== null && !isNaN(h);

    if (!productToEdit) {
      if (!hasWeight || w <= 0 || !hasLength || l <= 0 || !hasWidth || wi <= 0 || !hasHeight || h <= 0) {
        alert('Required for accurate courier shipping calculation. Please enter positive numeric values for Package Weight (grams) and Dimensions (Length, Width, Height in cm).');
        return;
      }
    } else {
      if ((hasWeight && w <= 0) || (hasLength && l <= 0) || (hasWidth && wi <= 0) || (hasHeight && h <= 0)) {
        alert('Package weight and dimensions must be positive numeric values greater than 0.');
        return;
      }
    }

    // Default SKU if empty
    const finalSku = formData.sku.trim() || `FBX-${Math.floor(100000 + Math.random() * 900000)}`;

    const finalImages = formData.images && formData.images.length > 0 ? formData.images : (formData.featuredImage ? [formData.featuredImage] : []);
    const primaryImg = finalImages[0] || formData.featuredImage || '';

    const finalWeight = hasWeight && w > 0 ? w : 0;
    const finalLength = hasLength && l > 0 ? l : 0;
    const finalWidth = hasWidth && wi > 0 ? wi : 0;
    const finalHeight = hasHeight && h > 0 ? h : 0;

    onSave({
      ...formData,
      sku: finalSku,
      title: formData.title.trim(),
      featuredImage: primaryImg,
      images: finalImages,
      shippingPackage: {
        weightGrams: finalWeight,
        lengthCm: finalLength,
        widthCm: finalWidth,
        heightCm: finalHeight
      },
      packageWeightGrams: finalWeight,
      packageLengthCm: finalLength,
      packageWidthCm: finalWidth,
      packageHeightCm: finalHeight
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-sand-border animate-scaleIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand-border bg-sand/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-forest-deep">
                {productToEdit ? 'Edit Ayurvedic Formulation' : 'Add New Formulation to Catalog'}
              </h3>
              <p className="text-xs text-charcoal-muted">
                Configure formulation title, SKU code, product image, and stock inventory.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-charcoal-muted hover:text-charcoal hover:bg-sand transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Hidden inputs for file uploads */}
          <input
            id="product-multi-file-input"
            type="file"
            ref={multiFileInputRef}
            accept="image/jpeg,image/png,image/webp,image/jpg,image/svg+xml"
            multiple
            onChange={handleBulkFileUpload}
            className="hidden"
          />
          <input
            id="product-slot-replace-input"
            type="file"
            ref={slotReplaceInputRef}
            accept="image/jpeg,image/png,image/webp,image/jpg,image/svg+xml"
            onChange={handleSlotReplaceUpload}
            className="hidden"
          />

          {/* 1. Title & SKU Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-7 space-y-1">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Fibax Ashwagandha Vitality Syrup 200ml"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-sm font-medium"
              />
            </div>

            {/* SKU Input with Auto-Generate Tool */}
            <div className="sm:col-span-5 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-1">
                  <Barcode className="h-3.5 w-3.5 text-forest" />
                  <span>SKU Code *</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateSku}
                  className="text-[10px] text-brand font-bold hover:underline flex items-center gap-0.5"
                  title="Auto generate SKU from title and pack size"
                >
                  <RefreshCw className="h-2.5 w-2.5" />
                  <span>Auto-Gen</span>
                </button>
              </div>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="e.g. FBX-ASHWA-200"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs font-mono font-bold text-forest bg-sand/20"
              />
            </div>
          </div>

          {/* 2. PRODUCT IMAGES / GALLERY SECTION */}
          <div className="bg-sand/30 p-4 rounded-2xl border border-sand-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-forest" />
                  <span>PRODUCT IMAGES / GALLERY</span>
                </label>

                {/* Counter Badge */}
                <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 border ${
                  currentImageCount >= 5 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {currentImageCount >= 5 ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  <span>Images: {currentImageCount}/5</span>
                  {currentImageCount >= 5 ? <span>✓</span> : <span className="text-[10px] text-amber-600 font-normal">(Min 5 recommended)</span>}
                </div>
              </div>

              {/* Bulk Upload Button */}
              <label
                htmlFor="product-multi-file-input"
                className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer select-none"
              >
                {uploadProgress ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>+ Upload Images</span>
                  </>
                )}
              </label>
            </div>

            <p className="text-[11px] text-charcoal-muted">
              Select multiple product images at once (Minimum 5 recommended). First image is automatically designated as <strong className="text-forest">PRIMARY</strong>. Supported formats: JPG, PNG, WebP (Max 5MB).
            </p>

            {uploadError && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Gallery Grid */}
            {currentImageCount > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
                {formData.images.map((imgUrl, index) => {
                  const isPrimary = index === 0;
                  return (
                    <div 
                      key={`${imgUrl}-${index}`}
                      className={`relative bg-white rounded-xl border p-2 flex flex-col justify-between shadow-xs transition-all ${
                        isPrimary ? 'border-forest ring-2 ring-forest/20' : 'border-sand-border hover:border-forest/40'
                      }`}
                    >
                      {/* Image Preview */}
                      <div className="relative w-full h-28 rounded-lg bg-sand/40 border border-sand-border overflow-hidden flex items-center justify-center mb-2">
                        <img
                          src={imgUrl}
                          alt={`Product Image ${index + 1}`}
                          className="w-full h-full object-contain p-1"
                        />

                        {/* Order & Primary Badge */}
                        <div className="absolute top-1 left-1 flex flex-col gap-1 z-10">
                          {isPrimary ? (
                            <span className="px-1.5 py-0.5 rounded-md bg-forest text-white text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-0.5 shadow-xs">
                              <Star className="h-2.5 w-2.5 fill-white" />
                              PRIMARY
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold">
                              Image {index + 1}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="space-y-1.5">
                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(index)}
                            className="w-full py-1 px-1.5 rounded-md bg-sand/80 hover:bg-forest hover:text-white text-forest text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
                          >
                            <Star className="h-2.5 w-2.5" />
                            <span>Set Primary</span>
                          </button>
                        )}

                        <div className="flex items-center justify-between gap-1 border-t border-sand-border/60 pt-1.5">
                          {/* Reorder Left/Right */}
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveImage(index, 'left')}
                              className="p-1 rounded bg-sand hover:bg-sand-border text-charcoal disabled:opacity-30 disabled:hover:bg-sand text-[10px]"
                              title="Move Left"
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              disabled={index === currentImageCount - 1}
                              onClick={() => handleMoveImage(index, 'right')}
                              className="p-1 rounded bg-sand hover:bg-sand-border text-charcoal disabled:opacity-30 disabled:hover:bg-sand text-[10px]"
                              title="Move Right"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Replace & Delete */}
                          <div className="flex items-center gap-1">
                            <label
                              htmlFor="product-slot-replace-input"
                              onClick={() => setReplacingSlotIndex(index)}
                              className="px-1.5 py-0.5 rounded bg-sand hover:bg-sand-border text-forest text-[10px] font-bold cursor-pointer"
                              title="Replace this image"
                            >
                              Replace
                            </label>

                            <button
                              type="button"
                              onClick={() => handleDeleteImage(index)}
                              className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 text-[10px]"
                              title="Delete Image"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty state */
              <label 
                htmlFor="product-multi-file-input"
                className="border-2 border-dashed border-sand-border rounded-xl p-6 text-center hover:border-forest/50 transition-colors cursor-pointer bg-white block"
              >
                <ImageIcon className="h-8 w-8 text-charcoal-muted mx-auto mb-2" />
                <p className="text-xs font-bold text-forest">No product images uploaded yet</p>
                <p className="text-[11px] text-charcoal-muted mt-0.5">
                  Click here or press <strong>+ Upload Images</strong> above to select minimum 5 product images.
                </p>
              </label>
            )}

            {/* Presets Row */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
              <span className="text-[10px] font-bold text-charcoal-muted uppercase whitespace-nowrap">Add Sample Presets:</span>
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setFormData(prev => {
                      const updated = [...(prev.images || []), preset.url];
                      return {
                        ...prev,
                        images: updated,
                        featuredImage: prev.featuredImage || updated[0] || ''
                      };
                    });
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-sand-border hover:bg-sand text-charcoal hover:text-forest transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  <Plus className="h-2.5 w-2.5" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Category, Format & Concern */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Product Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => {
                  const newCat = e.target.value;
                  const dosageMap = {
                    syrups: 'Syrup',
                    capsules: 'Capsules',
                    juices: 'Juice',
                    powders: 'Powder',
                    oils: 'Oil',
                    skincare: 'Soap'
                  };
                  setFormData(prev => ({
                    ...prev,
                    categoryId: newCat,
                    dosageForm: dosageMap[newCat] || prev.dosageForm
                  }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs bg-white font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Dosage Form
              </label>
              <select
                value={formData.dosageForm}
                onChange={(e) => {
                  const newDosage = e.target.value;
                  const catMap = {
                    'Syrup': 'syrups',
                    'Capsules': 'capsules',
                    'Juice': 'juices',
                    'Powder': 'powders',
                    'Oil': 'oils',
                    'Soap': 'skincare',
                    'Facewash': 'skincare'
                  };
                  setFormData(prev => ({
                    ...prev,
                    dosageForm: newDosage,
                    categoryId: catMap[newDosage] || prev.categoryId
                  }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs bg-white font-medium"
              >
                <option value="Syrup">Syrup / Tonic</option>
                <option value="Capsules">Capsules / Tablets</option>
                <option value="Juice">Juice (Swaras)</option>
                <option value="Powder">Powder (Churna)</option>
                <option value="Oil">Oil (Taila)</option>
                <option value="Soap">Herbal Soap</option>
                <option value="Facewash">Facewash / Gel</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Target Concern
              </label>
              <select
                value={formData.concernId}
                onChange={(e) => setFormData({ ...formData, concernId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs bg-white font-medium"
              >
                {CONCERNS.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Volume / Weight
              </label>
              <input
                type="text"
                value={formData.volumeWeight}
                onChange={(e) => setFormData({ ...formData, volumeWeight: e.target.value })}
                placeholder="e.g. 200 ml or 60 Caps"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs font-medium"
              />
            </div>
          </div>

          {/* 3.4 SHIPPING PACKAGE DETAILS SECTION */}
          {(() => {
            const sp = formData.shippingPackage || {};
            const w = Number(sp.weightGrams);
            const l = Number(sp.lengthCm);
            const wi = Number(sp.widthCm);
            const h = Number(sp.heightCm);
            const isConfigured = !isNaN(w) && w > 0 && !isNaN(l) && l > 0 && !isNaN(wi) && wi > 0 && !isNaN(h) && h > 0;

            return (
              <div className="bg-sand/30 p-4 rounded-2xl border border-sand-border space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                      <Package className="h-4 w-4 text-forest" />
                      <span>SHIPPING PACKAGE DETAILS</span>
                      {isConfigured ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>✓ Used for courier freight calculation</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 text-amber-600" />
                          <span>⚠ Package dimensions and weight not configured.</span>
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-charcoal-muted mt-0.5">
                      Enter the final packed parcel weight and outer package dimensions used for courier shipping.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                  {/* Package Weight */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-charcoal">
                      PACKAGE WEIGHT *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder="e.g. 320"
                        value={formData.shippingPackage?.weightGrams ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            shippingPackage: {
                              ...prev.shippingPackage,
                              weightGrams: val === '' ? '' : val
                            }
                          }));
                        }}
                        className="w-full px-3 py-2 pr-12 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-bold bg-white"
                      />
                      <span className="absolute right-3 top-2 text-[11px] font-semibold text-charcoal-muted pointer-events-none">
                        grams
                      </span>
                    </div>
                  </div>

                  {/* Package Length */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-charcoal">
                      PACKAGE LENGTH *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder="e.g. 15"
                        value={formData.shippingPackage?.lengthCm ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            shippingPackage: {
                              ...prev.shippingPackage,
                              lengthCm: val === '' ? '' : val
                            }
                          }));
                        }}
                        className="w-full px-3 py-2 pr-8 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-bold bg-white"
                      />
                      <span className="absolute right-3 top-2 text-[11px] font-semibold text-charcoal-muted pointer-events-none">
                        cm
                      </span>
                    </div>
                  </div>

                  {/* Package Width */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-charcoal">
                      PACKAGE WIDTH *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder="e.g. 8"
                        value={formData.shippingPackage?.widthCm ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            shippingPackage: {
                              ...prev.shippingPackage,
                              widthCm: val === '' ? '' : val
                            }
                          }));
                        }}
                        className="w-full px-3 py-2 pr-8 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-bold bg-white"
                      />
                      <span className="absolute right-3 top-2 text-[11px] font-semibold text-charcoal-muted pointer-events-none">
                        cm
                      </span>
                    </div>
                  </div>

                  {/* Package Height */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-charcoal">
                      PACKAGE HEIGHT *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder="e.g. 6"
                        value={formData.shippingPackage?.heightCm ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            shippingPackage: {
                              ...prev.shippingPackage,
                              heightCm: val === '' ? '' : val
                            }
                          }));
                        }}
                        className="w-full px-3 py-2 pr-8 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-bold bg-white"
                      />
                      <span className="absolute right-3 top-2 text-[11px] font-semibold text-charcoal-muted pointer-events-none">
                        cm
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-charcoal-muted italic">
                  * Required for accurate courier shipping calculation. Outer package dimensions are used for parcel shipping.
                </p>
              </div>
            );
          })()}

          {/* 3.5 TREATMENT COURSE / VALUE PACK SECTION */}
          <div className="bg-sand/30 p-4 rounded-2xl border border-sand-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                  <span>TREATMENT COURSE / VALUE PACK</span>
                </h4>
                <p className="text-[11px] text-charcoal-muted mt-0.5">
                  Configure custom treatment courses and bundle options for frontend purchase options.
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.treatmentCourseConfig?.enabled}
                  onChange={(e) => {
                    const isEnabled = e.target.checked;
                    const currentPacks = formData.treatmentCourseConfig?.packs || [];
                    setFormData(prev => ({
                      ...prev,
                      treatmentCourseConfig: {
                        ...prev.treatmentCourseConfig,
                        enabled: isEnabled,
                        heading: prev.treatmentCourseConfig?.heading || 'SELECT TREATMENT COURSE / VALUE PACK:',
                        recommendationText: prev.treatmentCourseConfig?.recommendationText !== undefined 
                          ? prev.treatmentCourseConfig.recommendationText 
                          : 'Recommended 90-Day Course for Best Results',
                        packs: isEnabled && currentPacks.length === 0 ? [
                          { id: Date.now(), name: '1 Unit (Standard)', quantity: 1, duration: '', price: formData.salePrice || 230, discountPercent: 0, promotionalLabel: 'STANDARD', sortOrder: 1 },
                          { id: Date.now() + 1, name: '2 Units (Value Pack)', quantity: 2, duration: '', price: Math.round((formData.salePrice || 230) * 2 * 0.9), discountPercent: 10, promotionalLabel: '10% OFF', sortOrder: 2 },
                          { id: Date.now() + 2, name: '3-Month Course (Best Value)', quantity: 3, duration: '3 Months', price: Math.round((formData.salePrice || 230) * 3 * 0.85), discountPercent: 15, promotionalLabel: 'BEST VALUE', sortOrder: 3 }
                        ] : currentPacks
                      }
                    }));
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest"></div>
                <span className="ml-2 text-xs font-bold text-charcoal uppercase">
                  {formData.treatmentCourseConfig?.enabled ? 'ON' : 'OFF'}
                </span>
              </label>
            </div>

            {formData.treatmentCourseConfig?.enabled && (
              <div className="space-y-4 pt-2 border-t border-sand-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-charcoal">
                      Section Heading <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.treatmentCourseConfig?.heading || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        treatmentCourseConfig: {
                          ...prev.treatmentCourseConfig,
                          heading: e.target.value
                        }
                      }))}
                      placeholder="SELECT TREATMENT COURSE / VALUE PACK:"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-charcoal">
                      Recommendation / Highlight Text
                    </label>
                    <input
                      type="text"
                      value={formData.treatmentCourseConfig?.recommendationText || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        treatmentCourseConfig: {
                          ...prev.treatmentCourseConfig,
                          recommendationText: e.target.value
                        }
                      }))}
                      placeholder="Recommended 90-Day Course for Best Results"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
                      Configured Packs ({formData.treatmentCourseConfig?.packs?.length || 0}/5)
                    </span>
                    {(formData.treatmentCourseConfig?.packs?.length || 0) < 5 && (
                      <button
                        type="button"
                        onClick={handleAddPack}
                        className="px-3 py-1.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                      >
                        <span>+ Add Pack</span>
                      </button>
                    )}
                  </div>

                  {formData.treatmentCourseConfig?.packs?.map((pack, index) => {
                    const qty = Number(pack.quantity) || 0;
                    const price = Number(pack.price) || 0;
                    const unitPriceDisplay = qty > 0 && price > 0 ? `₹${Math.round(price / qty)} / unit` : '-';

                    return (
                      <div key={pack.id || index} className="p-3.5 rounded-xl bg-white border border-sand-border space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-sand-border/60 pb-2">
                          <span className="text-xs font-extrabold text-forest uppercase tracking-wider">
                            PACK {index + 1}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMovePack(index, 'up')}
                              className="p-1 rounded bg-sand hover:bg-sand-border disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-charcoal"
                              title="Move Up"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              disabled={index === (formData.treatmentCourseConfig?.packs?.length || 0) - 1}
                              onClick={() => handleMovePack(index, 'down')}
                              className="p-1 rounded bg-sand hover:bg-sand-border disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-charcoal"
                              title="Move Down"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePack(index)}
                              className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold ml-1"
                              title="Delete Pack"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-[11px] font-bold text-charcoal">
                              Pack Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={pack.name || ''}
                              onChange={(e) => handleUpdatePack(index, 'name', e.target.value)}
                              placeholder="e.g. 1 Unit (Standard)"
                              className="w-full px-3 py-1.5 rounded-lg border border-sand-border focus:ring-1 focus:ring-forest text-xs font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-charcoal">
                              Quantity / Units <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={pack.quantity || ''}
                              onChange={(e) => handleUpdatePack(index, 'quantity', e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="1"
                              className="w-full px-3 py-1.5 rounded-lg border border-sand-border focus:ring-1 focus:ring-forest text-xs font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-charcoal">Duration (Optional)</label>
                            <input
                              type="text"
                              value={pack.duration || ''}
                              onChange={(e) => handleUpdatePack(index, 'duration', e.target.value)}
                              placeholder="e.g. 3 Months"
                              className="w-full px-3 py-1.5 rounded-lg border border-sand-border focus:ring-1 focus:ring-forest text-xs font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-charcoal">
                              Selling Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={pack.price || ''}
                              onChange={(e) => handleUpdatePack(index, 'price', e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="230"
                              className="w-full px-3 py-1.5 rounded-lg border border-sand-border focus:ring-1 focus:ring-forest text-xs font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-charcoal">Discount %</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={pack.discountPercent !== undefined ? pack.discountPercent : ''}
                              onChange={(e) => handleUpdatePack(index, 'discountPercent', e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="0"
                              className="w-full px-3 py-1.5 rounded-lg border border-sand-border focus:ring-1 focus:ring-forest text-xs font-medium"
                            />
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-[11px] font-bold text-charcoal">Promotional Label</label>
                            <input
                              type="text"
                              value={pack.promotionalLabel || ''}
                              onChange={(e) => handleUpdatePack(index, 'promotionalLabel', e.target.value)}
                              placeholder="e.g. STANDARD or 10% OFF"
                              className="w-full px-3 py-1.5 rounded-lg border border-sand-border focus:ring-1 focus:ring-forest text-xs font-medium"
                            />
                          </div>

                          <div className="space-y-1 flex items-end">
                            <div className="w-full px-3 py-1.5 rounded-lg bg-sand/60 border border-sand-border text-[11px] font-bold text-forest">
                              Price per unit: <span className="text-charcoal">{unitPriceDisplay}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4. Pricing & Offer Section */}
          <div className="bg-sand/30 p-4 rounded-2xl border border-sand-border space-y-3">
            <h4 className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span>Offer Pricing & Discounts</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-charcoal">Regular MRP (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-sm font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-charcoal">Special Sale Price (₹) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-forest text-forest focus:ring-2 focus:ring-forest focus:outline-none text-sm font-bold bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-charcoal">Calculated Discount</label>
                <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                  <span>Save {discountPercent}%</span>
                  <span className="text-[10px] text-emerald-600 font-normal">Auto</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Stock & Inventory Control */}
          <div className="bg-sand/30 p-4 rounded-2xl border border-sand-border space-y-3">
            <h4 className="text-xs font-bold text-forest uppercase tracking-wider">
              Stock & Inventory Control
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-charcoal">Current Stock Units</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-sm font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-charcoal">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  min="1"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-sm font-semibold"
                />
              </div>
            </div>

            {/* Bestseller & Badges */}
            <div className="flex flex-wrap items-center gap-5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-charcoal">
                <input
                  type="checkbox"
                  checked={formData.isBestseller}
                  onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                  className="w-4 h-4 rounded text-forest focus:ring-forest"
                />
                <span>Highlight as Bestseller on Homepage</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-charcoal">
                <input
                  type="checkbox"
                  checked={formData.ayushCertified}
                  onChange={(e) => setFormData({ ...formData, ayushCertified: e.target.checked })}
                  className="w-4 h-4 rounded text-forest focus:ring-forest"
                />
                <span>AYUSH Ministry Certified</span>
              </label>
            </div>
          </div>

          {/* 6. Description & Ingredients */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Short Description & Health Indications
              </label>
              <textarea
                rows={2}
                value={formData.shortDesc}
                onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                placeholder="Targeted natural relief for joint inflammation, stiffness, and cartilage lubrication..."
                className="w-full px-3.5 py-2 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-charcoal">Key Ingredients</label>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  placeholder="e.g. Shallaki, Guggulu, Ashwagandha"
                  className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-charcoal">Dosage Instructions</label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="e.g. 10 ml twice daily with warm water"
                  className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-sand-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-charcoal hover:bg-sand transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>{productToEdit ? 'Save Changes' : 'Publish Product to Store'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
