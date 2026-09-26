import api from './api';

export const settingsService = {
  async getPublicSettings() {
    const response = await api.get('/settings/public');
    return response.data;
  }
};
