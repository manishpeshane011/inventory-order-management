/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  price: number;
  stock_quantity: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface OrderItem {
  product_id: number;
  quantity: number;
  name?: string;
  price?: number;
}

export interface Order {
  id: number;
  customer_id: number;
  customer_name?: string; // Cache or derived
  items: OrderItem[];
  total_amount: number;
  status: string; // "PLACED"
  order_date?: string;
}

export interface InventoryItem {
  product_id: number;
  name: string;
  stock_quantity: number;
}
