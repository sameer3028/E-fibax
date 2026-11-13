import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../lib/utils';
import { apiRequest } from '../../utils/api';
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
  ArrowRight,
  ArrowLeft,
  XCircle,
  AlertCircle,
  RefreshCw,
  Heart,
  HelpCircle,
  Sparkles,
  Wallet,
  CreditCard,
  Star,
  Bell,
  Info,
  ShieldCheck,
  FileText,
  PhoneCall,
  MessageCircle,
  Lightbulb,
  ChevronRight,
  Send,
  Tag,
  Copy,
  Check
} from 'lucide-react';

export function AccountModal({ onExploreProducts, onOpenTrackOrder, onNavigate }) {
  const {
    currentUser,
    token,
    isAccountModalOpen,
    closeAccountModal,
    accountModalTab,
    setAccountModalTab,
    userOrders,
    loadingOrders,
    fetchUserOrders,
    updateProfile,
    logout
  } = useAuth();

  // Sub-tab view inside Account: 'main' | 'orders' | 'profile' | 'addresses' | 'support' | 'wishlist' | 'refunds' | 'payments' | 'rewards' | 'suggest'
  const activeTab = accountModalTab || 'main';

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editAddress, setEditAddress] = useState(currentUser?.addresses?.[0]?.address || '');
  const [editCity, setEditCity] = useState(currentUser?.addresses?.[0]?.city || '');
  const [editPincode, setEditPincode] = useState(currentUser?.addresses?.[0]?.pincode || '');
  const [profileMessage, setProfileMessage] = useState('');

  // Cancellation Modal state
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [customReason, setCustomReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');

  // Logout confirmation modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Wishlist state
  const [wishlistItems, setWishlistItems] = useState([]);

  // Active coupons for rewards
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [copiedCoupon, setCopiedCoupon] = useState('');

  // Suggest product state
  const [suggestCategory, setSuggestCategory] = useState('Immunity & Vitality');
  const [suggestIdea, setSuggestIdea] = useState('');
  const [suggestSent, setSuggestSent] = useState(false);

  // Sync edit profile values when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditPhone(currentUser.phone || '');
      setEditAddress(currentUser.addresses?.[0]?.address || '');
      setEditCity(currentUser.addresses?.[0]?.city || '');
      setEditPincode(currentUser.addresses?.[0]?.pincode || '');
    }
  }, [currentUser]);

  // Load wishlist from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('fibax_wishlist');
      if (stored) {
        setWishlistItems(JSON.parse(stored));
      }
    } catch (_) {}
  }, [isAccountModalOpen]);

  // Fetch active store coupons for Fibax Rewards
  useEffect(() => {
    if (isAccountModalOpen) {
      apiRequest('/api/coupons/active')
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setAvailableCoupons(res.data);
          }
        })
        .catch(() => {});
    }
  }, [isAccountModalOpen]);

  if (!isAccountModalOpen || !currentUser) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    const updatedAddresses = [
      {
        id: currentUser.addresses?.[0]?.id || 'addr_primary',
        address: editAddress,
        city: editCity,
        pincode: editPincode,
        isDefault: true
      }
    ];

    const res = await updateProfile({
      name: editName,
      phone: editPhone,
      addresses: updatedAddresses
    });

    if (res.success) {
      setProfileMessage('Profile updated successfully!');
      setIsEditingProfile(false);
      setTimeout(() => setProfileMessage(''), 3000);
    } else {
      setProfileMessage(res.error || 'Failed to update profile');
    }
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(''), 2500);
  };

  const handleCancelOrderSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModalOrder) return;
    setIsCancelling(true);
    setCancelError('');
    setCancelSuccess('');

    const finalReason = cancelReason === 'Other' ? customReason.trim() : cancelReason;

    try {
      const res = await apiRequest(`/api/orders/${cancelModalOrder.id}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: finalReason || 'Customer requested cancellation' })
      });

      if (res.success) {
        setCancelSuccess('Order has been cancelled successfully.');
        await fetchUserOrders();
        setTimeout(() => {
          setCancelModalOrder(null);
          setCancelSuccess('');
          setCustomReason('');
          setCancelReason('Changed my mind');
        }, 1500);
      } else {
        setCancelError(res.error || 'Unable to cancel order. Please contact support.');
      }
    } catch (err) {
      setCancelError(err.message || 'An error occurred while cancelling order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="h-3 w-3" /> Delivered
        </span>
      );
    }
    if (s === 'shipped' || s === 'in_transit') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <Truck className="h-3 w-3" /> In Transit
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <XCircle className="h-3 w-3" /> Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
        <Clock className="h-3 w-3" /> Processing
      </span>
    );
  };

  // Compute stats
  const totalOrders = userOrders ? userOrders.length : 0;
  const cancelledOrders = userOrders ? userOrders.filter(o => String(o.status).toLowerCase() === 'cancelled') : [];
  const activeAddressesCount = (currentUser.addresses && currentUser.addresses.filter(a => a.address || a.city).length) || (currentUser.addresses?.length ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center sm:p-4">
      {/* Container: Full Screen on Mobile (320px-430px), Centered Card on Tablet/Desktop */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-xl bg-[#F4F6F5] text-charcoal sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
        
        {/* ======================================================== */}
        {/* TOP PROFILE HEADER                                       */}
        {/* ======================================================== */}
        <div className="sticky top-0 z-20 bg-white border-b border-sand-border/70 px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            {activeTab !== 'main' ? (
              <button
                type="button"
                onClick={() => setAccountModalTab('main')}
                className="p-1.5 -ml-1.5 rounded-full text-charcoal hover:bg-sand/40 hover:text-forest transition-colors flex items-center justify-center"
                aria-label="Back to Profile"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : null}
            <h1 className="font-heading font-extrabold text-lg sm:text-xl text-forest-deep tracking-tight">
              {activeTab === 'main' ? 'Profile' : 
               activeTab === 'orders' ? 'Your Orders' :
               activeTab === 'support' ? 'Help & Support' :
               activeTab === 'wishlist' ? 'Your Wishlist' :
               activeTab === 'refunds' ? 'Your Refunds' :
               activeTab === 'payments' ? 'Payment Methods' :
               activeTab === 'rewards' ? 'Fibax Rewards' :
               activeTab === 'addresses' ? 'Saved Addresses' :
               activeTab === 'profile' ? 'Edit Profile' :
               activeTab === 'suggest' ? 'Suggest Products' : 'My Account'}
            </h1>
          </div>
          <button
            type="button"
            onClick={closeAccountModal}
            className="p-1.5 -mr-1.5 rounded-full text-charcoal-muted hover:bg-sand/50 hover:text-forest transition-colors flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* SCROLLABLE BODY CONTENT                                  */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-5 space-y-4">

          {/* ------------------------------------------------------ */}
          {/* VIEW: MAIN PROFILE DASHBOARD (Zepto Style)             */}
          {/* ------------------------------------------------------ */}
          {activeTab === 'main' && (
            <>
              {/* 1. Profile User Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sand-border/80 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-forest text-white font-extrabold text-xl sm:text-2xl flex items-center justify-center ring-4 ring-forest/10 flex-shrink-0 shadow-xs">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'F'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-heading font-bold text-base sm:text-lg text-charcoal truncate">
                      {currentUser.name || 'Valued Customer'}
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold text-charcoal-muted mt-0.5">
                      +91 {currentUser.phone ? currentUser.phone.replace(/^\+?91/, '') : 'Customer Mobile'}
                    </p>
                    {currentUser.email && (
                      <p className="text-[11px] text-charcoal-muted truncate mt-0.5">
                        {currentUser.email}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAccountModalTab('profile')}
                  className="p-2 rounded-xl text-forest hover:bg-forest/5 transition-colors flex-shrink-0"
                  title="Edit Profile"
                >
                  <Edit2 className="h-4 w-4 text-forest" />
                </button>
              </div>

              {/* 2. Quick Access Row of 3 Equal Cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {/* Card 1: Your Orders */}
                <button
                  type="button"
                  onClick={() => {
                    fetchUserOrders();
                    setAccountModalTab('orders');
                  }}
                  className="bg-white rounded-2xl p-3 sm:p-4 border border-sand-border/80 shadow-xs flex flex-col items-center justify-center text-center hover:border-forest/40 hover:shadow-sm transition-all active:scale-[0.98]"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-forest/10 text-forest flex items-center justify-center mb-1.5 flex-shrink-0">
                    <Package className="h-5 w-5" />
                  </div>
                  <span className="font-heading font-bold text-xs sm:text-sm text-charcoal leading-tight">
                    Your Orders
                  </span>
                  {totalOrders > 0 && (
                    <span className="text-[10px] font-semibold text-brand mt-0.5">
                      {totalOrders} {totalOrders === 1 ? 'order' : 'orders'}
                    </span>
                  )}
                </button>

                {/* Card 2: Help & Support */}
                <button
                  type="button"
                  onClick={() => setAccountModalTab('support')}
                  className="bg-white rounded-2xl p-3 sm:p-4 border border-sand-border/80 shadow-xs flex flex-col items-center justify-center text-center hover:border-forest/40 hover:shadow-sm transition-all active:scale-[0.98]"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-1.5 flex-shrink-0">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <span className="font-heading font-bold text-xs sm:text-sm text-charcoal leading-tight">
                    Help & Support
                  </span>
                  <span className="text-[10px] font-semibold text-charcoal-muted mt-0.5">
                    24/7 Helpline
                  </span>
                </button>

                {/* Card 3: Your Wishlist */}
                <button
                  type="button"
                  onClick={() => setAccountModalTab('wishlist')}
                  className="bg-white rounded-2xl p-3 sm:p-4 border border-sand-border/80 shadow-xs flex flex-col items-center justify-center text-center hover:border-forest/40 hover:shadow-sm transition-all active:scale-[0.98]"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-1.5 flex-shrink-0">
                    <Heart className="h-5 w-5" />
                  </div>
                  <span className="font-heading font-bold text-xs sm:text-sm text-charcoal leading-tight">
                    Your Wishlist
                  </span>
                  <span className="text-[10px] font-semibold text-charcoal-muted mt-0.5">
                    {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'saved'}
                  </span>
                </button>
              </div>

              {/* 3. Rewards Promotional Banner */}
              <div 
                onClick={() => setAccountModalTab('rewards')}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-forest-deep via-forest to-emerald-800 text-white p-4 sm:p-4.5 cursor-pointer shadow-sm hover:shadow transition-all group"
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                      <span className="font-heading font-extrabold text-sm sm:text-base text-white">
                        Fibax Rewards
                      </span>
                      <span className="px-2 py-0.5 bg-amber-400 text-forest-deep text-[10px] font-black uppercase rounded-full">
                        Coupons Inside
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100">
                      Earn rewards & unlock discounts on your Ayurvedic wellness purchases
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-white text-forest text-xs font-bold shadow-xs whitespace-nowrap group-hover:bg-amber-300 group-hover:text-forest-deep transition-colors flex items-center gap-1"
                  >
                    <span>Explore</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* 4. Money Center Section */}
              <div className="bg-white rounded-2xl border border-sand-border/80 shadow-xs divide-y divide-sand-border/50 overflow-hidden">
                <div className="px-4 py-3 bg-[#FAFBF9]">
                  <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider text-charcoal-muted">
                    Money Center
                  </h3>
                </div>

                {/* Your Refunds */}
                <button
                  type="button"
                  onClick={() => {
                    fetchUserOrders();
                    setAccountModalTab('refunds');
                  }}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-sand/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-charcoal group-hover:text-forest transition-colors">
                        Your Refunds
                      </p>
                      <p className="text-[11px] text-charcoal-muted">
                        {cancelledOrders.length > 0
                          ? `${cancelledOrders.length} cancelled order refund${cancelledOrders.length > 1 ? 's' : ''}`
                          : 'Track instant refunds on returns or cancellations'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-charcoal-muted group-hover:text-forest transition-colors" />
                </button>

                {/* Payment Methods */}
                <button
                  type="button"
                  onClick={() => setAccountModalTab('payments')}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-sand/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-charcoal group-hover:text-forest transition-colors">
                        Payment Methods
                      </p>
                      <p className="text-[11px] text-charcoal-muted">
                        UPI, Cards, Net Banking & Cash on Delivery via Razorpay
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-charcoal-muted group-hover:text-forest transition-colors" />
                </button>
              </div>

              {/* 5. Your Information Section */}
              <div className="bg-white rounded-2xl border border-sand-border/80 shadow-xs divide-y divide-sand-border/50 overflow-hidden">
                <div className="px-4 py-3 bg-[#FAFBF9]">
                  <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider text-charcoal-muted">
                    Your Information
                  </h3>
                </div>

                {/* Review & Earn */}
                <button
                  type="button"
                  onClick={() => {
                    fetchUserOrders();
                    setAccountModalTab('orders');
                  }}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-sand/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <Star className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-charcoal group-hover:text-forest transition-colors">
                        Review & Earn
                      </p>
                      <p className="text-[11px] text-charcoal-muted">
                        Rate received products & share Ayurvedic results
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-charcoal-muted group-hover:text-forest transition-colors" />
                </button>

                {/* Saved Addresses */}
                <button
                  type="button"
                  onClick={() => setAccountModalTab('addresses')}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-sand/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-forest/10 text-forest flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-bold text-charcoal group-hover:text-forest transition-colors">
                          Saved Addresses
                        </p>
                        <span className="px-1.5 py-0.2 bg-sand text-forest text-[10px] font-bold rounded">
                          {activeAddressesCount} saved
                        </span>
                      </div>
                      <p className="text-[11px] text-charcoal-muted truncate max-w-[200px] sm:max-w-xs">
                        {currentUser.addresses?.[0]?.address || 'Manage delivery addresses'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-charcoal-muted group-hover:text-forest transition-colors" />
                </button>

                {/* Edit Profile */}
                <button
                  type="button"
                  onClick={() => setAccountModalTab('profile')}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-sand/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-charcoal group-hover:text-forest transition-colors">
                        Edit Profile
                      </p>
                      <p className="text-[11px] text-charcoal-muted">
                        Update name, registered phone & email
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-charcoal-muted group-hover:text-forest transition-colors" />
                </button>

                {/* Your Wishlist */}
                <button
                  type="button"
                  onClick={() => setAccountModalTab('wishlist')}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-sand/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                      <Heart className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-bold text-charcoal group-hover:text-forest transition-colors">
                          Your Wishlist
                        </p>
                        <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 text-[10px] font-bold rounded">
                          {wishlistItems.length}
                        </span>
                      </div>
                      <p className="text-[11px] text-charcoal-muted">
                        All favourite formulas in one place
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-charcoal-muted group-hover:text-forest transition-colors" />
                </button>
              </div>

              {/* 6. Other Information Section */}
              <div className="bg-white rounded-2xl border border-sand-border/80 shadow-xs divide-y divide-sand-border/50 overflow-hidden">
                <div className="px-4 py-3 bg-[#FAFBF9]">
                  <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider text-charcoal-muted">
                    Other Information
                  </h3>
                </div>

                {/* Suggest Products */}
                <button
                  type="button"
                  onClick={() => setAccountModalTab('suggest')}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-sand/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-charcoal group-hover:text-forest transition-colors">
                        Suggest Products
                      </p>
                      <p className="text-[11px] text-charcoal-muted">
                        Request classical herbs or formulations you want us to craft
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-charcoal-muted group-hover:text-forest transition-colors" />
                </button>

                {/* About Fibax Ayurveda */}
                <button
                  type="button"
                  onClick={() => {
                    closeAccountModal();
                    if (onNavigate) onNavigate('about');
                  }}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-sand/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-forest/10 text-forest flex items-center justify-center flex-shrink-0">
                      <Info className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-charcoal group-hover:text-forest transition-colors">
                        About Fibax Ayurveda
                      </p>
                      <p className="text-[11px] text-charcoal-muted">
                        GMP Certified Ayurvedic manufacturing, legacy & purity
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-charcoal-muted group-hover:text-forest transition-colors" />
                </button>

                {/* Privacy Policy */}
                <button
                  type="button"
                  onClick={() => {
                    closeAccountModal();
                    if (onNavigate) onNavigate('privacy');
                  }}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-sand/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sand text-charcoal flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-charcoal group-hover:text-forest transition-colors">
                        Privacy Policy
                      </p>
                      <p className="text-[11px] text-charcoal-muted">
                        Data protection, OTP security & customer rights
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-charcoal-muted group-hover:text-forest transition-colors" />
                </button>

                {/* Terms & Conditions */}
                <button
                  type="button"
                  onClick={() => {
                    closeAccountModal();
                    if (onNavigate) onNavigate('terms');
                  }}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-sand/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sand text-charcoal flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-charcoal group-hover:text-forest transition-colors">
                        Terms & Conditions
                      </p>
                      <p className="text-[11px] text-charcoal-muted">
                        Shipping, return protocol & service guarantees
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-charcoal-muted group-hover:text-forest transition-colors" />
                </button>

                {/* Doctor WhatsApp Support */}
                <a
                  href="https://wa.me/918872544458?text=Hello%20Fibax%20Ayurveda%20Doctor%2C%20I%20need%20expert%20consultation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-sand/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs sm:text-sm font-bold text-charcoal group-hover:text-forest transition-colors">
                          Ayurvedic Doctor on WhatsApp
                        </p>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <p className="text-[11px] text-charcoal-muted">
                        Free personalized dosage & regimen guidance (+91 88725 44458)
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-charcoal-muted group-hover:text-forest transition-colors" />
                </a>
              </div>

              {/* 7. Full-Width Logout Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </div>

              {/* 8. App Version Footer */}
              <div className="text-center py-2 text-[11px] text-charcoal-muted/70">
                <p>Fibax Ayurveda v1.2.0 • Build 2026</p>
                <p className="text-[10px] text-charcoal-muted/50 mt-0.5">
                  100% Classical & Certified Herbal Health Sciences
                </p>
              </div>
            </>
          )}

          {/* ------------------------------------------------------ */}
          {/* VIEW: YOUR ORDERS SUB-TAB                              */}
          {/* ------------------------------------------------------ */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-charcoal-muted">
                  Showing all recent orders for +91 {currentUser.phone ? currentUser.phone.replace(/^\+?91/, '') : ''}
                </p>
                <button
                  type="button"
                  onClick={() => fetchUserOrders()}
                  className="p-1.5 text-xs font-bold text-forest hover:bg-forest/5 rounded-lg flex items-center gap-1"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {loadingOrders ? (
                <div className="py-16 text-center">
                  <RefreshCw className="h-8 w-8 text-forest animate-spin mx-auto mb-3" />
                  <p className="text-xs font-bold text-charcoal">Loading your orders...</p>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="py-16 px-4 text-center bg-white rounded-2xl border border-sand-border/80 shadow-xs">
                  <ShoppingBag className="h-12 w-12 text-forest/30 mx-auto mb-3" />
                  <h3 className="font-heading font-bold text-base text-charcoal mb-1">
                    No orders placed yet
                  </h3>
                  <p className="text-xs text-charcoal-muted max-w-xs mx-auto mb-5">
                    Explore our authentic Ayurvedic juices, oils, churnas and syrups to begin your wellness journey.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      closeAccountModal();
                      if (onExploreProducts) onExploreProducts();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold transition-colors shadow-xs inline-flex items-center gap-1.5"
                  >
                    <span>Browse Formulations</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {userOrders.map((order) => {
                    const statusStr = String(order.status || '').toLowerCase();
                    const isCancellable = ['pending', 'processing', 'placed'].includes(statusStr) && !order.waybill;

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl p-4 sm:p-5 border border-sand-border/80 shadow-xs space-y-3"
                      >
                        {/* Order Header */}
                        <div className="flex items-center justify-between border-b border-sand-border/60 pb-3">
                          <div>
                            <span className="text-[10px] font-bold text-charcoal-muted uppercase tracking-wider block">
                              Order ID
                            </span>
                            <span className="font-mono text-xs font-bold text-forest">
                              #{order.id}
                            </span>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(order.status)}
                            <span className="text-[10px] text-charcoal-muted block mt-1">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="divide-y divide-sand-border/40">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="py-2 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2.5 min-w-0">
                                {item.featuredImage || item.image ? (
                                  <img
                                    src={item.featuredImage || item.image}
                                    alt={item.title}
                                    className="w-10 h-10 object-contain rounded-lg border border-sand-border flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-sand flex items-center justify-center flex-shrink-0 text-charcoal-muted">
                                    <Package className="h-5 w-5" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-bold text-charcoal truncate">{item.title}</p>
                                  <p className="text-[11px] text-charcoal-muted">
                                    {item.pack ? `${item.pack} • ` : ''}Qty: {item.quantity || 1}
                                  </p>
                                </div>
                              </div>
                              <span className="font-bold text-forest whitespace-nowrap ml-2">
                                {formatPrice((item.sellingPrice || item.price || 0) * (item.quantity || 1))}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Delhivery Tracking Details */}
                        {order.waybill && (
                          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/60 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <Truck className="h-4 w-4 text-blue-700 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-bold text-blue-950 truncate">
                                  Delhivery AWB: <span className="font-mono">{order.waybill}</span>
                                </p>
                                <p className="text-[10px] text-blue-700">
                                  Courier: {order.courierName || 'Delhivery Express'}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                closeAccountModal();
                                if (onOpenTrackOrder) onOpenTrackOrder(order.waybill);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-700 text-white text-[11px] font-bold hover:bg-blue-800 transition-colors whitespace-nowrap flex-shrink-0 ml-2"
                            >
                              Track Live
                            </button>
                          </div>
                        )}

                        {/* Footer Totals & Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-sand-border/60">
                          <div>
                            <span className="text-[10px] text-charcoal-muted block">Payment</span>
                            <span className="text-xs font-bold text-charcoal">
                              {order.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '🟢 Prepaid (Online)'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-charcoal-muted block">Total Amount</span>
                            <span className="font-heading font-extrabold text-sm text-forest-deep">
                              {formatPrice(order.totalAmount || order.total || 0)}
                            </span>
                          </div>
                        </div>

                        {/* Order Cancellation Button if applicable */}
                        {isCancellable && (
                          <div className="pt-1 text-right">
                            <button
                              type="button"
                              onClick={() => setCancelModalOrder(order)}
                              className="text-xs text-rose-600 hover:text-rose-800 font-bold underline"
                            >
                              Cancel this Order
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------ */}
          {/* VIEW: HELP & SUPPORT SUB-TAB                           */}
          {/* ------------------------------------------------------ */}
          {activeTab === 'support' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sand-border/80 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-forest/10 text-forest flex items-center justify-center flex-shrink-0">
                    <PhoneCall className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-charcoal">
                      Fibax Customer Care Helpline
                    </h3>
                    <p className="text-xs text-charcoal-muted">
                      Monday to Saturday, 9:00 AM – 7:00 PM IST
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <a
                    href="tel:+918872544458"
                    className="p-3 rounded-xl bg-forest text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-forest-deep transition-colors shadow-xs"
                  >
                    <PhoneCall className="h-4 w-4" />
                    <span>Call +91 88725 44458</span>
                  </a>
                  <a
                    href="https://wa.me/918872544458?text=Hello%20Fibax%20Support%2C%20I%20have%20an%20order%20query"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp Support</span>
                  </a>
                </div>
              </div>

              {/* FAQs */}
              <div className="bg-white rounded-2xl border border-sand-border/80 shadow-xs divide-y divide-sand-border/50 overflow-hidden">
                <div className="px-4 py-3 bg-[#FAFBF9]">
                  <h4 className="font-heading font-extrabold text-xs uppercase tracking-wider text-charcoal-muted">
                    Frequently Asked Questions
                  </h4>
                </div>
                <div className="p-4 space-y-1">
                  <p className="text-xs font-bold text-charcoal">When will my order be dispatched?</p>
                  <p className="text-xs text-charcoal-muted">
                    Orders are processed within 24 hours and shipped via Delhivery Express courier. Typical delivery takes 2 to 4 business days.
                  </p>
                </div>
                <div className="p-4 space-y-1">
                  <p className="text-xs font-bold text-charcoal">Can I pay Cash on Delivery (COD)?</p>
                  <p className="text-xs text-charcoal-muted">
                    Yes! COD is available across 19,000+ Indian PIN codes. You can pay cash or scan the courier QR upon delivery.
                  </p>
                </div>
                <div className="p-4 space-y-1">
                  <p className="text-xs font-bold text-charcoal">How do I cancel my order?</p>
                  <p className="text-xs text-charcoal-muted">
                    Orders in "Processing" status can be cancelled with one tap under "Your Orders". Once dispatched, please contact our support team.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------ */}
          {/* VIEW: YOUR WISHLIST SUB-TAB                            */}
          {/* ------------------------------------------------------ */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              {wishlistItems.length === 0 ? (
                <div className="py-16 px-4 text-center bg-white rounded-2xl border border-sand-border/80 shadow-xs">
                  <Heart className="h-12 w-12 text-rose-300 mx-auto mb-3" />
                  <h3 className="font-heading font-bold text-base text-charcoal mb-1">
                    Your wishlist is empty
                  </h3>
                  <p className="text-xs text-charcoal-muted max-w-xs mx-auto mb-5">
                    Save products you want to buy later by tapping the heart icon on any product page.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      closeAccountModal();
                      if (onExploreProducts) onExploreProducts();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold transition-colors shadow-xs inline-flex items-center gap-1.5"
                  >
                    <span>Discover Classical Formulations</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {wishlistItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="bg-white rounded-2xl p-3.5 sm:p-4 border border-sand-border/80 shadow-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image || item.featuredImage ? (
                          <img
                            src={item.image || item.featuredImage}
                            alt={item.title}
                            className="w-14 h-14 object-contain rounded-xl border border-sand-border flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-sand flex items-center justify-center flex-shrink-0 text-charcoal-muted">
                            <Heart className="h-6 w-6 text-rose-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-charcoal truncate">
                            {item.title}
                          </h4>
                          <p className="text-xs font-bold text-forest mt-0.5">
                            {formatPrice(item.price || item.sellingPrice || 0)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = wishlistItems.filter((_, i) => i !== idx);
                          setWishlistItems(updated);
                          localStorage.setItem('fibax_wishlist', JSON.stringify(updated));
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors flex-shrink-0"
                        title="Remove from wishlist"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------ */}
          {/* VIEW: YOUR REFUNDS SUB-TAB                             */}
          {/* ------------------------------------------------------ */}
          {activeTab === 'refunds' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sand-border/80 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-charcoal">
                      Fibax Refund Guarantee
                    </h3>
                    <p className="text-xs text-charcoal-muted">
                      Prepaid refunds are initiated within 24 hours of cancellation and credit to source in 3–5 banking days.
                    </p>
                  </div>
                </div>
              </div>

              {cancelledOrders.length === 0 ? (
                <div className="py-12 px-4 text-center bg-white rounded-2xl border border-sand-border/80 shadow-xs">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                  <p className="font-heading font-bold text-sm text-charcoal">
                    No pending refunds
                  </p>
                  <p className="text-xs text-charcoal-muted max-w-xs mx-auto mt-1">
                    All your orders are active or delivered in good standing.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cancelledOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-4 border border-sand-border/80 shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-forest">#{order.id}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {order.paymentMethod === 'COD' ? 'No Refund Needed (COD)' : 'Refund Initiated'}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal">
                        Amount: <strong>{formatPrice(order.totalAmount || order.total || 0)}</strong>
                      </p>
                      <p className="text-[11px] text-charcoal-muted">
                        Cancellation note: {order.cancelReason || 'Customer requested'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------ */}
          {/* VIEW: PAYMENT METHODS SUB-TAB                          */}
          {/* ------------------------------------------------------ */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sand-border/80 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-charcoal">
                      100% Encrypted Payment Gateway
                    </h3>
                    <p className="text-xs text-charcoal-muted">
                      Transactions processed via PCI-DSS compliant Razorpay
                    </p>
                  </div>
                </div>
                <div className="space-y-2 pt-2 text-xs">
                  <div className="p-3 bg-[#FAFBF9] rounded-xl border border-sand-border/60 flex items-center justify-between">
                    <span className="font-bold text-charcoal">🟢 UPI (Google Pay, PhonePe, Paytm, BHIM)</span>
                    <span className="text-emerald-700 font-extrabold text-[10px] uppercase">Fastest</span>
                  </div>
                  <div className="p-3 bg-[#FAFBF9] rounded-xl border border-sand-border/60 flex items-center justify-between">
                    <span className="font-bold text-charcoal">💳 Credit & Debit Cards (Visa, Mastercard, RuPay)</span>
                    <span className="text-charcoal-muted text-[10px]">Instant</span>
                  </div>
                  <div className="p-3 bg-[#FAFBF9] rounded-xl border border-sand-border/60 flex items-center justify-between">
                    <span className="font-bold text-charcoal">🏦 Net Banking (50+ Indian Banks)</span>
                    <span className="text-charcoal-muted text-[10px]">Secure</span>
                  </div>
                  <div className="p-3 bg-[#FAFBF9] rounded-xl border border-sand-border/60 flex items-center justify-between">
                    <span className="font-bold text-charcoal">💵 Cash on Delivery (Doorstep Cash / QR)</span>
                    <span className="text-charcoal-muted text-[10px]">Pan-India</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------ */}
          {/* VIEW: FIBAX REWARDS & COUPONS SUB-TAB                  */}
          {/* ------------------------------------------------------ */}
          {activeTab === 'rewards' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-forest via-forest-deep to-emerald-900 rounded-2xl p-4 sm:p-5 text-white shadow-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                  <h3 className="font-heading font-extrabold text-base text-white">
                    Active Fibax Store Coupons
                  </h3>
                </div>
                <p className="text-xs text-emerald-100 mt-1">
                  Copy any code and apply during checkout for instant savings.
                </p>
              </div>

              {availableCoupons.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-sand-border/80 shadow-xs space-y-2">
                  <Tag className="h-10 w-10 text-forest/30 mx-auto" />
                  <p className="font-heading font-bold text-sm text-charcoal">
                    No active promotional codes right now
                  </p>
                  <p className="text-xs text-charcoal-muted">
                    New festive and wellness coupons will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableCoupons.map((c) => (
                    <div
                      key={c.id || c.code}
                      className="bg-white rounded-2xl p-4 border border-sand-border/80 shadow-xs flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-sm text-forest bg-forest/10 px-2.5 py-1 rounded-lg">
                            {c.code}
                          </span>
                          <span className="text-xs font-bold text-brand">
                            {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                          </span>
                        </div>
                        {c.description && (
                          <p className="text-xs text-charcoal-muted mt-1 truncate">
                            {c.description}
                          </p>
                        )}
                        {c.minOrder > 0 && (
                          <p className="text-[10px] text-charcoal-muted mt-0.5">
                            Minimum Order: ₹{c.minOrder}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(c.code)}
                        className="px-3.5 py-2 rounded-xl bg-forest/10 hover:bg-forest/20 text-forest text-xs font-bold transition-colors flex items-center gap-1.5 flex-shrink-0"
                      >
                        {copiedCoupon === c.code ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------ */}
          {/* VIEW: SAVED ADDRESSES SUB-TAB                          */}
          {/* ------------------------------------------------------ */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sand-border/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-sand-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-forest" />
                    <h3 className="font-heading font-bold text-sm text-charcoal">
                      Primary Delivery Address
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAccountModalTab('profile')}
                    className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                </div>

                {currentUser.addresses?.[0]?.address ? (
                  <div className="space-y-1 text-xs text-charcoal">
                    <p className="font-bold text-forest-deep">{currentUser.name}</p>
                    <p>{currentUser.addresses[0].address}</p>
                    <p>
                      {currentUser.addresses[0].city}
                      {currentUser.addresses[0].pincode ? ` - ${currentUser.addresses[0].pincode}` : ''}
                    </p>
                    <p className="text-charcoal-muted pt-1">
                      Phone: +91 {currentUser.phone ? currentUser.phone.replace(/^\+?91/, '') : ''}
                    </p>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-charcoal-muted space-y-3">
                    <p>No default address saved yet.</p>
                    <button
                      type="button"
                      onClick={() => setAccountModalTab('profile')}
                      className="px-4 py-2 rounded-xl bg-forest text-white font-bold text-xs shadow-xs"
                    >
                      Add Delivery Address
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------ */}
          {/* VIEW: EDIT PROFILE SUB-TAB                             */}
          {/* ------------------------------------------------------ */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sand-border/80 shadow-xs space-y-3.5">
                <h3 className="font-heading font-bold text-sm text-charcoal border-b border-sand-border/60 pb-2">
                  Personal Details
                </h3>

                {profileMessage && (
                  <div className={`p-3 rounded-xl text-xs font-bold ${
                    profileMessage.includes('success') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {profileMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    Mobile Number (OTP Verified)
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                    required
                  />
                </div>

                <h3 className="font-heading font-bold text-sm text-charcoal border-b border-sand-border/60 pb-2 pt-2">
                  Doorstep Delivery Address
                </h3>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    Street Address / House No.
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="House/Flat No, Street, Locality"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      placeholder="e.g. Ludhiana"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">
                      PIN Code
                    </label>
                    <input
                      type="tel"
                      maxLength={6}
                      value={editPincode}
                      onChange={(e) => setEditPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-digit PIN"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ------------------------------------------------------ */}
          {/* VIEW: SUGGEST PRODUCTS SUB-TAB                         */}
          {/* ------------------------------------------------------ */}
          {activeTab === 'suggest' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sand-border/80 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-charcoal">
                      Suggest a Classical Formulation
                    </h3>
                    <p className="text-xs text-charcoal-muted">
                      Tell us which herbs, rasayanas or wellness blends you want our vaidyas to craft.
                    </p>
                  </div>
                </div>

                {suggestSent ? (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-1">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
                    <p className="font-bold text-xs text-emerald-900">Thank you for your suggestion!</p>
                    <p className="text-[11px] text-emerald-700">
                      Our formulation team reviews all customer ideas during product roadmap planning.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1">
                        Health Concern / Category
                      </label>
                      <select
                        value={suggestCategory}
                        onChange={(e) => setSuggestCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                      >
                        <option>Immunity & Vitality</option>
                        <option>Pain & Joint Care</option>
                        <option>Digestive Wellness</option>
                        <option>Skin & Hair Care</option>
                        <option>Heart & BP Health</option>
                        <option>Kidney & Urinary Care</option>
                        <option>Classical Single Herbs</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1">
                        Formulation Idea or Specific Ingredients
                      </label>
                      <textarea
                        rows={4}
                        value={suggestIdea}
                        onChange={(e) => setSuggestIdea(e.target.value)}
                        placeholder="e.g. A classical Ashwagandha Gold tablet or pure Moringa leaf extract powder..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border text-xs focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={!suggestIdea.trim()}
                      onClick={() => setSuggestSent(true)}
                      className="w-full py-3 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold disabled:opacity-50 transition-colors shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Recommendation</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* ======================================================== */}
        {/* LOGOUT CONFIRMATION MODAL (OVERLAY)                      */}
        {/* ======================================================== */}
        {showLogoutConfirm && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl text-center space-y-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <LogOut className="h-6 w-6" />
              </div>
              <h4 className="font-heading font-bold text-base text-charcoal">
                Log Out of Fibax?
              </h4>
              <p className="text-xs text-charcoal-muted">
                Are you sure you want to log out? You will need to verify your mobile OTP to log in again.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="py-2.5 px-3 rounded-xl border border-sand-border text-xs font-bold text-charcoal hover:bg-sand/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    logout();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CANCELLATION CONFIRMATION MODAL (OVERLAY)                */}
        {/* ======================================================== */}
        {cancelModalOrder && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-sand-border pb-2.5">
                <h4 className="font-heading font-bold text-sm text-charcoal flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                  <span>Cancel Order #{cancelModalOrder.id}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setCancelModalOrder(null);
                    setCancelError('');
                  }}
                  className="p-1 rounded-full text-charcoal-muted hover:bg-sand/50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {cancelSuccess ? (
                <div className="p-4 bg-emerald-50 rounded-xl text-center space-y-1">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-emerald-900">{cancelSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleCancelOrderSubmit} className="space-y-3">
                  <p className="text-xs text-charcoal-muted">
                    Please tell us why you wish to cancel this order:
                  </p>

                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest/30"
                  >
                    <option>Changed my mind</option>
                    <option>Ordered by mistake</option>
                    <option>Found alternative ayurvedic formulation</option>
                    <option>Need to change delivery address</option>
                    <option>Delay in expected dispatch</option>
                    <option>Other</option>
                  </select>

                  {cancelReason === 'Other' && (
                    <textarea
                      rows={2}
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Please enter your reason"
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:outline-none focus:ring-2 focus:ring-forest/30"
                      required
                    />
                  )}

                  {cancelError && (
                    <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100">
                      {cancelError}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setCancelModalOrder(null)}
                      className="py-2 px-3 rounded-xl border border-sand-border text-xs font-bold text-charcoal hover:bg-sand/40"
                    >
                      Keep Order
                    </button>
                    <button
                      type="submit"
                      disabled={isCancelling}
                      className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50 transition-colors shadow-xs"
                    >
                      {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
