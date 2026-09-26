import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, ShieldCheck, Truck, Check, AlertCircle, ShoppingCart, BookOpen } from 'lucide-react';
import { formatTsh } from '../../utils/currency';
import ImageCarousel from './ImageCarousel';
import { useCart } from '../../context/CartContext';

// Helper to provide realistic, category-accurate instructions for products
const getProductInstructions = (product) => {
  if (!product) return [];

  // If product already has instructions defined in data (array or string)
  if (Array.isArray(product.how_to_use) && product.how_to_use.length > 0) {
    return product.how_to_use;
  }
  if (Array.isArray(product.instructions) && product.instructions.length > 0) {
    return product.instructions;
  }
  if (typeof product.how_to_use === 'string' && product.how_to_use.trim()) {
    return product.how_to_use.split('\n').map(s => s.trim().replace(/^\d+[\.\)]\s*/, '')).filter(Boolean);
  }
  if (typeof product.instructions === 'string' && product.instructions.trim()) {
    return product.instructions.split('\n').map(s => s.trim().replace(/^\d+[\.\)]\s*/, '')).filter(Boolean);
  }

  const name = (product.name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();

  // Water sanitizers / disinfectants / biosecurity
  if (name.includes('cleanse') || name.includes('sanitizer') || name.includes('shield') || name.includes('disinfect') || category.includes('biosecurity')) {
    return [
      "Thoroughly clean and rinse drinkers, water pipes, and storage tanks prior to sanitizing.",
      "Dilute 1ml to 2ml per 10 Litres of fresh drinking water (or 5ml per 1L for terminal house disinfection).",
      "Allow the treated solution to circulate through the system for at least 30 minutes before poultry access.",
      "Administer continuously during clean-out periods, or 2 to 3 days per week during production cycles.",
      "Store the concentrated bottle tightly sealed in a cool, dry place away from direct sunlight."
    ];
  }

  // Electrolytes / Rehydration / Heat stress
  if (name.includes('electrolyte') || name.includes('aqua-vita') || name.includes('vita-chick') || desc.includes('electrolyte') || desc.includes('rehydration')) {
    return [
      "Dissolve 100g in 200 Litres of clean drinking water (or approx. 1 teaspoon per 5 Litres).",
      "Mix thoroughly until completely dissolved before filling drinking fountains or bell drinkers.",
      "Provide as the exclusive drinking water source during hot weather, post-vaccination, or transit arrival.",
      "Prepare fresh electrolyte solution daily; discard any remaining unconsumed solution after 24 hours.",
      "Administer for 3 to 5 consecutive days during stress periods or high ambient temperatures."
    ];
  }

  // Chick starter / Day-old chicks formula
  if (name.includes('chick') || desc.includes('day-old') || desc.includes('starter pack')) {
    return [
      "Mix 1g to 2g per Litre of clean drinking water for the first 5 to 7 days of the chick's arrival.",
      "Ensure drinking water is at room temperature (20°C - 25°C) before introducing to the brooder.",
      "Provide ad-libitum access alongside starter crumbs to jumpstart digestive enzyme secretion.",
      "Replace drinking water twice daily (morning and evening) to maintain maximum freshness and hygiene.",
      "Transition chicks to Vitamix Plus or standard grower regimen after the initial first week."
    ];
  }

  // Egg Max / Layers / Shell / Bone & Calcium supplements
  if (name.includes('layer') || name.includes('egg') || name.includes('calci') || name.includes('shell') || desc.includes('layer') || desc.includes('shell fractures')) {
    return [
      "For Feed Mixing: Blend 1kg to 2kg thoroughly per 100kg of finished commercial layer feed.",
      "For Drinking Water: Dissolve 1g per 2 Litres of water during peak laying or cracked shell alerts.",
      "Ensure uniform dispersion in mash or pellet feed to avoid uneven mineral consumption.",
      "Administer daily throughout the active egg production cycle, especially from week 18 onwards.",
      "Store in an airtight container in a dry location to prevent moisture absorption and caking."
    ];
  }

  // Toxin binder / Feed additives / Mycotoxin
  if (name.includes('toxi') || name.includes('binder') || name.includes('mycotoxin') || desc.includes('aflatoxin')) {
    return [
      "Incorporate 1kg to 2kg per metric ton (1,000kg) of complete poultry feed during milling.",
      "For small-scale farms: Thoroughly pre-mix 100g with 5kg of feed before blending into the full 100kg batch.",
      "Ensure homogeneous blending so every bird receives balanced mycotoxin defense.",
      "Use continuously whenever humidity is elevated or feed grain storage moisture exceeds 13%.",
      "Keep the sack tightly closed to protect the active aluminosilicates from ambient moisture."
    ];
  }

  // Herbal / Immuno / Respiratory
  if (name.includes('herbal') || name.includes('immuno') || name.includes('botanical') || desc.includes('essential oils')) {
    return [
      "Mix 1kg per 500kg of feed (or 2g per Litre of warm drinking water for liquid dispersal).",
      "Administer for 5 to 7 consecutive days during seasonal weather shifts or viral challenge outbreaks.",
      "Stir or agitate thoroughly to ensure active botanical essential oils remain evenly suspended.",
      "Safe to use concurrently with routine vaccination and nutritional programs.",
      "Seal container securely after each use to preserve essential aromatic phytonutrients."
    ];
  }

  // General Feed Grade Vitamins / Premix (Vitamix Plus, Vital-Amino, etc.)
  if (category.includes('vitamin') || name.includes('vitamix') || name.includes('vital') || name.includes('booster')) {
    return [
      "Drinking Water Dosage: Dissolve 1g per 2 to 4 Litres of fresh drinking water.",
      "Feed Dosage: Mix 100g to 200g per 100kg of complete poultry feed or mash.",
      "Administer for 5 to 7 consecutive days during stress, brooding, molting, or peak growth stages.",
      "Prepare fresh solution each morning and protect drinkers from direct heat and direct sunlight.",
      "Store in a cool, dark, and dry environment below 25°C to preserve vitamin potency."
    ];
  }

  // Universal livestock fallback
  return [
    "Carefully measure the recommended dosage according to the flock size and age bracket.",
    "Dissolve evenly in clean drinking water (1g to 2g per Litre) or blend thoroughly into finished feed.",
    "Provide fresh mixture daily and ensure clean drinkers are accessible to all birds.",
    "Continue standard administration for 5 to 7 consecutive days or as advised by your veterinary officer.",
    "Store in a cool, dry place away from direct sunlight, sealed tightly after every use."
  ];
};

