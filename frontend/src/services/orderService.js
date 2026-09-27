import api from './api';

export const orderService = {
  async createOrder(orderPayload) {
    const response = await api.post('/orders', orderPayload);
    return response.data;
  },

  async getOrderInvoice(orderNumber, token = null) {
    const url = token 
      ? `/orders/${orderNumber}/invoice?token=${encodeURIComponent(token)}`
      : `/orders/${orderNumber}/invoice`;
    const response = await api.get(url);
    return response.data;
  }
};
