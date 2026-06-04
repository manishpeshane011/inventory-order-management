import { useAppState } from '../context/AppContext';

export function useCustomers() {
  const {
    customers,
    loading,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    isOfflineMode,
  } = useAppState();

  return {
    customers,
    loading,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    isOfflineMode,
  };
}
export default useCustomers;
