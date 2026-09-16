import React, { useState, useEffect } from 'react';
import { formatPrice } from '../../lib/utils';
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
  MapPin
} from 'lucide-react';

export function UsersView() {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeSessions, setActiveSessions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, online, with-orders

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
        setTotalUsers(data.totalUsers || 0);
        setActiveSessions(data.activeSessions || 0);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.id?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === 'online') return u.isOnline;
    if (statusFilter === 'with-orders') return u.ordersCount > 0;
    return true;
  });

  const totalOrdersPlaced = users.reduce((sum, u) => sum + (u.ordersCount || 0), 0);
  const totalCustomerSpend = users.reduce((sum, u) => sum + (u.totalSpend || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Metric Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-forest-deep flex items-center gap-2">
            <Users className="h-5 w-5 text-forest" />
            <span>Customer Accounts & Live Logins</span>
          </h2>
          <p className="text-xs text-charcoal-muted mt-1">
            Real-time monitor of registered customers, active login sessions, and purchase activity.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-sand hover:bg-sand-border/40 border border-sand-border text-charcoal text-xs font-bold transition-all inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-forest' : ''}`} />
          <span>Refresh Data</span>
        </button>
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

      {/* 2. Controls & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-sand-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-charcoal-subtle absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-sand border border-sand-border rounded-xl text-xs focus:outline-none focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <span className="text-xs text-charcoal-muted font-medium whitespace-nowrap">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-sand border border-sand-border rounded-xl px-3 py-2 text-xs font-semibold text-charcoal focus:outline-none focus:border-brand w-full sm:w-auto"
          >
            <option value="all">All Accounts ({users.length})</option>
            <option value="online">Online Sessions ({activeSessions})</option>
            <option value="with-orders">Has Placed Orders</option>
          </select>
        </div>
      </div>

      {/* 3. Customer Accounts Table */}
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
                    {loading ? 'Fetching customers...' : 'No customer accounts match your search criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
