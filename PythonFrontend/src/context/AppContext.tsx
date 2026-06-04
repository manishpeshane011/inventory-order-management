import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Customer, Order, InventoryItem } from '../types';
import { productsApi } from '../api/products';
import { customersApi } from '../api/customers';
import { ordersApi } from '../api/orders';
import { inventoryApi } from '../api/inventory';

interface AppContextType {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  inventory: InventoryItem[];
  loading: boolean;
  isOfflineMode: boolean; // Keep for layout backward compatibility (always false)
  errorMessage: string | null;
  successMessage: string | null;
  clearMessages: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  toast: { message: string; type: 'success' | 'error' } | null;

  // Products CRUD
  fetchProducts: (search?: string) => Promise<void>;
  createProduct: (product: Omit<Product, 'id'>) => Promise<boolean>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
  getProductById: (id: number) => Product | undefined;

  // Customers CRUD
  fetchCustomers: (email?: string) => Promise<void>;
  createCustomer: (customer: Omit<Customer, 'id'>) => Promise<boolean>;
  updateCustomer: (id: number, customer: Partial<Customer>) => Promise<boolean>;
  deleteCustomer: (id: number) => Promise<boolean>;
  getCustomerById: (id: number) => Customer | undefined;

  // Orders CRUD
  fetchOrders: () => Promise<void>;
  createOrder: (customerId: number, items: Array<{ product_id: number; quantity: number }>) => Promise<{ success: boolean; message: string }>;
  getOrderById: (id: number) => Order | undefined;

