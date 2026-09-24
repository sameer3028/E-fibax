import React, { useState, useEffect, useRef } from 'react';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/utils';
import { apiRequest } from '../../utils/api';
import {
  Sparkles,
  Save,
  Check,
  Plus,
  Edit3,
  Trash2,
  Tag,
  Package,
  Truck,
  Percent,
  DollarSign,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  SlidersHorizontal
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { CONCERNS } from '../../data/concerns';

export function OffersManager() {
  const { products, updatePricing, addProduct, updateProduct, deleteProduct } = useProducts();
  const {
    freeShippingThreshold,
    updateFreeShippingThreshold,
    coupons,
    refreshCoupons
  } = useCart();

  // Sub-tab navigation state: 'single-pricing' | 'combos' | 'coupons'
  const [activeTab, setActiveTab] = useState('single-pricing');

  // Single product quick edit state
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [savedSuccess, setSavedSuccess] = useState(null);

  // Free shipping threshold edit state
  const [isEditingThreshold, setIsEditingThreshold] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(freeShippingThreshold || 499);
  const [thresholdSavedMsg, setThresholdSavedMsg] = useState(false);

  useEffect(() => {
    setTempThreshold(freeShippingThreshold || 499);
  }, [freeShippingThreshold]);

  // Combo Offer Modal state & Upload controls
  const comboFileInputRef = useRef(null);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [comboToEdit, setComboToEdit] = useState(null);
  const [isUploadingComboImg, setIsUploadingComboImg] = useState(false);
  const [comboImgError, setComboImgError] = useState('');
  const [comboFormData, setComboFormData] = useState({
    title: '',
    sku: '',
    categoryId: 'combos',
    concernId: 'joint-pain-care',
    dosageForm: 'Combo Pack',
    volumeWeight: 'Full Course Pack',
    mrp: 999,
    salePrice: 799,
    stockQuantity: 50,
    featuredImage: '',
    isBestseller: true,
    shortDesc: 'Ayurvedic multi-product value course formulation bundle.',
    ingredients: '100% Herbal Extracts & Pure Formulations',
    dosage: 'Follow individual product dosage instructions.',
    shippingPackage: {
      weightGrams: '',
      lengthCm: '',
      widthCm: '',
      heightCm: ''
    }
  });

  // Coupon Offer Modal state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState(null);
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    type: 'percent', // 'percent' | 'flat'
    value: 10,
    minOrder: 499,
    maxDiscount: '',
    description: '',
    isActive: true
  });

  // ----------------------------------------------------
  // 1. FREE SHIPPING THRESHOLD EDIT HANDLER
  // ----------------------------------------------------
  const handleSaveThreshold = async () => {
    const val = Number(tempThreshold);
    if (isNaN(val) || val < 0) {
      alert('Please enter a valid threshold amount (0 or positive integer).');
      return;
    }
    await updateFreeShippingThreshold(val);
    setIsEditingThreshold(false);
    setThresholdSavedMsg(true);
    setTimeout(() => setThresholdSavedMsg(false), 2500);
  };

  // ----------------------------------------------------
  // 2. SINGLE PRODUCT QUICK-SAVE HANDLER
  // ----------------------------------------------------
  const startEditProduct = (product) => {
    setEditingId(product.id);
    setEditFields({
      mrp: product.mrp,
      salePrice: product.salePrice,
      isBestseller: !!product.isBestseller,
    });
  };

  const handleSaveProductPricing = async (id) => {
    await updatePricing(id, editFields);
    setEditingId(null);
    setSavedSuccess(id);
    setTimeout(() => setSavedSuccess(null), 2500);
  };

  // ----------------------------------------------------
  // 3. COMBO OFFER CREATION / EDIT / UPLOAD HANDLERS
  // ----------------------------------------------------
  const comboProducts = products.filter(
    (p) => p.isCombo || p.categoryId === 'combos' || p.dosageForm?.toLowerCase().includes('combo')
  );

  const openCreateComboModal = () => {
    setComboToEdit(null);
    setComboImgError('');
    setComboFormData({
      title: '',
      sku: `FBX-COMBO-${Math.floor(100 + Math.random() * 900)}`,
      categoryId: 'combos',
      concernId: 'joint-pain-care',
      dosageForm: 'Combo Pack',
      volumeWeight: 'Full Course Pack',
      mrp: 999,
      salePrice: 799,
      stockQuantity: 50,
      featuredImage: '',
      isBestseller: true,
      shortDesc: 'Ayurvedic multi-product value course formulation bundle.',
      ingredients: '100% Herbal Extracts & Pure Formulations',
      dosage: 'Follow individual product dosage instructions.',
      shippingPackage: {
        weightGrams: '',
        lengthCm: '',
        widthCm: '',
        heightCm: ''
      }
    });
    setIsComboModalOpen(true);
  };

  const openEditComboModal = (combo) => {
    setComboToEdit(combo);
    setComboImgError('');
    const sp = combo.shippingPackage || {};
    setComboFormData({
      title: combo.title || '',
      sku: combo.sku || `FBX-COMBO-${combo.id}`,
      categoryId: combo.categoryId || 'combos',
      concernId: combo.concernId || 'joint-pain-care',
      dosageForm: combo.dosageForm || 'Combo Pack',
      volumeWeight: combo.volumeWeight || 'Full Course Pack',
      mrp: combo.mrp || 999,
      salePrice: combo.salePrice || 799,
      stockQuantity: combo.stockQuantity !== undefined ? combo.stockQuantity : 50,
      featuredImage: combo.featuredImage || '',
      isBestseller: !!combo.isBestseller,
      shortDesc: combo.shortDesc || '',
      ingredients: combo.ingredients || '',
      dosage: combo.dosage || '',
      shippingPackage: {
        weightGrams: sp.weightGrams ?? combo.packageWeightGrams ?? '',
        lengthCm: sp.lengthCm ?? combo.packageLengthCm ?? '',
        widthCm: sp.widthCm ?? combo.packageWidthCm ?? '',
        heightCm: sp.heightCm ?? combo.packageHeightCm ?? ''
      }
    });
    setIsComboModalOpen(true);
  };

  const handleComboFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setComboImgError('Please upload a JPG, PNG, or WebP image.');
      if (comboFileInputRef.current) comboFileInputRef.current.value = '';
      return;
    }

    // Validate size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setComboImgError('Image must be 5 MB or smaller.');
      if (comboFileInputRef.current) comboFileInputRef.current.value = '';
      return;
    }

    setComboImgError('');
    setIsUploadingComboImg(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Content = reader.result;
      // Immediate local preview
      setComboFormData(prev => ({ ...prev, featuredImage: base64Content }));

      try {
        const res = await apiRequest('/api/upload', {
          method: 'POST',
          body: JSON.stringify({
            image: base64Content,
            filename: file.name
          })
        });
        if (res.success && res.url) {
          setComboFormData(prev => ({ ...prev, featuredImage: res.url }));
        } else {
          setComboImgError(res.error || 'Image upload failed. Please try again.');
        }
      } catch (err) {
        setComboImgError('Image upload failed. Please try again.');
      } finally {
        setIsUploadingComboImg(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveComboImage = () => {
    if (window.confirm('Remove featured image?')) {
      setComboFormData(prev => ({ ...prev, featuredImage: '' }));
      setComboImgError('');
      if (comboFileInputRef.current) {
        comboFileInputRef.current.value = '';
      }
    }
  };

  const handleSaveCombo = async (e) => {
    e.preventDefault();
    if (!comboFormData.title || !comboFormData.salePrice) {
      alert('Please fill in Combo Offer Title and Offer Price.');
      return;
    }

    const sp = comboFormData.shippingPackage || {};
    const w = Number(sp.weightGrams);
    const l = Number(sp.lengthCm);
    const wi = Number(sp.widthCm);
    const h = Number(sp.heightCm);

    const hasWeight = sp.weightGrams !== '' && sp.weightGrams !== null && !isNaN(w);
    const hasLength = sp.lengthCm !== '' && sp.lengthCm !== null && !isNaN(l);
    const hasWidth = sp.widthCm !== '' && sp.widthCm !== null && !isNaN(wi);
    const hasHeight = sp.heightCm !== '' && sp.heightCm !== null && !isNaN(h);

    if ((hasWeight && w <= 0) || (hasLength && l <= 0) || (hasWidth && wi <= 0) || (hasHeight && h <= 0)) {
      alert('Package weight and dimensions must be positive numeric values greater than 0.');
      return;
    }

    const finalWeight = hasWeight && w > 0 ? w : 0;
    const finalLength = hasLength && l > 0 ? l : 0;
    const finalWidth = hasWidth && wi > 0 ? wi : 0;
    const finalHeight = hasHeight && h > 0 ? h : 0;

    const payload = {
      ...comboFormData,
      isCombo: true,
      categoryId: 'combos',
      mrp: Number(comboFormData.mrp),
      salePrice: Number(comboFormData.salePrice),
      stockQuantity: Number(comboFormData.stockQuantity) || 50,
      inStock: Number(comboFormData.stockQuantity) > 0,
      discountPercent: Math.round(((comboFormData.mrp - comboFormData.salePrice) / comboFormData.mrp) * 100),
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
    };

    if (comboToEdit) {
      await updateProduct(comboToEdit.id, payload);
    } else {
      await addProduct(payload);
    }
    setIsComboModalOpen(false);
  };

  const handleDeleteCombo = (combo) => {
    if (window.confirm(`Are you sure you want to delete the combo offer "${combo.title}"?`)) {
      deleteProduct(combo.id);
    }
  };

  // ----------------------------------------------------
  // 4. COUPON OFFER CREATION / EDIT HANDLERS
  // ----------------------------------------------------
  const openCreateCouponModal = () => {
    setCouponToEdit(null);
    setCouponFormData({
      code: '',
      type: 'percent',
      value: 10,
      minOrder: 499,
      maxDiscount: '',
      description: '',
      isActive: true
    });
    setIsCouponModalOpen(true);
  };

  const openEditCouponModal = (coupon) => {
    setCouponToEdit(coupon);
    setCouponFormData({
      code: coupon.code || '',
      type: coupon.type || 'percent',
      value: coupon.value || 10,
      minOrder: coupon.minOrder || 0,
      maxDiscount: coupon.maxDiscount !== null && coupon.maxDiscount !== undefined ? coupon.maxDiscount : '',
      description: coupon.description || '',
      isActive: coupon.isActive !== false
    });
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponFormData.code || !couponFormData.code.trim()) {
      alert('Coupon code is required.');
      return;
    }

    const cleanCode = couponFormData.code.trim().toUpperCase();
    const payload = {
      ...couponFormData,
      code: cleanCode,
      value: Number(couponFormData.value) || 0,
      minOrder: Number(couponFormData.minOrder) || 0,
      maxDiscount: couponFormData.maxDiscount !== '' ? Number(couponFormData.maxDiscount) : null,
    };

    try {
      if (couponToEdit) {
        await apiRequest(`/api/coupons/${couponToEdit.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest('/api/coupons', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      refreshCoupons();
      setIsCouponModalOpen(false);
    } catch (err) {
      alert('Failed to save coupon: ' + err.message);
    }
  };

  const handleToggleCouponStatus = async (coupon) => {
    try {
      await apiRequest(`/api/coupons/${coupon.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !coupon.isActive })
      });
      refreshCoupons();
    } catch (err) {
      alert('Failed to update coupon status: ' + err.message);
    }
  };

  const handleDeleteCoupon = async (coupon) => {
    if (window.confirm(`Are you sure you want to delete coupon code "${coupon.code}"?`)) {
      try {
        await apiRequest(`/api/coupons/${coupon.id}`, {
          method: 'DELETE'
        });
        refreshCoupons();
      } catch (err) {
        alert('Failed to delete coupon: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* TOP BANNER & FREE SHIPPING THRESHOLD EDIT CARD       */}
      {/* ---------------------------------------------------- */}
      <div className="bg-gradient-to-r from-forest to-forest-dark p-6 rounded-2xl text-white shadow-botanical flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gold text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <span>Ayurvedic Offer, Combo & Coupon Engine</span>
          </div>
          <h3 className="font-heading text-xl font-bold !text-white text-white drop-shadow-sm">
            Manage Discounts, Combo Bundles & Promo Coupons
          </h3>
          <p className="text-xs !text-white/90 text-white/90 max-w-xl mt-1">
            Configure formulation offer pricing, create combo value packages, launch coupon discount codes, and adjust the free shipping delivery threshold live.
          </p>
        </div>

        {/* Dynamic Free Shipping Threshold Editor Card */}
        <div className="bg-white/10 p-4 rounded-xl border border-white/20 text-center min-w-[220px] relative">
          <div className="text-[10px] text-sand/90 uppercase tracking-wider font-bold mb-1 flex items-center justify-center gap-1">
            <Truck className="h-3 w-3 text-gold" />
            <span>Free Shipping Threshold</span>
          </div>

          {isEditingThreshold ? (
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-center gap-1">
                <span className="text-xl font-bold text-gold">₹</span>
                <input
                  type="number"
                  value={tempThreshold}
                  onChange={(e) => setTempThreshold(e.target.value)}
                  className="w-24 px-2 py-1 text-center font-bold text-lg bg-white text-forest-deep rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleSaveThreshold}
                  className="px-3 py-1 rounded-md bg-gold hover:bg-amber-400 text-forest-deep font-bold text-xs shadow-xs transition-all flex items-center gap-1"
                >
                  <Save className="h-3 w-3" /> Save
                </button>
                <button
                  onClick={() => {
                    setIsEditingThreshold(false);
                    setTempThreshold(freeShippingThreshold || 499);
                  }}
                  className="px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-3xl font-black text-gold drop-shadow-sm">
                ₹{freeShippingThreshold || 499}+
              </div>
              <button
                onClick={() => setIsEditingThreshold(true)}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20"
              >
                <Edit3 className="h-3 w-3 text-gold" />
                <span>Edit Threshold</span>
              </button>
              {thresholdSavedMsg && (
                <div className="text-[11px] font-bold text-emerald-300 mt-1 animate-fadeIn flex items-center justify-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Updated live across site!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-NAVIGATION TABS BAR                             */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white p-2 rounded-2xl border border-sand-border shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('single-pricing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'single-pricing'
                ? 'bg-forest text-white shadow-xs'
                : 'text-charcoal hover:bg-sand text-charcoal-muted'
            }`}
          >
            <Tag className="h-4 w-4" />
            <span>Single Product Pricing</span>
          </button>

          <button
            onClick={() => setActiveTab('combos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'combos'
                ? 'bg-forest text-white shadow-xs'
                : 'text-charcoal hover:bg-sand text-charcoal-muted'
            }`}
          >
            <Package className="h-4 w-4 text-amber-400" />
            <span>Combo Offers ({comboProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'coupons'
                ? 'bg-forest text-white shadow-xs'
                : 'text-charcoal hover:bg-sand text-charcoal-muted'
            }`}
          >
            <Percent className="h-4 w-4 text-emerald-400" />
            <span>Coupon Offers ({coupons.length})</span>
          </button>
        </div>

        {/* Create CTAs depending on active sub-tab */}
        {activeTab === 'combos' && (
          <button
            onClick={openCreateComboModal}
            className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>+ Create Combo Offer</span>
          </button>
        )}

        {activeTab === 'coupons' && (
          <button
            onClick={openCreateCouponModal}
            className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>+ Create Coupon Offer</span>
          </button>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 1: SINGLE PRODUCT PRICING & OFFERS           */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'single-pricing' && (
        <div className="bg-white rounded-2xl border border-sand-border shadow-xs overflow-hidden">
          <div className="p-4 border-b border-sand-border bg-sand/20 flex items-center justify-between">
            <h4 className="font-heading text-sm font-bold text-forest-deep">
              Standard Formulation Price & Offer Management
            </h4>
            <span className="text-xs text-charcoal-muted font-medium">
              Click "Edit Offer" on any product to update MRP, Offer Price, or Bestseller status.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sand/60 border-b border-sand-border text-[11px] font-bold text-charcoal-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Product Formulation</th>
                  <th className="py-3 px-4">Regular MRP (₹)</th>
                  <th className="py-3 px-4">Offer Price (₹)</th>
                  <th className="py-3 px-4">Discount %</th>
                  <th className="py-3 px-4">2-Pack Savings</th>
                  <th className="py-3 px-4">3-Pack Savings</th>
                  <th className="py-3 px-4">Bestseller Flag</th>
                  <th className="py-3 px-4 text-right">Quick Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-border text-xs">
                {products.map((product) => {
                  const isEditing = editingId === product.id;
                  const currentMrp = isEditing ? editFields.mrp : product.mrp;
                  const currentSale = isEditing ? editFields.salePrice : product.salePrice;
                  const currentDiscount = Math.round(((currentMrp - currentSale) / currentMrp) * 100);

                  return (
                    <tr key={product.id} className="hover:bg-sand/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={product.featuredImage}
                            alt={product.title}
                            className="w-9 h-9 rounded-lg object-contain bg-sand p-1 border border-sand-border"
                          />
                          <div>
                            <span className="font-heading font-bold text-charcoal line-clamp-1">
                              {product.title}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] font-bold text-forest bg-forest/5 px-1.5 py-0.5 rounded border border-forest/15">
                                {product.sku || `FBX-${product.id}`}
                              </span>
                              <span className="text-[10px] text-charcoal-subtle">{product.volumeWeight}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* MRP */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editFields.mrp}
                            onChange={(e) => setEditFields({ ...editFields, mrp: Number(e.target.value) })}
                            className="w-20 px-2 py-1 rounded border border-sand-border text-xs font-semibold focus:ring-1 focus:ring-forest focus:outline-none"
                          />
                        ) : (
                          <span className="line-through text-charcoal-muted">{formatPrice(product.mrp)}</span>
                        )}
                      </td>

                      {/* Sale Price */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editFields.salePrice}
                            onChange={(e) => setEditFields({ ...editFields, salePrice: Number(e.target.value) })}
                            className="w-20 px-2 py-1 rounded border border-forest text-forest font-bold text-xs focus:ring-1 focus:ring-forest focus:outline-none bg-emerald-50/50"
                          />
                        ) : (
                          <span className="font-bold text-forest text-sm">{formatPrice(product.salePrice)}</span>
                        )}
                      </td>

                      {/* Discount % */}
                      <td className="py-3 px-4">
                        <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                          {currentDiscount}% OFF
                        </span>
                      </td>

                      {/* Multi-pack 2-pack */}
                      <td className="py-3 px-4 text-charcoal-muted font-medium">
                        {formatPrice(Math.round(currentSale * 2 * 0.9))} <span className="text-[10px] text-emerald-700">(-10%)</span>
                      </td>

                      {/* Multi-pack 3-pack */}
                      <td className="py-3 px-4 text-charcoal-muted font-medium">
                        {formatPrice(Math.round(currentSale * 3 * 0.85))} <span className="text-[10px] text-emerald-700">(-15%)</span>
                      </td>

                      {/* Bestseller */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="checkbox"
                            checked={editFields.isBestseller}
                            onChange={(e) => setEditFields({ ...editFields, isBestseller: e.target.checked })}
                            className="w-4 h-4 rounded text-forest focus:ring-forest cursor-pointer"
                          />
                        ) : (
                          product.isBestseller ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              YES
                            </span>
                          ) : (
                            <span className="text-charcoal-muted text-[10px]">No</span>
                          )
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveProductPricing(product.id)}
                            className="px-3 py-1 rounded-lg bg-forest hover:bg-forest-light text-white text-xs font-bold transition-all flex items-center gap-1 ml-auto"
                          >
                            <Save className="h-3.5 w-3.5" />
                            <span>Save</span>
                          </button>
                        ) : savedSuccess === product.id ? (
                          <span className="text-emerald-700 text-xs font-bold flex items-center gap-1 justify-end">
                            <Check className="h-4 w-4" />
                            <span>Saved!</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => startEditProduct(product)}
                            className="px-3 py-1 rounded-lg text-forest hover:bg-forest/10 font-bold text-xs transition-colors"
                          >
                            Edit Offer
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 2: COMBO OFFERS & VALUE BUNDLES             */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'combos' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                <Package className="h-4 w-4 text-amber-600" />
                <span>Ayurvedic Combo Offers & Value Packages</span>
              </h4>
              <p className="text-xs text-amber-800/80 mt-0.5">
                Combos are featured under "Combos & Value Courses" section and offer higher average order values.
              </p>
            </div>

            <button
              onClick={openCreateComboModal}
              className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>+ Create Combo Offer</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-sand-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-sand/60 border-b border-sand-border text-[11px] font-bold text-charcoal-muted uppercase tracking-wider">
                    <th className="py-3 px-4">Combo Offer Details</th>
                    <th className="py-3 px-4">SKU Code</th>
                    <th className="py-3 px-4">Package Contents</th>
                    <th className="py-3 px-4">Regular MRP</th>
                    <th className="py-3 px-4">Combo Offer Price</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-border text-xs">
                  {comboProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-charcoal-muted">
                        No combo offers created yet. Click "+ Create Combo Offer" above to create one.
                      </td>
                    </tr>
                  ) : (
                    comboProducts.map((combo) => {
                      const discount = Math.round(((combo.mrp - combo.salePrice) / combo.mrp) * 100);

                      return (
                        <tr key={combo.id} className="hover:bg-sand/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-sand p-1 border border-sand-border flex-shrink-0 flex items-center justify-center">
                                <img
                                  src={combo.featuredImage}
                                  alt={combo.title}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <div className="font-heading font-bold text-charcoal text-xs">
                                  {combo.title}
                                </div>
                                <div className="text-[10px] text-sage">{combo.concernId?.replace(/-/g, ' ')}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-mono text-xs font-bold text-forest bg-forest/5 px-2 py-0.5 rounded border border-forest/15">
                              {combo.sku || `FBX-COMBO-${combo.id}`}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-charcoal-muted font-medium">
                            {combo.volumeWeight}
                          </td>

                          <td className="py-3 px-4 line-through text-charcoal-muted">
                            {formatPrice(combo.mrp)}
                          </td>

                          <td className="py-3 px-4 font-bold text-forest text-sm">
                            {formatPrice(combo.salePrice)}
                          </td>

                          <td className="py-3 px-4">
                            <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                              {discount}% OFF
                            </span>
                          </td>

                          <td className="py-3 px-4 font-bold text-charcoal">
                            {combo.stockQuantity || 50} units
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => openEditComboModal(combo)}
                                className="px-2.5 py-1.5 rounded-lg text-forest hover:bg-forest/10 font-bold text-xs transition-colors flex items-center gap-1"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteCombo(combo)}
                                className="p-1.5 rounded-lg text-charcoal-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete Combo"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 3: COUPON OFFERS & PROMO CODES               */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-emerald-600" />
                <span>Coupon Code & Promo Discount Management</span>
              </h4>
              <p className="text-xs text-emerald-800/80 mt-0.5">
                Coupons created here are active in customer checkout and cart drawer instantly.
              </p>
            </div>

            <button
              onClick={openCreateCouponModal}
              className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>+ Create Coupon Offer</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-sand-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-sand/60 border-b border-sand-border text-[11px] font-bold text-charcoal-muted uppercase tracking-wider">
                    <th className="py-3 px-4">Coupon Code</th>
                    <th className="py-3 px-4">Discount Type & Value</th>
                    <th className="py-3 px-4">Minimum Order Amount</th>
                    <th className="py-3 px-4">Max Discount Cap</th>
                    <th className="py-3 px-4">Description / Offer Details</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-border text-xs">
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-charcoal-muted">
                        No coupon offers found. Click "+ Create Coupon Offer" to create your first coupon!
                      </td>
                    </tr>
                  ) : (
                    coupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-sand/30 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-extrabold text-forest bg-forest/10 px-3 py-1.5 rounded-lg border border-forest/20 inline-block uppercase tracking-wider">
                            {coupon.code}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-bold text-emerald-800">
                          {coupon.type === 'percent' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <Percent className="h-3 w-3 text-emerald-600" />
                              <span>{coupon.value}% OFF</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <span>Flat ₹{coupon.value} OFF</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-semibold text-charcoal">
                          {coupon.minOrder > 0 ? formatPrice(coupon.minOrder) : 'No Minimum'}
                        </td>

                        <td className="py-3 px-4 text-charcoal-muted font-medium">
                          {coupon.maxDiscount ? formatPrice(coupon.maxDiscount) : 'No Cap'}
                        </td>

                        <td className="py-3 px-4 text-charcoal-muted max-w-xs truncate">
                          {coupon.description || 'Ayurvedic promo discount code'}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleCouponStatus(coupon)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 transition-all ${
                              coupon.isActive
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            {coupon.isActive ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                <span>ACTIVE</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 text-gray-500" />
                                <span>INACTIVE</span>
                              </>
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => openEditCouponModal(coupon)}
                              className="px-2.5 py-1.5 rounded-lg text-forest hover:bg-forest/10 font-bold text-xs transition-colors flex items-center gap-1"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(coupon)}
                              className="p-1.5 rounded-lg text-charcoal-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Coupon"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: CREATE / EDIT COMBO OFFER                   */}
      {/* ---------------------------------------------------- */}
      {isComboModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-sand-border animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-sand-border bg-sand/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-forest-deep">
                    {comboToEdit ? 'Edit Combo Offer' : 'Create New Combo Offer'}
                  </h3>
                  <p className="text-xs text-charcoal-muted">
                    Configure multi-product Ayurvedic value packages and special bundled pricing.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsComboModalOpen(false)}
                className="p-2 rounded-full text-charcoal-muted hover:text-charcoal hover:bg-sand transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCombo} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-charcoal uppercase tracking-wider">
                  Combo Offer Title *
                </label>
                <input
                  type="text"
                  required
                  value={comboFormData.title}
                  onChange={(e) => setComboFormData({ ...comboFormData, title: e.target.value })}
                  placeholder="e.g. Arthobax Joint Relief Complete Kit (Capsules + Oil)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-charcoal uppercase tracking-wider">SKU Code</label>
                  <input
                    type="text"
                    value={comboFormData.sku}
                    onChange={(e) => setComboFormData({ ...comboFormData, sku: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none font-mono font-bold text-forest"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-charcoal uppercase tracking-wider">Target Concern</label>
                  <select
                    value={comboFormData.concernId}
                    onChange={(e) => setComboFormData({ ...comboFormData, concernId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none bg-white font-medium"
                  >
                    {CONCERNS.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-charcoal uppercase tracking-wider">Regular MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    value={comboFormData.mrp}
                    onChange={(e) => setComboFormData({ ...comboFormData, mrp: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-forest uppercase tracking-wider">Offer Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={comboFormData.salePrice}
                    onChange={(e) => setComboFormData({ ...comboFormData, salePrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-forest focus:ring-2 focus:ring-forest focus:outline-none font-bold text-forest bg-emerald-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-charcoal uppercase tracking-wider">Stock Qty</label>
                  <input
                    type="number"
                    value={comboFormData.stockQuantity}
                    onChange={(e) => setComboFormData({ ...comboFormData, stockQuantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-charcoal uppercase tracking-wider">Package Contents / Volume</label>
                <input
                  type="text"
                  value={comboFormData.volumeWeight}
                  onChange={(e) => setComboFormData({ ...comboFormData, volumeWeight: e.target.value })}
                  placeholder="e.g. 200ml Syrup + 30 Capsules + 50ml Oil"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none"
                />
              </div>

              {/* SHIPPING PACKAGE DETAILS FOR COMBO */}
              <div className="bg-sand/30 p-3.5 rounded-2xl border border-sand-border space-y-2">
                <label className="block font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-forest" />
                  <span>SHIPPING PACKAGE DETAILS (COMBO PARCEL)</span>
                </label>
                <p className="text-[11px] text-charcoal-muted">
                  Enter outer packed shipping parcel weight and dimensions for this combo offer shipment.
                </p>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  <div className="space-y-0.5">
                    <label className="block text-[10px] font-bold text-charcoal">Package Weight</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder="850"
                        value={comboFormData.shippingPackage?.weightGrams ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setComboFormData(prev => ({
                            ...prev,
                            shippingPackage: {
                              ...prev.shippingPackage,
                              weightGrams: val === '' ? '' : val
                            }
                          }));
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-sand-border focus:ring-1 focus:ring-forest font-bold text-xs bg-white"
                      />
                      <span className="text-[9px] text-charcoal-muted font-semibold block mt-0.5">grams</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="block text-[10px] font-bold text-charcoal">Length</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder="25"
                        value={comboFormData.shippingPackage?.lengthCm ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setComboFormData(prev => ({
                            ...prev,
                            shippingPackage: {
                              ...prev.shippingPackage,
                              lengthCm: val === '' ? '' : val
                            }
                          }));
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-sand-border focus:ring-1 focus:ring-forest font-bold text-xs bg-white"
                      />
                      <span className="text-[9px] text-charcoal-muted font-semibold block mt-0.5">cm</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="block text-[10px] font-bold text-charcoal">Width</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder="18"
                        value={comboFormData.shippingPackage?.widthCm ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setComboFormData(prev => ({
                            ...prev,
                            shippingPackage: {
                              ...prev.shippingPackage,
                              widthCm: val === '' ? '' : val
                            }
                          }));
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-sand-border focus:ring-1 focus:ring-forest font-bold text-xs bg-white"
                      />
                      <span className="text-[9px] text-charcoal-muted font-semibold block mt-0.5">cm</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="block text-[10px] font-bold text-charcoal">Height</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder="10"
                        value={comboFormData.shippingPackage?.heightCm ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setComboFormData(prev => ({
                            ...prev,
                            shippingPackage: {
                              ...prev.shippingPackage,
                              heightCm: val === '' ? '' : val
                            }
                          }));
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-sand-border focus:ring-1 focus:ring-forest font-bold text-xs bg-white"
                      />
                      <span className="text-[9px] text-charcoal-muted font-semibold block mt-0.5">cm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FEATURED IMAGE MANUAL UPLOAD FIELD */}
              <div className="space-y-2 pt-1">
                <label className="block font-bold text-charcoal uppercase tracking-wider">
                  FEATURED IMAGE
                </label>

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={comboFileInputRef}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleComboFileUpload}
                  className="hidden"
                />

                {comboFormData.featuredImage ? (
                  <div className="space-y-3">
                    {/* Clean Square Preview Container (object-fit: contain) */}
                    <div className="relative w-full h-48 rounded-2xl bg-sand/40 border-2 border-sand-border p-3 flex items-center justify-center overflow-hidden">
                      <img
                        src={comboFormData.featuredImage}
                        alt="Combo Featured Preview"
                        className="w-full h-full object-contain"
                      />
                      {isUploadingComboImg && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-2xs flex items-center justify-center font-bold text-xs text-forest">
                          Uploading image...
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={isUploadingComboImg}
                        onClick={() => comboFileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-forest/10 hover:bg-forest/20 text-forest font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Change Image</span>
                      </button>
                      <button
                        type="button"
                        disabled={isUploadingComboImg}
                        onClick={handleRemoveComboImage}
                        className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Remove Image</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !isUploadingComboImg && comboFileInputRef.current?.click()}
                    className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-2 ${
                      isUploadingComboImg
                        ? 'border-forest bg-forest/5 cursor-wait'
                        : 'border-sand-border hover:border-forest/50 hover:bg-sand/30 bg-sand/10'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-forest/10 text-forest flex items-center justify-center mx-auto">
                      {isUploadingComboImg ? (
                        <Upload className="h-6 w-6 animate-bounce" />
                      ) : (
                        <ImageIcon className="h-6 w-6" />
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        disabled={isUploadingComboImg}
                        className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-1.5 mb-2"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>{isUploadingComboImg ? 'Uploading image...' : 'Upload Combo Image'}</span>
                      </button>
                      <p className="text-[11px] font-semibold text-charcoal">
                        Supported formats: <span className="text-forest">JPG, JPEG, PNG, WebP</span>
                      </p>
                      <p className="text-[10px] text-charcoal-muted mt-0.5">
                        Recommended size: 1200 × 1200 px • Maximum file size: 5 MB
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {comboImgError && (
                  <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                    {comboImgError}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-charcoal uppercase tracking-wider">Short Description</label>
                <textarea
                  rows={2}
                  value={comboFormData.shortDesc}
                  onChange={(e) => setComboFormData({ ...comboFormData, shortDesc: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="comboBestseller"
                  checked={comboFormData.isBestseller}
                  onChange={(e) => setComboFormData({ ...comboFormData, isBestseller: e.target.checked })}
                  className="w-4 h-4 rounded text-forest focus:ring-forest cursor-pointer"
                />
                <label htmlFor="comboBestseller" className="font-bold text-charcoal cursor-pointer">
                  Mark as BESTSELLER Combo Offer
                </label>
              </div>

              <div className="pt-4 border-t border-sand-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsComboModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-sand hover:bg-sand-border text-charcoal font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingComboImg}
                  className={`px-6 py-2 rounded-xl bg-forest hover:bg-forest-light text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 ${
                    isUploadingComboImg ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Save className="h-4 w-4" />
                  <span>{isUploadingComboImg ? 'Uploading image...' : 'Save Combo Offer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: CREATE / EDIT COUPON OFFER                  */}
      {/* ---------------------------------------------------- */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-sand-border animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-sand-border bg-sand/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-forest-deep">
                    {couponToEdit ? 'Edit Coupon Offer' : 'Create New Coupon Offer'}
                  </h3>
                  <p className="text-xs text-charcoal-muted">
                    Set up coupon code, discount percentage or flat amount, and rules.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="p-2 rounded-full text-charcoal-muted hover:text-charcoal hover:bg-sand transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-charcoal uppercase tracking-wider">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={couponFormData.code}
                  onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. WELCOME20 or AYUSH100"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none font-mono font-extrabold uppercase text-forest tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-charcoal uppercase tracking-wider">Discount Type</label>
                  <select
                    value={couponFormData.type}
                    onChange={(e) => setCouponFormData({ ...couponFormData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none font-medium bg-white"
                  >
                    <option value="percent">Percentage (%) OFF</option>
                    <option value="flat">Flat Amount (₹) OFF</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-forest uppercase tracking-wider">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={couponFormData.value}
                    onChange={(e) => setCouponFormData({ ...couponFormData, value: e.target.value })}
                    placeholder={couponFormData.type === 'percent' ? '15' : '100'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-forest focus:ring-2 focus:ring-forest focus:outline-none font-bold text-forest bg-emerald-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-charcoal uppercase tracking-wider">
                    Minimum Order (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={couponFormData.minOrder}
                    onChange={(e) => setCouponFormData({ ...couponFormData, minOrder: e.target.value })}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-charcoal uppercase tracking-wider">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={couponFormData.maxDiscount}
                    onChange={(e) => setCouponFormData({ ...couponFormData, maxDiscount: e.target.value })}
                    placeholder="Optional cap"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-charcoal uppercase tracking-wider">Offer Description</label>
                <input
                  type="text"
                  value={couponFormData.description}
                  onChange={(e) => setCouponFormData({ ...couponFormData, description: e.target.value })}
                  placeholder="e.g. 15% discount on all formulations over ₹499"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={couponFormData.isActive}
                  onChange={(e) => setCouponFormData({ ...couponFormData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-forest focus:ring-forest cursor-pointer"
                />
                <label htmlFor="couponActive" className="font-bold text-charcoal cursor-pointer">
                  Coupon Status: ACTIVE (Available for Customer Checkout)
                </label>
              </div>

              <div className="pt-4 border-t border-sand-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-sand hover:bg-sand-border text-charcoal font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-forest hover:bg-forest-light text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Coupon Offer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
