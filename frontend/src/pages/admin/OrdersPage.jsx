import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import InvoiceModal from '../../components/storefront/InvoiceModal';
import { adminService } from '../../services/adminService';
import { formatTsh } from '../../utils/currency';
import { 
  Search, 
  Filter, 
  Eye, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Phone, 
  MapPin, 
  Calendar,
  Loader2,
  RefreshCw,
  FileText
} from 'lucide-react';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Invoice Modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const handleOpenInvoice = async () => {
    if (!selectedOrder) return;
    try {
      setLoadingInvoice(true);
      const inv = await adminService.getOrderInvoice(selectedOrder.id);
      setInvoiceData(inv);
      setShowInvoiceModal(true);
    } catch (err) {
      console.error('Failed to load invoice:', err);
      setInvoiceData({
        order_number: selectedOrder.order_number,
        pricing_mode: selectedOrder.pricing_mode || 'RETAIL',
        created_at: selectedOrder.created_at,
        customer_name: selectedOrder.customer_name,
        customer_phone: selectedOrder.customer_phone,
        customer_location: selectedOrder.customer_location,
        customer_notes: selectedOrder.customer_notes,
        items: selectedOrder.items,
        total_amount: selectedOrder.total_amount,
        status: selectedOrder.status
      });
      setShowInvoiceModal(true);
    } finally {
      setLoadingInvoice(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminService.getOrders({
        search,
        status: statusFilter
      });
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;
    try {
      setUpdatingStatus(true);
      setStatusMessage('');
      const updated = await adminService.updateOrderStatus(selectedOrder.id, newStatus);
      setSelectedOrder(updated);
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      setStatusMessage(`Order status successfully changed to ${newStatus}`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.detail || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Pending</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Confirmed</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Processing</span>;
      case 'READY':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">Ready</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Delivered</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <AdminLayout activeTitle="Order Management">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-amsterdam-dark tracking-tight">
            Orders Desk
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Process, confirm, and update customer order fulfillment statuses.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amsterdam-olive' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-card mb-6 space-y-4">
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search by Order # (AMG-...), customer name, phone, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm text-amsterdam-dark focus:outline-none focus:ring-2 focus:ring-amsterdam-olive/20 focus:border-amsterdam-olive bg-gray-50/50"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick Clear */}
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs font-semibold text-gray-500 hover:text-amsterdam-dark whitespace-nowrap"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-amsterdam-olive text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-card overflow-hidden">
        
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-amsterdam-olive animate-spin mb-2" />
            <p className="text-xs text-gray-400">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-xs">
            No orders match your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-6">Order #</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Mode</th>
                  <th className="py-3 px-6">Customer Details</th>
                  <th className="py-3 px-6">Location</th>
                  <th className="py-3 px-6">Total Amount</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-amsterdam-olive-dark">
                      {order.order_number}
                    </td>
                    <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        (order.pricing_mode || '').toUpperCase() === 'WHOLESALE'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {order.pricing_mode || 'RETAIL'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-amsterdam-dark">{order.customer_name}</div>
                      <div className="text-gray-400 text-[11px]">{order.customer_phone}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 max-w-xs truncate">
                      {order.customer_location}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-amsterdam-dark">
                      {formatTsh(order.total_amount)}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-amsterdam-olive hover:text-white text-gray-700 text-xs font-semibold transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Order Details & Status Manager Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setSelectedOrder(null)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-gray-100 z-10 space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Order Details</span>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-xl text-amsterdam-dark">
                    {selectedOrder.order_number}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    (selectedOrder.pricing_mode || '').toUpperCase() === 'WHOLESALE'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {(selectedOrder.pricing_mode || 'RETAIL').toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {statusMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Customer Snapshot */}
            <div className="bg-[#F9FAF6] p-4 rounded-2xl border border-gray-200/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Customer:</span>
                <span className="font-bold text-amsterdam-dark">{selectedOrder.customer_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Phone:</span>
                <a href={`tel:${selectedOrder.customer_phone}`} className="font-bold text-amsterdam-olive hover:underline">
                  {selectedOrder.customer_phone}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Delivery Location:</span>
                <span className="font-bold text-amsterdam-dark truncate max-w-[200px]">
                  {selectedOrder.customer_location}
                </span>
              </div>
              {selectedOrder.customer_notes && (
                <div className="pt-2 border-t border-gray-200/40 text-gray-600">
                  <span className="font-bold block text-gray-400 text-[10px] uppercase">Notes:</span>
                  {selectedOrder.customer_notes}
                </div>
              )}
            </div>

            {/* Items Breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Purchased Items</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-gray-50 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-amsterdam-dark block">{item.product_name_snapshot}</span>
                      <span className="text-gray-400 text-[11px]">{item.quantity} × {formatTsh(item.unit_price)}</span>
                    </div>
                    <span className="font-extrabold text-amsterdam-dark">
                      {formatTsh(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex justify-between items-baseline pt-3 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-700 uppercase">Order Total:</span>
                <span className="font-display font-extrabold text-lg text-amsterdam-olive-dark">
                  {formatTsh(selectedOrder.total_amount)}
                </span>
              </div>
            </div>

            {/* Invoice Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenInvoice}
                disabled={loadingInvoice}
                className="w-full py-2.5 px-4 rounded-xl bg-amsterdam-dark hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-60"
              >
                {loadingInvoice ? (
                  <Loader2 className="w-4 h-4 text-amsterdam-lime animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 text-amsterdam-lime" />
                )}
                <span>View / Print Customer Invoice</span>
              </button>
            </div>

            {/* Status Update Control */}
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Update Order Status
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                {['PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    disabled={updatingStatus || selectedOrder.status === st}
                    onClick={() => handleStatusChange(st)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedOrder.status === st
                        ? 'bg-amsterdam-olive text-white border-amsterdam-olive shadow-xs'
                        : st === 'CANCELLED'
                        ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    } disabled:opacity-50`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              
              <p className="text-[10px] text-gray-400 mt-2">
                Setting status to <strong className="text-red-700">CANCELLED</strong> will automatically restore reserved stock to inventory.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Printable & Downloadable Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        invoiceData={invoiceData}
      />

    </AdminLayout>
  );
}
