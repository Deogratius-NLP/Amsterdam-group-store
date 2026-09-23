import React, { useState } from 'react';
import { X, ArrowLeft, Send, CheckCircle2, AlertCircle, Loader2, MapPin, User, Phone, FileText } from 'lucide-react';
import { formatTsh } from '../../utils/currency';
import { orderService } from '../../services/orderService';
import { getProductImageUrl } from '../../utils/imageUrl';

export default function OrderFormModal({ 
  product, 
  quantity, 
  cartItems = null,
  isOpen, 
  onClose, 
  onBack, 
  onOrderSuccess,
  pricingMode = 'RETAIL'
}) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_location: '',
    customer_notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isMultiItem = Array.isArray(cartItems) && cartItems.length > 0;

  if (!isOpen || (!product && !isMultiItem)) return null;

  const isWholesale = (pricingMode || '').toUpperCase() === 'WHOLESALE';
  const unitPrice = product
    ? isWholesale
      ? (parseFloat(product.wholesale_price) || parseFloat(product.price) || 0)
      : (parseFloat(product.retail_price) || parseFloat(product.price) || 0)
    : 0;

  const totalAmount = isMultiItem
    ? cartItems.reduce((acc, it) => {
        const isWs = (it.pricingMode || '').toUpperCase() === 'WHOLESALE';
        const price = isWs
          ? (parseFloat(it.product.wholesale_price) || parseFloat(it.product.price) || 0)
          : (parseFloat(it.product.retail_price) || parseFloat(it.product.price) || 0);
        return acc + price * it.quantity;
      }, 0)
    : unitPrice * (quantity || 1);

  const totalUnits = isMultiItem
    ? cartItems.reduce((acc, it) => acc + it.quantity, 0)
    : quantity || 1;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!formData.customer_phone.trim()) {
      setError('Please provide your phone number.');
      return;
    }
    if (!formData.customer_location.trim()) {
      setError('Please enter your delivery location (e.g. Kinondoni, Dar es Salaam).');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let orderPayload;
      if (isMultiItem) {
        const hasWholesale = cartItems.some(
          (it) => (it.pricingMode || '').toUpperCase() === 'WHOLESALE'
        );
        orderPayload = {
          customer_name: formData.customer_name.trim(),
          customer_phone: formData.customer_phone.trim(),
          customer_location: formData.customer_location.trim(),
          customer_notes: formData.customer_notes.trim() || null,
          pricing_mode: hasWholesale ? 'WHOLESALE' : 'RETAIL',
          items: cartItems.map((it) => ({
            product_id: it.product.id,
            quantity: it.quantity,
            pricing_mode: it.pricingMode || (hasWholesale ? 'WHOLESALE' : 'RETAIL'),
          })),
        };
      } else {
        orderPayload = {
          customer_name: formData.customer_name.trim(),
          customer_phone: formData.customer_phone.trim(),
          customer_location: formData.customer_location.trim(),
          customer_notes: formData.customer_notes.trim() || null,
          product_id: product.id,
          quantity: quantity,
          pricing_mode: isWholesale ? 'WHOLESALE' : 'RETAIL',
        };
      }

      const result = await orderService.createOrder(orderPayload);
      onOrderSuccess(result);
    } catch (err) {
      console.error('Order submission failed:', err);
      const detail = err.response?.data?.detail || 'Failed to submit order. Please check inventory and try again.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Modal Container */}
      <div 
        className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto z-10 border border-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-amsterdam-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <h3 className="font-display font-bold text-base text-amsterdam-dark">
            Complete Your Order
          </h3>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-amsterdam-dark flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Order Summary Snapshot */}
          {isMultiItem ? (
            <div className="bg-[#F8FAF5] p-4 rounded-2xl border border-amsterdam-lime/20 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                <span className="text-xs font-bold text-gray-700">
                  Cart Order ({cartItems.length} {cartItems.length === 1 ? 'product' : 'products'} • {totalUnits} {totalUnits === 1 ? 'unit' : 'units'})
                </span>
                <span className="text-xs font-extrabold text-amsterdam-olive-dark">
                  Total: {formatTsh(totalAmount)}
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-2 pr-1 divide-y divide-gray-100">
                {cartItems.map((it) => {
                  const itIsWs = (it.pricingMode || '').toUpperCase() === 'WHOLESALE';
                  const itPrice = itIsWs
                    ? (parseFloat(it.product.wholesale_price) || parseFloat(it.product.price) || 0)
                    : (parseFloat(it.product.retail_price) || parseFloat(it.product.price) || 0);
                  const itSubtotal = itPrice * it.quantity;
                  const rawItImg =
                    it.product.primary_image_url ||
                    (it.product.images && it.product.images[0]?.image_url);
                  const itImg = getProductImageUrl(rawItImg);
                  return (
                    <div
                      key={`${it.product.id}-${it.pricingMode}`}
                      className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <img
                          src={itImg}
                          alt={it.product.name}
                          className="w-9 h-9 object-contain rounded-lg border border-gray-200 p-0.5 bg-white shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = '/vitamix-sample.jpg';
                          }}
                        />
                        <div className="min-w-0 flex-1 truncate">
                          <p className="font-bold text-amsterdam-dark truncate">{it.product.name}</p>
                          <p className="text-[11px] text-gray-400">
                            {it.quantity} × {formatTsh(itPrice)}
                            <span
                              className={`ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                                itIsWs ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {itIsWs ? 'Wholesale' : 'Retail'}
                            </span>
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-amsterdam-dark shrink-0">
                        {formatTsh(itSubtotal)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : product ? (
            <div className="bg-[#F8FAF5] p-4 rounded-2xl border border-amsterdam-lime/20 flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-xl bg-white p-1 flex-shrink-0 flex items-center justify-center border border-gray-200">
                <img
                  src={getProductImageUrl(product.primary_image_url || (product.images && product.images[0]?.image_url))}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/vitamix-sample.jpg';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-display font-bold text-sm text-amsterdam-dark truncate">
                    {product.name}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold shrink-0 ${
                      isWholesale
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isWholesale ? 'Wholesale' : 'Retail'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Quantity: <span className="font-bold text-amsterdam-dark">{quantity}</span> × {formatTsh(unitPrice)}
                </p>
                <p className="text-sm font-extrabold text-amsterdam-olive-dark mt-0.5">
                  Total: {formatTsh(totalAmount)}
                </p>
              </div>
            </div>
          ) : null}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amsterdam-olive" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                name="customer_name"
                required
                placeholder="e.g. John Doe / Bakari Ally"
                value={formData.customer_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-amsterdam-dark focus:outline-none focus:ring-2 focus:ring-amsterdam-olive/20 focus:border-amsterdam-olive bg-white"
              />
            </div>

            {/* Customer Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amsterdam-olive" />
                <span>Phone Number (WhatsApp reachable) *</span>
              </label>
              <input
                type="tel"
                name="customer_phone"
                required
                placeholder="e.g. +255 712 345 678 or 0712345678"
                value={formData.customer_phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-amsterdam-dark focus:outline-none focus:ring-2 focus:ring-amsterdam-olive/20 focus:border-amsterdam-olive bg-white"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Order confirmation will be sent directly to our Amsterdam Group WhatsApp line.
              </span>
            </div>

            {/* Delivery Location (Free Text - matching specification) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amsterdam-olive" />
                <span>Delivery Location (Free Text) *</span>
              </label>
              <input
                type="text"
                name="customer_location"
                required
                placeholder="e.g. Kinondoni, Dar es Salaam or Arusha Town"
                value={formData.customer_location}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-amsterdam-dark focus:outline-none focus:ring-2 focus:ring-amsterdam-olive/20 focus:border-amsterdam-olive bg-white"
              />
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                <span>Special Instructions / Notes (Optional)</span>
              </label>
              <textarea
                name="customer_notes"
                rows={2}
                placeholder="e.g. Deliver before 4pm, call before delivery"
                value={formData.customer_notes}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm text-amsterdam-dark focus:outline-none focus:ring-2 focus:ring-amsterdam-olive/20 focus:border-amsterdam-olive bg-white resize-none"
              />
            </div>

          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-amsterdam-red hover:bg-amsterdam-red-hover text-white font-display font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>SUBMIT ORDER & OPEN WHATSAPP</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-gray-400 mt-2">
              Inventory is secured immediately upon submission. No payment needed now.
            </p>
          </div>

        </form>

      </div>
    </div>
  );
}
