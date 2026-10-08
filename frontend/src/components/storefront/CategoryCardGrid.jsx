import React from 'react';
import CategoryCard from './CategoryCard';
import { ANIMAL_CATEGORIES, filterProductsByAnimal } from '../../utils/animalCategories';

export default function CategoryCardGrid({
  products = [],
  onSelectCategory
}) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:gap-10">
      {ANIMAL_CATEGORIES.map((cat) => {
        const categoryProducts = filterProductsByAnimal(products, cat.id);
        return (
          <CategoryCard
            key={cat.id}
            category={cat}
            products={categoryProducts}
            onSelect={onSelectCategory}
          />
        );
      })}
    </div>
  );
}

