import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Bell, Sparkles, MessageCircle } from 'lucide-react';
import { formatTsh } from '../../utils/currency';
import { useSettings } from '../../context/SettingsContext';
import { AMSTERDAM_WHATSAPP_NUMBER } from '../../utils/constants';

export default function ComingSoonSection({ products = [] }) {
  const { whatsappNumber } = useSettings();
  const activeWaNumber = whatsappNumber || AMSTERDAM_WHATSAPP_NUMBER;
  // If no coming soon products loaded from API, use authentic fallback pipeline items
  const defaultItems = [
    {
      id: 'cs-1',
      name: 'Pro-Gastro Poultry Probiotic',
      category: 'Upcoming Innovation',
      price: 35000,
      description: 'Advanced live microflora cultures replacing routine antibiotics.',
      primary_image_url: '/vitamix-sample.jpg'
    },
    {
      id: 'cs-2',
      name: 'Mega-Lact Dairy Bovine Pack',
      category: 'Upcoming Innovation',
      price: 55000,
      description: 'Rumen-bypass nutrition for East African dairy cow yield.',
      primary_image_url: '/vitamix-sample.jpg'
    },
    {
      id: 'cs-3',
      name: 'Aqua-Pur Fish Mineralizer',
      category: 'Upcoming Innovation',
      price: 40000,
      description: 'Essential pond trace minerals for fingerling survival.',
      primary_image_url: '/vitamix-sample.jpg'
    }
  ];

  const items = products && products.length > 0 ? products : defaultItems;
  const [activeIndex, setActiveIndex] = useState(0);

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const activeProduct = items[activeIndex] || items[0];

  return (
    <section id="coming-soon-section" className="py-16 sm:py-20 bg-gradient-to-b from-[#F9FAF7] to-[#F1F5EB]/60 overflow-hidden border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Section Heading (exact wording from Canva) */}
        <div className="max-w-xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amsterdam-muted text-amsterdam-olive-dark text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pipeline Innovations</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-amsterdam-dark tracking-tight">
            Coming Soon ...
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
            Our coming products, reach them before others because we care about our customers.
          </p>
        </div>

        {/* 3D Overlapping Carousel Stage (matching Canva layered card display) */}
        <div className="relative max-w-4xl mx-auto py-6 flex items-center justify-center min-h-[360px] sm:min-h-[420px]">
          
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg text-amsterdam-dark hover:bg-amsterdam-olive hover:text-white flex items-center justify-center transition-all hover:scale-110"
            aria-label="Previous preview"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg text-amsterdam-dark hover:bg-amsterdam-olive hover:text-white flex items-center justify-center transition-all hover:scale-110"
            aria-label="Next preview"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Cards Display Layer */}
          <div className="relative w-full flex items-center justify-center">
            
            {/* Left background card */}
            <div className="hidden sm:block absolute left-4 md:left-12 w-64 h-80 rounded-2xl bg-white/70 p-4 border border-gray-200 shadow-md transform -rotate-6 scale-90 blur-[0.5px] pointer-events-none opacity-60 transition-all duration-300">
              <div className="w-full h-44 rounded-xl bg-[#EAF2E2] mb-3 p-3 flex items-center justify-center">
                <img src="/vitamix-sample.jpg" alt="Preview" className="max-h-full opacity-50" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>

            {/* Center Active Hero Card (Elevated & in focus) */}
            <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-amsterdam-lime/30 transform hover:-translate-y-1 transition-all duration-300 text-left">
              
              {/* Product Frame */}
              <div className="relative w-full h-56 sm:h-64 rounded-2xl bg-gradient-to-b from-[#EFF6EA] to-[#E3EED9] p-4 flex items-center justify-center overflow-hidden mb-5 border border-amsterdam-lime/20">
                <img
                  src={activeProduct.primary_image_url || '/vitamix-sample.jpg'}
                  alt={activeProduct.name}
                  className="max-h-full max-w-full object-contain drop-shadow-xl hover:scale-105 transition-transform"
                  onError={(e) => { e.currentTarget.src = '/vitamix-sample.jpg'; }}
                />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amsterdam-olive text-white text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
                  In Formulation
                </span>
              </div>

              {/* Title & Info */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-amsterdam-olive uppercase tracking-wider">
                  {activeProduct.category}
                </span>
                <h3 className="font-display font-bold text-xl text-amsterdam-dark">
                  {activeProduct.name}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {activeProduct.description}
                </p>
              </div>

              {/* Action Bar */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">Target Price</span>
                  <span className="font-display font-extrabold text-base text-amsterdam-dark">
                    {formatTsh(activeProduct.price)}
                  </span>
                </div>

                <a
                  href={`https://wa.me/${activeWaNumber}?text=${encodeURIComponent(`Hello Amsterdam Group, I am interested in pre-ordering or getting updates about ${activeProduct.name}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-amsterdam-olive hover:bg-amsterdam-olive-dark text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Notify Me</span>
                </a>
              </div>

            </div>

            {/* Right background card */}
            <div className="hidden sm:block absolute right-4 md:right-12 w-64 h-80 rounded-2xl bg-white/70 p-4 border border-gray-200 shadow-md transform rotate-6 scale-90 blur-[0.5px] pointer-events-none opacity-60 transition-all duration-300">
              <div className="w-full h-44 rounded-xl bg-[#EAF2E2] mb-3 p-3 flex items-center justify-center">
                <img src="/vitamix-sample.jpg" alt="Preview" className="max-h-full opacity-50" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>

          </div>

        </div>

        {/* 5 Dot Indicators (exactly matching the 5 dots in Canva design) */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[0, 1, 2, 3, 4].map((dotIndex) => {
            const isDotActive = (activeIndex % 5) === dotIndex;
            return (
              <button
                key={dotIndex}
                onClick={() => setActiveIndex(dotIndex % items.length)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isDotActive
                    ? 'w-7 bg-amsterdam-lime ring-2 ring-amsterdam-lime/30'
                    : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to item ${dotIndex + 1}`}
              />
            );
          })}
        </div>

      </div>
    </section>
  );
}