export default function ProductDetailsModal({ 
  product, 
  isOpen, 
  onClose, 
  onProceedToOrder,
  pricingMode = 'RETAIL'
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [validationError, setValidationError] = useState('');
  const { addToCart } = useCart();
  const [cartSuccess, setCartSuccess] = useState(false);
  const instructions = getProductInstructions(product);

  const isWholesale = (pricingMode || '').toUpperCase() === 'WHOLESALE';
  const wholesaleMin = product?.wholesale_minimum_quantity || 10;
  const minAllowed = isWholesale ? wholesaleMin : 1;
  const maxAvailable = product?.stock_quantity || 0;
  const isOutOfStock = maxAvailable <= 0;
  const isLowStock = maxAvailable > 0 && maxAvailable <= (product?.low_stock_threshold || 5);

  // Initialize selected package when product changes
  useEffect(() => {
    if (product?.packages && product.packages.length > 0) {
      setSelectedPackage(product.packages[0]);
    } else {
      setSelectedPackage(null);
    }
  }, [product]);

  const unitPrice = selectedPackage
    ? isWholesale
      ? parseFloat(selectedPackage.wholesale_price) || 0
      : parseFloat(selectedPackage.retail_price) || 0
    : product
      ? isWholesale
        ? parseFloat(product.wholesale_price) || parseFloat(product.price) || 0
        : parseFloat(product.retail_price) || parseFloat(product.price) || 0
      : 0;

  const subtotal = unitPrice * quantity;

  // Reset quantity whenever a new product or mode is selected
  useEffect(() => {
    if (product) {
      const isWs = (pricingMode || '').toUpperCase() === 'WHOLESALE';
      const initial = isWs ? (product.wholesale_minimum_quantity || 10) : 1;
      setQuantity(Math.min(product.stock_quantity || 0, initial));
      setValidationError('');
    }
  }, [product, pricingMode]);

  // Handle ESC key to close
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

  if (!isOpen || !product) return null;

  const handleDecrement = () => {
    if (isWholesale && quantity <= wholesaleMin) {
      setValidationError(`Wholesale orders require a minimum of ${wholesaleMin} units for this product.`);
      return;
    }
    setValidationError('');
    setQuantity((prev) => Math.max(minAllowed, prev - 1));
  };

  const handleIncrement = () => {
    setValidationError('');
    setQuantity((prev) => Math.min(maxAvailable, prev + 1));
  };

  const handleOrderClick = () => {
    if (isOutOfStock) return;
    if (isWholesale && quantity < wholesaleMin) {
      setValidationError(`Wholesale orders require a minimum of ${wholesaleMin} units for this product.`);
      return;
    }
    onProceedToOrder(product, quantity, selectedPackage);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Modal Card */}
      <div 
        className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto z-10 border border-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-amsterdam-dark flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Container (Desktop 2 Columns: LEFT details, RIGHT carousel. Mobile: Stacked carousel top, details bottom) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 p-6 sm:p-8">
          
          {/* MOBILE ORDER: On mobile (<md), carousel shows first at the top */}
          <div className="md:col-span-6 md:order-2 flex flex-col items-center justify-center">
            <ImageCarousel
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* LEFT SIDE (Desktop: order-1) */}
          <div className="md:col-span-6 md:order-1 flex flex-col justify-between space-y-4">
            <div>
              {/* Category & Stock Tag & Mode */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amsterdam-muted text-amsterdam-olive-dark">
                  {product.category}
                </span>

                <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                  isWholesale ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isWholesale ? 'Wholesale Tier' : 'Retail Tier'}
                </span>
                
                {isOutOfStock ? (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                    Low Stock: {maxAvailable} remaining
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <Check className="w-3 h-3" /> In Stock ({maxAvailable} units)
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-amsterdam-dark tracking-tight leading-snug">
                {product.name}
              </h2>

              {/* Price Banner */}
              <div className="mt-2.5 flex flex-wrap items-baseline gap-2">
                <span className="text-xs text-gray-400 font-semibold uppercase">
                  {isWholesale ? 'Wholesale Unit Price:' : 'Unit Price:'}
                </span>
                <span className="font-display font-extrabold text-2xl text-amsterdam-dark tracking-tight">
                  {formatTsh(unitPrice)}
                </span>
                {isWholesale && (
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Minimum: {wholesaleMin} units
                  </span>
                )}
              </div>

              {/* Package Variation Selector (e.g. 30g, 100g, 250g) */}
              {product.packages && product.packages.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Package Size: <span className="text-amsterdam-olive-dark font-extrabold">{selectedPackage?.package_name}</span>
                    </span>
                    <span className="text-[11px] text-gray-400">Select package</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.packages.map((pkg) => {
                      const isSelected = selectedPackage?.id === pkg.id || selectedPackage?.package_name === pkg.package_name;
                      const pkgPrice = isWholesale ? pkg.wholesale_price : pkg.retail_price;
                      return (
                        <button
                          key={pkg.id || pkg.package_name}
                          type="button"
                          onClick={() => setSelectedPackage(pkg)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                            isSelected
                              ? 'bg-amsterdam-dark text-white border-amsterdam-dark shadow-sm ring-2 ring-amsterdam-olive/20'
                              : 'bg-[#F8FAF5] hover:bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          <span>{pkg.package_name}</span>
                          <span className={`text-[10px] font-semibold ${isSelected ? 'text-amsterdam-lime' : 'text-gray-500'}`}>
                            {formatTsh(pkgPrice)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Description</h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {product.description || 'Formulated specifically for East African agricultural and livestock performance. Tested and certified for quality assurance.'}
                </p>
              </div>

              {/* How to Use (Instructions) - Scrollable numbered steps */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amsterdam-dark flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amsterdam-olive" />
                    <span>How to Use</span>
                  </h4>
                  <span className="text-[10px] font-medium text-gray-400">Scroll for steps</span>
                </div>

                <div className="max-h-24 sm:max-h-28 overflow-y-auto pr-1.5 space-y-2 rounded-xl bg-[#F8FAF5] p-2.5 border border-gray-200/80 text-xs">
                  {instructions.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#EBF7D4] text-[#4F772D] font-bold text-[10px] flex items-center justify-center border border-[#D5ECC2]">
                        {idx + 1}
                      </span>
                      <p className="text-gray-700 leading-relaxed font-normal text-xs">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Specifications & Trust Highlights */}
              <div className="mt-3 grid grid-cols-2 gap-2.5 pt-1">
                <div className="bg-[#F8FAF5] p-2.5 rounded-xl border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Guarantee</span>
                  <span className="text-xs font-semibold text-amsterdam-dark">100% Genuine Formula</span>
                </div>
                <div className="bg-[#F8FAF5] p-2.5 rounded-xl border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Delivery</span>
                  <span className="text-xs font-semibold text-amsterdam-dark">Tanzania-wide Delivery</span>
                </div>
              </div>
            </div>

            {/* Ordering Controls & Quantity Selection */}
            <div className="pt-4 border-t border-gray-100 space-y-3.5">
              
              {!isOutOfStock ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-700 block">Select Quantity</span>
                      <span className="text-[11px] text-gray-400">
                        {isWholesale ? `Min wholesale: ${wholesaleMin} • ` : ''}Available: {maxAvailable} units
                      </span>
                    </div>

                    {/* Interactive Quantity Selector */}
                    <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
                      <button
                        onClick={handleDecrement}
                        disabled={quantity <= (isWholesale ? wholesaleMin : 1)}
                        className="w-8 h-8 rounded-full bg-white text-amsterdam-dark flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs transition-all"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center font-display font-bold text-sm text-amsterdam-dark">
                        {quantity}
                      </span>
                      <button
                        onClick={handleIncrement}
                        disabled={quantity >= maxAvailable}
                        className="w-8 h-8 rounded-full bg-white text-amsterdam-dark flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs transition-all"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Minimum Quantity Warning */}
                  {validationError && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  {/* Subtotal preview */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amsterdam-muted/60 border border-amsterdam-lime/20">
                    <span className="text-xs font-semibold text-amsterdam-olive-dark">
                      Subtotal ({quantity} {quantity === 1 ? 'unit' : 'units'}):
                    </span>
                    <span className="font-display font-extrabold text-base text-amsterdam-dark">
                      {formatTsh(subtotal)}
                    </span>
                  </div>

                  {/* Action Buttons: Add to Cart + Order Now */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (isOutOfStock) return;
                        if (isWholesale && quantity < wholesaleMin) {
                          setValidationError(`Wholesale orders require a minimum of ${wholesaleMin} units for this product.`);
                          return;
                        }
                        addToCart(product, quantity, pricingMode, selectedPackage);
                        setCartSuccess(true);
                        setTimeout(() => setCartSuccess(false), 2000);
                      }}
                      disabled={isOutOfStock}
                      className={`w-full sm:w-1/2 py-3.5 px-4 rounded-full font-display font-bold text-sm transition-all flex items-center justify-center gap-2 border shadow-sm ${
                        cartSuccess
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white hover:bg-[#8C1B2A] text-[#8C1B2A] hover:text-white border-[#8C1B2A]'
                      } transform active:scale-[0.99] cursor-pointer`}
                    >
                      {cartSuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>ADDED TO CART! ✓</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>ADD TO CART</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleOrderClick}
                      className="w-full sm:flex-1 py-3.5 px-4 rounded-full bg-amsterdam-olive hover:bg-amsterdam-olive-dark text-white font-display font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-[0.99] cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>ORDER NOW — {formatTsh(subtotal)}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center">
                  <p className="text-sm font-bold text-red-700">Currently Out of Stock</p>
                  <p className="text-xs text-red-600 mt-1">
                    New inventory is arriving soon. Please contact us via WhatsApp to reserve units.
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
