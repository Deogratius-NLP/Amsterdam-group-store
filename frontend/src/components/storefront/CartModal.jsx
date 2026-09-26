import React, { useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, AlertCircle, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatTsh } from '../../utils/currency';
import { getProductImageUrl } from '../../utils/imageUrl';

export default function CartModal({ isOpen, onClose, onProceedToCheckout }) {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItemsCount,
    totalAmount,
    getItemPrice,
  } = useCart();

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200 select-none">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col z-10 border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 sm:py-5 border-b border-gray-100 flex items-center justify-between bg-[#F8FAF5]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#8C1B2A] text-white flex items-center justify-center shadow-md">
              <ShoppingCart className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-lg sm:text-xl text-amsterdam-dark">
                Your Shopping Cart
              </h2>
              <p className="text-xs text-gray-500">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} selected
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-amsterdam-dark flex items-center justify-center transition-colors shadow-xs"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body / Items list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-gray-100">
          {cartItems.length === 0 ? (
            <div className="py-12 sm:py-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-lg text-amsterdam-dark mb-1">
                Your cart is empty
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mb-6">
                Explore our catalog to add authentic poultry vitamins, premixes, and farm solutions.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-amsterdam-olive hover:bg-amsterdam-olive-dark text-white text-xs font-bold transition-all shadow-sm"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => {
                const isWholesale = (item.pricingMode || '').toUpperCase() === 'WHOLESALE';
                const unitPrice = item.unitPrice !== undefined 
                  ? item.unitPrice 
                  : getItemPrice(item.product, item.pricingMode, item.package_id);
                const subtotal = unitPrice * item.quantity;
                const wholesaleMin = item.product.wholesale_minimum_quantity || 10;
                const minAllowed = isWholesale ? wholesaleMin : 1;
                const maxAvailable = item.product.stock_quantity || 9999;
                const rawImg =
                  item.product.primary_image_url ||
                  (item.product.images && item.product.images[0]?.image_url);
                const primaryImage = getProductImageUrl(rawImg);

                return (
                  <div
                    key={`${item.product.id}-${item.pricingMode}-${item.package_id || 'default'}`}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAFCF8] border border-gray-100 hover:border-amsterdam-lime/40 transition-colors"
                  >
                    {/* Thumbnail & Info */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 p-1 flex items-center justify-center shrink-0">
                        <img
                          src={primaryImage}
                          alt={item.product.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/vitamix-sample.jpg';
                          }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h4 className="font-display font-bold text-sm text-amsterdam-dark truncate">
                            {item.product.name}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-extrabold shrink-0 ${
                              isWholesale
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isWholesale ? 'Wholesale' : 'Retail'}
                          </span>
                        </div>
                        {item.package_name && (
                          <div className="mb-1">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-amsterdam-muted text-amsterdam-olive-dark text-[11px] font-bold">
                              {item.package_name}
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          {formatTsh(unitPrice)} per unit
                        </p>
                        {isWholesale && (
                          <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                            Min: {wholesaleMin} units
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls & Line Subtotal */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      {/* Plus / Minus Counter */}
                      <div className="flex items-center bg-white rounded-full p-1 border border-gray-200 shadow-xs">
                        <button
                          onClick={() => {
                            if (item.quantity <= minAllowed) {
                              if (!isWholesale && item.quantity === 1) {
                                removeFromCart(item.product.id, item.pricingMode, item.package_id);
                              }
                              return;
                            }
                            updateQuantity(item.product.id, item.pricingMode, item.quantity - 1, item.package_id);
                          }}
                          disabled={isWholesale && item.quantity <= minAllowed}
                          className="w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-200 text-amsterdam-dark flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-9 text-center font-display font-bold text-xs text-amsterdam-dark">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            if (item.quantity < maxAvailable) {
                              updateQuantity(item.product.id, item.pricingMode, item.quantity + 1, item.package_id);
                            }
                          }}
                          disabled={item.quantity >= maxAvailable}
                          className="w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-200 text-amsterdam-dark flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[90px]">
                        <span className="font-display font-bold text-sm text-amsterdam-dark block">
                          {formatTsh(subtotal)}
                        </span>
                      </div>

                      {/* Delete item button */}
                      <button
                        onClick={() => removeFromCart(item.product.id, item.pricingMode, item.package_id)}
                        className="w-8 h-8 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-6 bg-white border-t border-gray-100 space-y-4">
            {/* Total Calculation */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 font-semibold block uppercase">
                  Total Order Amount
                </span>
                <span className="text-xs text-gray-400">
                  {totalItemsCount} units across {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="text-right">
                <span className="font-display font-black text-2xl text-amsterdam-dark">
                  {formatTsh(totalAmount)}
                </span>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={clearCart}
                className="w-full sm:w-auto px-4 py-3 rounded-full border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cart</span>
              </button>

              <button
                onClick={() => {
                  onProceedToCheckout(cartItems);
                  onClose();
                }}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-full bg-[#8C1B2A] hover:bg-[#721522] text-white font-display font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
              >
                <span>PROCEED TO CHECKOUT ({totalItemsCount} ITEMS)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
