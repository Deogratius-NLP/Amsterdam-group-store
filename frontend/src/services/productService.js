import api from './api';

export const productService = {
  async getProducts({ search = '', category = '', coming_soon = false } = {}) {
    const params = {};
    if (search) params.search = search;
    if (category && category !== 'All') params.category = category;
    if (coming_soon !== undefined) params.coming_soon = coming_soon;

    const response = await api.get('/products', { params });
    return response.data;
  },

  async getProduct(productId) {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  async getCategories() {
    const response = await api.get('/products/categories');
    return response.data;
  }
};
