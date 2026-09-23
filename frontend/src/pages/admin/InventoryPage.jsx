import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import { formatTsh } from '../../utils/currency';
import { 
  Boxes, 
  PlusCircle, 
  History, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  X, 
  Loader2, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'history'
  const [inventoryItems, setInventoryItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Quick Adjust Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityChange, setQuantityChange] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [items, txs] = await Promise.all([
        adminService.getInventory(statusFilter),
        adminService.getInventoryTransactions()
      ]);
      setInventoryItems(items || []);
      setTransactions(txs || []);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [statusFilter]);

  const openAdjustModal = (item) => {
    setSelectedProduct(item);
    setQuantityChange(10);
    setAdjustReason('Restock shipment received from supplier');
    setAdjustError('');
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustReason.trim()) {
      setAdjustError('A mandatory reason is required for audit compliance.');
      return;
    }
    if (parseInt(quantityChange, 10) === 0) {
      setAdjustError('Quantity change cannot be 0.');
      return;
    }

    try {
      setAdjusting(true);
      setAdjustError('');
      await adminService.adjustInventory(
        selectedProduct.product_id,
        quantityChange,
        adjustReason
      );
      setAdjustModalOpen(false);
      fetchInventory();
    } catch (err) {
      console.error('Adjustment error:', err);
      setAdjustError(err.response?.data?.detail || 'Failed to record inventory adjustment.');
    } finally {
      setAdjusting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'IN_STOCK':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">In Stock</span>;
      case 'LOW_STOCK':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Low Stock</span>;
      case 'OUT_OF_STOCK':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">Out of Stock</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <AdminLayout activeTitle="Inventory Control & Ledger">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-amsterdam-dark tracking-tight">
            Inventory & Stock Audit
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor real-time product quantities, restock items, and inspect immutable audit logs.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amsterdam-olive' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-3 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-3 px-2 text-xs sm:text-sm font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'stock'
              ? 'border-amsterdam-olive text-amsterdam-olive'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Live Stock Levels</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-2 text-xs sm:text-sm font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-amsterdam-olive text-amsterdam-olive'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Ledger / History</span>
        </button>
      </div>

      {/* TAB 1: Stock Levels */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-amsterdam-olive text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-card overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-amsterdam-olive animate-spin mb-2" />
                <span>Loading inventory data...</span>
              </div>
            ) : inventoryItems.length === 0 ? (
              <div className="py-16 text-center text-xs text-gray-400">
                No items found for this inventory filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-3 px-6">Product</th>
                      <th className="py-3 px-6">Category</th>
                      <th className="py-3 px-6">Unit Price</th>
                      <th className="py-3 px-6">Stock Level</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {inventoryItems.map((item) => (
                      <tr key={item.product_id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6 font-bold text-amsterdam-dark">
                          {item.product_name}
                        </td>
                        <td className="py-4 px-6 text-gray-500">
                          {item.category}
                        </td>
                        <td className="py-4 px-6 font-extrabold text-amsterdam-dark">
                          {formatTsh(item.price)}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-extrabold text-sm text-amsterdam-dark">
                            {item.stock_quantity}
                          </span>
                          <span className="text-[11px] text-gray-400 ml-1.5">
                            (alert at &le; {item.low_stock_threshold})
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => openAdjustModal(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amsterdam-muted text-amsterdam-olive-dark hover:bg-amsterdam-lime/30 text-xs font-bold transition-colors"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Adjust Stock</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: Inventory Audit Ledger */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-card overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-amsterdam-olive animate-spin mb-2" />
              <span>Loading ledger history...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-400">
              No inventory transactions recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-6">Timestamp</th>
                    <th className="py-3 px-6">Product</th>
                    <th className="py-3 px-6">Adjustment</th>
                    <th className="py-3 px-6">Stock Progression</th>
                    <th className="py-3 px-6">Type</th>
                    <th className="py-3 px-6">Reason / Reference</th>
                    <th className="py-3 px-6">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-4 px-6 font-bold text-amsterdam-dark">
                        {tx.product_name}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold">
                        {tx.quantity_change > 0 ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            +{tx.quantity_change}
                          </span>
                        ) : (
                          <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded">
                            {tx.quantity_change}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-gray-600">
                        {tx.previous_quantity} &rarr; <strong className="text-amsterdam-dark">{tx.new_quantity}</strong>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 max-w-xs truncate">
                        {tx.reason}
                      </td>
                      <td className="py-4 px-6 text-gray-500">
                        {tx.created_by_name || 'System Auto'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setAdjustModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 border border-gray-100 z-10 space-y-5">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Inventory Adjustment</span>
                <h3 className="font-display font-extrabold text-lg text-amsterdam-dark">
                  {selectedProduct.product_name}
                </h3>
              </div>
              <button
                onClick={() => setAdjustModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {adjustError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                {adjustError}
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              
              {/* Current vs Next Stock Projection */}
              <div className="bg-[#F9FAF6] p-4 rounded-2xl border border-gray-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-400 block uppercase text-[10px] font-bold">Current Stock</span>
                  <span className="font-display font-extrabold text-xl text-amsterdam-dark">
                    {selectedProduct.stock_quantity}
                  </span>
                </div>

                <ArrowRight className="w-5 h-5 text-gray-400" />

                <div className="text-right">
                  <span className="text-gray-400 block uppercase text-[10px] font-bold">New Result</span>
                  <span className="font-display font-extrabold text-xl text-amsterdam-olive-dark">
                    {Math.max(0, selectedProduct.stock_quantity + (parseInt(quantityChange, 10) || 0))}
                  </span>
                </div>
              </div>

              {/* Quantity Change Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Quantity Adjustment (+ to add, - to subtract) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50 or -5"
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono font-bold text-amsterdam-dark focus:outline-none focus:ring-2 focus:ring-amsterdam-olive/20 focus:border-amsterdam-olive"
                />
              </div>

              {/* Mandatory Reason */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Audit Reason (Mandatory) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Received new shipment from factory, or Damaged stock write-off"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-amsterdam-dark focus:outline-none focus:ring-2 focus:ring-amsterdam-olive/20 focus:border-amsterdam-olive resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-6 py-2 rounded-full bg-amsterdam-olive hover:bg-amsterdam-olive-dark text-white text-xs font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {adjusting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Boxes className="w-4 h-4" />}
                  <span>Commit Adjustment</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </AdminLayout>
  );
}
