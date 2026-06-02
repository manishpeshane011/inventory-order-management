import axios, { AxiosResponse } from "axios";
import { Product, Customer, Order, InventoryItem } from "../types";

const API_BASE_URL = "http://127.0.0.1:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

function normalizeListResponse<T>(response: AxiosResponse<unknown>): T[] {
  const raw = response.data;

  if (Array.isArray(raw)) {
    console.debug("API response is a direct array:", raw);
    return raw as T[];
  }

  if (raw && typeof raw === "object") {
    const payload = raw as Record<string, unknown>;
    const listKeys = ["data", "inventory", "items", "results"];

    for (const key of listKeys) {
      const value = payload[key];
      if (Array.isArray(value)) {
        console.debug(`API payload list found under "${key}"`, value);
        return value as T[];
      }
    }
  }

  console.warn("Unexpected API list payload shape, returning empty array.", raw);
  return [];
}

export const productAPI = {
  getProducts: async (search?: string): Promise<Product[]> => {
    const url = search ? `/api/products?search=${encodeURIComponent(search)}` : "/api/products";
    const response = await apiClient.get<unknown>(url);
    return normalizeListResponse<Product>(response);
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await apiClient.get<Product>(`/api/products/${id}`);
    return response.data;
  },

  createProduct: async (product: Product): Promise<Product> => {
    const response = await apiClient.post<Product>("/api/products", product);
    return response.data;
  },

  updateProduct: async (id: number, product: Product): Promise<Product> => {
    const response = await apiClient.put<Product>(`/api/products/${id}`, product);
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/products/${id}`);
  },
};

export const customerAPI = {
  getCustomers: async (email?: string): Promise<Customer[]> => {
    const url = email ? `/api/customers?email=${encodeURIComponent(email)}` : "/api/customers";
    const response = await apiClient.get<unknown>(url);
    return normalizeListResponse<Customer>(response);
  },

  getCustomer: async (id: number): Promise<Customer> => {
    const response = await apiClient.get<Customer>(`/api/customers/${id}`);
    return response.data;
  },

  createCustomer: async (customer: Customer): Promise<Customer> => {
    const response = await apiClient.post<Customer>("/api/customers", customer);
    return response.data;
  },

  updateCustomer: async (id: number, customer: Customer): Promise<Customer> => {
    const response = await apiClient.put<Customer>(`/api/customers/${id}`, customer);
    return response.data;
  },

  deleteCustomer: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/customers/${id}`);
  },
};

export const orderAPI = {
  getOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<unknown>("/api/orders");
    return normalizeListResponse<Order>(response);
  },

  getOrder: async (id: number): Promise<Order> => {
    const response = await apiClient.get<Order>(`/api/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData: { customer_id: number; items: { product_id: number; quantity: number }[] }): Promise<Order> => {
    const response = await apiClient.post<Order>("/api/orders", orderData);
    return response.data;
  },
};

export const inventoryAPI = {
  getInventory: async (): Promise<InventoryItem[]> => {
    const response = await apiClient.get<unknown>("/api/inventory");
    return normalizeListResponse<InventoryItem>(response);
  },
};

export default apiClient;
