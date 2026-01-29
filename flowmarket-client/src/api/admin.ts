import { api } from './instance';

export const adminApi = {
  getUsers: async () => {
    const response = await api.get('/Admin/users');
    return response.data;
  },
  getOrders: async () => {
    const response = await api.get('/Admin/orders');
    return response.data;
  },
  getProducts: async (page = 1, search = '') => {
    const response = await api.get('/Admin/products', { params: { page, pageSize: 10, search } });
    return response.data;
  },
  deleteProduct: async (id: string) => {
    await api.delete(`/Admin/products/${id}`);
  }
};