import { api } from './instance';

// Типы
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bonusBalance: number;
}

export interface OrderHistoryItem {
  orderId: string;
  createdAt: string;
  totalAmount: number;
  statusSummary: string;
}

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/Users/me');
    return response.data;
  },
  getHistory: async (): Promise<OrderHistoryItem[]> => {
    const response = await api.get<OrderHistoryItem[]>('/Orders/my-history');
    return response.data;
  }
};