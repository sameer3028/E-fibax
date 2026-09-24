import React, { useState, useRef } from 'react';
import {
  X,
  Star,
  Camera,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  UserCheck
} from 'lucide-react';
import { apiRequest } from '../../utils/api';

export function WriteReviewModal({ isOpen, onClose, product, onReviewSubmitted }) {
  const fileInputRef = useRef(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Staged local media files & previews
  const [photos, setPhotos] = useState([]); // array of { file, previewUrl, isUploaded, url }
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Customer Account Auth Check
  const [customerInfo, setCustomerInfo] = useState(() => {
    try {
      const savedUser = localStorage.getItem('fibax_customer') || localStorage.getItem('fibax_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [customNameInput, setCustomNameInput] = useState(customerInfo?.name || '');
  const [customPhoneInput, setCustomPhoneInput] = useState(customerInfo?.phone || '');

  if (!isOpen || !product) return null;

  // Handle Photo Selection (Up to 5 images)
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadError('');
    if (photos.length + files.length > 5) {
      setUploadError('Maximum 5 photos allowed per review.');
      return;
    }

    const newPhotos = [];
    for (const file of files) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type.toLowerCase())) {
        setUploadError('Please select JPG, PNG, or WebP product photos.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Image size must be 5 MB or smaller.');
        return;
      }
      newPhotos.push({
        file,
        previewUrl: URL.createObjectURL(file),
        isUploaded: false,
        url: null
      });
    }

    setPhotos(prev => [...prev, ...newPhotos]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setTitle('');
    setContent('');
    setPhotos([]);
    setUploadError('');
  };

  // Submit Review Form Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');

    if (!rating || rating < 1 || rating > 5) {
      setUploadError('Please select a rating.');
      return;
    }

    if (!content || !content.trim()) {
      setUploadError('Please write your review.');
      return;
    }

    if (!title || !title.trim()) {
      setUploadError('Please enter a review title.');
      return;
    }

    const finalCustomerName = customNameInput.trim() || customerInfo?.name || 'Verified Customer';
    if (!finalCustomerName) {
      setUploadError('Please enter your name for the review.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload photos to server
      const uploadedImageUrls = [];
      for (const p of photos) {
        if (p.url) {
          uploadedImageUrls.push(p.url);
        } else if (p.file) {
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(p.file);
          });
          const res = await apiRequest('/api/upload', {
            method: 'POST',
            body: JSON.stringify({
              image: base64,
              filename: p.file.name
            })
          });
          if (res.success && res.url) {
            uploadedImageUrls.push(res.url);
          }
        }
      }

      // 2. Submit Review Payload to Backend API
      const res = await apiRequest('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          rating,
          title: title.trim(),
          content: content.trim(),
          images: uploadedImageUrls,
          customerId: customerInfo?.id || null,
          customerName: finalCustomerName,
          customerEmail: customerInfo?.email || '',
          customerPhone: customPhoneInput || customerInfo?.phone || ''
        })
      });

      if (res.success) {
        setSubmitSuccess(true);
        if (onReviewSubmitted) onReviewSubmitted();
        setTimeout(() => {
          onClose();
          setSubmitSuccess(false);
          resetForm();
        }, 2500);
      } else {
        setUploadError(res.error || 'Failed to submit review. Please try again.');
      }
    } catch (err) {
      console.error('Review submission error:', err);
      setUploadError(err.message || 'Failed to submit review. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-sand-border animate-scaleIn">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand-border bg-sand/30">
          <div className="flex items-center gap-3">
            <img
              src={product.featuredImage}
              alt={product.title}
              className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-sand-border"
            />
            <div>
              <h3 className="font-heading text-base font-bold text-forest-deep line-clamp-1">
                How was the item?
              </h3>
              <p className="text-xs text-charcoal-muted line-clamp-1">
                {product.title}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 rounded-full text-charcoal-muted hover:text-charcoal hover:bg-sand transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitSuccess ? (
          <div className="p-8 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-heading font-extrabold text-xl text-forest-deep">
              Review Submitted!
            </h3>
            <p className="text-xs text-charcoal-muted max-w-md mx-auto leading-relaxed">
              Thank you! Your review has been submitted and is awaiting approval by our team before publishing.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
            />

            {/* 1. Star Rating Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star);
                      if (uploadError === 'Please select a rating.') setUploadError('');
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-100 text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-charcoal-muted font-medium">Select your rating</p>
            </div>

            {/* 2. Write A Review Textarea */}
            <div className="space-y-1.5 pt-2 border-t border-sand-border">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                WRITE A REVIEW
              </label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (uploadError === 'Please write your review.') setUploadError('');
                }}
                placeholder="What should other customers know?"
                className="w-full px-4 py-3 rounded-2xl border border-sand-border focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm text-charcoal outline-none resize-y"
              />
            </div>

            {/* 3. Share Product Photos Section */}
            <div className="space-y-2 pt-2 border-t border-sand-border">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                SHARE PRODUCT PHOTOS
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={photos.length >= 5}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-sand hover:bg-sand-border text-forest text-xs font-bold transition-colors flex items-center gap-1.5 border border-sand-border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="h-4 w-4" />
                  <span>+ Add Photos ({photos.length}/5)</span>
                </button>
              </div>

              {/* Previews Grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl border border-sand-border overflow-hidden bg-sand/40 group">
                      <img src={p.previewUrl} alt={`Review photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white text-[10px] shadow-sm hover:bg-red-700 transition-colors"
                        title="Remove photo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Title Your Review Input */}
            <div className="space-y-1.5 pt-2 border-t border-sand-border">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                TITLE YOUR REVIEW
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (uploadError === 'Please enter a review title.') setUploadError('');
                }}
                placeholder="What's most important to know?"
                className="w-full px-4 py-3 rounded-2xl border border-sand-border focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm text-charcoal outline-none"
              />
            </div>

            {/* Error Banner */}
            {uploadError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-shake">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Footer Action Buttons */}
            <div className="pt-3 border-t border-sand-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-charcoal hover:bg-sand transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting Review...</span>
                  </>
                ) : (
                  <span>Submit Review</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default WriteReviewModal;
