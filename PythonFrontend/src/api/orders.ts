import { apiClient } from './api';
import { Order } from '../types';

export interface OrderCreatePayload {
  customer_id: number;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export interface OrderCreateResponse {
  success: boolean;
  message: string;
  data?: {
    order_id: number;
    customer_id: number;
    total_amount: number;
    status: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders');
    return response.data.data || [];
  },

  getById: async (id: number | string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data.data;
  },

  create: async (payload: OrderCreatePayload): Promise<OrderCreateResponse> => {
    const response = await apiClient.post<OrderCreateResponse>('/orders', payload);
    return response.data;
  },
};
