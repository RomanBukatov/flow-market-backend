import { api } from './instance';
import type { Product } from '../types/catalog';

export const catalogApi = {
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/Products');
    return response.data;
  }
};