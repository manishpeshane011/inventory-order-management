import { apiClient } from './api';
import { InventoryItem } from '../types';

export interface InventoryResponse {
  success: boolean;
  message: string;
  data: InventoryItem[];
}

export const inventoryApi = {
  getInventory: async (): Promise<InventoryResponse> => {
    const response = await apiClient.get<InventoryResponse>('/inventory');
    return response.data;
  },
};
