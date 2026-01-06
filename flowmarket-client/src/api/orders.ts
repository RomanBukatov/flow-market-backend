import { api } from './instance';

export interface CartItemDto {
  productId: string;
  quantity: number;
}

export interface CreateOrderDto {
  userPhone: string;
  userAddress: string;
  items: CartItemDto[];
}

export interface OrderResultDto {
  orderId: string;
  totalAmount: number;
  paymentLink: string;
}

export const ordersApi = {
  createOrder: async (data: CreateOrderDto): Promise<OrderResultDto> => {
    const response = await api.post<OrderResultDto>('/Orders', data);
    return response.data;
  }
};