import { api } from './instance';
import type { CreateShopDto, Shop, CreateProductDto, SellerOrder, UpdateShopDto } from '../types/seller';

// Добавь тип для расчета
export interface CalculateDeliveryDto {
  shopId: string;
  userLatitude: number;
  userLongitude: number;
  orderTotalAmount: number;
}

export interface ShopStats {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  averageCheck: number;
}

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

  updateProduct: async (id: string, data: CreateProductDto): Promise<any> => {
    const response = await api.put(`/Products/${id}`, data);
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
  },

  // --- ПУБЛИЧНЫЙ МАГАЗИН ---
  getPublicShop: async (id: string): Promise<Shop> => {
    const response = await api.get<Shop>(`/Shops/${id}`);
    return response.data;
  },

  // ИМПОРТ EXCEL
  importExcel: async (file: File, shopId: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    // shopId передаем в query params, как ждет контроллер
    const response = await api.post(`/Catalog/import?shopId=${shopId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // ИМПОРТ YML
  importYml: async (url: string, shopId: string): Promise<any> => {
    const response = await api.post(`/Catalog/import-yml?shopId=${shopId}&url=${encodeURIComponent(url)}`);
    return response.data;
  },

  // КАЛЬКУЛЯТОР
  calculateDelivery: async (data: CalculateDeliveryDto): Promise<{ price: number, message: string }> => {
    // Используем axios.post, путь проверь в своем контроллере (обычно DeliveryZones/calculate)
    const response = await api.post('/DeliveryZones/calculate', data);
    return response.data;
  },

  getStats: async (): Promise<ShopStats> => {
    const response = await api.get<ShopStats>('/Shops/stats');
    return response.data;
  },
};