import React, { useState, useEffect, useRef } from 'react';
import { formatPrice } from '../../lib/utils';
import { apiRequest } from '../../utils/api';
import {
  Users,
  UserCheck,
  Search,
  RefreshCw,
  ShoppingBag,
  Phone,
  Mail,
  Calendar,
  Clock,
  ShieldCheck,
  ArrowUpDown,
  ExternalLink,
  MapPin,
  PhoneCall,
  MessageCircle,
  Download,
  CheckCircle2,
  AlertCircle,
  Edit3,
  X,
  FileSpreadsheet,
  Activity,
  Filter
} from 'lucide-react';

export function UsersView() {
  // Subtab navigation: 'callbacks' (Doctor Callback Requests) or 'accounts' (Customer Accounts)
  const [subTab, setSubTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('subtab') === 'accounts' ? 'accounts' : 'callbacks';
    }
    return 'callbacks';
  });

  // -------------------------------------------------------------
  // 1. DOCTOR CALLBACK REQUESTS STATE & LOGIC
  // -------------------------------------------------------------
  const [callbacks, setCallbacks] = useState([]);
  const [callbackMetrics, setCallbackMetrics] = useState({
    total: 0,
    newCount: 0,
    contactedCount: 0,
    completedCount: 0,
    cancelledCount: 0
  });
  const [callbacksLoading, setCallbacksLoading] = useState(true);
  const [callbacksLastUpdated, setCallbacksLastUpdated] = useState(null);
  const [callbackSearch, setCallbackSearch] = useState('');
  const [callbackStatusFilter, setCallbackStatusFilter] = useState('all'); // all, New, Contacted, Completed, Cancelled
  const [callbackDateFilter, setCallbackDateFilter] = useState('all'); // all, today, yesterday, last7, last30
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // Notes Modal state
  const [activeNotesItem, setActiveNotesItem] = useState(null);
  const [notesInput, setNotesInput] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Fetch Callbacks from Admin Enquiries Endpoint
  const fetchCallbacks = async (silent = false) => {
    if (!silent) setCallbacksLoading(true);
    try {
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const res = await apiRequest('/api/admin/enquiries', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res && res.success && Array.isArray(res.data)) {
        // Filter doctor callbacks (or all submissions for holistic visibility)
        const allItems = res.data;
        setCallbacks(allItems);

        // Compute metrics
        const newCount = allItems.filter(c => c.status === 'New').length;
        const contactedCount = allItems.filter(c => c.status === 'Contacted').length;
        const completedCount = allItems.filter(c => c.status === 'Completed').length;
        const cancelledCount = allItems.filter(c => c.status === 'Cancelled').length;

        setCallbackMetrics({
          total: allItems.length,
          newCount,
          contactedCount,
          completedCount,
          cancelledCount
        });
        setCallbacksLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch callback requests:', err);
    } finally {
      if (!silent) setCallbacksLoading(false);
    }
  };

  // Live Auto-Polling Interval (every 6 seconds)
  useEffect(() => {
    fetchCallbacks(false);

    const interval = setInterval(() => {
      fetchCallbacks(true);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Update Status for an Enquiry
  const handleStatusChange = async (enquiryId, newStatus) => {
    setStatusUpdatingId(enquiryId);
    try {
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const res = await apiRequest(`/api/admin/enquiries/${enquiryId}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify({ status: newStatus })
      });

      if (res && res.success) {
        setCallbacks(prev =>
          prev.map(item => (item.id === enquiryId ? { ...item, status: newStatus, updatedAt: new Date().toISOString() } : item))
        );
        // Recalculate metrics
        setCallbackMetrics(prev => {
          const updated = callbacks.map(i => (i.id === enquiryId ? { ...i, status: newStatus } : i));
          return {
            total: updated.length,
            newCount: updated.filter(c => c.status === 'New').length,
            contactedCount: updated.filter(c => c.status === 'Contacted').length,
            completedCount: updated.filter(c => c.status === 'Completed').length,
            cancelledCount: updated.filter(c => c.status === 'Cancelled').length
          };
        });
      } else {
        alert(res?.error || 'Failed to update status.');
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Open Notes Modal
  const openNotesModal = (item) => {
    setActiveNotesItem(item);
    setNotesInput(item.followUpNotes || '');
  };

  // Save Follow-up Notes
  const handleSaveNotes = async () => {
    if (!activeNotesItem) return;
    setSavingNotes(true);
    try {
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const res = await apiRequest(`/api/admin/enquiries/${activeNotesItem.id}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify({ followUpNotes: notesInput })
      });

      if (res && res.success) {
        setCallbacks(prev =>
          prev.map(i => (i.id === activeNotesItem.id ? { ...i, followUpNotes: notesInput, updatedAt: new Date().toISOString() } : i))
        );
        setActiveNotesItem(null);
      } else {
        alert(res?.error || 'Failed to save notes.');
      }
    } catch (err) {
      alert('Error saving notes: ' + err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  // Date Filtering Helper
  const matchesDateFilter = (timestamp) => {
    if (callbackDateFilter === 'all') return true;
    if (!timestamp) return false;
    const itemDate = new Date(timestamp);
    const now = new Date();

    if (callbackDateFilter === 'today') {
      return itemDate.toDateString() === now.toDateString();
    }
    if (callbackDateFilter === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return itemDate.toDateString() === yesterday.toDateString();
    }
    if (callbackDateFilter === 'last7') {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return itemDate >= past7;
    }
    if (callbackDateFilter === 'last30') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return itemDate >= past30;
    }
    return true;
  };

  // Filtered Callbacks
  const filteredCallbacks = callbacks.filter(item => {
    const q = callbackSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.phone?.includes(q) ||
      item.city?.toLowerCase().includes(q) ||
      item.concern?.toLowerCase().includes(q) ||
      item.notes?.toLowerCase().includes(q) ||
      item.id?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (callbackStatusFilter !== 'all' && item.status !== callbackStatusFilter) {
      return false;
    }

    return matchesDateFilter(item.timestamp);
  });

  // Export to Excel CSV
  const handleExportCSV = () => {
    if (filteredCallbacks.length === 0) {
      alert('No callback records available to export.');
      return;
    }

    const headers = [
      'Enquiry ID',
      'Date & Time (IST)',
      'Customer Name',
      'Phone Number',
      'City / State',
      'Health Concern',
      'Preferred Callback Time',
      'Customer Notes / Symptoms',
      'Status',
      'Admin Follow-Up Notes',
      'Source'
    ];

    const escapeCSV = (str) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = filteredCallbacks.map(item => {
      const formattedDate = new Date(item.timestamp).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short'
      });
      return [
        escapeCSV(item.id),
        escapeCSV(formattedDate),
        escapeCSV(item.name),
        escapeCSV(item.phone ? `+91 ${item.phone}` : ''),
        escapeCSV(item.city),
        escapeCSV(item.concern || 'General Ayurvedic Consultation'),
        escapeCSV(item.preferredTime || 'Not specified'),
        escapeCSV(item.notes || ''),
        escapeCSV(item.status || 'New'),
        escapeCSV(item.followUpNotes || ''),
        escapeCSV(item.source || 'website')
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const todayStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `fibax_doctor_callback_requests_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Status Styling Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Contacted':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Cancelled':
        return 'bg-stone-100 text-stone-700 border-stone-300';
      default:
        return 'bg-sand text-charcoal border-sand-border';
    }
  };

  // Format IST time
  const formatIST = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return String(timestamp);
    }
  };

  // -------------------------------------------------------------
  // 2. CUSTOMER ACCOUNTS STATE & LOGIC
  // -------------------------------------------------------------
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeSessions, setActiveSessions] = useState(0);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const res = await apiRequest('/api/admin/users', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.success) {
        setUsers(res.data || []);
        setTotalUsers(res.totalUsers || 0);
        setActiveSessions(res.activeSessions || 0);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (subTab === 'accounts') {
      fetchUsers();
    }
  }, [subTab]);

  const filteredUsers = users.filter(u => {
    const q = userSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.id?.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (userStatusFilter === 'online') return u.isOnline;
    if (userStatusFilter === 'with-orders') return (u.ordersCount || 0) > 0;
    return true;
  });

  const totalOrdersPlaced = users.reduce((sum, u) => sum + (u.ordersCount || 0), 0);
  const totalCustomerSpend = users.reduce((sum, u) => sum + (u.totalSpend || 0), 0);

  // Sync subtab state into URL
  const handleTabSwitch = (tabName) => {
    setSubTab(tabName);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('subtab', tabName);
      window.history.replaceState({}, '', url.toString());
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* TOP SUB-NAVIGATION BAR                                    */}
      {/* ========================================================= */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-sand-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Doctor Callback Requests Subtab Button */}
          <button
            onClick={() => handleTabSwitch('callbacks')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              subTab === 'callbacks'
                ? 'bg-forest text-white shadow-xs'
                : 'text-charcoal hover:bg-sand text-charcoal-muted'
            }`}
          >
            <PhoneCall className={`h-4 w-4 ${subTab === 'callbacks' ? 'text-emerald-300' : 'text-forest'}`} />
            <span>Doctor Callback Requests</span>
            {callbackMetrics.newCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                {callbackMetrics.newCount} New
              </span>
            )}
          </button>

          {/* Customer Accounts Subtab Button */}
          <button
            onClick={() => handleTabSwitch('accounts')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              subTab === 'accounts'
                ? 'bg-forest text-white shadow-xs'
                : 'text-charcoal hover:bg-sand text-charcoal-muted'
            }`}
          >
            <Users className={`h-4 w-4 ${subTab === 'accounts' ? 'text-emerald-300' : 'text-emerald-600'}`} />
            <span>Customer Accounts & Logins</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-sand-border/40 text-charcoal">
              {totalUsers || users.length}
            </span>
          </button>
        </div>

        {/* Live Sync Status & Refresh Controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto text-xs">
          {subTab === 'callbacks' && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Auto-Sync Active (6s)</span>
            </div>
          )}

          <button
            onClick={() => (subTab === 'callbacks' ? fetchCallbacks(false) : fetchUsers())}
            disabled={subTab === 'callbacks' ? callbacksLoading : usersLoading}
            className="px-3 py-1.5 rounded-xl bg-sand hover:bg-sand-border/40 border border-sand-border text-charcoal font-bold transition-all inline-flex items-center gap-1.5"
            title="Refresh current view"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                (subTab === 'callbacks' ? callbacksLoading : usersLoading) ? 'animate-spin text-forest' : ''
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW A: DOCTOR CALLBACK REQUESTS                          */}
      {/* ========================================================= */}
      {subTab === 'callbacks' && (
        <div className="space-y-6">
          {/* Header Title */}
          <div>
            <h2 className="text-xl font-bold text-forest-deep flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-forest" />
              <span>Doctor Callback Requests</span>
            </h2>
            <p className="text-xs text-charcoal-muted mt-1">
              Patient consultations requested through the Doctor Callback popup. Real-time persistent records with direct call, WhatsApp dispatch, and status tracking.
            </p>
          </div>

          {/* 4 Stat KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Requests */}
            <div className="p-4 bg-white rounded-2xl border border-sand-border shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-charcoal-subtle uppercase tracking-wider">
                  Total Requests
                </span>
                <div className="p-2 rounded-xl bg-forest/10 text-forest">
                  <PhoneCall className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-forest-deep">{callbackMetrics.total}</div>
              <p className="text-[11px] text-charcoal-muted mt-0.5">All persistent submissions</p>
            </div>

            {/* New / Action Required */}
            <div className="p-4 bg-white rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  New (Action Required)
                </span>
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-700 flex items-center gap-2">
                <span>{callbackMetrics.newCount}</span>
                {callbackMetrics.newCount > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>
              <p className="text-[11px] text-amber-800/80 mt-0.5">Awaiting doctor call back</p>
            </div>

            {/* Contacted */}
            <div className="p-4 bg-white rounded-2xl border border-sand-border shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-charcoal-subtle uppercase tracking-wider">
                  Contacted / In Progress
                </span>
                <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-blue-700">{callbackMetrics.contactedCount}</div>
              <p className="text-[11px] text-charcoal-muted mt-0.5">Consultation initiated</p>
            </div>

            {/* Completed */}
            <div className="p-4 bg-white rounded-2xl border border-sand-border shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-charcoal-subtle uppercase tracking-wider">
                  Completed
                </span>
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-700">{callbackMetrics.completedCount}</div>
              <p className="text-[11px] text-charcoal-muted mt-0.5">Consultations closed</p>
            </div>
          </div>

          {/* Search, Filter & Excel Export Toolbar */}
          <div className="p-4 bg-white rounded-2xl border border-sand-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 text-charcoal-subtle absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by customer name, phone, city, or concern..."
                value={callbackSearch}
                onChange={(e) => setCallbackSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-sand border border-sand-border rounded-xl text-xs focus:outline-none focus:border-brand"
              />
            </div>

            {/* Filter Group + Export */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-charcoal-muted font-medium">Status:</span>
                <select
                  value={callbackStatusFilter}
                  onChange={(e) => setCallbackStatusFilter(e.target.value)}
                  className="bg-sand border border-sand-border rounded-xl px-3 py-2 text-xs font-semibold text-charcoal focus:outline-none focus:border-brand"
                >
                  <option value="all">All Statuses ({callbacks.length})</option>
                  <option value="New">New ({callbackMetrics.newCount})</option>
                  <option value="Contacted">Contacted ({callbackMetrics.contactedCount})</option>
                  <option value="Completed">Completed ({callbackMetrics.completedCount})</option>
                  <option value="Cancelled">Cancelled ({callbackMetrics.cancelledCount})</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-charcoal-muted font-medium">Date:</span>
                <select
                  value={callbackDateFilter}
                  onChange={(e) => setCallbackDateFilter(e.target.value)}
                  className="bg-sand border border-sand-border rounded-xl px-3 py-2 text-xs font-semibold text-charcoal focus:outline-none focus:border-brand"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7">Last 7 Days</option>
                  <option value="last30">Last 30 Days</option>
                </select>
              </div>

              {/* Excel Export Button */}
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-xs"
                title="Export filtered records to Excel CSV"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Callback Requests Data Table */}
          <div className="bg-white rounded-2xl border border-sand-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[900px]">
                <thead className="bg-sand border-b border-sand-border text-charcoal-subtle uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Submission / ID</th>
                    <th className="py-3.5 px-4 font-bold">Customer Details</th>
                    <th className="py-3.5 px-4 font-bold">Health Concern</th>
                    <th className="py-3.5 px-4 font-bold">Preferred Time</th>
                    <th className="py-3.5 px-4 font-bold">Customer Notes</th>
                    <th className="py-3.5 px-4 font-bold text-center">Status</th>
                    <th className="py-3.5 px-4 font-bold">Direct Actions</th>
                    <th className="py-3.5 px-4 font-bold">Admin Follow-up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-border">
                  {filteredCallbacks.length > 0 ? (
                    filteredCallbacks.map((item) => {
                      const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
                      const whatsappMessage = encodeURIComponent(
                        `Namaste ${item.name || 'Sir/Madam'}, this is the Ayurvedic Medical Advisory Team from Fibax Ayurveda regarding your callback request for "${item.concern || 'Ayurvedic Consultation'}". Is this a good time to speak?`
                      );

                      return (
                        <tr key={item.id} className="hover:bg-sand/40 transition-colors">
                          {/* Submission Date & Time + ID */}
                          <td className="py-3.5 px-4 align-top whitespace-nowrap">
                            <div className="font-semibold text-charcoal text-[11px]">
                              {formatIST(item.timestamp)}
                            </div>
                            <div className="text-[10px] font-mono text-charcoal-subtle mt-0.5">
                              #{item.id}
                            </div>
                            {item.status === 'New' && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                                Fresh Lead
                              </span>
                            )}
                          </td>

                          {/* Customer Details: Name, Phone, City */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="font-bold text-charcoal text-sm">{item.name}</div>
                            <div className="flex items-center gap-1.5 text-charcoal-muted mt-0.5">
                              <MapPin className="h-3 w-3 text-charcoal-subtle shrink-0" />
                              <span className="truncate max-w-[160px]">{item.city || 'India'}</span>
                            </div>
                            <div className="text-charcoal-subtle text-[11px] font-mono mt-0.5">
                              +91 {cleanPhone}
                            </div>
                          </td>

                          {/* Health Concern */}
                          <td className="py-3.5 px-4 align-top">
                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                              {item.concern || 'General Ayurvedic Consultation'}
                            </span>
                          </td>

                          {/* Preferred Callback Time */}
                          <td className="py-3.5 px-4 align-top whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-charcoal font-medium">
                              <Clock className="h-3.5 w-3.5 text-forest" />
                              <span>{item.preferredTime || 'Anytime'}</span>
                            </div>
                          </td>

                          {/* Additional Notes */}
                          <td className="py-3.5 px-4 align-top max-w-[200px]">
                            {item.notes ? (
                              <p className="text-[11px] text-charcoal-muted line-clamp-3 bg-sand/60 p-1.5 rounded-lg border border-sand-border/60">
                                {item.notes}
                              </p>
                            ) : (
                              <span className="text-[11px] text-charcoal-subtle italic">No notes provided</span>
                            )}
                          </td>

                          {/* Enquiry Status Select Dropdown */}
                          <td className="py-3.5 px-4 align-top text-center">
                            <div className="inline-block relative">
                              <select
                                value={item.status || 'New'}
                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                disabled={statusUpdatingId === item.id}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer focus:outline-none ${getStatusBadge(
                                  item.status || 'New'
                                )}`}
                              >
                                <option value="New">● New</option>
                                <option value="Contacted">● Contacted</option>
                                <option value="Completed">● Completed</option>
                                <option value="Cancelled">● Cancelled</option>
                              </select>
                              {statusUpdatingId === item.id && (
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-forest" />
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Direct Actions: Click-to-Call & WhatsApp */}
                          <td className="py-3.5 px-4 align-top whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {/* Click-to-call link */}
                              <a
                                href={`tel:+91${cleanPhone}`}
                                className="px-2.5 py-1.5 rounded-lg bg-sand hover:bg-forest hover:text-white border border-sand-border text-charcoal font-bold transition-all inline-flex items-center gap-1 text-[11px]"
                                title={`Direct Call +91 ${cleanPhone}`}
                              >
                                <Phone className="h-3 w-3 text-forest group-hover:text-white" />
                                <span>Call</span>
                              </a>

                              {/* WhatsApp link with pre-filled message */}
                              <a
                                href={`https://wa.me/91${cleanPhone}?text=${whatsappMessage}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all inline-flex items-center gap-1 text-[11px] shadow-xs"
                                title="Open WhatsApp Chat with prefilled message"
                              >
                                <MessageCircle className="h-3 w-3" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          </td>

                          {/* Admin Follow-up Notes */}
                          <td className="py-3.5 px-4 align-top max-w-[180px]">
                            {item.followUpNotes ? (
                              <div className="space-y-1">
                                <p className="text-[11px] text-charcoal bg-amber-50 border border-amber-200 p-1.5 rounded-lg line-clamp-2">
                                  {item.followUpNotes}
                                </p>
                                <button
                                  onClick={() => openNotesModal(item)}
                                  className="text-[10px] text-forest font-bold hover:underline inline-flex items-center gap-1"
                                >
                                  <Edit3 className="h-2.5 w-2.5" />
                                  <span>Edit Note</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => openNotesModal(item)}
                                className="px-2 py-1 rounded-lg bg-sand hover:bg-sand-border/50 text-charcoal-muted text-[11px] font-medium border border-sand-border inline-flex items-center gap-1"
                              >
                                <Edit3 className="h-3 w-3 text-charcoal-subtle" />
                                <span>Add Note</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-charcoal-muted">
                        <PhoneCall className="h-8 w-8 text-charcoal-subtle mx-auto mb-2 opacity-50" />
                        <div className="font-bold text-sm text-charcoal">No doctor callback requests found</div>
                        <p className="text-xs text-charcoal-muted mt-1">
                          {callbacksLoading
                            ? 'Fetching latest submissions from server...'
                            : 'Submissions from the Doctor Callback popup will automatically appear here.'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW B: CUSTOMER ACCOUNTS & LIVE LOGINS                   */}
      {/* ========================================================= */}
      {subTab === 'accounts' && (
        <div className="space-y-6">
          {/* Header Title */}
          <div>
            <h2 className="text-xl font-bold text-forest-deep flex items-center gap-2">
              <Users className="h-5 w-5 text-forest" />
              <span>Customer Accounts & Live Logins</span>
            </h2>
            <p className="text-xs text-charcoal-muted mt-1">
              Real-time monitor of registered customers, active login sessions, and purchase activity.
            </p>
          </div>

          {/* 4 Stat KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-sand-border shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-charcoal-subtle uppercase tracking-wider">
                  Total Accounts
                </span>
                <div className="p-2 rounded-xl bg-forest/10 text-forest">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-forest-deep">{totalUsers}</div>
              <p className="text-[11px] text-charcoal-muted mt-0.5">Registered customers</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-sand-border shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-charcoal-subtle uppercase tracking-wider">
                  Online Now
                </span>
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <UserCheck className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-700 flex items-center gap-2">
                <span>{activeSessions}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-charcoal-muted mt-0.5">Active logged-in sessions</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-sand-border shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-charcoal-subtle uppercase tracking-wider">
                  Orders Placed
                </span>
                <div className="p-2 rounded-xl bg-brand/10 text-brand">
                  <ShoppingBag className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-charcoal">{totalOrdersPlaced}</div>
              <p className="text-[11px] text-charcoal-muted mt-0.5">By registered accounts</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-sand-border shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-charcoal-subtle uppercase tracking-wider">
                  Customer Spend
                </span>
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-forest">{formatPrice(totalCustomerSpend)}</div>
              <p className="text-[11px] text-charcoal-muted mt-0.5">Cumulative order value</p>
            </div>
          </div>

          {/* Controls & Search Bar */}
          <div className="p-4 bg-white rounded-2xl border border-sand-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 text-charcoal-subtle absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by customer name, phone, or email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-sand border border-sand-border rounded-xl text-xs focus:outline-none focus:border-brand"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
              <span className="text-xs text-charcoal-muted font-medium whitespace-nowrap">Filter:</span>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="bg-sand border border-sand-border rounded-xl px-3 py-2 text-xs font-semibold text-charcoal focus:outline-none focus:border-brand w-full sm:w-auto"
              >
                <option value="all">All Accounts ({users.length})</option>
                <option value="online">Online Sessions ({activeSessions})</option>
                <option value="with-orders">Has Placed Orders</option>
              </select>
            </div>
          </div>

          {/* Customer Accounts Table */}
          <div className="bg-white rounded-2xl border border-sand-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand border-b border-sand-border text-charcoal-subtle uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Customer Name</th>
                    <th className="py-3.5 px-4 font-bold">Contact Info</th>
                    <th className="py-3.5 px-4 font-bold text-center">Status</th>
                    <th className="py-3.5 px-4 font-bold text-center">Logins</th>
                    <th className="py-3.5 px-4 font-bold text-center">Orders</th>
                    <th className="py-3.5 px-4 font-bold text-right">Total Spent</th>
                    <th className="py-3.5 px-4 font-bold">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-border">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-sand/60 transition-colors">
                        {/* Name + Initials */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {user.name
                                ? user.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)
                                : 'CU'}
                            </div>
                            <div>
                              <span className="font-bold text-charcoal block">{user.name}</span>
                              <span className="text-[10px] font-mono text-charcoal-subtle">{user.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Email + Phone */}
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="flex items-center gap-1.5 text-charcoal font-medium">
                            <Mail className="h-3 w-3 text-charcoal-subtle" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-charcoal-muted">
                            <Phone className="h-3 w-3 text-charcoal-subtle" />
                            <a href={`tel:${user.phone}`} className="hover:text-forest">
                              +91 {user.phone}
                            </a>
                          </div>
                        </td>

                        {/* Online / Active Status */}
                        <td className="py-3.5 px-4 text-center">
                          {user.isOnline ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              <span>Online Now</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-sand text-charcoal-subtle">
                              Offline
                            </span>
                          )}
                        </td>

                        {/* Total Logins */}
                        <td className="py-3.5 px-4 text-center font-semibold text-charcoal">
                          <span className="px-2 py-0.5 bg-sand rounded-md">
                            {user.loginCount || 1}
                          </span>
                        </td>

                        {/* Orders Count */}
                        <td className="py-3.5 px-4 text-center">
                          {user.ordersCount > 0 ? (
                            <span className="inline-flex items-center gap-1 font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-md">
                              <ShoppingBag className="h-3 w-3" />
                              <span>{user.ordersCount}</span>
                            </span>
                          ) : (
                            <span className="text-charcoal-subtle font-normal">0</span>
                          )}
                        </td>

                        {/* Total Spent */}
                        <td className="py-3.5 px-4 text-right font-black text-charcoal">
                          {formatPrice(user.totalSpend || 0)}
                        </td>

                        {/* Joined Date */}
                        <td className="py-3.5 px-4 text-charcoal-muted text-[11px]">
                          {new Date(user.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-charcoal-muted">
                        {usersLoading ? 'Fetching customers...' : 'No customer accounts match your search criteria.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADMIN FOLLOW-UP NOTES MODAL                               */}
      {/* ========================================================= */}
      {activeNotesItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-sand-border space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-sand-border">
              <div className="flex items-center gap-2 text-forest-deep font-bold text-sm">
                <Edit3 className="h-4 w-4 text-forest" />
                <span>Follow-up Notes for #{activeNotesItem.id}</span>
              </div>
              <button
                onClick={() => setActiveNotesItem(null)}
                className="p-1.5 rounded-lg hover:bg-sand text-charcoal-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-bold text-charcoal">{activeNotesItem.name} ({activeNotesItem.phone})</div>
              <div className="text-charcoal-muted">
                Concern: <span className="font-semibold text-forest">{activeNotesItem.concern}</span> | Slot: {activeNotesItem.preferredTime}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">
                Doctor / Telecaller Consultation Notes:
              </label>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="e.g. Called at 4:30 PM. Customer interested in Arth-Amrit for severe knee stiffness. Sent prescription via WhatsApp. Callback scheduled for tomorrow morning."
                rows={4}
                className="w-full p-3 bg-sand border border-sand-border rounded-xl text-xs focus:outline-none focus:border-brand text-charcoal"
              />
              <p className="text-[10px] text-charcoal-muted mt-1">
                These notes are strictly confidential to the admin panel and survive server deployments.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-sand-border">
              <button
                onClick={() => setActiveNotesItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-charcoal-muted hover:bg-sand transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-forest text-white hover:bg-forest-light transition-all shadow-xs inline-flex items-center gap-1.5"
              >
                {savingNotes ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving Notes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Save Notes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
