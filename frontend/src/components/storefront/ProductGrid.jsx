import React from 'react';
import ProductCard from './ProductCard';
import { PackageOpen } from 'lucide-react';

export default function ProductGrid({
  products,
  loading,
  onSelectProduct,
  onResetSearch,
  pricingMode = 'RETAIL',
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-7 border border-amsterdam-lime/20 shadow-md animate-pulse flex flex-col justify-between h-[480px]"
          >
            <div className="w-full h-56 sm:h-64 bg-gray-100 rounded-2xl mb-5"></div>
            <div className="space-y-2 mb-4">
              <div className="w-24 h-3 bg-gray-200 rounded"></div>
              <div className="w-3/4 h-5 bg-gray-200 rounded"></div>
              <div className="w-full h-3 bg-gray-100 rounded"></div>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
              <div className="w-20 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 sm:p-12 text-center border border-gray-100 shadow-card flex flex-col items-center justify-center max-w-md mx-auto my-8">
        <div className="w-16 h-16 rounded-full bg-amsterdam-muted flex items-center justify-center mb-4">
          <PackageOpen className="w-8 h-8 text-amsterdam-olive" />
        </div>
        <h3 className="font-display font-bold text-lg text-amsterdam-dark mb-1">
          No Products Found
        </h3>
        <p className="text-xs text-gray-500 mb-5 max-w-xs">
          We could not find any products matching your active search or category filters.
        </p>
        <button
          onClick={onResetSearch}
          className="px-5 py-2.5 rounded-full bg-amsterdam-olive text-white text-xs font-bold hover:bg-amsterdam-olive-dark transition-colors shadow-sm"
        >
          View All Products
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={onSelectProduct}
          pricingMode={pricingMode}
        />
      ))}
    </div>
  );
}
