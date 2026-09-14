import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, ArrowLeft, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

export function AdminLogin({ onLoginSuccess, onExit }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both User ID and Password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      // Store session token
      if (rememberMe) {
        localStorage.setItem('fibax_admin_token', data.token);
        localStorage.setItem('fibax_admin_user', data.username);
      } else {
        sessionStorage.setItem('fibax_admin_token', data.token);
        sessionStorage.setItem('fibax_admin_user', data.username);
      }

      onLoginSuccess({ username: data.username, token: data.token });
    } catch (err) {
      setError(err.message || 'Invalid User ID or Password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c2415] via-[#124225] to-[#0a1b10] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden font-sans">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/15 transition-all shadow-md"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Storefront</span>
        </button>
      </div>

      {/* Card Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-sand-border p-8 sm:p-10 relative z-10">
        {/* Brand & Security Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-forest/10 border border-forest/20 shadow-inner mb-1">
            <ShieldCheck className="h-10 w-10 text-forest" />
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-brand uppercase tracking-wider mb-1">
              <KeyRound className="h-3.5 w-3.5 text-brand" />
              <span>Restricted Access</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-forest-deep tracking-tight">
              Fibax Admin Portal
            </h1>
            <p className="text-xs text-charcoal-muted mt-1">
              Authenticate with your administrative credentials
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-shake">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-forest-deep uppercase tracking-wider mb-1.5">
              Admin User ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-muted">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin user ID"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sand/40 border border-sand-border text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-deep uppercase tracking-wider mb-1.5">
              Secret Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-muted">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-sand/40 border border-sand-border text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-charcoal-muted hover:text-charcoal transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-forest focus:ring-forest h-4 w-4"
              />
              <span className="text-xs text-charcoal-muted font-medium">Keep me signed in</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-forest via-forest-deep to-forest hover:from-forest-deep hover:to-forest text-white font-bold text-sm tracking-wider uppercase shadow-lg shadow-forest/20 hover:shadow-forest/30 transition-all transform hover:-translate-y-0.5 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Default Access Credential Helper for Owner */}
        <div className="mt-6 pt-5 border-t border-sand-border/70 text-center">
          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-left space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-forest uppercase tracking-wider">
              <Sparkles className="h-3 w-3 text-forest" />
              <span>Initial Master Credentials:</span>
            </div>
            <div className="text-xs text-charcoal flex items-center justify-between">
              <span>User ID: <strong className="font-mono text-forest-deep">admin</strong></span>
              <span>Password: <strong className="font-mono text-forest-deep">admin@fibax2026</strong></span>
            </div>
            <div className="text-[10px] text-charcoal-muted">
              You can change both User ID & Password anytime inside Settings.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-emerald-200/60">
        © 2026 Fibax Pharma Pvt. Ltd. • Secure SSL Encrypted Session
      </div>
    </div>
  );
}
