import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../lib/utils';
import {
  X,
  Package,
  User,
  MapPin,
  LogOut,
  Truck,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit2,
  Save,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';

export function AccountModal({ onExploreProducts }) {
  const {
    currentUser,
    isAccountModalOpen,
    closeAccountModal,
    accountModalTab,
    setAccountModalTab,
    userOrders,
    loadingOrders,
    updateProfile,
    logout
  } = useAuth();

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editAddress, setEditAddress] = useState(currentUser?.addresses?.[0]?.address || '');
  const [editCity, setEditCity] = useState(currentUser?.addresses?.[0]?.city || '');
  const [editPincode, setEditPincode] = useState(currentUser?.addresses?.[0]?.pincode || '');
  const [profileMessage, setProfileMessage] = useState('');

  if (!isAccountModalOpen || !currentUser) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    const res = await updateProfile({
      name: editName,
      phone: editPhone,
      address: editAddress,
      city: editCity,
      pincode: editPincode
    });
    if (res.success) {
      setProfileMessage('Profile updated successfully!');
      setIsEditingProfile(false);
      setTimeout(() => setProfileMessage(''), 3000);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="h-3 w-3" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
            <Truck className="h-3 w-3" /> In Transit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="h-3 w-3" /> Processing Order
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeAccountModal}
      />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-modal border border-sand-border p-6 sm:p-8 z-10 animate-scaleIn max-h-[90vh] flex flex-col">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-5 border-b border-sand-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-forest text-white font-black text-lg flex items-center justify-center shadow-xs">
                {currentUser.name
                  ? currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : 'FP'}
              </div>
              <div>
                <h3 className="font-heading font-bold text-forest-deep text-lg sm:text-xl">
                  {currentUser.name}
                </h3>
                <p className="text-xs text-charcoal-muted">
                  {currentUser.email} • +91-{currentUser.phone}
                </p>
              </div>
            </div>

            <button
              onClick={closeAccountModal}
              className="p-2 rounded-full text-charcoal-subtle hover:text-charcoal hover:bg-sand transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-sand-border pt-3 pb-2 overflow-x-auto scrollbar-none flex-shrink-0">
            <button
              onClick={() => setAccountModalTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                accountModalTab === 'orders'
                  ? 'bg-forest text-white shadow-xs'
                  : 'text-charcoal-muted hover:text-forest hover:bg-sand'
              }`}
            >
              <Package className="h-4 w-4" />
              <span>My Orders ({userOrders.length})</span>
            </button>

            <button
              onClick={() => setAccountModalTab('profile')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                accountModalTab === 'profile'
                  ? 'bg-forest text-white shadow-xs'
                  : 'text-charcoal-muted hover:text-forest hover:bg-sand'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile Details</span>
            </button>

            <button
              onClick={() => setAccountModalTab('addresses')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                accountModalTab === 'addresses'
                  ? 'bg-forest text-white shadow-xs'
                  : 'text-charcoal-muted hover:text-forest hover:bg-sand'
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Saved Addresses</span>
            </button>

            <button
              onClick={logout}
              className="ml-auto px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Tab Contents (Scrollable) */}
          <div className="flex-1 overflow-y-auto pt-5 pr-1 space-y-4">
            
            {/* 1. ORDERS TAB */}
            {accountModalTab === 'orders' && (
              <div>
                {loadingOrders ? (
                  <div className="py-12 text-center text-xs text-charcoal-muted">
                    Loading your order history...
                  </div>
                ) : userOrders.length > 0 ? (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <div
                        key={order.orderId}
                        className="bg-sand rounded-2xl p-4 sm:p-5 border border-sand-border space-y-3"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand-border pb-3">
                          <div>
                            <span className="text-xs font-black text-forest block">
                              Order #{order.orderId}
                            </span>
                            <span className="text-[11px] text-charcoal-subtle flex items-center gap-1 mt-0.5">
                              <Calendar className="h-3 w-3" />
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {getStatusBadge(order.status)}
                            <span className="text-sm font-black text-forest-deep">
                              {formatPrice(order.totals?.grandTotal || 0)}
                            </span>
                          </div>
                        </div>

                        {/* Courier tracking strip */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-white p-2.5 rounded-xl border border-sand-border">
                          <span className="flex items-center gap-1.5 text-charcoal-muted">
                            <Truck className="h-3.5 w-3.5 text-forest" />
                            <span>Courier: <strong>{order.courier || 'Delhivery Express'}</strong></span>
                          </span>
                          <span className="text-forest font-mono font-bold text-[11px]">
                            AWB: {order.trackingId}
                          </span>
                        </div>

                        {/* Items list */}
                        <div className="space-y-2 pt-1">
                          {order.items?.map((item, iIdx) => (
                            <div key={iIdx} className="flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-2.5 min-w-0">
                                {item.featuredImage && (
                                  <img
                                    src={item.featuredImage}
                                    alt={item.title}
                                    className="w-9 h-9 object-contain bg-white rounded-lg p-0.5 border border-sand-border flex-shrink-0"
                                  />
                                )}
                                <div className="truncate">
                                  <span className="font-semibold text-charcoal truncate block">
                                    {item.title}
                                  </span>
                                  <span className="text-[10px] text-charcoal-subtle">
                                    Qty: {item.quantity} {item.packName ? `• ${item.packName}` : ''}
                                  </span>
                                </div>
                              </div>
                              <span className="font-bold text-charcoal flex-shrink-0">
                                {formatPrice(item.price * (item.quantity || 1))}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Shipping Destination */}
                        {order.shipping?.address && (
                          <div className="text-[11px] text-charcoal-muted pt-2 border-t border-sand-border/60">
                            Deliver to: {order.shipping.address}, {order.shipping.city} - {order.shipping.pincode}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-sand mx-auto flex items-center justify-center text-charcoal-subtle mb-3">
                      <ShoppingBag className="h-7 w-7 text-brand" />
                    </div>
                    <h4 className="text-base font-bold text-forest-deep">No Orders Yet</h4>
                    <p className="text-xs text-charcoal-muted mt-1 max-w-sm mx-auto">
                      You haven't placed any orders yet. Discover authentic Ayurvedic formulations and start your wellness journey today.
                    </p>
                    <button
                      onClick={() => {
                        closeAccountModal();
                        if (onExploreProducts) onExploreProducts();
                      }}
                      className="mt-4 px-6 py-2.5 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brand-hover shadow-orange-glow transition-all"
                    >
                      Explore Bestsellers
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 2. PROFILE TAB */}
            {accountModalTab === 'profile' && (
              <div className="space-y-4">
                {profileMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    {profileMessage}
                  </div>
                )}

                {!isEditingProfile ? (
                  <div className="bg-sand rounded-2xl p-5 border border-sand-border space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-forest">Personal Information</h4>
                      <button
                        onClick={() => {
                          setEditName(currentUser.name);
                          setEditPhone(currentUser.phone);
                          setIsEditingProfile(true);
                        }}
                        className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                      >
                        <Edit2 className="h-3 w-3" /> Edit Details
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-charcoal-subtle block mb-0.5">Full Name:</span>
                        <strong className="text-charcoal font-semibold text-sm">{currentUser.name}</strong>
                      </div>
                      <div>
                        <span className="text-charcoal-subtle block mb-0.5">Mobile Number:</span>
                        <strong className="text-charcoal font-semibold text-sm">+91 {currentUser.phone}</strong>
                      </div>
                      <div>
                        <span className="text-charcoal-subtle block mb-0.5">Email Address:</span>
                        <strong className="text-charcoal font-semibold text-sm">{currentUser.email}</strong>
                      </div>
                      <div>
                        <span className="text-charcoal-subtle block mb-0.5">Member Since:</span>
                        <strong className="text-charcoal font-semibold text-sm">
                          {new Date(currentUser.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="bg-sand rounded-2xl p-5 border border-sand-border space-y-3">
                    <h4 className="text-sm font-bold text-forest">Edit Profile Details</h4>
                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold hover:bg-brand-hover"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2 bg-white border border-sand-border rounded-xl text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* 3. SAVED ADDRESSES TAB */}
            {accountModalTab === 'addresses' && (
              <div className="space-y-4">
                <div className="bg-sand rounded-2xl p-5 border border-sand-border space-y-3">
                  <h4 className="text-sm font-bold text-forest">Default Delivery Address</h4>
                  {currentUser.addresses && currentUser.addresses.length > 0 ? (
                    <div className="bg-white p-4 rounded-xl border border-sand-border text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-forest flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-brand" /> Delivery Destination
                        </span>
                        <span className="text-[10px] bg-leaf/20 text-forest font-bold px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      </div>
                      <p className="text-charcoal font-medium pt-1">
                        {currentUser.addresses[0].address}
                      </p>
                      <p className="text-charcoal-muted">
                        {currentUser.addresses[0].city} - {currentUser.addresses[0].pincode}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-charcoal-muted">
                      No delivery address saved yet. You can add one during checkout or right now.
                    </p>
                  )}

                  {/* Add / Update Address form */}
                  <div className="pt-3 border-t border-sand-border">
                    <h5 className="text-xs font-bold text-charcoal mb-2">Update Delivery Address:</h5>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Street / Flat / Colony"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={editCity}
                          onChange={(e) => setEditCity(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs"
                        />
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="6-digit PIN"
                          value={editPincode}
                          onChange={(e) => setEditPincode(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs"
                        />
                      </div>
                      <button
                        onClick={handleSaveProfile}
                        className="px-4 py-2 bg-forest text-white rounded-xl text-xs font-bold hover:bg-forest-dark transition-colors"
                      >
                        Update Saved Address
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
