import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
    register
  } = useAuth();

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    city: '',
    pincode: ''
  });
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const res = await login(loginId, loginPassword);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (regData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    const cleanPhone = regData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    const res = await register({
      ...regData,
      phone: cleanPhone
    });
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeAuthModal}
      />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl max-w-md w-full shadow-modal border border-sand-border p-6 sm:p-8 z-10 animate-scaleIn">
          
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-2 rounded-full text-charcoal-subtle hover:text-charcoal hover:bg-sand transition-colors"
            aria-label="Close Modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Logo & Header */}
          <div className="text-center mb-6">
            <img
              src="/fibax-logo.png"
              alt="Fibax Pharma"
              className="h-10 w-auto mx-auto object-contain mb-2"
            />
            <p className="text-xs text-charcoal-muted">
              {authModalTab === 'login'
                ? 'Welcome back! Sign in to access your orders & saved details.'
                : 'Create your customer account for fast checkout and order tracking.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-sand border border-sand-border rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthModalTab('login');
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                authModalTab === 'login'
                  ? 'bg-white text-forest shadow-xs'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModalTab('register');
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                authModalTab === 'register'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Sign In Form */}
          {authModalTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Email Address or Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="e.g. yourname@mail.com or 9876543210"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                  />
                  <Mail className="h-4 w-4 text-charcoal-subtle absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-charcoal">Password</label>
                  <a
                    href="https://wa.me/917657963458?text=Hello%20Fibax%20Pharma,%20I%20need%20help%20resetting%20my%20customer%20password"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-brand hover:underline font-semibold"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                  />
                  <Lock className="h-4 w-4 text-charcoal-subtle absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-charcoal-subtle hover:text-charcoal"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Signing in...' : 'Sign In to Account'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-charcoal-muted">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthModalTab('register')}
                    className="text-brand font-bold hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* 2. Create Account Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                  />
                  <User className="h-4 w-4 text-charcoal-subtle absolute left-3.5 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    Email Address <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      placeholder="ramesh@email.com"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                    />
                    <Mail className="h-3.5 w-3.5 text-charcoal-subtle absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    Mobile Number <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={regData.phone}
                      onChange={(e) => setRegData({ ...regData, phone: e.target.value.replace(/\D/g, '') })}
                      placeholder="10-digit number"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                    />
                    <Phone className="h-3.5 w-3.5 text-charcoal-subtle absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Create Password (min 6 characters) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                  />
                  <Lock className="h-4 w-4 text-charcoal-subtle absolute left-3.5 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-2.5 text-charcoal-subtle hover:text-charcoal"
                  >
                    {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Optional Address */}
              <div className="pt-1">
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Delivery Address <span className="text-charcoal-subtle font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={regData.address}
                  onChange={(e) => setRegData({ ...regData, address: e.target.value })}
                  placeholder="House/Flat No., Street, Colony"
                  className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand mb-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={regData.city}
                    onChange={(e) => setRegData({ ...regData, city: e.target.value })}
                    placeholder="City"
                    className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                  />
                  <input
                    type="text"
                    maxLength={6}
                    value={regData.pincode}
                    onChange={(e) => setRegData({ ...regData, pincode: e.target.value.replace(/\D/g, '') })}
                    placeholder="6-digit PIN code"
                    className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Perks badge */}
              <div className="p-3 bg-brand-soft border border-brand-border/60 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Member Privileges Included:</span>
                </div>
                <p className="text-[11px] text-charcoal-muted leading-relaxed">
                  • Instant Delhivery express tracking • Saved shipping addresses • Exclusive Ayurvedic health club discounts.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs sm:text-sm shadow-orange-glow transition-all flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>

              <div className="text-center pt-1">
                <p className="text-xs text-charcoal-muted">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthModalTab('login')}
                    className="text-forest font-bold hover:underline"
                  >
                    Sign In here
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
