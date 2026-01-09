import { api } from './instance';
import type { Product, PagedResponse, ProductFilter } from '../types/catalog';

export const catalogApi = {
  getProducts: async (page = 1, pageSize = 48, filters?: ProductFilter): Promise<PagedResponse<Product>> => {
    const response = await api.get<PagedResponse<Product>>('/Products', {
      params: {
        page,
        pageSize,
        ...filters // Разворачиваем фильтры в query-параметры
      }
    });
    return response.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/Products/${id}`);
    return response.data;
  }
};