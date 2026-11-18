import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import {
  Users,
  Search,
  Filter,
  Download,
  PhoneCall,
  MessageCircle,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin,
  Briefcase,
  TrendingUp,
  X,
  Edit2,
  Trash2,
  Send,
  Loader2,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  UserCheck
} from 'lucide-react';

export function FranchiseLeadsManager() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    newCount: 0,
    contactedCount: 0,
    interestedCount: 0,
    followUpCount: 0,
    convertedCount: 0,
    rejectedCount: 0
  });
  const [statesList, setStatesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');

  // Modal State for Viewing & Updating Lead
  const [selectedLead, setSelectedLead] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editAssignedStaff, setEditAssignedStaff] = useState('');
  const [editFollowUpDate, setEditFollowUpDate] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [savingLead, setSavingLead] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Fetch leads from backend
  const fetchLeads = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (stateFilter !== 'all') params.set('state', stateFilter);
      if (dateRangeFilter !== 'all') params.set('dateRange', dateRangeFilter);

      const res = await apiRequest(`/api/admin/franchise/leads?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res && res.success) {
        setLeads(res.leads || []);
        if (res.stats) setStats(res.stats);
        if (Array.isArray(res.states)) setStatesList(res.states);
      } else {
        setError(res.error || 'Failed to load franchise leads.');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, stateFilter, dateRangeFilter]);

  // Handle Search on Enter or debounce
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleOpenLeadModal = (lead) => {
    setSelectedLead(lead);
    setEditStatus(lead.status || 'New');
    setEditAssignedStaff(lead.assignedStaff || 'Unassigned');
    setEditFollowUpDate(lead.followUpDate || '');
    setNewNoteText('');
    setSaveSuccessMsg('');
  };

  const handleSaveLeadUpdates = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;

    setSavingLead(true);
    setSaveSuccessMsg('');
    try {
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const payload = {
        status: editStatus,
        assignedStaff: editAssignedStaff,
        followUpDate: editFollowUpDate,
        newNote: newNoteText.trim() ? newNoteText.trim() : undefined
      };

      const res = await apiRequest(`/api/admin/franchise/leads/${selectedLead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (res && res.success && res.lead) {
        setSelectedLead(res.lead);
        setNewNoteText('');
        setSaveSuccessMsg('Lead updated successfully!');
        // Update local list
        setLeads((prev) => prev.map((l) => (l.id === res.lead.id ? res.lead : l)));
        // Refresh metrics
        fetchLeads();
      } else {
        alert('Failed to update lead: ' + (res.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error updating lead: ' + err.message);
    } finally {
      setSavingLead(false);
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm(`Are you sure you want to permanently delete lead ${leadId}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
      const res = await apiRequest(`/api/admin/franchise/leads/${leadId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res && res.success) {
        setSelectedLead(null);
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
        fetchLeads();
      } else {
        alert('Failed to delete lead: ' + (res.error || 'Server error'));
      }
    } catch (err) {
      alert('Error deleting lead: ' + err.message);
    }
  };

  // Export to Excel (CSV)
  const handleExportCsv = () => {
    const token = localStorage.getItem('fibax_admin_token') || sessionStorage.getItem('fibax_admin_token');
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (stateFilter !== 'all') params.set('state', stateFilter);
    if (dateRangeFilter !== 'all') params.set('dateRange', dateRangeFilter);

    const exportUrl = `/api/admin/franchise/leads/export/csv?${params.toString()}`;

    // Direct authenticated fetch download
    fetch(exportUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Fibax_Franchise_Leads_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        alert('Failed to export CSV: ' + err.message);
      });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" /> New
          </span>
        );
      case 'Contacted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="h-3 w-3" /> Contacted
          </span>
        );
      case 'Interested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <TrendingUp className="h-3 w-3" /> Interested
          </span>
        );
      case 'Follow-up Required':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Calendar className="h-3 w-3" /> Follow-up
          </span>
        );
      case 'Converted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> Converted
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <X className="h-3 w-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sand text-charcoal">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-sand-border shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-forest" />
            <h2 className="font-heading font-extrabold text-xl text-forest-deep">
              PCD Pharma Franchise Leads
            </h2>
            {stats.newCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-black animate-pulse">
                {stats.newCount} NEW
              </span>
            )}
          </div>
          <p className="text-xs text-charcoal-muted mt-1">
            Enterprise pipeline management, territory verification, and applicant follow-ups across India.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchLeads}
            disabled={loading}
            className="p-2.5 rounded-xl bg-sand hover:bg-sand-border text-charcoal text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Refresh Leads"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={leads.length === 0}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export to Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* Metrics Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        <div className="p-4 rounded-2xl bg-white border border-sand-border shadow-xs">
          <span className="text-[11px] font-bold text-charcoal-muted uppercase tracking-wider block">Total Leads</span>
          <div className="text-2xl font-heading font-black text-charcoal mt-1">{stats.total}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" /> New
          </span>
          <div className="text-2xl font-heading font-black text-rose-600 mt-1">{stats.newCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-xs">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Contacted</span>
          <div className="text-2xl font-heading font-black text-blue-700 mt-1">{stats.contactedCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Interested</span>
          <div className="text-2xl font-heading font-black text-amber-600 mt-1">{stats.interestedCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-xs">
          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Follow-up Due</span>
          <div className="text-2xl font-heading font-black text-purple-700 mt-1">{stats.followUpCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Converted</span>
          <div className="text-2xl font-heading font-black text-emerald-600 mt-1">{stats.convertedCount}</div>
        </div>

      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-sand-border shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="h-4 w-4 text-charcoal-muted absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Lead ID, Name, Mobile, Email, District or City..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-sand/30 border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-sand/30 border border-sand-border rounded-xl text-xs font-semibold text-charcoal focus:outline-none focus:border-forest cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Follow-up Required">Follow-up Required</option>
              <option value="Converted">Converted</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* State Filter */}
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="px-3 py-2.5 bg-sand/30 border border-sand-border rounded-xl text-xs font-semibold text-charcoal focus:outline-none focus:border-forest cursor-pointer"
            >
              <option value="all">All States</option>
              {statesList.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Date Range Filter */}
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="px-3 py-2.5 bg-sand/30 border border-sand-border rounded-xl text-xs font-semibold text-charcoal focus:outline-none focus:border-forest cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Filter
            </button>
          </div>

        </form>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-sand-border shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-charcoal-muted flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-forest" />
            <span>Loading Franchise Leads...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-600 bg-rose-50">
            {error}
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-charcoal-muted space-y-2">
            <Briefcase className="h-10 w-10 text-charcoal-muted/40 mx-auto" />
            <h4 className="font-heading font-bold text-sm text-charcoal">No Franchise Enquiries Found</h4>
            <p className="text-xs">
              {searchTerm || statusFilter !== 'all' || stateFilter !== 'all'
                ? 'Try adjusting your search criteria or resetting filters.'
                : 'New enquiries submitted on /pcd-pharma-franchise will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAFBF9] border-b border-sand-border text-charcoal-muted font-heading font-extrabold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Lead ID &amp; Date</th>
                  <th className="py-3 px-4">Applicant &amp; Location</th>
                  <th className="py-3 px-4">Direct Contact</th>
                  <th className="py-3 px-4">Business Profile</th>
                  <th className="py-3 px-4">Investment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Staff</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-border/60">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-sand/20 transition-colors">
                    
                    {/* ID & Date */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-forest text-[11px] block">{lead.id}</span>
                      <span className="text-[10px] text-charcoal-muted flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>

                    {/* Name & Location */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-charcoal text-xs block">{lead.name}</span>
                      <span className="text-[11px] text-charcoal-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-forest" />
                        {lead.city}, {lead.state}
                      </span>
                    </td>

                    {/* Contact Actions */}
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:+91${lead.phone}`}
                          className="font-bold text-forest hover:underline flex items-center gap-1"
                          title="Click to Call"
                        >
                          <PhoneCall className="h-3 w-3 text-forest" />
                          <span>+91 {lead.phone}</span>
                        </a>

                        <a
                          href={`https://wa.me/91${(lead.whatsapp || lead.phone).replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(lead.name)}%2C%20regarding%20your%20Fibax%20Ayurveda%20Franchise%20enquiry%20(${lead.id})`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          title="Open WhatsApp Chat"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-[11px] text-charcoal-muted hover:text-forest truncate max-w-[160px] block"
                      >
                        {lead.email}
                      </a>
                    </td>

                    {/* Business Profile */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-charcoal block">{lead.businessType}</span>
                      <span className="text-[10px] text-charcoal-muted block">Exp: {lead.experience}</span>
                    </td>

                    {/* Investment */}
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                        {lead.investmentRange}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(lead.status)}
                    </td>

                    {/* Staff */}
                    <td className="py-3.5 px-4 text-charcoal-muted">
                      {lead.assignedStaff || 'Unassigned'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenLeadModal(lead)}
                        className="px-3 py-1.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        Review &amp; Edit
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: LEAD DETAILS & STATUS MANAGEMENT                   */}
      {/* ======================================================== */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-sand-border shadow-2xl overflow-hidden my-6 animate-fadeIn flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#1B4D3E] text-white p-5 px-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-300 font-bold block">
                  PCD FRANCHISE APPLICATION
                </span>
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-white mt-0.5">
                  {selectedLead.name}
                </h3>
                <p className="text-xs text-sand/80 mt-0.5">
                  Ref: <strong className="font-mono text-white">{selectedLead.id}</strong> • Location: <strong>{selectedLead.city}, {selectedLead.state}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {saveSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Quick Communication Bar */}
              <div className="p-3.5 rounded-2xl bg-[#FAFBF9] border border-sand-border flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <a
                    href={`tel:+91${selectedLead.phone}`}
                    className="flex items-center gap-1.5 font-bold text-forest hover:underline"
                  >
                    <PhoneCall className="h-4 w-4 text-forest" />
                    <span>Call +91 {selectedLead.phone}</span>
                  </a>

                  <a
                    href={`https://wa.me/91${(selectedLead.whatsapp || selectedLead.phone).replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(selectedLead.name)}%2C%20regarding%20your%20Fibax%20Ayurveda%20Franchise%20enquiry%20(${selectedLead.id})`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-bold text-emerald-700 hover:underline"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="flex items-center gap-1.5 font-bold text-charcoal hover:underline"
                  >
                    <Mail className="h-4 w-4 text-charcoal-muted" />
                    <span>Email</span>
                  </a>
                </div>

                <div className="text-[11px] text-charcoal-muted">
                  Submitted: {new Date(selectedLead.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </div>
              </div>

              {/* Application Details Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-sand/30 border border-sand-border/70">
                  <span className="text-charcoal-muted text-[10px] block font-bold uppercase">Business Type</span>
                  <strong className="text-charcoal mt-0.5 block">{selectedLead.businessType}</strong>
                </div>

                <div className="p-3 rounded-xl bg-sand/30 border border-sand-border/70">
                  <span className="text-charcoal-muted text-[10px] block font-bold uppercase">Pharma Experience</span>
                  <strong className="text-charcoal mt-0.5 block">{selectedLead.experience}</strong>
                </div>

                <div className="p-3 rounded-xl bg-sand/30 border border-sand-border/70">
                  <span className="text-charcoal-muted text-[10px] block font-bold uppercase">Initial Investment</span>
                  <strong className="text-amber-800 font-extrabold mt-0.5 block">{selectedLead.investmentRange}</strong>
                </div>
              </div>

              {/* Applicant Message */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-charcoal">Applicant Requirements / Message:</span>
                <div className="p-3.5 rounded-xl bg-sand/20 border border-sand-border text-xs text-charcoal-muted leading-relaxed italic">
                  "{selectedLead.message || 'No specific requirements mentioned.'}"
                </div>
              </div>

              {/* Status & Assignment Update Form */}
              <form onSubmit={handleSaveLeadUpdates} className="space-y-4 pt-2 border-t border-sand-border">
                <h4 className="font-heading font-extrabold text-xs uppercase tracking-wider text-charcoal">
                  Franchise Pipeline &amp; Follow-Up Controls
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Lead Status */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal">Pipeline Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs font-bold text-charcoal focus:outline-none focus:border-forest"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Interested">Interested</option>
                      <option value="Follow-up Required">Follow-up Required</option>
                      <option value="Converted">Converted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Assigned Staff */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal">Assigned BDM / Staff</label>
                    <input
                      type="text"
                      placeholder="e.g. Harpreet Singh"
                      value={editAssignedStaff}
                      onChange={(e) => setEditAssignedStaff(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                    />
                  </div>

                  {/* Next Follow-up Date */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal">Next Follow-up Date</label>
                    <input
                      type="date"
                      value={editFollowUpDate}
                      onChange={(e) => setEditFollowUpDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                    />
                  </div>

                </div>

                {/* Add Internal Note */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-charcoal">Add Internal Staff Note</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Verified drug license; sent visual aid PDF; follow up on Friday..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>

                {/* Existing Notes History */}
                {Array.isArray(selectedLead.internalNotes) && selectedLead.internalNotes.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-charcoal-muted block uppercase">Notes History</span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {selectedLead.internalNotes.map((note) => (
                        <div key={note.id} className="p-2.5 rounded-xl bg-sand/30 border border-sand-border/60 text-xs">
                          <div className="flex items-center justify-between text-[10px] text-charcoal-muted">
                            <strong className="text-forest">{note.author}</strong>
                            <span>{new Date(note.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                          </div>
                          <p className="mt-1 text-charcoal font-medium">{note.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-sand-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleDeleteLead(selectedLead.id)}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Lead</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedLead(null)}
                      className="px-4 py-2 rounded-xl bg-sand hover:bg-sand-border text-charcoal text-xs font-bold transition-colors"
                    >
                      Close
                    </button>

                    <button
                      type="submit"
                      disabled={savingLead}
                      className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {savingLead ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Lead Updates</span>
                      )}
                    </button>
                  </div>
                </div>

              </form>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
