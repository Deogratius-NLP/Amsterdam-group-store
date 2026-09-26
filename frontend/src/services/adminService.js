import api from './api';

export const adminService = {
  // Authentication
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Dashboard Overview
  async getDashboardMetrics() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Orders Management
  async getOrders({ search = '', status = '', limit = 50, offset = 0 } = {}) {
    const params = { limit, offset };
    if (search) params.search = search;
    if (status && status !== 'ALL') params.status = status;
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  async getOrder(orderId) {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  },

  async updateOrderStatus(orderId, status) {
    const response = await api.patch(`/admin/orders/${orderId}/status`, { status });
    return response.data;
  },

  async getOrderInvoice(orderId) {
    const response = await api.get(`/admin/orders/${orderId}/invoice`);
    return response.data;
  },

  // Products Management
  async getProducts({ search = '', category = '', is_active } = {}) {
    const params = {};
    if (search) params.search = search;
    if (category && category !== 'All') params.category = category;
    if (is_active !== undefined) params.is_active = is_active;
    const response = await api.get('/admin/products', { params });
    return response.data;
  },

  async getProduct(productId) {
    const response = await api.get(`/admin/products/${productId}`);
    return response.data;
  },

  async createProduct(productData) {
    const response = await api.post('/admin/products', productData);
    return response.data;
  },

  async updateProduct(productId, productData) {
    const response = await api.put(`/admin/products/${productId}`, productData);
    return response.data;
  },

  async deleteProduct(productId) {
    const response = await api.delete(`/admin/products/${productId}`);
    return response.data;
  },

  async uploadProductImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/admin/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Customers Management
  async getCustomers({ search = '', limit = 50, offset = 0 } = {}) {
    const params = { limit, offset };
    if (search) params.search = search;
    const response = await api.get('/admin/customers', { params });
    return response.data;
  },

  async getCustomer(customerId) {
    const response = await api.get(`/admin/customers/${customerId}`);
    return response.data;
  },

  // Inventory Management
  async getInventory(statusFilter = 'ALL') {
    const params = {};
    if (statusFilter && statusFilter !== 'ALL') {
      params.status_filter = statusFilter;
    }
    const response = await api.get('/admin/inventory', { params });
    return response.data;
  },

  async adjustInventory(productId, quantityChange, reason) {
    const response = await api.post('/admin/inventory/adjustments', {
      product_id: productId,
      quantity_change: parseInt(quantityChange, 10),
      reason: reason.trim()
    });
    return response.data;
  },

  async getInventoryTransactions({ productId = '', limit = 50, offset = 0 } = {}) {
    const params = { limit, offset };
    if (productId) params.product_id = productId;
    const response = await api.get('/admin/inventory/transactions', { params });
    return response.data;
  },

  // System Settings Management
  async getSettings() {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  async updateSettings(settingsData) {
    const response = await api.put('/admin/settings', settingsData);
    return response.data;
  },

  // Product Reordering
  async reorderProducts(productIds) {
    const response = await api.put('/admin/products/reorder', { product_ids: productIds });
    return response.data;
  },

  // Admin Security & Credentials
  async updateSecurity(securityData) {
    const response = await api.put('/auth/security', securityData);
    return response.data;
  }
};
