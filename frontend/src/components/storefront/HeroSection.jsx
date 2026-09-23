import React from 'react';
import { Search, X } from 'lucide-react';

export default function HeroSection({ searchQuery, setSearchQuery }) {
  return (
    <section className="relative w-full overflow-hidden bg-[#E5E2DC]">
      {/* Authentic Showroom Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/hero-bg.jpg"
        className="absolute inset-0 w-full h-full object-cover object-center select-none"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* User Request 4: Green color layer #87cd49 with 33% transparency on top of background image */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{ backgroundColor: '#87cd49', opacity: 0.33 }}
      ></div>

      {/* User Request 3: Red gradient at top matching navigation bar */}
      <div className="absolute top-0 inset-x-0 h-32 sm:h-44 bg-gradient-to-b from-[#8C1B2A]/90 via-[#8C1B2A]/35 to-transparent pointer-events-none z-[3]"></div>

      {/* 1. Showroom Visual Stage with Plane "Shop" Typography */}
      <div className="relative w-full h-[380px] sm:h-[440px] md:h-[500px] lg:h-[580px] flex items-end justify-center pointer-events-none select-none">
        {/* The word "Shop" - Plane (flat, no 3D, not animated), large covering hero, reaching middle on mobile and touching bottom */}
        <div className="absolute bottom-0 inset-x-0 h-[55%] sm:h-[58%] md:h-[60%] flex items-end justify-center pointer-events-none z-10 leading-none select-none">
          <h1 className="sr-only">Shop</h1>
          <svg
            className="w-[94%] sm:w-[88%] md:w-[84%] lg:max-w-5xl h-full select-none"
            viewBox="0 0 420 215"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <text
              x="210"
              y="195"
              textAnchor="middle"
              fill="#BEFA89"
              fontFamily="'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif"
              fontWeight="900"
              fontSize="235"
              textLength="410"
              lengthAdjust="spacingAndGlyphs"
            >
              Shop
            </text>
          </svg>
        </div>
      </div>

      {/* 2. Docked Product Bar:
          - Not full length: w-[94%] sm:w-[88%] md:w-[85%] max-w-6xl centered
          - Side margins covered by showroom background image and green layer
          - Lengthened up / raised upward (-mt-7 sm:-mt-9 md:-mt-12) to conceal letter endings of "Shop"
          - Rounded top corners
      */}
      <div className="relative z-20 flex justify-center px-3 sm:px-6">
        <div className="w-[94%] sm:w-[88%] md:w-[85%] max-w-6xl bg-white rounded-t-[28px] sm:rounded-t-[36px] shadow-lg border-t border-gray-100/80 px-6 sm:px-10 pt-6 pb-5 sm:pt-7 sm:pb-6 md:pt-8 md:pb-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 -mt-7 sm:-mt-9 md:-mt-12">
          
          {/* Left: "Order What You Need" in dark green */}
          <h2 className="font-display font-extrabold text-xl sm:text-2xl md:text-3xl text-[#2F5A18] tracking-tight text-center sm:text-left">
            Order What You Need
          </h2>

          {/* Right: Search Pill with green border and green Search label */}
          <div className="w-full sm:w-auto flex items-center justify-center gap-3">
            <div className="w-full sm:w-72 md:w-80 relative flex items-center">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-gray-900 placeholder-gray-400 text-sm font-medium rounded-full pl-5 pr-11 py-2.5 border-2 border-[#87CD49] shadow-sm focus:outline-none focus:border-[#4F772D] focus:ring-2 focus:ring-[#87CD49]/30 transition-all"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Clear search"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <div className="absolute right-3.5 pointer-events-none text-[#569123] flex items-center">
                  <Search className="w-4 h-4" />
                </div>
              )}
            </div>

            <span className="hidden sm:inline-block font-display font-bold text-base text-[#2F5A18]">
              Search
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
