import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { ANIMAL_CATEGORIES } from '../../utils/animalCategories';

export default function CategoryFilter({
  selectedAnimalCategory = 'all',
  onSelectAnimalCategory,
  onShowCategoriesOverview
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
      {/* Overview Button */}
      {onShowCategoriesOverview && (
        <button
          type="button"
          onClick={onShowCategoriesOverview}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-white text-amsterdam-dark hover:bg-amsterdam-muted border border-gray-200/90 shadow-2xs transition-all hover:border-amsterdam-lime/50"
          title="Back to Animal Category Cards"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-amsterdam-olive" />
          <span>Category Cards</span>
        </button>
      )}

      {/* All Animals Pill */}
      <button
        type="button"
        onClick={() => onSelectAnimalCategory('all')}
        className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
          selectedAnimalCategory === 'all'
            ? 'bg-amsterdam-dark text-white shadow-xs'
            : 'bg-white text-gray-700 hover:bg-amsterdam-muted border border-gray-200/80'
        }`}
      >
        All Animals
      </button>

      {/* Animal Category Pills */}
      {ANIMAL_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelectAnimalCategory(cat.id)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            selectedAnimalCategory === cat.id
              ? 'bg-amsterdam-olive text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-amsterdam-muted border border-gray-200/80'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
