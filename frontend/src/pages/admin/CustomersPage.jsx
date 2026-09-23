import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import { formatTsh } from '../../utils/currency';
import { 
  Search, 
  Users, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  Eye, 
  X, 
  Calendar, 
  Loader2,
  RefreshCw
} from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Selected Customer Details Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCustomers({ search });
      setCustomers(data || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const handleViewCustomer = async (cust) => {
    try {
      setLoadingDetail(true);
      setSelectedCustomer(cust);
      const fullDetail = await adminService.getCustomer(cust.id);
      setSelectedCustomer(fullDetail);
    } catch (err) {
      console.error('Failed to load customer details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <AdminLayout activeTitle="Customer Directory">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-amsterdam-dark tracking-tight">
            Customer Directory
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Profiles, contact numbers, delivery locations, and complete purchase histories.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amsterdam-olive' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-card mb-6">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search by customer name, phone number, or delivery location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm text-amsterdam-dark focus:outline-none focus:ring-2 focus:ring-amsterdam-olive/20 focus:border-amsterdam-olive bg-gray-50/50"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-card overflow-hidden">
        
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-amsterdam-olive animate-spin mb-2" />
            <p className="text-xs text-gray-400">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-xs">
            No customers found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-6">Customer Name</th>
                  <th className="py-3 px-6">Phone Number</th>
                  <th className="py-3 px-6">Delivery Location</th>
                  <th className="py-3 px-6">Total Orders</th>
                  <th className="py-3 px-6">Lifetime Value</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-amsterdam-dark">
                      {c.name}
                    </td>
                    <td className="py-4 px-6">
                      <a href={`tel:${c.phone}`} className="text-amsterdam-olive hover:underline font-mono">
                        {c.phone}
                      </a>
                    </td>
                    <td className="py-4 px-6 text-gray-600 max-w-xs truncate">
                      {c.location}
                    </td>
                    <td className="py-4 px-6 font-bold text-amsterdam-dark">
                      {c.total_orders} {c.total_orders === 1 ? 'order' : 'orders'}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-amsterdam-dark">
                      {formatTsh(c.total_spent)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleViewCustomer(c)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-amsterdam-olive hover:text-white text-gray-700 text-xs font-semibold transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile & Orders</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Customer Profile & Order History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setSelectedCustomer(null)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-gray-100 z-10 space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amsterdam-muted flex items-center justify-center text-amsterdam-olive-dark font-bold text-base">
                  {selectedCustomer.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-xl text-amsterdam-dark">
                    {selectedCustomer.name}
                  </h3>
                  <span className="text-[11px] text-gray-400">
                    Customer ID: {selectedCustomer.id?.substring(0, 8)}...
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-[#F9FAF6] p-4 rounded-2xl border border-gray-200/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amsterdam-olive" /> Phone:
                </span>
                <span className="font-bold text-amsterdam-dark font-mono">{selectedCustomer.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amsterdam-olive" /> Location:
                </span>
                <span className="font-bold text-amsterdam-dark truncate max-w-[200px]">
                  {selectedCustomer.location}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                <span className="text-gray-500 font-semibold">Total Lifetime Orders:</span>
                <span className="font-bold text-amsterdam-dark">{selectedCustomer.total_orders || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Total Lifetime Spend:</span>
                <span className="font-extrabold text-amsterdam-olive-dark">
                  {formatTsh(selectedCustomer.total_spent || 0)}
                </span>
              </div>
            </div>

            {/* Order History Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-400 mb-2.5">Order History</h4>
              
              {loadingDetail ? (
                <div className="py-6 text-center text-xs text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-amsterdam-olive" />
                  Loading historical orders...
                </div>
              ) : selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedCustomer.orders.map((o) => (
                    <div key={o.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-amsterdam-olive-dark block">
                          {o.order_number}
                        </span>
                        <span className="text-gray-400 text-[11px]">
                          {new Date(o.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-amsterdam-dark block">
                          {formatTsh(o.total_amount)}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-4 text-center">
                  No orders found for this customer.
                </p>
              )}
            </div>

          </div>
        </div>
      )}

    </AdminLayout>
  );
}
