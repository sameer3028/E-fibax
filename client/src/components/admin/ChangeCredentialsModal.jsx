import React, { useState } from 'react';
import { X, Lock, User, KeyRound, Check, AlertCircle } from 'lucide-react';

export function ChangeCredentialsModal({ isOpen, onClose, currentUsername, onCredentialsUpdated }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newUsername, setNewUsername] = useState(currentUsername || 'admin');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword) {
      setError('Please enter your current password to verify identity.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword,
          newUsername: newUsername.trim(),
          newPassword: newPassword || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update credentials.');
      }

      setSuccess('Credentials successfully updated!');
      if (data.username) {
        if (localStorage.getItem('fibax_admin_user')) {
          localStorage.setItem('fibax_admin_user', data.username);
        } else {
          sessionStorage.setItem('fibax_admin_user', data.username);
        }
        if (onCredentialsUpdated) onCredentialsUpdated(data.username);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error updating credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-sand-border overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-sand-border flex items-center justify-between bg-sand/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-forest/10 text-forest">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-forest-deep text-sm">
                Change Admin Credentials
              </h3>
              <p className="text-[11px] text-charcoal-muted">
                Update your login User ID or Password
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-sand-border/50 text-charcoal-muted hover:text-charcoal transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{success}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1">
              Current Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password to authorize"
              className="w-full px-3.5 py-2 rounded-xl bg-sand/40 border border-sand-border text-sm focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div className="pt-2 border-t border-sand-border/60">
            <label className="block text-xs font-bold text-forest-deep mb-1">
              New User ID
            </label>
            <input
              type="text"
              required
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="e.g. admin or myname"
              className="w-full px-3.5 py-2 rounded-xl bg-sand/40 border border-sand-border text-sm focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1">
              New Password (Leave blank to keep current)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2 rounded-xl bg-sand/40 border border-sand-border text-sm focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          {newPassword && (
            <div>
              <label className="block text-xs font-bold text-forest-deep mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2 rounded-xl bg-sand/40 border border-sand-border text-sm focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-sand-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-sand hover:bg-sand-border text-charcoal text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Update Credentials'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
