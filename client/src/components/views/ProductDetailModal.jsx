import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Accordion } from '../ui/Accordion';
import { formatPrice } from '../../lib/utils';
import { apiRequest } from '../../utils/api';
import { useProductRating } from '../../hooks/useProductRating';
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  Sparkles,
  ShoppingBag,
  Zap,
  Check,
  AlertCircle
} from 'lucide-react';

export function ProductDetailModal({ product, isOpen, onClose }) {
  const { addToCart, openCart } = useCart();
  const [selectedPack, setSelectedPack] = useState('pack-1');
  const [pincode, setPincode] = useState('');
  const [pinStatus, setPinStatus] = useState(null);
  const { average, count } = useProductRating(product);

  const galleryImages = (Array.isArray(product?.images) && product.images.length > 0)
    ? product.images.map(img => typeof img === 'string' ? img : (img?.url || '')).filter(Boolean)
    : [product?.featuredImage || product?.image || 'https://fibaxpharma.com/wp-content/uploads/2025/11/fp-enzyme.png'];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!isOpen || !product) return null;

  const activeMainImage = galleryImages[selectedImageIndex] || galleryImages[0] || product?.featuredImage || product?.image;

  const isOutOfStock = product.inStock === false || product.stockQuantity === undefined || product.stockQuantity === null || Number(product.stockQuantity) <= 0;

  const packs = [
    { id: 'pack-1', name: '1 Pack (Standard Course)', multiplier: 1, discount: 0 },
    { id: 'pack-2', name: '2 Packs (60-Day Therapy)', multiplier: 2, discount: 0.10 },
    { id: 'pack-3', name: '3-Month Complete Course', multiplier: 3, discount: 0.15 },
  ];

  const currentPack = packs.find(p => p.id === selectedPack) || packs[0];
  const calculatedPrice = Math.round(product.salePrice * currentPack.multiplier * (1 - currentPack.discount));
  const calculatedMrp = Math.round(product.mrp * currentPack.multiplier);

  const handleInstantBuy = () => {
    if (isOutOfStock) return;
    addToCart(product, currentPack.multiplier);
    onClose();
    openCart();
  };

  const handlePinCheck = async (e) => {
    e.preventDefault();
    const cleanPin = pincode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setPinStatus({ serviceable: false, message: 'Please enter a valid 6-digit Indian PIN code' });
      return;
    }
    try {
      const res = await apiRequest('/shipping/check-serviceability', {
        method: 'POST',
        body: JSON.stringify({ pincode: cleanPin })
      });
      const data = res?.data || res;
      if (res?.success && data?.serviceable) {
        const livePrefix = data.liveVerified ? 'Delhivery Live' : 'Delhivery Express';
        const locationName = data.city || data.circle || 'your city';
        const codText = data.codAvailable ? 'COD Available' : 'Prepaid Only';
        setPinStatus({
          serviceable: true,
          message: `${livePrefix}: Delivery in ${data.estimatedDays || '2-4 days'} to ${locationName} (${codText})`
        });
      } else {
        setPinStatus({
          serviceable: false,
          message: data?.error || 'PIN code is currently unserviceable for courier dispatch.'
        });
      }
    } catch {
      setPinStatus({ serviceable: true, message: 'Delivery in 2-4 business days via Delhivery Express' });
    }
  };

  const accordionItems = [
    {
      title: 'Key Health Benefits',
      content: (
        <ul className="space-y-1.5 text-xs text-charcoal">
          <li className="flex items-start gap-1.5">
            <Check className="h-3.5 w-3.5 text-sage flex-shrink-0 mt-0.5" />
            <span>Formulated to support natural biological recovery and systemic cellular balance.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Check className="h-3.5 w-3.5 text-sage flex-shrink-0 mt-0.5" />
            <span>Provides bioactive micronutrients without triggering acidity or gastric discomfort.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Check className="h-3.5 w-3.5 text-sage flex-shrink-0 mt-0.5" />
            <span>Non-addictive, safe for prolonged therapeutic regimens under proper guidance.</span>
          </li>
        </ul>
      ),
    },
    {
      title: 'Active Botanical Ingredients',
      content: (
        <p className="text-xs text-charcoal leading-relaxed">
          Standardized Ayurvedic extracts harvested from certified herb gardens. 100% vegetarian capsules and preservative-free herbal extracts tested for microbial purity and zero heavy metals.
        </p>
      ),
    },
    {
      title: 'Dosage & Directions for Use',
      content: (
        <p className="text-xs text-charcoal leading-relaxed">
          Take as directed on packaging or as advised by an Ayurvedic physician. For syrups: 10-15ml twice daily after meals with lukewarm water. For capsules: 1-2 capsules daily.
        </p>
      ),
    },
    {
      title: 'Safety, Quality & AYUSH Compliance',
      content: (
        <p className="text-xs text-charcoal leading-relaxed">
          Certified under GMP guidelines. Keep out of direct sunlight in a cool, dry place. Dietary supplement not intended to treat severe emergencies.
        </p>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-modal border border-sand-border p-6 sm:p-8 overflow-hidden z-10 animate-scaleIn">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-charcoal-muted hover:text-charcoal hover:bg-sand transition-colors z-20"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Gallery Image */}
            <div className="space-y-3">
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                {galleryImages.length > 1 && (
                  <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[300px] flex-shrink-0">
                    {galleryImages.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-12 h-12 rounded-lg border p-1 bg-white flex items-center justify-center flex-shrink-0 ${
                          selectedImageIndex === idx ? 'border-forest ring-2 ring-forest/20' : 'border-sand-border opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
                <div className="aspect-square flex-1 rounded-2xl bg-sand/70 p-6 flex items-center justify-center border border-sand-border">
                  <img
                    src={activeMainImage}
                    alt={product.title}
                    className="max-h-72 object-contain drop-shadow-md"
                  />
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs font-semibold text-forest">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-sage" />
                  AYUSH Certified
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Truck className="h-4 w-4 text-gold" />
                  Delhivery Express
                </span>
              </div>
            </div>

            {/* Product Details & Purchase Box */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="ayurvedic">100% AYURVEDIC</Badge>
                  {isOutOfStock ? (
                    <span className="bg-charcoal text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      OUT OF STOCK
                    </span>
                  ) : product.isBestseller ? (
                    <Badge variant="bestseller">POPULAR REMEDY</Badge>
                  ) : null}
                </div>

                <h2 className="font-heading text-2xl font-bold text-forest-deep leading-tight">
                  {product.title}
                </h2>
                <p className="text-xs text-charcoal-muted mt-1 font-medium">
                  {product.volumeWeight} • {product.dosageForm}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          count > 0 && star <= Math.round(average)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-gray-100 text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {count > 0 ? (
                    <>
                      <span className="text-xs font-bold text-charcoal">{average.toFixed(1)}</span>
                      <span className="text-xs text-charcoal-subtle">({count} verified review{count !== 1 ? 's' : ''})</span>
                    </>
                  ) : (
                    <span className="text-xs text-charcoal-subtle">No reviews yet</span>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="p-3.5 rounded-2xl bg-sand border border-sand-border">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-bold text-forest-deep">
                    {formatPrice(calculatedPrice)}
                  </span>
                  <span className="text-sm text-charcoal-muted line-through">
                    {formatPrice(calculatedMrp)}
                  </span>
                  {currentPack.discount > 0 && (
                    <Badge variant="discount">
                      SAVE {Math.round(currentPack.discount * 100)}% EXTRA
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                  Inclusive of all taxes
                </p>
              </div>

              {/* Pack Selector */}
              <div>
                <label className="block text-xs font-bold text-charcoal-muted uppercase tracking-wider mb-1.5">
                  Select Treatment Course:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {packs.map((pk) => (
                    <button
                      key={pk.id}
                      onClick={() => setSelectedPack(pk.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                        selectedPack === pk.id
                          ? 'border-forest bg-sage-soft/30 font-bold text-forest'
                          : 'border-sand-border bg-white text-charcoal hover:bg-sand'
                      }`}
                    >
                      <span>{pk.name}</span>
                      {pk.discount > 0 ? (
                        <span className="text-crimson font-bold">Extra {pk.discount * 100}% Off</span>
                      ) : (
                        <span className="text-charcoal-muted">Standard</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delhivery PIN code validation */}
              <form onSubmit={handlePinCheck} className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="Enter 6-digit PIN code"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-sand-border focus:outline-none focus:border-forest"
                  />
                  <Button variant="secondary" size="sm" type="submit" className="text-xs flex-shrink-0">
                    Check PIN
                  </Button>
                </div>
                {pinStatus && (
                  <p className={`text-[11px] mt-1 font-medium ${pinStatus.serviceable ? 'text-emerald-700' : 'text-crimson'}`}>
                    {pinStatus.message}
                  </p>
                )}
              </form>

              {/* Action Buttons */}
              {isOutOfStock ? (
                <div className="w-full pt-2">
                  <button
                    disabled
                    className="w-full py-3.5 px-5 rounded-xl bg-sand text-charcoal-muted text-xs font-extrabold uppercase tracking-wide cursor-not-allowed flex items-center justify-center gap-1.5 border border-sand-border"
                  >
                    <AlertCircle className="h-4 w-4 text-charcoal-subtle" />
                    <span>Out of Stock</span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleInstantBuy}
                    className="flex-1 font-bold shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Zap className="h-4 w-4 text-gold fill-current" />
                    <span>Buy Now (Direct Checkout)</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      if (isOutOfStock) return;
                      addToCart(product, currentPack.multiplier);
                      onClose();
                    }}
                    className="flex-1 font-semibold flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </Button>
                </div>
              )}

              {/* Accordions */}
              <div className="pt-4 border-t border-sand-border">
                <Accordion items={accordionItems} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
