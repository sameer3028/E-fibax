import React, { useState, useEffect } from 'react';
import { formatPrice } from '../../lib/utils';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  Printer,
  Settings,
  RefreshCw,
  Search,
  MapPin,
  X,
  Sliders,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { apiRequest } from '../../utils/api';

export function ShippingView() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [shippingConfig, setShippingConfig] = useState(null);
  const [configSaving, setConfigSaving] = useState(false);
  const [statusModalOrder, setStatusModalOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('In Transit');
  const [statusRemark, setStatusRemark] = useState('');
  const [statusLocation, setStatusLocation] = useState('');

  const [shippingOrderId, setShippingOrderId] = useState(null);

  // Load orders & shipping configuration
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ordersRes, configRes] = await Promise.all([
        apiRequest('/api/orders'),
        apiRequest('/api/shipping/config')
      ]);

      if (ordersRes.success && Array.isArray(ordersRes.data)) {
        setOrders(ordersRes.data);
      }
      if (configRes.success && configRes.data) {
        setShippingConfig(configRes.data);
      }
    } catch (err) {
      console.error('Error loading shipping data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1-Click Ship via Delhivery/Shiprocket
  const handleShipOrder = async (orderId) => {
    if (!orderId) return;
    setShippingOrderId(orderId);
    try {
      const res = await apiRequest(`/api/shipping/ship-order/${orderId}`, {
        method: 'POST',
        body: JSON.stringify({
          provider: shippingConfig?.provider || 'delhivery',
          courier: shippingConfig?.defaultCourier || 'Delhivery Express'
        })
      });

      if (res.success && res.data) {
        setOrders(prev => prev.map(o => (String(o.orderId) === String(orderId) ? res.data : o)));
        await loadData();
      } else {
        alert('Shipment creation failed: ' + (res.error || res.message || 'Unknown server error'));
      }
    } catch (err) {
      alert('Failed to manifest shipment: ' + err.message);
    } finally {
      setShippingOrderId(null);
    }
  };

  // Open Printable Shipping Label
  const handlePrintLabel = (orderId) => {
    const url = `/api/shipping/label/${orderId}`;
    window.open(url, '_blank', 'width=520,height=720');
  };

  // Update Status & Milestone
  const handleUpdateStatus = async () => {
    if (!statusModalOrder) return;
    try {
      const res = await apiRequest(`/api/shipping/status/${statusModalOrder.orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          location: statusLocation || (shippingConfig?.warehouse?.city || 'Transit Hub'),
          remark: statusRemark || `Shipment marked as ${newStatus}`
        })
      });

      if (res.success) {
        setOrders(prev => prev.map(o => (o.orderId === statusModalOrder.orderId ? res.data : o)));
        setStatusModalOrder(null);
        setStatusRemark('');
        setStatusLocation('');
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // Save Settings
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setConfigSaving(true);
    try {
      const res = await apiRequest('/api/shipping/config', {
        method: 'POST',
        body: JSON.stringify(shippingConfig)
      });
      if (res.success) {
        setIsSettingsOpen(false);
      }
    } catch (err) {
      alert('Failed to save shipping settings: ' + err.message);
    } finally {
      setConfigSaving(false);
    }
  };

  // Filter calculations
  const totalShipments = orders.length;
  const unfulfilledCount = orders.filter(o => o.status === 'Processing' || !o.trackingId).length;
  const inTransitCount = orders.filter(o => o.status === 'Manifested' || o.status === 'Dispatched' || o.status === 'In Transit').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
  const totalCodPending = orders
    .filter(o => o.payment?.method === 'COD' && o.status !== 'Delivered')
    .reduce((acc, o) => acc + (o.totals?.grandTotal || 0), 0);

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      (order.orderId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.trackingId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.shipping?.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.shipping?.pincode || '').includes(searchQuery);

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'unfulfilled') return order.status === 'Processing' || !order.trackingId;
    if (statusFilter === 'in-transit') return order.status === 'Manifested' || order.status === 'Dispatched' || order.status === 'In Transit';
    if (statusFilter === 'delivered') return order.status === 'Delivered';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Settings Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-sand-border shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-forest/10 text-forest">
              <Truck className="h-5 w-5" />
            </span>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-forest-deep">
              Logistics & Shipping Operations
            </h3>
          </div>
          <p className="text-xs text-charcoal-muted">
            Manage multi-carrier fulfillment with live Delhivery Express & Shiprocket AWB tracking, dispatch labels, and PIN code delivery operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Refresh Shipments"
            className="p-2.5 rounded-xl border border-sand-border text-charcoal hover:bg-sand transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-forest' : ''}`} />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all"
          >
            <Settings className="h-4 w-4" />
            <span>Shipping Settings</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-sand-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-charcoal-muted mb-1">
            <span>Total Orders</span>
            <Package className="h-4 w-4 text-forest" />
          </div>
          <div className="text-2xl font-black text-forest-deep">{totalShipments}</div>
          <span className="text-[10px] text-charcoal-subtle">All time shipments</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1">
            <span>Needs Dispatch</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900">{unfulfilledCount}</div>
          <span className="text-[10px] text-amber-700">Awaiting AWB generation</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-sand-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-charcoal-muted mb-1">
            <span>In Transit</span>
            <Truck className="h-4 w-4 text-brand" />
          </div>
          <div className="text-2xl font-black text-brand">{inTransitCount}</div>
          <span className="text-[10px] text-charcoal-subtle">With courier partners</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-1">
            <span>Delivered</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900">{deliveredCount}</div>
          <span className="text-[10px] text-emerald-700">Safely handed to customers</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-sand-border shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs text-charcoal-muted mb-1">
            <span>COD Pending</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-forest-deep">{formatPrice(totalCodPending)}</div>
          <span className="text-[10px] text-charcoal-subtle">Courier cash collection</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-sand-border shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: `All (${orders.length})` },
            { id: 'unfulfilled', label: `Awaiting Fulfillment (${unfulfilledCount})` },
            { id: 'in-transit', label: `In Transit (${inTransitCount})` },
            { id: 'delivered', label: `Delivered (${deliveredCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-forest text-white shadow-xs'
                  : 'text-charcoal-muted hover:bg-sand'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-charcoal-subtle" />
          <input
            type="text"
            placeholder="Search Order ID, AWB, Phone, PIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-sand rounded-xl text-xs text-charcoal border border-transparent focus:border-forest focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-2xl border border-sand-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand/60 border-b border-sand-border text-[11px] font-bold text-charcoal-muted uppercase tracking-wider">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Consignee & Destination</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Courier & AWB</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-border text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-charcoal-muted">
                    No shipments found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const hasAwb = !!order.trackingId;
                  return (
                    <tr key={order.orderId} className="hover:bg-sand/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-forest-deep font-mono text-xs">{order.orderId}</div>
                        <div className="text-[10px] text-charcoal-muted">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-charcoal">{order.customer?.name || 'Customer'}</div>
                        <div className="text-[11px] text-charcoal-muted flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-brand flex-shrink-0" />
                          <span>{order.shipping?.city || 'N/A'} - <strong>{order.shipping?.pincode || ''}</strong></span>
                        </div>
                        <div className="text-[10px] text-charcoal-subtle">{order.customer?.phone}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5 max-w-[220px]">
                          {(order.items || []).map((it, i) => (
                            <div key={i} className="text-[11px] text-charcoal truncate">
                              <span className="font-bold text-forest">{it.quantity}x</span> {it.title}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-forest text-xs">
                          {formatPrice(order.totals?.grandTotal || 0)}
                        </div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          order.payment?.method === 'COD'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {order.payment?.method || 'COD'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-xs font-bold text-forest">
                          {order.trackingId || <span className="text-amber-600 font-normal">Pending AWB</span>}
                        </div>
                        <div className="text-[10px] text-charcoal-muted">
                          {order.courier || (shippingConfig?.defaultCourier || 'Delhivery Express')}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'In Transit' || order.status === 'Dispatched'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'Manifested'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status === 'Delivered' ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          <span>{order.status || 'Processing'}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!hasAwb || order.status === 'Processing' ? (
                            <button
                              onClick={() => handleShipOrder(order.orderId)}
                              disabled={shippingOrderId === order.orderId}
                              className="px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-[11px] font-bold shadow-xs flex items-center gap-1 transition-all disabled:opacity-50"
                            >
                              {shippingOrderId === order.orderId ? (
                                <>
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                  <span>Shipping...</span>
                                </>
                              ) : (
                                <>
                                  <Truck className="h-3 w-3" />
                                  <span>Ship Now</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handlePrintLabel(order.orderId)}
                                title="Print Dispatch Label"
                                className="p-1.5 rounded-lg border border-sand-border hover:bg-sand text-charcoal transition-colors"
                              >
                                <Printer className="h-3.5 w-3.5 text-forest" />
                              </button>

                              <button
                                onClick={() => {
                                  setStatusModalOrder(order);
                                  setNewStatus(order.status || 'In Transit');
                                }}
                                title="Update Milestone"
                                className="px-2.5 py-1.5 rounded-lg border border-sand-border hover:bg-sand text-[11px] font-semibold text-charcoal transition-colors flex items-center gap-1"
                              >
                                <Sliders className="h-3 w-3" />
                                <span>Status</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Status Update Modal */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-card border border-sand-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sand-border">
              <h4 className="font-heading text-base font-bold text-forest-deep flex items-center gap-2">
                <Truck className="h-4 w-4 text-brand" />
                <span>Update Shipment Status</span>
              </h4>
              <button
                onClick={() => setStatusModalOrder(null)}
                className="p-1 rounded-lg text-charcoal-subtle hover:bg-sand"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-charcoal-muted">
              Order: <strong className="font-mono text-forest">{statusModalOrder.orderId}</strong> | AWB: <strong className="font-mono">{statusModalOrder.trackingId}</strong>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">New Milestone Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-sand rounded-xl text-xs text-charcoal border border-transparent focus:border-forest focus:outline-none"
                >
                  <option value="Manifested">Manifested (Packed in Warehouse)</option>
                  <option value="Dispatched">Dispatched (Handed to Courier)</option>
                  <option value="In Transit">In Transit (Highway / Air Express)</option>
                  <option value="Out for Delivery">Out for Delivery (Doorstep Route)</option>
                  <option value="Delivered">Delivered (Completed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Current Location / Hub</label>
                <input
                  type="text"
                  placeholder="e.g. Jaipur Regional Delivery Hub"
                  value={statusLocation}
                  onChange={(e) => setStatusLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-sand rounded-xl text-xs text-charcoal border border-transparent focus:border-forest focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Milestone Description Remark</label>
                <input
                  type="text"
                  placeholder="e.g. Arrived at distribution facility. Scheduled for morning delivery."
                  value={statusRemark}
                  onChange={(e) => setStatusRemark(e.target.value)}
                  className="w-full px-3 py-2 bg-sand rounded-xl text-xs text-charcoal border border-transparent focus:border-forest focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalOrder(null)}
                className="flex-1 py-2.5 rounded-xl border border-sand-border text-xs font-bold text-charcoal hover:bg-sand"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                className="flex-1 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-xs"
              >
                Save Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Shipping Platform Settings Modal */}
      {isSettingsOpen && shippingConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-card border border-sand-border space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-sand-border">
              <h4 className="font-heading text-lg font-bold text-forest-deep flex items-center gap-2">
                <Settings className="h-5 w-5 text-forest" />
                <span>Shipping Platform Settings</span>
              </h4>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg text-charcoal-subtle hover:bg-sand"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              {/* Provider Selection */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Active Shipping Platform Provider
                </label>
                <select
                  value={shippingConfig.provider}
                  onChange={(e) => setShippingConfig({ ...shippingConfig, provider: e.target.value })}
                  className="w-full px-3 py-2 bg-sand rounded-xl text-xs text-charcoal font-semibold border border-transparent focus:border-forest focus:outline-none"
                >
                  <option value="delhivery">Delhivery One Direct (B2C Express & Surface)</option>
                  <option value="shiprocket">Shiprocket API (Multi-Carrier Aggregator)</option>
                  <option value="auto">Automated Fulfillment Engine (Simulated Live Tracking)</option>
                </select>
              </div>

              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Environment Mode</label>
                  <select
                    value={shippingConfig.mode}
                    onChange={(e) => setShippingConfig({ ...shippingConfig, mode: e.target.value })}
                    className="w-full px-3 py-2 bg-sand rounded-xl text-xs text-charcoal border border-transparent focus:border-forest focus:outline-none"
                  >
                    <option value="sandbox">Sandbox / Test Mode</option>
                    <option value="production">Production / Live Mode</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Default Courier</label>
                  <input
                    type="text"
                    value={shippingConfig.defaultCourier || ''}
                    onChange={(e) => setShippingConfig({ ...shippingConfig, defaultCourier: e.target.value })}
                    className="w-full px-3 py-2 bg-sand rounded-xl text-xs text-charcoal border border-transparent focus:border-forest focus:outline-none"
                  />
                </div>
              </div>

              {/* Threshold & Charges */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-charcoal mb-1">Free Delivery Min (₹)</label>
                  <input
                    type="number"
                    value={shippingConfig.freeShippingThreshold || 499}
                    onChange={(e) => setShippingConfig({ ...shippingConfig, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-sand rounded-xl text-xs text-charcoal border border-transparent focus:border-forest focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-charcoal mb-1">Standard Fee (₹)</label>
                  <input
                    type="number"
                    value={shippingConfig.standardShippingFee || 49}
                    onChange={(e) => setShippingConfig({ ...shippingConfig, standardShippingFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-sand rounded-xl text-xs text-charcoal border border-transparent focus:border-forest focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-charcoal mb-1">Extra COD Fee (₹)</label>
                  <input
                    type="number"
                    value={shippingConfig.codFee || 0}
                    onChange={(e) => setShippingConfig({ ...shippingConfig, codFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-sand rounded-xl text-xs text-charcoal border border-transparent focus:border-forest focus:outline-none"
                  />
                </div>
              </div>

              {/* Carrier API Credentials */}
              <div className="p-3.5 bg-sand/60 rounded-2xl border border-sand-border space-y-2.5">
                <div className="text-xs font-bold text-forest flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5" />
                  <span>
                    {shippingConfig.provider === 'shiprocket' ? 'Shiprocket API Credentials' : 'Delhivery API Credentials'}
                  </span>
                </div>

                {shippingConfig.provider === 'shiprocket' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Shiprocket Login Email"
                      value={shippingConfig.shiprocket?.email || ''}
                      onChange={(e) => setShippingConfig({
                        ...shippingConfig,
                        shiprocket: { ...(shippingConfig.shiprocket || {}), email: e.target.value }
                      })}
                      className="px-3 py-1.5 bg-white rounded-xl text-xs text-charcoal border border-sand-border focus:outline-none"
                    />
                    <input
                      type="password"
                      placeholder="Shiprocket Password / Token"
                      value={shippingConfig.shiprocket?.password || ''}
                      onChange={(e) => setShippingConfig({
                        ...shippingConfig,
                        shiprocket: { ...(shippingConfig.shiprocket || {}), password: e.target.value }
                      })}
                      className="px-3 py-1.5 bg-white rounded-xl text-xs text-charcoal border border-sand-border focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="password"
                      placeholder="Delhivery Client API Token"
                      value={shippingConfig.delhivery?.apiKey || ''}
                      onChange={(e) => setShippingConfig({
                        ...shippingConfig,
                        delhivery: { ...(shippingConfig.delhivery || {}), apiKey: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-white rounded-xl text-xs text-charcoal border border-sand-border focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Warehouse Pickup Address */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-charcoal block">Central Dispatch Warehouse Address</span>
                <input
                  type="text"
                  placeholder="Facility Name"
                  value={shippingConfig.warehouse?.name || ''}
                  onChange={(e) => setShippingConfig({
                    ...shippingConfig,
                    warehouse: { ...(shippingConfig.warehouse || {}), name: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 bg-sand rounded-xl text-xs text-charcoal border border-transparent focus:border-forest focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Street / SCO Address"
                  value={shippingConfig.warehouse?.address || ''}
                  onChange={(e) => setShippingConfig({
                    ...shippingConfig,
                    warehouse: { ...(shippingConfig.warehouse || {}), address: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 bg-sand rounded-xl text-xs text-charcoal border border-transparent focus:border-forest focus:outline-none"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={shippingConfig.warehouse?.city || ''}
                    onChange={(e) => setShippingConfig({
                      ...shippingConfig,
                      warehouse: { ...(shippingConfig.warehouse || {}), city: e.target.value }
                    })}
                    className="px-3 py-1.5 bg-sand rounded-xl text-xs text-charcoal border border-transparent focus:border-forest focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={shippingConfig.warehouse?.state || ''}
                    onChange={(e) => setShippingConfig({
                      ...shippingConfig,
                      warehouse: { ...(shippingConfig.warehouse || {}), state: e.target.value }
                    })}
                    className="px-3 py-1.5 bg-sand rounded-xl text-xs text-charcoal border border-transparent focus:border-forest focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={shippingConfig.warehouse?.pincode || ''}
                    onChange={(e) => setShippingConfig({
                      ...shippingConfig,
                      warehouse: { ...(shippingConfig.warehouse || {}), pincode: e.target.value }
                    })}
                    className="px-3 py-1.5 bg-sand rounded-xl text-xs text-charcoal border border-transparent focus:border-forest focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-sand-border">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-sand-border text-xs font-bold text-charcoal hover:bg-sand"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={configSaving}
                  className="flex-1 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-xs"
                >
                  {configSaving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
