import { api } from './instance';

export const adminApi = {
  getUsers: async () => {
    const response = await api.get('/Admin/users');
    return response.data;
  },
  getOrders: async () => {
    const response = await api.get('/Admin/orders');
    return response.data;
  }
};