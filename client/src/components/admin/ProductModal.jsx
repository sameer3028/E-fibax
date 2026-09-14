import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  Check, 
  Image as ImageIcon, 
  RefreshCw, 
  Trash2, 
  Link as LinkIcon, 
  FileUp,
  Barcode
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { CONCERNS } from '../../data/concerns';

const PRESET_IMAGES = [
  { name: 'Syrup Bottle', url: 'https://fibaxpharma.com/wp-content/uploads/2025/11/fp-enzyme.png' },
  { name: 'Capsules Bottle', url: 'https://fibaxpharma.com/wp-content/uploads/2024/03/Diabdic-cap-580-x580_webp.webp' },
  { name: 'Relief Oil', url: 'https://fibaxpharma.com/wp-content/uploads/2023/10/AXE-ORTHO-OIL-copy.webp' },
  { name: 'Herbal Powder', url: 'https://fibaxpharma.com/wp-content/uploads/2025/11/Ashwagandha-powder-2000px.webp' },
  { name: 'Herbal Soap', url: 'https://fibaxpharma.com/wp-content/uploads/2025/11/rose-soap-1000px.webp' },
];

export function ProductModal({ isOpen, onClose, onSave, productToEdit }) {
  const fileInputRef = useRef(null);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'url'
  const [isUploading, setIsUploading] = useState(false);

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
    featuredImage: 'https://fibaxpharma.com/wp-content/uploads/2025/11/front.webp',
    isBestseller: false,
    ayushCertified: true,
    shortDesc: '',
    ingredients: 'Standardized herbal extracts, purified botanical decoctions',
    dosage: '10-15 ml twice daily with warm water after meals',
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        title: productToEdit.title || '',
        slug: productToEdit.slug || '',
        sku: productToEdit.sku || '',
        categoryId: productToEdit.categoryId || 'syrups',
        concernId: productToEdit.concernId || 'joint-pain-relief',
        dosageForm: productToEdit.dosageForm || 'Syrup',
        volumeWeight: productToEdit.volumeWeight || '200 ml',
        mrp: productToEdit.mrp || 299,
        salePrice: productToEdit.salePrice || 249,
        stockQuantity: productToEdit.stockQuantity !== undefined ? productToEdit.stockQuantity : 50,
        lowStockThreshold: productToEdit.lowStockThreshold || 15,
        featuredImage: productToEdit.featuredImage || 'https://fibaxpharma.com/wp-content/uploads/2025/11/front.webp',
        isBestseller: !!productToEdit.isBestseller,
        ayushCertified: productToEdit.ayushCertified !== false,
        shortDesc: productToEdit.shortDesc || '',
        ingredients: productToEdit.ingredients || '',
        dosage: productToEdit.dosage || '',
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
        featuredImage: 'https://fibaxpharma.com/wp-content/uploads/2025/11/front.webp',
        isBestseller: false,
        ayushCertified: true,
        shortDesc: '',
        ingredients: 'Standardized herbal extracts, purified botanical decoctions',
        dosage: '10-15 ml twice daily with warm water after meals',
      });
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const discountPercent = Math.round(((formData.mrp - formData.salePrice) / formData.mrp) * 100);

  // Auto-generate standardized SKU (e.g. FBX-ASHWA-200ML)
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

  // Handle local image file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Content = reader.result;
      // Immediate local preview
      setFormData(prev => ({ ...prev, featuredImage: base64Content }));

      // Upload to backend API
      try {
        setIsUploading(true);
        const res = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Content,
            filename: file.name
          })
        });
        const data = await res.json();
        if (data.success && data.url) {
          setFormData(prev => ({ ...prev, featuredImage: data.url }));
        }
      } catch (err) {
        console.warn('Server upload fallback (using base64 preview):', err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.salePrice) {
      alert('Please provide product title and selling price.');
      return;
    }

    // Default SKU if empty
    const finalSku = formData.sku.trim() || `FBX-${Math.floor(100000 + Math.random() * 900000)}`;

    onSave({
      ...formData,
      sku: finalSku,
      title: formData.title.trim()
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

          {/* 2. Product Image & Upload / Change Section */}
          <div className="bg-sand/30 p-4 rounded-2xl border border-sand-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-forest" />
                <span>Product Packshot / Image</span>
              </label>

              {/* Mode Toggle: File Upload vs URL */}
              <div className="flex items-center rounded-lg bg-sand p-0.5 border border-sand-border text-xs">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors flex items-center gap-1 ${
                    uploadMode === 'file' ? 'bg-white text-forest shadow-xs' : 'text-charcoal-muted hover:text-charcoal'
                  }`}
                >
                  <FileUp className="h-3 w-3" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors flex items-center gap-1 ${
                    uploadMode === 'url' ? 'bg-white text-forest shadow-xs' : 'text-charcoal-muted hover:text-charcoal'
                  }`}
                >
                  <LinkIcon className="h-3 w-3" />
                  <span>Image URL</span>
                </button>
              </div>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Visual Image Uploader Container */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-sand-border">
              {/* Thumbnail Preview */}
              <div className="relative w-24 h-24 rounded-xl bg-sand/60 border border-sand-border flex-shrink-0 flex items-center justify-center p-1.5 overflow-hidden shadow-xs group">
                {formData.featuredImage ? (
                  <>
                    <img
                      src={formData.featuredImage}
                      alt="Preview"
                      className="w-full h-full object-contain transform group-hover:scale-105 transition-transform"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px] font-bold">
                        Uploading...
                      </div>
                    )}
                  </>
                ) : (
                  <ImageIcon className="h-8 w-8 text-charcoal-muted" />
                )}
              </div>

              {/* Actions & Input */}
              <div className="flex-1 w-full space-y-2">
                {uploadMode === 'file' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>{formData.featuredImage ? 'Change Image' : 'Upload Image from Computer'}</span>
                      </button>

                      {formData.featuredImage && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, featuredImage: '' })}
                          className="p-2 rounded-xl border border-sand-border text-charcoal-muted hover:text-red-600 hover:bg-sand transition-colors"
                          title="Remove Image"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-charcoal-muted">
                      Select PNG, JPG, WebP, or SVG from your device. Auto-optimized for high-resolution packshots.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="url"
                      value={formData.featuredImage}
                      onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                      placeholder="https://fibaxpharma.com/wp-content/uploads/image.webp"
                      className="w-full px-3 py-2 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs"
                    />
                    <p className="text-[10px] text-charcoal-muted">Paste any public image or CDN URL.</p>
                  </div>
                )}

                {/* Preset Suggestions */}
                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                  <span className="text-[10px] font-bold text-charcoal-muted uppercase">Sample Presets:</span>
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, featuredImage: preset.url })}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-sand hover:bg-sand-border text-charcoal hover:text-forest transition-colors whitespace-nowrap"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Health Concern & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Dosage Form
              </label>
              <select
                value={formData.dosageForm}
                onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
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
