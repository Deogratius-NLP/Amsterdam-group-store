import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatTsh } from '../../utils/currency';

export default function FloatingCartButton() {
  const { totalItemsCount, totalAmount, openCart, cartAnimationTrigger } = useCart();
  const [bouncing, setBouncing] = useState(false);

  // Trigger bounce effect on add to cart
  useEffect(() => {
    if (cartAnimationTrigger > 0) {
      setBouncing(true);
      const timer = setTimeout(() => setBouncing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [cartAnimationTrigger]);

  if (totalItemsCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 group select-none">
      {/* Red and White Vector Cart Floating Button */}
      <button
        onClick={openCart}
        aria-label={`View shopping cart with ${totalItemsCount} items`}
        className={`relative flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#8C1B2A] hover:bg-[#721522] text-white shadow-2xl hover:shadow-[0_12px_28px_rgba(140,27,42,0.45)] border-2 border-white ring-4 ring-[#8C1B2A]/20 transition-all duration-300 transform active:scale-95 cursor-pointer ${
          bouncing ? 'animate-bounce scale-110' : 'hover:scale-105'
        }`}
      >
        {/* White Vector Cart Icon */}
        <div className="relative flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 sm:w-9 sm:h-9 text-white stroke-[2.2] drop-shadow-md" />
        </div>

        {/* Counter Badge */}
        <span className="absolute -top-1.5 -right-1.5 min-w-[26px] h-[26px] px-1.5 rounded-full bg-white text-[#8C1B2A] font-display font-extrabold text-xs flex items-center justify-center shadow-lg border-2 border-[#8C1B2A]">
          {totalItemsCount > 99 ? '99+' : totalItemsCount}
        </span>
      </button>

      {/* Floating mini summary chip on hover (Desktop) */}
      <div className="hidden sm:block absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-y-1 group-hover:translate-y-0 whitespace-nowrap">
        <div className="bg-[#1D2919] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xl border border-white/10 flex items-center gap-2">
          <span>{totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in cart</span>
          <span className="text-[#A2E048] font-bold">•</span>
          <span className="text-[#A2E048] font-bold">{formatTsh(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
