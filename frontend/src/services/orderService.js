import api from './api';

export const orderService = {
  async createOrder(orderPayload) {
    const response = await api.post('/orders', orderPayload);
    return response.data;
  },

  async getOrderInvoice(orderNumber) {
    const response = await api.get(`/orders/${orderNumber}/invoice`);
    return response.data;
  }
};
