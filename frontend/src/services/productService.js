import api from './api';
import { 
  enrichProductsList, 
  enrichProductWithAnimalCategories 
} from '../utils/animalCategories';

export const productService = {
  async getProducts({ search = '', category = '', coming_soon = false } = {}) {
    const params = {};
    if (search) params.search = search;
    if (category && category !== 'All') params.category = category;
    if (coming_soon !== undefined) params.coming_soon = coming_soon;

    const response = await api.get('/products', { params });
    return enrichProductsList(response.data);
  },

  async getProduct(productId) {
    const response = await api.get(`/products/${productId}`);
    return enrichProductWithAnimalCategories(response.data);
  },

  async getCategories() {
    const response = await api.get('/products/categories');
    return response.data;
  }
};
