import { api } from './instance';
import type { CreateShopDto, Shop, CreateProductDto, SellerOrder, UpdateShopDto } from '../types/seller';

export const shopApi = {
  // --- МАГАЗИН ---
  // Получить мои магазины (берем первый, т.к. у нас пока 1 магазин на юзера)
  getMyShop: async (): Promise<Shop | null> => {
    const response = await api.get<Shop[]>('/Shops/my');
    return response.data[0] || null;
  },

  createShop: async (data: CreateShopDto): Promise<Shop> => {
    const response = await api.post<Shop>('/Shops', data);
    return response.data;
  },

  updateShop: async (data: UpdateShopDto): Promise<Shop> => {
    const response = await api.put<Shop>('/Shops', data);
    return response.data;
  },

  // --- ТОВАРЫ ---
  createProduct: async (data: CreateProductDto): Promise<any> => {
    const response = await api.post('/Products', data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/Products/${id}`);
  },

  // --- ЗАКАЗЫ ---
  getOrders: async (): Promise<SellerOrder[]> => {
    const response = await api.get<SellerOrder[]>('/Orders/seller');
    return response.data;
  },

  updateOrderStatus: async (subOrderId: string, status: number): Promise<void> => {
    // status: 6 = Completed
    await api.put(`/Orders/${subOrderId}/status`, { status });
  }
};