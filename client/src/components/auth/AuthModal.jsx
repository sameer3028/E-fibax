import React, { useState, useEffect, useRef } from 'react';
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
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Clock,
  RotateCw
} from 'lucide-react';

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
    register,
    sendForgotPasswordOtp,
    verifyForgotPasswordOtp,
    resetForgotPassword
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

  // Forgot Password state
  // Steps: 'email' | 'otp' | 'new_password' | 'success'
  const [forgotStep, setForgotStep] = useState('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const otpInputRefs = useRef([]);

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 60-Second Cooldown Countdown Timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isAuthModalOpen) return null;

  // Handle Sign In Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const res = await login(loginId, loginPassword);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Login failed. Please check your credentials.');
    }
  };

  // Handle Registration Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (regData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    const digits = regData.phone.replace(/\D/g, '');
    let cleanPhone = digits;
    if (digits.length === 11 && digits.startsWith('0')) cleanPhone = digits.slice(1);
    else if (digits.length === 12 && digits.startsWith('91')) cleanPhone = digits.slice(2);
    else if (digits.length > 10) cleanPhone = digits.slice(-10);

    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
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
      if (res.error && res.error.includes('already registered')) {
        setLoginId(cleanPhone);
      }
    }
  };

  // Step 1: Request 6-digit Email OTP
  const handleSendForgotOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }

    setLoading(true);
    const res = await sendForgotPasswordOtp(cleanEmail);
    setLoading(false);

    if (res.success) {
      setForgotStep('otp');
      setCooldown(res.cooldownSeconds || 60);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMessage(res.message || `Verification code sent to ${cleanEmail}`);
    } else {
      setErrorMessage(res.error || 'Failed to send verification code. Please check your email.');
    }
  };

  // Step 2: Handle Individual OTP Digit Inputs
  const handleOtpDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = digit;
    setOtpDigits(nextDigits);
    setErrorMessage('');

    // Auto-focus next box if digit entered
    if (digit && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0 && otpInputRefs.current[index - 1]) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const nextDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        nextDigits[i] = pasted[i] || '';
      }
      setOtpDigits(nextDigits);
      const nextFocus = Math.min(pasted.length, 5);
      if (otpInputRefs.current[nextFocus]) {
        otpInputRefs.current[nextFocus].focus();
      }
    }
  };

  // Step 2: Submit OTP Verification
  const handleVerifyForgotOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const otpCode = otpDigits.join('').trim();
    if (otpCode.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    const res = await verifyForgotPasswordOtp(forgotEmail.trim().toLowerCase(), otpCode);
    setLoading(false);

    if (res.success && res.resetToken) {
      setResetToken(res.resetToken);
      setForgotStep('new_password');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('');
    } else {
      setErrorMessage(res.error || 'Invalid verification code. Please try again.');
    }
  };

  // Step 3: Submit New Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);
    const res = await resetForgotPassword(forgotEmail.trim().toLowerCase(), resetToken, newPassword);
    setLoading(false);

    if (res.success) {
      setForgotStep('success');
      setLoginId(forgotEmail.trim().toLowerCase());
      setLoginPassword('');
    } else {
      setErrorMessage(res.error || 'Failed to reset password. Please try again.');
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
          <div className="text-center mb-5">
            <img
              src="/fibax-logo.png"
              alt="Fibax Pharma"
              className="h-10 w-auto mx-auto object-contain mb-2"
            />
            <p className="text-xs text-charcoal-muted">
              {authModalTab === 'login'
                ? 'Welcome back! Sign in to access your orders & saved details.'
                : authModalTab === 'register'
                ? 'Create your customer account for fast checkout and order tracking.'
                : forgotStep === 'email'
                ? 'Enter your registered email address to receive a secure verification code.'
                : forgotStep === 'otp'
                ? `Enter the 6-digit code sent to ${forgotEmail}`
                : forgotStep === 'new_password'
                ? 'Create a secure new password for your Fibax account.'
                : 'Your password has been successfully reset!'}
            </p>
          </div>

          {/* Tab Switcher (Visible in Sign In and Create Account modes) */}
          {authModalTab !== 'forgot' ? (
            <div className="grid grid-cols-2 p-1 bg-sand border border-sand-border rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthModalTab('login');
                  setErrorMessage('');
                  setSuccessMessage('');
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
                  setSuccessMessage('');
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
          ) : (
            /* Forgot Password Top Navigation Breadcrumb */
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-sand-border/80">
              <button
                type="button"
                onClick={() => {
                  setAuthModalTab('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Sign In</span>
              </button>
              <span className="text-[11px] font-bold text-forest tracking-wide uppercase">
                {forgotStep === 'email' ? 'Step 1 of 3' : forgotStep === 'otp' ? 'Step 2 of 3' : forgotStep === 'new_password' ? 'Step 3 of 3' : 'Completed'}
              </span>
            </div>
          )}

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col gap-1.5 animate-shake">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
              {errorMessage.includes('already registered') && (
                <div className="flex items-center gap-3 pl-6 pt-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('login');
                      setErrorMessage('');
                    }}
                    className="font-bold text-forest hover:underline"
                  >
                    👉 Sign In Now
                  </button>
                  <span className="text-rose-300">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('forgot');
                      setForgotStep('email');
                      setErrorMessage('');
                    }}
                    className="font-bold text-forest hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>
          )}

          {successMessage && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* 1. SIGN IN FORM                                         */}
          {/* ======================================================== */}
          {authModalTab === 'login' && (
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
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setSuccessMessage('');
                      setAuthModalTab('forgot');
                      setForgotStep('email');
                      if (loginId && loginId.includes('@')) {
                        setForgotEmail(loginId.trim());
                      }
                    }}
                    className="text-[11px] text-brand hover:underline font-semibold transition-colors"
                  >
                    Forgot Password?
                  </button>
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
                  className="w-full py-3 px-4 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
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
                    onClick={() => {
                      setAuthModalTab('register');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-brand font-bold hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* 2. CREATE ACCOUNT FORM                                   */}
          {/* ======================================================== */}
          {authModalTab === 'register' && (
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
                      maxLength={15}
                      value={regData.phone}
                      onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                      placeholder="10-digit mobile (e.g. 9876543210 or +91)"
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
                  className="w-full py-3 px-4 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs sm:text-sm shadow-orange-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60"
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
                    onClick={() => {
                      setAuthModalTab('login');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-forest font-bold hover:underline"
                  >
                    Sign In here
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* 3. FORGOT PASSWORD FLOW (EMAIL OTP RESET)               */}
          {/* ======================================================== */}
          {authModalTab === 'forgot' && (
            <div className="space-y-4">
              
              {/* --- Step 1: Registered Email Input --- */}
              {forgotStep === 'email' && (
                <form onSubmit={handleSendForgotOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        autoFocus
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="e.g. yourname@mail.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                      />
                      <Mail className="h-4 w-4 text-charcoal-subtle absolute left-3.5 top-3" />
                    </div>
                    <p className="text-[11px] text-charcoal-muted mt-1.5 leading-relaxed">
                      We will send a 6-digit verification code to this email to verify account ownership.
                    </p>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={loading || !forgotEmail.trim()}
                      className="w-full py-3 px-4 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <Mail className="h-4 w-4" />
                      <span>{loading ? 'Sending Code...' : 'Send Verification Code'}</span>
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalTab('login');
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-xs text-charcoal-muted hover:text-forest transition-colors font-medium"
                    >
                      Remember your password? <span className="font-bold underline text-brand">Sign In</span>
                    </button>
                  </div>
                </form>
              )}

              {/* --- Step 2: 6-Digit OTP Verification --- */}
              {forgotStep === 'otp' && (
                <form onSubmit={handleVerifyForgotOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-charcoal">
                        6-Digit Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotStep('email');
                          setErrorMessage('');
                          setSuccessMessage('');
                        }}
                        className="text-[11px] text-brand hover:underline font-medium"
                      >
                        Change Email
                      </button>
                    </div>

                    {/* 6 Individual OTP Digit Boxes */}
                    <div className="grid grid-cols-6 gap-2 my-2" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpInputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          autoFocus={index === 0}
                          onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpDigitKeyDown(index, e)}
                          className={`w-full h-12 text-center text-lg font-bold font-mono bg-white border rounded-xl text-charcoal focus:outline-none transition-all ${
                            digit ? 'border-forest bg-forest/5' : 'border-sand-border focus:border-brand'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-charcoal-muted">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-charcoal-subtle" />
                        <span>Valid for 10 minutes</span>
                      </div>

                      {/* Resend Cooldown Counter */}
                      {cooldown > 0 ? (
                        <span className="font-semibold text-charcoal-muted">
                          Resend in <span className="font-mono text-brand font-bold">{cooldown}s</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={loading}
                          onClick={handleSendForgotOtp}
                          className="font-bold text-brand hover:underline flex items-center gap-1 transition-colors"
                        >
                          <RotateCw className="h-3 w-3" />
                          <span>Resend Code</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || otpDigits.join('').trim().length !== 6}
                      className="w-full py-3 px-4 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{loading ? 'Verifying Code...' : 'Verify Code & Proceed'}</span>
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalTab('login');
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-xs text-charcoal-muted hover:text-forest transition-colors font-medium"
                    >
                      Cancel and <span className="font-bold underline text-brand">Back to Sign In</span>
                    </button>
                  </div>
                </form>
              )}

              {/* --- Step 3: Set New Password --- */}
              {forgotStep === 'new_password' && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">
                      New Password (min 6 characters) <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        autoFocus
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-brand"
                      />
                      <Lock className="h-4 w-4 text-charcoal-subtle absolute left-3.5 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-charcoal-subtle hover:text-charcoal"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">
                      Confirm New Password <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-xs text-charcoal focus:outline-none ${
                          confirmPassword && newPassword !== confirmPassword
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-sand-border focus:border-brand'
                        }`}
                      />
                      <KeyRound className="h-4 w-4 text-charcoal-subtle absolute left-3.5 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-charcoal-subtle hover:text-charcoal"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Live Password Match Hint */}
                    {confirmPassword && (
                      <div className="mt-1 text-[11px]">
                        {newPassword === confirmPassword ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Passwords match perfectly
                          </span>
                        ) : (
                          <span className="text-rose-600 font-medium">
                            Passwords do not match
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                      className="w-full py-3 px-4 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <Lock className="h-4 w-4" />
                      <span>{loading ? 'Updating Password...' : 'Reset Password'}</span>
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalTab('login');
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-xs text-charcoal-muted hover:text-forest transition-colors font-medium"
                    >
                      Cancel and <span className="font-bold underline text-brand">Back to Sign In</span>
                    </button>
                  </div>
                </form>
              )}

              {/* --- Step 4: Reset Password Success Confirmation --- */}
              {forgotStep === 'success' && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner animate-scaleIn">
                    <CheckCircle2 className="h-9 w-9 text-emerald-600" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-forest">
                      Password Reset Successfully!
                    </h3>
                    <p className="text-xs text-charcoal-muted leading-relaxed max-w-xs mx-auto">
                      Your customer password has been updated securely. You can now sign in with your new credentials.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalTab('login');
                        setErrorMessage('');
                        setSuccessMessage('Password changed! Please sign in with your new password.');
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span>Sign In to Account</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
