import { api } from './instance';
import type { Product, PagedResponse } from '../types/catalog';

export const catalogApi = {
  getProducts: async (pageNumber = 1, pageSize = 12): Promise<PagedResponse<Product>> => {
    const response = await api.get<PagedResponse<Product>>('/Products', {
      params: { page: pageNumber, pageSize }
    });
    return response.data;
  }
};