import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getProductImageUrl } from '../../utils/imageUrl';

export default function CategoryCard({ category, products = [], onSelect }) {
  const productCount = products.length;

  // Grab preview packshots (up to 3)
  const previewProducts = products.slice(0, 3);

  return (
    <div
      onClick={() => onSelect(category.id)}
      className="group relative bg-white rounded-3xl overflow-hidden border border-amsterdam-lime/30 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer select-none text-left ring-1 ring-black/[0.03]"
    >
      {/* Animal Photo Stage (Amazon-inspired visual banner) */}
      <div className="relative h-52 sm:h-64 md:h-72 lg:h-80 w-full overflow-hidden bg-gray-100 shrink-0">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          onError={(e) => {
            e.currentTarget.src = '/hero-bg.jpg';
          }}
        />

        {/* Ambient Gradient Wash for maximum contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-amsterdam-dark text-[11px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amsterdam-olive" />
            <span>Livestock</span>
          </span>

          <span className="px-3 py-1 rounded-full bg-amsterdam-olive text-white text-[11px] font-extrabold tracking-wider shadow-sm">
            {productCount} {productCount === 1 ? 'Product' : 'Products'}
          </span>
        </div>

        {/* Bottom Title on Image */}
        <div className="absolute bottom-3.5 inset-x-3.5">
          <p className="text-[11px] font-bold text-amsterdam-lime uppercase tracking-widest drop-shadow-sm mb-0.5">
            {category.tagline}
          </p>
          <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight drop-shadow-md">
            {category.name}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 space-y-4">
        {/* Subtitle & Description */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-amsterdam-olive uppercase tracking-wider block">
            {category.subtitle}
          </span>
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
            {category.description}
          </p>
        </div>

        {/* Product Packshot Previews (Amazon 3-item showcase) */}
        {previewProducts.length > 0 && (
          <div className="pt-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Featured Formulations:
            </span>
            <div className="flex items-center gap-2">
              {previewProducts.map((p) => {
                const img = getProductImageUrl(p.primary_image_url || p.images?.[0]?.image_url);
                return (
                  <div
                    key={p.id}
                    title={p.name}
                    className="w-12 h-12 rounded-xl bg-[#EFF6EA] border border-amsterdam-lime/30 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs group-hover:border-amsterdam-olive/50 transition-colors"
                  >
                    <img
                      src={img}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => { e.currentTarget.src = '/vitamix-sample.jpg'; }}
                    />
                  </div>
                );
              })}
              {productCount > 3 && (
                <span className="text-[11px] font-extrabold text-amsterdam-olive bg-amsterdam-lime/15 px-2.5 py-1 rounded-lg border border-amsterdam-lime/30">
                  +{productCount - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Card Footer: Explore CTA */}
        <div className="pt-4 border-t border-gray-100">
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl sm:rounded-full bg-amsterdam-olive hover:bg-amsterdam-olive-dark text-white text-sm sm:text-base font-bold transition-all shadow-sm"
          >
            <span>See Products</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
