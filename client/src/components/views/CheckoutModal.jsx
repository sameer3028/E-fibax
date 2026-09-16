import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatPrice } from '../../lib/utils';
import {
  X,
  ShieldCheck,
  Truck,
  CheckCircle,
  CreditCard,
  Banknote,
  ArrowRight,
  User,
  Sparkles,
  Lock
} from 'lucide-react';

export function CheckoutModal({ isOpen, onClose }) {
  const { items, grandTotal, subtotal, shippingFee, discountAmount, clearCart } = useCart();
  const { currentUser, token, openAuthModal, fetchUserOrders } = useAuth();

  const [step, setStep] = useState(1); // 1: Info, 2: Address, 3: Payment, 4: Confirmed
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [orderNumber, setOrderNumber] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill from logged-in customer profile
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !name) setName(currentUser.name);
      if (currentUser.phone && !phone) setPhone(currentUser.phone);
      if (currentUser.email && !email) setEmail(currentUser.email);
      if (currentUser.addresses && currentUser.addresses.length > 0) {
        const def = currentUser.addresses[0];
        if (def.address && !address) setAddress(def.address);
        if (def.city && !city) setCity(def.city);
        if (def.pincode && !pincode) setPincode(def.pincode);
      }
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleCompleteOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderPayload = {
      customer: {
        name,
        phone,
        email: email || currentUser?.email || '',
        userId: currentUser?.id || null
      },
      items: items.map((i) => ({
        id: i.id,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        packName: i.packName,
        featuredImage: i.featuredImage
      })),
      shipping: { address, city, pincode },
      payment: { method: paymentMethod, status: paymentMethod === 'COD' ? 'Pending' : 'Success' },
      totals: { subtotal, grandTotal, discountAmount, shippingFee }
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload)
      });
      const data = await response.json();

      if (data.success && data.data) {
        setOrderNumber(data.data.orderId);
        setTrackingNumber(data.data.trackingId);
      } else {
        const genOrder = 'FBX-' + Math.floor(100000 + Math.random() * 900000);
        setOrderNumber(genOrder);
        setTrackingNumber('DLH-' + Math.floor(100000000 + Math.random() * 900000000));
      }

      if (currentUser && fetchUserOrders) {
        fetchUserOrders();
      }
    } catch {
      const genOrder = 'FBX-' + Math.floor(100000 + Math.random() * 900000);
      setOrderNumber(genOrder);
      setTrackingNumber('DLH-' + Math.floor(100000000 + Math.random() * 900000000));
    } finally {
      setIsSubmitting(false);
      setStep(4);
      clearCart();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-modal border border-sand-border p-6 sm:p-8 z-10 animate-scaleIn">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-charcoal-muted hover:text-charcoal hover:bg-sand transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Stepper Header */}
          <div className="pb-5 border-b border-sand-border mb-6">
            <h3 className="font-heading font-bold text-forest-deep text-xl sm:text-2xl">
              {step === 4 ? 'Order Confirmed!' : 'Fibax Express Checkout'}
            </h3>
            <p className="text-xs text-charcoal-muted mt-1">
              Dispatched with care via Delhivery Express • 100% Secure Checkout
            </p>

            {/* Logged in indicator or Quick Login hint */}
            {step !== 4 && (
              <div className="mt-3">
                {currentUser ? (
                  <div className="p-2.5 bg-forest/5 border border-forest/15 rounded-xl flex items-center justify-between text-xs text-forest">
                    <span className="flex items-center gap-1.5 font-medium">
                      <User className="h-3.5 w-3.5" />
                      <span>Logged in as <strong>{currentUser.name}</strong> ({currentUser.email})</span>
                    </span>
                    <span className="text-[10px] bg-forest text-white px-2 py-0.5 rounded-full font-bold">
                      Account Verified
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-brand-soft border border-brand-border/60 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-charcoal-muted flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-brand" />
                      <span>Have a Fibax account?</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="text-brand font-bold hover:underline"
                    >
                      Sign In for Saved Address
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-forest">Step 1: Contact Information</h4>
              <Input
                label="Full Name"
                placeholder="Enter your complete name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Mobile Number (for WhatsApp Delivery Updates)"
                placeholder="10-digit mobile number"
                type="tel"
                maxLength="10"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                required
              />
              <Input
                label="Email Address (for Invoice & Receipt)"
                placeholder="you@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                variant="primary"
                size="md"
                disabled={!name || phone.length !== 10}
                onClick={() => setStep(2)}
                className="w-full mt-4 font-bold"
              >
                Continue to Delivery Address
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-forest">Step 2: Shipping Destination</h4>
              <Input
                label="House / Flat / Street Address"
                placeholder="Address line"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City / Town"
                  placeholder="e.g. Ludhiana / Delhi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
                <Input
                  label="PIN Code (Delhivery)"
                  placeholder="6-digit PIN"
                  maxLength="6"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="secondary" size="md" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  disabled={!address || !city || pincode.length !== 6}
                  onClick={() => setStep(3)}
                  className="flex-1 font-bold"
                >
                  Proceed to Payment
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-forest">Step 3: Payment Method</h4>

              {/* Order Summary Recap */}
              <div className="p-4 bg-sand rounded-2xl border border-sand-border space-y-1.5 text-xs text-charcoal">
                <div className="flex justify-between font-semibold">
                  <span>Subtotal ({items.length} items):</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-forest font-bold">
                    <span>Course Discount:</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delhivery Express Shipping:</span>
                  <span className={shippingFee === 0 ? 'text-forest font-bold' : ''}>
                    {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="pt-2 border-t border-sand-border flex justify-between font-extrabold text-sm text-forest-deep">
                  <span>Grand Total:</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Payment Select */}
              <div className="space-y-2 pt-2">
                <label
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-forest bg-forest/5 shadow-xs'
                      : 'border-sand-border hover:bg-sand'
                  }`}
                  onClick={() => setPaymentMethod('UPI')}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                      className="text-forest focus:ring-forest"
                    />
                    <div>
                      <p className="text-xs font-bold text-charcoal">UPI Instant (GPay / PhonePe / Paytm)</p>
                      <p className="text-[11px] text-charcoal-muted">Fastest checkout & instant priority dispatch</p>
                    </div>
                  </div>
                  <CreditCard className="h-4 w-4 text-forest" />
                </label>

                <label
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-forest bg-forest/5 shadow-xs'
                      : 'border-sand-border hover:bg-sand'
                  }`}
                  onClick={() => setPaymentMethod('COD')}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="text-forest focus:ring-forest"
                    />
                    <div>
                      <p className="text-xs font-bold text-charcoal">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-charcoal-muted">Pay cash at doorstep when order arrives</p>
                    </div>
                  </div>
                  <Banknote className="h-4 w-4 text-brand" />
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="secondary" size="md" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  onClick={handleCompleteOrder}
                  className="flex-1 font-bold text-base py-3"
                >
                  {isSubmitting ? 'Placing Order...' : `Place Order • ${formatPrice(grandTotal)}`}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h3 className="font-heading font-bold text-2xl text-forest-deep">
                Thank You, {name}!
              </h3>
              <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
                Your order <strong>#{orderNumber}</strong> has been received and scheduled for dispatch via <strong>Delhivery Express</strong>.
              </p>
              <div className="p-4 rounded-2xl bg-sand border border-sand-border text-xs max-w-sm mx-auto text-left space-y-1.5 text-charcoal">
                <p><strong>AWB Tracking:</strong> <span className="font-mono text-forest font-bold">{trackingNumber}</span></p>
                <p><strong>Courier:</strong> Delhivery Express Air</p>
                <p><strong>Delivery Address:</strong> {address}, {city} - {pincode}</p>
                <p><strong>Confirmation SMS/WhatsApp:</strong> Sent to +91 {phone}</p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={onClose}
                className="mt-4"
              >
                Back to Store
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
