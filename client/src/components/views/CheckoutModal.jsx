import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
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
  ArrowRight
} from 'lucide-react';

export function CheckoutModal({ isOpen, onClose }) {
  const { items, grandTotal, subtotal, shippingFee, discountAmount, clearCart } = useCart();
  const [step, setStep] = useState(1); // 1: Info, 2: Address, 3: Payment, 4: Confirmed
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [orderNumber, setOrderNumber] = useState('');

  if (!isOpen) return null;

  const handleCompleteOrder = (e) => {
    e.preventDefault();
    const generatedOrder = 'FBX-' + Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(generatedOrder);
    setStep(4);
    clearCart();
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
          <div className="pb-6 border-b border-sand-border mb-6">
            <h3 className="font-serif font-bold text-forest-deep text-xl sm:text-2xl">
              {step === 4 ? 'Order Confirmed!' : 'Fibax Express Checkout'}
            </h3>
            <p className="text-xs text-charcoal-muted mt-1">
              Dispatched with care via Delhivery Express • 100% Secure Checkout
            </p>
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
              <div className="p-3.5 rounded-2xl bg-sand border border-sand-border text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Items ({items.length})</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Delivery</span>
                  <span>{shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-crimson font-medium">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-forest-deep pt-1 border-t border-sand-border">
                  <span>Payable Amount</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Payment Selector */}
              <div className="space-y-2">
                <label
                  onClick={() => setPaymentMethod('UPI')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-forest bg-sage-soft/30 font-bold text-forest'
                      : 'border-sand-border hover:bg-sand'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="h-4 w-4 text-forest" />
                    <span>Instant UPI / Cards / Netbanking (Razorpay)</span>
                  </div>
                  <span className="text-[11px] text-emerald-800 font-bold">Fastest</span>
                </label>

                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-forest bg-sage-soft/30 font-bold text-forest'
                      : 'border-sand-border hover:bg-sand'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Banknote className="h-4 w-4 text-forest" />
                    <span>Cash on Delivery (COD)</span>
                  </div>
                  <span className="text-[11px] text-charcoal-muted">OTP Verified</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="secondary" size="md" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleCompleteOrder}
                  className="flex-1 font-bold text-base py-3"
                >
                  Place Order • {formatPrice(grandTotal)}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-forest-deep">
                Thank You, {name}!
              </h3>
              <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
                Your order <strong>#{orderNumber}</strong> has been received and scheduled for dispatch via <strong>Delhivery Express</strong>.
              </p>
              <div className="p-4 rounded-2xl bg-sand border border-sand-border text-xs max-w-sm mx-auto text-left space-y-1 text-charcoal">
                <p><strong>Tracking partner:</strong> Delhivery</p>
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
