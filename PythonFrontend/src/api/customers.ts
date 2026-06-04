import { apiClient } from './api';
import { Customer } from '../types';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const customersApi = {
  getAll: async (email?: string): Promise<Customer[]> => {
    const response = await apiClient.get<ApiResponse<Customer[]>>('/customers', {
      params: email ? { email } : undefined,
    });
    return response.data.data || [];
  },

  getById: async (id: number | string): Promise<Customer> => {
    const response = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data.data;
  },

  create: async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
    const response = await apiClient.post<ApiResponse<Customer>>('/customers', customer);
    return response.data.data;
  },

  update: async (id: number, customer: Partial<Customer>): Promise<Customer> => {
    const response = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, customer);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },
};
