import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import { formatTsh } from '../../utils/currency';
import { 
  ShoppingBag, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  Loader2,
  RefreshCw,
  LayoutDashboard
} from 'lucide-react';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-[#FFF0F2] text-[#881A28] border border-[#881A28]/20">
            Pending
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-[#F2F8EA] text-[#4F772D] border border-[#4F772D]/20">
            Confirmed
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/50">
            Processing
          </span>
        );
      case 'READY':
        return (
          <span className="px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200/50">
            Ready
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-[#DCFCE7] text-[#15803D] border border-green-200/50">
            Delivered
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <AdminLayout activeTitle="Executive Dashboard">
      
      {/* Dashboard Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#80C345] to-[#4F772D] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(79,119,45,0.3)]">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-amsterdam-dark tracking-tight">
              Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Live operational metrics & storefront performance across Tanzania
            </p>
          </div>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-xs hover:shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amsterdam-olive' : 'text-gray-500'}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {loading && !metrics ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-amsterdam-olive animate-spin mb-3" />
          <p className="text-xs text-gray-500 font-semibold">Loading operations metrics...</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Exactly 3 Vibrant Gradient Cards (matching Amsterdam Group Logo Palette) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Total Sales (Amsterdam Vibrant Lime Green Gradient - from logo "Amsterdam") */}
            <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#5E9E23] via-[#6FA82A] to-[#80C345] text-white shadow-[0_14px_28px_-6px_rgba(110,168,42,0.38)] hover:shadow-[0_20px_35px_-6px_rgba(110,168,42,0.48)] transform hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[175px]">
              {/* Decorative Concentric Wave Rings */}
              <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -right-2 -bottom-2 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-white/85 uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded-full">
                    Revenue
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-white/90 block">
                  Total Sales
                </span>
                <div className="font-display font-black text-2xl lg:text-3xl text-white tracking-tight mt-1">
                  {formatTsh(metrics?.total_revenue || 0)}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/85 font-medium">
                <span>From confirmed orders</span>
                <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                  Live
                </span>
              </div>
            </div>

            {/* Card 2: Total Orders (Amsterdam Deep Forest / Olive Gradient - from corporate brand) */}
            <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#27481C] via-[#376127] to-[#4F772D] text-white shadow-[0_14px_28px_-6px_rgba(55,97,39,0.38)] hover:shadow-[0_20px_35px_-6px_rgba(55,97,39,0.48)] transform hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[175px]">
              {/* Decorative Concentric Wave Rings */}
              <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -right-2 -bottom-2 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <Link
                    to="/admin/orders"
                    className="text-[11px] font-bold text-white/90 hover:text-white uppercase tracking-wider bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-white/90 block">
                  Total Orders
                </span>
                <div className="font-display font-black text-2xl lg:text-3xl text-white tracking-tight mt-1">
                  {metrics?.total_orders || 0}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/85 font-medium">
                <span>Today: <strong className="text-white font-bold">{metrics?.today_orders || 0} orders</strong></span>
                <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                  Tracked
                </span>
              </div>
            </div>

            {/* Card 3: Pending Orders (Amsterdam Maroon / Wine Red Gradient - from logo "group") */}
            <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#6E121E] via-[#881A28] to-[#9E1B2D] text-white shadow-[0_14px_28px_-6px_rgba(136,26,40,0.38)] hover:shadow-[0_20px_35px_-6px_rgba(136,26,40,0.48)] transform hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[175px]">
              {/* Decorative Concentric Wave Rings */}
              <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -right-2 -bottom-2 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-white/85 uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded-full">
                    Action
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-white/90 block">
                  Pending Orders
                </span>
                <div className="font-display font-black text-2xl lg:text-3xl text-white tracking-tight mt-1">
                  {metrics?.pending_orders || 0}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/85 font-medium">
                <span>Awaiting fulfillment confirmation</span>
                <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                  Queue
                </span>
              </div>
            </div>

          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
            
            <div className="p-6 sm:p-7 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-amsterdam-dark">
                  Recent Customer Orders
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Latest customer orders placed from storefront
                </p>
              </div>

              <Link
                to="/admin/orders"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 hover:bg-amsterdam-muted text-gray-700 hover:text-amsterdam-olive-dark text-xs font-bold transition-all shadow-xs"
              >
                <span>Full Orders Desk</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Order #</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Products</th>
                    <th className="py-4 px-6">Total Amount</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {metrics?.recent_orders && metrics.recent_orders.length > 0 ? (
                    metrics.recent_orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-amsterdam-olive">
                          {order.order_number}
                        </td>
                        <td className="py-4 px-6 font-semibold text-amsterdam-dark">
                          <div>{order.customer_name}</div>
                          <span className="text-[11px] text-gray-400 font-normal">{order.customer_phone}</span>
                        </td>
                        <td className="py-4 px-6 text-gray-600 max-w-xs truncate">
                          {order.customer_location}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {order.items?.map(i => `${i.product_name_snapshot} (${i.quantity})`).join(', ') || 'Item'}
                        </td>
                        <td className="py-4 px-6 font-black text-amsterdam-dark text-sm">
                          {formatTsh(order.total_amount)}
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(order.status)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        No orders recorded yet. Place an order on the storefront to test the live flow!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

    </AdminLayout>
  );
}
