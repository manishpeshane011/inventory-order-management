import { useAppState } from '../context/AppContext';

export function useOrders() {
  const {
    orders,
    loading,
    fetchOrders,
    createOrder,
    getOrderById,
    isOfflineMode,
  } = useAppState();

  return {
    orders,
    loading,
    fetchOrders,
    createOrder,
    getOrderById,
    isOfflineMode,
  };
}
export default useOrders;
