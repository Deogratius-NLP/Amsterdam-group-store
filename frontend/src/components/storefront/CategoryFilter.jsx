import React from 'react';

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
      <button
        onClick={() => onSelectCategory('All')}
        className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all ${
          selectedCategory === 'All'
            ? 'bg-amsterdam-olive text-white shadow-xs'
            : 'bg-white text-gray-700 hover:bg-amsterdam-muted border border-gray-200/80'
        }`}
      >
        All Products
      </button>

      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === cat
              ? 'bg-amsterdam-olive text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-amsterdam-muted border border-gray-200/80'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
