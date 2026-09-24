import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../utils/api';
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Filter,
  Search,
  Camera,
  CheckSquare,
  MessageSquare,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export function ReviewManager() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    removed: 0,
    withPhotos: 0
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [verifiedFilter, setVerifiedFilter] = useState('ALL');
  const [mediaFilter, setMediaFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Selections
  const [selectedReview, setSelectedReview] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const handleRemoveSingleMedia = async (reviewId, mediaUrl) => {
    if (!window.confirm('Remove this photo from the review?')) return;

    setActionLoading(true);
    try {
      const res = await apiRequest(`/api/admin/reviews/${reviewId}/media`, {
        method: 'DELETE',
        body: JSON.stringify({ mediaUrl })
      });
      if (res.success && res.data) {
        setSelectedReview(res.data);
        fetchAdminReviews();
      } else {
        alert(res.error || 'Unable to remove photo. Please try again.');
      }
    } catch (err) {
      alert(err.message || 'Unable to remove photo. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchAdminReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (ratingFilter !== 'ALL') params.append('rating', ratingFilter);
      if (verifiedFilter !== 'ALL') params.append('verified', verifiedFilter);
      if (mediaFilter !== 'ALL') params.append('media', mediaFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await apiRequest(`/api/admin/reviews?${params.toString()}`);
      if (res.success) {
        const payload = res.data || res;
        const reviewList = payload.reviews || res.reviews || [];
        const rawStats = payload.stats || res.stats || {};

        setReviews(reviewList);
        setStats({
          total: rawStats.totalReviews ?? rawStats.total ?? 0,
          pending: rawStats.pendingReviews ?? rawStats.pending ?? 0,
          approved: rawStats.approvedReviews ?? rawStats.approved ?? 0,
          rejected: rawStats.rejectedReviews ?? rawStats.rejected ?? 0,
          removed: rawStats.removedReviews ?? rawStats.removed ?? 0,
          withPhotos: rawStats.reviewsWithPhotos ?? rawStats.withPhotos ?? 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch admin reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, ratingFilter, verifiedFilter, mediaFilter, searchQuery]);

  useEffect(() => {
    fetchAdminReviews();
  }, [fetchAdminReviews]);

  const handleUpdateStatus = async (id, newStatus, rejectionReason = '') => {
    setActionLoading(true);
    try {
      const res = await apiRequest(`/api/admin/reviews/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, rejectionReason })
      });
      if (res.success) {
        fetchAdminReviews();
        if (selectedReview?.id === id) {
          const updated = res.data || res.review;
          if (updated) setSelectedReview(updated);
        }
      }
    } catch (err) {
      alert(err.message || 'Status update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Remove this review? The review will no longer appear publicly.')) return;
    setActionLoading(true);
    try {
      const res = await apiRequest(`/api/admin/reviews/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        fetchAdminReviews();
        setIsDetailModalOpen(false);
      } else {
        alert(res.error || 'Unable to remove review. Please try again.');
      }
    } catch (err) {
      alert(err.message || 'Unable to remove review. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (status) => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Apply status "${status}" to ${selectedIds.length} selected review(s)?`)) return;
    setActionLoading(true);
    try {
      const res = await apiRequest('/api/admin/reviews/bulk-status', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds, status })
      });
      if (res.success) {
        setSelectedIds([]);
        fetchAdminReviews();
      }
    } catch (err) {
      alert(err.message || 'Bulk action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(reviews.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`w-3.5 h-3.5 ${
          s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">Approved</span>;
      case 'PENDING':
        return <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-300">Pending</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-800 rounded-full border border-rose-300">Rejected</span>;
      case 'REMOVED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-gray-200 text-gray-700 rounded-full border border-gray-300">Removed</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold bg-gray-100 text-gray-700 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-sand-border shadow-xs">
          <p className="text-xs font-bold text-gray-500 uppercase">Total Reviews</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 shadow-xs">
          <p className="text-xs font-bold text-amber-800 uppercase">Pending Approval</p>
          <p className="text-2xl font-extrabold text-amber-900 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <p className="text-xs font-bold text-emerald-800 uppercase">Approved</p>
          <p className="text-2xl font-extrabold text-emerald-900 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 shadow-xs">
          <p className="text-xs font-bold text-rose-800 uppercase">Rejected</p>
          <p className="text-2xl font-extrabold text-rose-900 mt-1">{stats.rejected}</p>
        </div>
        <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 shadow-xs">
          <p className="text-xs font-bold text-purple-800 uppercase">With Photos</p>
          <p className="text-2xl font-extrabold text-purple-900 mt-1">{stats.withPhotos}</p>
        </div>
      </div>

      {/* 2. Admin Filters & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-sand-border shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-forest" />
            <h3 className="font-bold text-gray-900 text-lg">Filter &amp; Search Reviews</h3>
          </div>

          <button
            onClick={fetchAdminReviews}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-sand hover:bg-sand-border rounded-xl transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search customer, product, text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-gray-50 border border-gray-300 rounded-xl font-medium"
            >
              <option value="ALL">Status: All</option>
              <option value="PENDING">Status: Pending</option>
              <option value="APPROVED">Status: Approved</option>
              <option value="REJECTED">Status: Rejected</option>
              <option value="REMOVED">Status: Removed</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-gray-50 border border-gray-300 rounded-xl font-medium"
            >
              <option value="ALL">Rating: All</option>
              <option value="5">5 Star</option>
              <option value="4">4 Star</option>
              <option value="3">3 Star</option>
              <option value="2">2 Star</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Verification / Media Filter */}
          <div>
            <select
              value={mediaFilter}
              onChange={(e) => setMediaFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-gray-50 border border-gray-300 rounded-xl font-medium"
            >
              <option value="ALL">Media: All</option>
              <option value="PHOTOS">With Photos</option>
              <option value="NO_PHOTOS">Without Photos</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions Bar if items selected */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold">
            <span className="text-emerald-900">
              {selectedIds.length} review(s) selected:
            </span>
            <button
              onClick={() => handleBulkAction('APPROVED')}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors"
            >
              Approve Selected
            </button>
            <button
              onClick={() => handleBulkAction('REJECTED')}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
            >
              Reject Selected
            </button>
            <button
              onClick={() => handleBulkAction('REMOVED')}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors"
            >
              Remove Selected
            </button>
          </div>
        )}
      </div>

      {/* 3. Review Management Table */}
      <div className="bg-white rounded-2xl border border-sand-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading customer reviews for administration...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            No reviews match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-sand-border text-gray-600 font-bold uppercase tracking-wider">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === reviews.length && reviews.length > 0}
                      onChange={handleSelectAll}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Review Text</th>
                  <th className="p-4">Media</th>
                  <th className="p-4">Verified</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((rev) => {
                  const hasPhoto = Array.isArray(rev.images) && rev.images.length > 0;
                  const photoCount = Array.isArray(rev.images) ? rev.images.length : 0;

                  return (
                    <tr key={rev.id} className="hover:bg-sand/30 transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(rev.id)}
                          onChange={() => toggleSelectOne(rev.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Customer */}
                      <td className="p-4 font-semibold text-gray-900 whitespace-nowrap">
                        {rev.customerName || 'Customer'}
                      </td>

                      {/* Product */}
                      <td className="p-4 font-medium text-gray-700 max-w-[150px] truncate">
                        {rev.productName || rev.productId}
                      </td>

                      {/* Rating */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-0.5">
                          {renderStars(rev.rating)}
                        </div>
                      </td>

                      {/* Review Text */}
                      <td className="p-4 max-w-[220px]">
                        <div className="font-bold text-gray-900 truncate">{rev.title}</div>
                        <div className="text-gray-500 truncate">{rev.content}</div>
                      </td>

                      {/* Media */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-gray-600 font-semibold">
                          {hasPhoto ? (
                            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                              <Camera className="w-3 h-3" />
                              {photoCount}
                            </span>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </div>
                      </td>

                      {/* Verified */}
                      <td className="p-4 whitespace-nowrap">
                        {rev.verifiedPurchase ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-gray-400 font-medium">Unverified</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        {getStatusBadge(rev.status)}
                      </td>

                      {/* Date */}
                      <td className="p-4 whitespace-nowrap text-gray-500">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN')}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => {
                            setSelectedReview(rev);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                          title="Inspect Detailed Review"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {rev.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateStatus(rev.id, 'APPROVED')}
                            disabled={actionLoading}
                            className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition-colors"
                            title="Approve Review"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {rev.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleUpdateStatus(rev.id, 'REJECTED')}
                            disabled={actionLoading}
                            className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg transition-colors"
                            title="Reject Review"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          disabled={actionLoading}
                          className="p-1.5 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-700 rounded-lg transition-colors"
                          title="Remove Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Review Detail Modal */}
      {isDetailModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 border border-sand-border shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">Review Details</h3>
                <p className="text-xs text-gray-500">ID: {selectedReview.id}</p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <span className="font-bold text-gray-500 block uppercase text-[10px]">Customer</span>
                  <span className="font-extrabold text-gray-900 text-sm">{selectedReview.customerName}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500 block uppercase text-[10px]">Product</span>
                  <span className="font-bold text-emerald-800 text-sm">{selectedReview.productName || selectedReview.productId}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500 block uppercase text-[10px]">Purchase Status</span>
                  <span className="font-semibold text-gray-800">
                    {selectedReview.verifiedPurchase ? '✓ Verified Purchase' : 'Non-verified'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-500 block uppercase text-[10px]">Current Status</span>
                  {getStatusBadge(selectedReview.status)}
                </div>
              </div>

              <div>
                <span className="font-bold text-gray-500 block uppercase text-[10px] mb-1">Rating</span>
                <div className="flex items-center gap-1">
                  {renderStars(selectedReview.rating)}
                  <span className="font-bold text-sm ml-2">{selectedReview.rating} / 5</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-gray-500 block uppercase text-[10px] mb-1">Title</span>
                <p className="font-bold text-gray-900 text-base">{selectedReview.title}</p>
              </div>

              <div>
                <span className="font-bold text-gray-500 block uppercase text-[10px] mb-1">Review Content</span>
                <p className="bg-sand-warm/30 p-4 rounded-xl text-gray-800 leading-relaxed whitespace-pre-line text-sm border border-sand-border">
                  {selectedReview.content}
                </p>
              </div>

              {/* Uploaded Customer Photos Moderation Gallery */}
              {(() => {
                const photosList = Array.isArray(selectedReview.images) ? selectedReview.images : [];

                if (photosList.length === 0) return null;

                return (
                  <div className="space-y-3 pt-3 border-t border-sand-border">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 block uppercase text-xs">
                        Customer Uploaded Photos ({photosList.length})
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium">
                        Inspect &amp; remove individual photos before approving
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {photosList.map((url, idx) => (
                        <div
                          key={idx}
                          className="bg-sand/30 border border-sand-border rounded-2xl p-3 flex flex-col space-y-2 relative shadow-xs"
                        >
                          <div className="w-full h-44 rounded-xl overflow-hidden bg-black relative border border-gray-200 flex items-center justify-center">
                            <img
                              src={url}
                              alt={`Customer photo ${idx + 1}`}
                              className="w-full h-full object-contain rounded-lg cursor-pointer hover:scale-102 transition-transform"
                              onClick={() => setPreviewPhotoUrl(url)}
                            />
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1">
                              <Camera className="w-3.5 h-3.5 text-purple-600" />
                              Photo {idx + 1}
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setPreviewPhotoUrl(url)}
                                className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                View Full Size
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveSingleMedia(selectedReview.id, url)}
                                disabled={actionLoading}
                                className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                              >
                                <Trash2 className="w-3 h-3" />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Quick Action Footer */}
            <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => handleDeleteReview(selectedReview.id)}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-100 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition-colors"
              >
                Delete / Remove Review
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedReview.id, 'REJECTED')}
                  disabled={actionLoading || selectedReview.status === 'REJECTED'}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 transition-colors"
                >
                  Reject Review
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedReview.id, 'APPROVED')}
                  disabled={actionLoading || selectedReview.status === 'APPROVED'}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 transition-colors"
                >
                  Approve Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Image Lightbox */}
      {previewPhotoUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center">
            <button
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute -top-12 right-0 px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors"
            >
              ✕ Close Full Size
            </button>
            <img
              src={previewPhotoUrl}
              alt="Customer photo full size"
              className="max-h-[85vh] max-w-full object-contain rounded-2xl border border-white/20 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
