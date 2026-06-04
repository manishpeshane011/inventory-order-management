import { useAppState } from '../context/AppContext';

export function useInventory() {
  const {
    inventory,
    loading,
    fetchInventory,
    isOfflineMode,
  } = useAppState();

  return {
    inventory,
    loading,
    fetchInventory,
    isOfflineMode,
  };
}
export default useInventory;
