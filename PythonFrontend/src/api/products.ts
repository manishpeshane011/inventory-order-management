import { apiClient } from './api';
import { Product } from '../types';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const productsApi = {
  getAll: async (search?: string): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products', {
      params: search ? { search } : undefined,
    });
    return response.data.data || [];
  },

  getById: async (id: number | string): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<Product>>('/products', product);
    return response.data.data;
  },

  update: async (id: number, product: Partial<Product>): Promise<Product> => {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, product);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};
