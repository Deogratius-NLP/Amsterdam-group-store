import React, { useState } from 'react';
import { formatTsh, formatAmountNumber } from '../../utils/currency';
import { ArrowRight, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getProductImageUrl } from '../../utils/imageUrl';

export default function ProductCard({ product, onClick, pricingMode = 'RETAIL' }) {
  // Resolve primary packshot image with fallback
  const rawImage = product.primary_image_url || (product.images && product.images[0]?.image_url);
  const primaryImage = getProductImageUrl(rawImage);

  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;
  const isOutOfStock = product.stock_quantity <= 0;
  const isWholesale = (pricingMode || '').toUpperCase() === 'WHOLESALE';
  const activePrice = isWholesale ? (product.wholesale_price || product.price) : (product.retail_price || product.price);
  const wholesaleMin = product.wholesale_minimum_quantity || 10;

  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  return (
    <div
      onClick={() => onClick(product)}
      className="group relative z-10 w-full bg-white rounded-3xl p-6 sm:p-7 shadow-xl hover:shadow-2xl border border-amsterdam-lime/30 ring-1 ring-black/[0.04] transform hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer select-none text-left"
    >
      {/* Product Image Stage (exact Coming Soon h-56 sm:h-64 frame & studio packshot quality) */}
      <div className="relative w-full h-56 sm:h-64 rounded-2xl bg-gradient-to-b from-[#EFF6EA] to-[#E3EED9] p-4 flex items-center justify-center overflow-hidden mb-5 border border-amsterdam-lime/20 group-hover:bg-[#E5EFE0] transition-colors shrink-0">
        <img
          src={primaryImage}
          alt={product.name}
          className="max-h-full max-w-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/vitamix-sample.jpg';
          }}
        />

        {/* Wholesale Mode Indicator Pill */}
        {isWholesale && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
            Wholesale
          </span>
        )}

        {/* Stock Status Badge (matching Coming Soon "In Formulation" badge placement and styling) */}
        {isOutOfStock ? (
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-600 text-white text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
            Only {product.stock_quantity} left
          </span>
        ) : (
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amsterdam-olive text-white text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
            In Stock
          </span>
        )}
      </div>

      {/* Title & Info (exact Coming Soon layout: category tag above title, description below) */}
      <div className="space-y-1.5 shrink-0">
        <span className="text-[11px] font-bold text-amsterdam-olive uppercase tracking-wider block">
          {product.category}
        </span>
        <h3 className="font-display font-bold text-xl text-amsterdam-dark group-hover:text-amsterdam-olive transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {product.description || 'Premium agricultural and veterinary quality product from Amsterdam Group.'}
        </p>
      </div>

      {/* Price & Action Section (exact layout from uploaded design) */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-3 shrink-0">
        {/* Price Row: 25,000 /= */}
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-xl sm:text-2xl text-amsterdam-dark tracking-tight">
              {formatAmountNumber(activePrice)} /=
            </span>
          </div>
          {isWholesale && (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Min: {wholesaleMin} units
            </span>
          )}
        </div>

        {/* Buttons Row: Left 'cart' (rounded rectangle, white, red stroke, red vector), Right 'Order' (dark green like stock tag, arrow) */}
        <div className="flex items-center justify-between gap-3 w-full">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isOutOfStock) return;
              const addedQty = isWholesale ? wholesaleMin : 1;
              addToCart(product, addedQty, pricingMode);
              setJustAdded(true);
              setTimeout(() => setJustAdded(false), 1200);
            }}
            disabled={isOutOfStock}
            title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
            className="min-w-[100px] sm:min-w-[115px] py-2 px-5 sm:px-6 rounded-2xl bg-white hover:bg-red-50/60 border-2 border-[#8C1B2A] text-[#8C1B2A] font-display font-bold text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transform active:scale-95 text-center"
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4 text-[#8C1B2A] stroke-[2.5]" />
                <span>added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 text-[#8C1B2A] stroke-[2.2]" />
                <span>cart</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick(product);
            }}
            className="min-w-[100px] sm:min-w-[115px] py-2 px-5 sm:px-6 rounded-2xl bg-amsterdam-olive hover:bg-amsterdam-olive-dark text-white font-display font-bold text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 text-center group/order"
          >
            <span>Order</span>
            <ArrowRight className="w-4 h-4 text-white group-hover/order:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
