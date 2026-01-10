import { api } from './instance';

// Типы
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bonusBalance: number;
  role: string;
}

export interface OrderHistoryItem {
  orderId: string;
  createdAt: string;
  totalAmount: number;
  statusSummary: string;
}

export interface OrderDetails {
  subOrderId: string;
  orderId: string;
  createdAt: string;
  status: string;
  userPhone: string;
  userAddress: string;
  totalPrice: number;
  items: {
    productName: string;
    quantity: number;
    price: number;
    imageUrl: string;
  }[];
}

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/Users/me');
    return response.data;
  },
  getHistory: async (): Promise<OrderHistoryItem[]> => {
    const response = await api.get<OrderHistoryItem[]>('/Orders/my-history');
    return response.data;
  },
  getOrderDetails: async (id: string): Promise<OrderDetails> => {
    const response = await api.get<OrderDetails>(`/Orders/${id}`);
    return response.data;
  }
};