  // Inventory
  fetchInventory: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // isOfflineMode is always false since we only show live data directly from the APIs
  const isOfflineMode = false;

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    if (type === 'error') {
      setErrorMessage(message);
    } else {
      setSuccessMessage(message);
    }
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 4000);
  }, []);

  const clearMessages = useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  // Helper to extract nested error message
  const getApiError = (err: any): string => {
    if (err?.response?.data) {
      if (typeof err.response.data.detail === 'string') {
        return err.response.data.detail;
      }
      if (err.response.data.message) {
        return err.response.data.message;
      }
      if (Array.isArray(err.response.data.detail)) {
        return err.response.data.detail.map((d: any) => d.msg).join(', ');
      }
    }
    return err?.message || 'An unexpected error occurred';
  };

  // Initial loading of all components
  const initializeData = useCallback(async () => {
    setLoading(true);
    try {
      const prods = await productsApi.getAll();
      const custs = await customersApi.getAll();
      const ords = await ordersApi.getAll();
      const invResp = await inventoryApi.getInventory();

      setProducts(prods);
      setCustomers(custs);
      setOrders(ords);
      setInventory(invResp.data);
      clearMessages();
    } catch (err: any) {
      console.error('Error conducting initial database load:', err);
      const msg = getApiError(err);
      showToast(`Database connection issue: ${msg}. Make sure the backend service is running on Port 8000!`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, clearMessages]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // ==========================================
  // PRODUCTS CRUD
  // ==========================================

  const fetchProducts = async (search?: string) => {
    try {
      setLoading(true);
      const data = await productsApi.getAll(search);
      setProducts(data);
    } catch (err: any) {
      showToast(`Error retrieving products: ${getApiError(err)}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id'>): Promise<boolean> => {
    try {
      setLoading(true);
      await productsApi.create(productData);
      showToast('Product created successfully', 'success');
      // Automatically refresh in obedience to specifications
      const prods = await productsApi.getAll();
      setProducts(prods);
      const inv = await inventoryApi.getInventory();
      setInventory(inv.data);
      return true;
    } catch (err: any) {
      showToast(getApiError(err), 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: number, productData: Partial<Product>): Promise<boolean> => {
    try {
      setLoading(true);
      await productsApi.update(id, productData);
      showToast('Product updated successfully', 'success');
      // Automatically refresh in obedience to specifications
      const prods = await productsApi.getAll();
      setProducts(prods);
      const inv = await inventoryApi.getInventory();
      setInventory(inv.data);
      return true;
    } catch (err: any) {
      showToast(getApiError(err), 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      await productsApi.delete(id);
      showToast('Product deleted successfully', 'success');
      // Automatically refresh in obedience to specifications
      const prods = await productsApi.getAll();
      setProducts(prods);
      const inv = await inventoryApi.getInventory();
      setInventory(inv.data);
      return true;
    } catch (err: any) {
      showToast(getApiError(err), 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getProductById = (id: number): Product | undefined => {
    return products.find(p => p.id === id);
  };

  // ==========================================
  // CUSTOMERS CRUD
  // ==========================================

  const fetchCustomers = async (email?: string) => {
    try {
      setLoading(true);
      const data = await customersApi.getAll(email);
      setCustomers(data);
    } catch (err: any) {
      showToast(`Error retrieving customers: ${getApiError(err)}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (custData: Omit<Customer, 'id'>): Promise<boolean> => {
    try {
      setLoading(true);
      await customersApi.create(custData);
      showToast('Customer created successfully', 'success');
      // Automatically refresh in obedience to specifications
      const custs = await customersApi.getAll();
      setCustomers(custs);
      return true;
    } catch (err: any) {
      showToast(getApiError(err), 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (id: number, custData: Partial<Customer>): Promise<boolean> => {
    try {
      setLoading(true);
      await customersApi.update(id, custData);
      showToast('Customer updated successfully', 'success');
      // Automatically refresh in obedience to specifications
      const custs = await customersApi.getAll();
      setCustomers(custs);
      return true;
    } catch (err: any) {
      showToast(getApiError(err), 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      await customersApi.delete(id);
      showToast('Customer deleted successfully', 'success');
      // Automatically refresh in obedience to specifications
      const custs = await customersApi.getAll();
      setCustomers(custs);
      return true;
    } catch (err: any) {
      showToast(getApiError(err), 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getCustomerById = (id: number): Customer | undefined => {
    return customers.find(c => c.id === id);
  };

  const normalizeOrder = (order: any): Order => ({
    id: order?.id ?? 0,
    customer_id: order?.customer_id ?? 0,
    customer_name: order?.customer_name,
    items: Array.isArray(order?.items) ? order.items : [],
    total_amount: Number(order?.total_amount ?? 0),
    status: order?.status ?? 'PLACED',
    order_date: order?.order_date ? String(order.order_date) : undefined,
  });

  // ==========================================
  // ORDERS CRUD
  // ==========================================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getAll();
      setOrders(Array.isArray(data) ? data.map(normalizeOrder) : []);
    } catch (err: any) {
      showToast(`Error retrieving orders: ${getApiError(err)}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (
    customerId: number,
    items: Array<{ product_id: number; quantity: number }>
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      const resp = await ordersApi.create({ customer_id: customerId, items });
      if (resp.success) {
        showToast(resp.message || 'Order placed successfully', 'success');
        // Automatically refresh in obedience to specifications
        const ords = await ordersApi.getAll();
        setOrders(Array.isArray(ords) ? ords.map(normalizeOrder) : []);
        const prods = await productsApi.getAll();
        setProducts(prods);
        const inv = await inventoryApi.getInventory();
        setInventory(inv.data);
        return { success: true, message: resp.message };
      } else {
        showToast(resp.message || 'Failed to place order', 'error');
        return { success: false, message: resp.message };
      }
    } catch (err: any) {
      const errMsg = getApiError(err);
      // Handles insufficient stock and other errors from backend directly
      showToast(errMsg, 'error');
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = (id: number): Order | undefined => {
    return orders.find(o => o.id === id);
  };

  // ==========================================
  // INVENTORY
  // ==========================================

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getInventory();
      setInventory(data.data);
    } catch (err: any) {
      showToast(`Error retrieving inventory: ${getApiError(err)}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        products,
        customers,
        orders,
        inventory,
        loading,
        isOfflineMode,
        errorMessage,
        successMessage,
        clearMessages,
        showToast,
        toast,

        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        getProductById,

        fetchCustomers,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerById,

        fetchOrders,
        createOrder,
        getOrderById,

        fetchInventory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};
