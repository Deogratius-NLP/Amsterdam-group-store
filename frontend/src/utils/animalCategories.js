export const ANIMAL_CATEGORIES = [
  {
    id: 'hens-chickens',
    name: 'Chickens',
    subtitle: 'Poultry, Broilers, Layers & Chicks',
    tagline: 'Broilers, Layers & Day-Old Chicks',
    image: '/categories/hens-chickens.jpg',
    description: 'Feed grade vitamins, essential amino acids, egg boosters & flock health formulas.'
  },
  {
    id: 'pigs',
    name: 'Pigs',
    subtitle: 'Piglets, Sows & Grower Herds',
    tagline: 'Piglets, Growers & Breeding Sows',
    image: '/categories/pigs.jpg',
    description: 'Rapid growth accelerators, concentrated amino acids, mycotoxin defense & pen hygiene.'
  },
  {
    id: 'fishery',
    name: 'Fishery',
    subtitle: 'Tilapia, Catfish & Hatchery Ponds',
    tagline: 'Commercial Tilapia & Catfish Ponds',
    image: '/categories/fishery.jpg',
    description: 'Pond water sanitizers, aquatic mineralizers, biofilm cleansers & survival boosters.'
  },
  {
    id: 'cattle-dairy',
    name: 'Cattle & Ruminants',
    subtitle: 'Dairy Cows, Calves & Goats',
    tagline: 'Dairy Cows, Calves & Beef Herds',
    image: '/categories/cattle-dairy.jpg',
    description: 'Bone & skeletal density, rumen-bypass nutrition, calcium supplements & herd biosecurity.'
  }
];

const STORAGE_KEY = 'amsterdam_animal_categories_map';

// Sensible initial baseline mapping for seeded products (used only if not yet edited)
const DEFAULT_INITIAL_BY_NAME = {
  'vitamix': ['hens-chickens'],
  'vitamin chick': ['hens-chickens'],
  'vita-chick': ['hens-chickens'],
  'clear heat': ['hens-chickens'],
  'pig concentrate': ['pigs'],
  'selko': ['hens-chickens', 'pigs'],
  'maxcare': ['cattle-dairy', 'pigs']
};

export function getStoredCategoryMap() {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Error reading category map from localStorage:', e);
    return {};
  }
}

export function saveStoredCategoryMap(map) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Error saving category map to localStorage:', e);
  }
}

export function saveProductAnimalCategories(productId, categories) {
  if (!productId) return;
  const map = getStoredCategoryMap();
  map[productId] = Array.isArray(categories) ? categories : [];
  saveStoredCategoryMap(map);
}

export function enrichProductWithAnimalCategories(product) {
  if (!product) return product;

  const map = getStoredCategoryMap();

  // 1. If admin explicitly configured and saved this product in storage, respect it unconditionally
  if (map && product.id && map[product.id] !== undefined) {
    return {
      ...product,
      animal_categories: Array.isArray(map[product.id]) ? map[product.id] : []
    };
  }

  // 2. If the backend returned animal_categories (once deployed to production)
  if (product.animal_categories !== undefined && product.animal_categories !== null) {
    const parsed = Array.isArray(product.animal_categories)
      ? product.animal_categories
      : (typeof product.animal_categories === 'string' && product.animal_categories.trim()
        ? product.animal_categories.split(',').map((s) => s.trim()).filter(Boolean)
        : []);
    if (parsed.length > 0) {
      return {
        ...product,
        animal_categories: parsed
      };
    }
  }

  // 3. Fallback baseline by product name for uncustomized seed products
  const lowerName = (product.name || '').toLowerCase();
  for (const [key, defaultCats] of Object.entries(DEFAULT_INITIAL_BY_NAME)) {
    if (lowerName.includes(key)) {
      return {
        ...product,
        animal_categories: defaultCats
      };
    }
  }

  return {
    ...product,
    animal_categories: []
  };
}

export function enrichProductsList(products) {
  if (!Array.isArray(products)) return [];
  return products.map(enrichProductWithAnimalCategories);
}

/**
 * Filter products strictly by animal category.
 * If a product is NOT categorized under animalId, it will NOT appear.
 */
export function filterProductsByAnimal(products, animalId) {
  if (!animalId || animalId === 'all') return products;

  const category = ANIMAL_CATEGORIES.find((c) => c.id === animalId);
  if (!category) return products;

  return products.filter((p) => {
    const enriched = enrichProductWithAnimalCategories(p);
    const assignedList = Array.isArray(enriched.animal_categories)
      ? enriched.animal_categories.map((c) => String(c).toLowerCase().trim())
      : [];

    // STRICT: The product appears ONLY in the categories where it is assigned
    return assignedList.includes(animalId.toLowerCase());
  });
}
